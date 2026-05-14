import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sql } from "../db/index.js";
import { AppError } from "../lib/errors.js";
import { uploadFile, getPublicUrl } from "../lib/storage.js";
import { jobEvents } from "./notifications.js";

const startConversionSchema = z.object({
  output_format: z.enum(["mp4", "webm", "gif", "mp3", "mov", "avi", "mkv", "flv", "wmv", "wav"]),
  resolution: z.enum(["original", "2160p", "1080p", "720p", "480p"]).default("original"),
  quality: z.number().min(0.1).max(1).default(0.8),
  bitrate: z.enum(["auto", "500k", "1M", "2M", "4M", "8M"]).default("auto"),
});

const ALLOWED_INPUTS = ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "mpeg", "3gp"];

export async function conversionRoutes(app: FastifyInstance) {
  // ── POST /conversions ──────────────────────────────────────────────────────
  app.post("/conversions", {
    preHandler: [async (request) => {
      if (!request.tenant) {
        throw new AppError(400, "Tenant context required");
      }
    }],
  }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      throw new AppError(400, "No file uploaded");
    }

    const fields = data.fields as Record<string, any>;

    const rawQuality = fields.quality?.value ? Number(fields.quality.value) : NaN;

    const options = startConversionSchema.parse({
      output_format: fields.output_format?.value || "mp4",
      resolution: fields.resolution?.value || "original",
      quality: isNaN(rawQuality) ? 0.8 : rawQuality,
      bitrate: fields.bitrate?.value || "auto",
    });

    const buffer = await data.toBuffer();
    const inputExt = data.filename.split(".").pop()?.toLowerCase() || "mp4";

    if (!ALLOWED_INPUTS.includes(inputExt)) {
      throw new AppError(400, `Unsupported input format: .${inputExt}`);
    }

    // Check plan limits
    const tenant = request.tenant!;
    if (tenant.plan === "free") {
      const monthlyUsage = await sql`
        SELECT COALESCE(SUM(quantity), 0) AS total
        FROM usage_records
        WHERE tenant_id = ${tenant.tenantId}
          AND metric = 'conversion'
          AND date_trunc('month', created_at) = date_trunc('month', now())
      `;
      if (Number(monthlyUsage[0]?.total) >= 5) {
        throw new AppError(429, "Free plan limit reached (5 conversions/month). Upgrade to Pro.");
      }
    }

    // Upload input file to S3
    const s3Key = `conversions/${tenant.tenantId}/${crypto.randomUUID()}.${inputExt}`;
    await uploadFile(s3Key, buffer, data.mimetype);

    // Create job record with conversion options
    const [job] = await sql`
      INSERT INTO conversion_jobs (tenant_id, user_id, input_format, output_format, resolution, quality, bitrate, input_file, file_size)
      VALUES (
        ${tenant.tenantId},
        ${request.user?.sub || null},
        ${inputExt},
        ${options.output_format},
        ${options.resolution},
        ${options.quality},
        ${options.bitrate},
        ${s3Key},
        ${buffer.length}
      )
      RETURNING id, status, created_at
    `;

    // Record usage
    await sql`
      INSERT INTO usage_records (tenant_id, user_id, metric, quantity, resource_id)
      VALUES (${tenant.tenantId}, ${request.user?.sub || null}, 'conversion', 1, ${job.id})
    `;

    // Emit real-time notification
    jobEvents.emit("update", {
      tenant_id: tenant.tenantId,
      job_id: job.id,
      status: "pending",
      progress: 0,
      message: "Archivo recibido. Iniciando procesamiento...",
    });

    return reply.status(201).send({
      job: {
        id: job.id,
        status: job.status,
        created_at: job.created_at,
      },
    });
  });

  // ── GET /conversions/:id ──────────────────────────────────────────────────
  app.get<{ Params: { id: string } }>("/conversions/:id", async (request, reply) => {
    const { id } = request.params;
    const tenant = request.tenant!;

    const [job] = await sql`
      SELECT id, status, input_format, output_format, input_file, output_file,
             file_size, error_message, started_at, completed_at, created_at
      FROM conversion_jobs
      WHERE id = ${id} AND tenant_id = ${tenant.tenantId}
    `;

    if (!job) {
      throw new AppError(404, "Conversion job not found");
    }

    return {
      job: {
        ...job,
        download_url: job.output_file ? getPublicUrl(job.output_file) : null,
      },
    };
  });

  // ── GET /conversions ──────────────────────────────────────────────────────
  app.get("/conversions", async (request, reply) => {
    const { searchParams } = new URL(request.url, "http://localhost");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const offset = Number(searchParams.get("offset")) || 0;
    const tenant = request.tenant!;

    const jobs = await sql`
      SELECT id, status, input_format, output_format, file_size,
             error_message, created_at, completed_at
      FROM conversion_jobs
      WHERE tenant_id = ${tenant.tenantId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count 
      FROM conversion_jobs
      WHERE tenant_id = ${tenant.tenantId}
    `;

    return { jobs, total: count };
  });
}
