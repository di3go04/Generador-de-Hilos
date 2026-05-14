/**
 * Urban FFmpeg Worker
 *
 * Background job processor that:
 *   1. Polls PostgreSQL for pending conversion_jobs
 *   2. Downloads input file from S3
 *   3. Runs FFmpeg to convert
 *   4. Uploads output to S3
 *   5. Updates job status + records usage
 *
 * Run standalone:   npx tsx worker/process.ts
 * Run in Docker:    docker compose up worker
 */

import "dotenv/config";
import postgres from "postgres";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { execSync } from "node:child_process";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// ── Config ──────────────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL || "postgres://urban:urban@localhost:5432/urban";

const S3 = {
  endpoint: process.env.S3_ENDPOINT || "",
  region: process.env.S3_REGION || "us-east-1",
  accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  bucket: process.env.S3_BUCKET || "urban-videos",
};

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_MS) || 3000;
const MAX_CONCURRENT = Number(process.env.WORKER_CONCURRENCY) || 2;

// ── Clients ─────────────────────────────────────────────────────────────────
const sql = postgres(DB_URL, { max: MAX_CONCURRENT + 2 });

const s3 = new S3Client({
  endpoint: S3.endpoint || undefined,
  region: S3.region,
  credentials: { accessKeyId: S3.accessKeyId, secretAccessKey: S3.secretAccessKey },
  forcePathStyle: !S3.endpoint?.includes("amazonaws"),
});

// ── FFmpeg argument builder (mirrors client-side + backend) ─────────────────
const RESOLUTION_MAP: Record<string, string> = {
  "2160p": "3840:2160", "1080p": "1920:1080",
  "720p": "1280:720", "480p": "854:480",
};

function buildArgs(job: any): string[] {
  const format = job.output_format;
  const resolution = job.resolution || "original";
  const quality = job.quality ?? 0.8;
  const bitrate = job.bitrate || "auto";
  const crf = String(Math.round((1 - quality) * 51));
  const resStr = resolution !== "original" ? RESOLUTION_MAP[resolution] : null;
  const args: string[] = ["-y", "-i", "input"];

  let vf = "";
  if (format === "gif") {
    vf = "fps=10";
    if (resStr) vf += `,scale=${resStr}:force_original_aspect_ratio=decrease:flags=lanczos`;
    else vf += ",scale=480:-1:flags=lanczos";
  } else if (resStr) {
    vf = `scale=${resStr}:force_original_aspect_ratio=decrease`;
  }
  if (vf) args.push("-vf", vf);

  switch (format) {
    case "mp4":  args.push("-c:v", "libx264", "-crf", crf); break;
    case "webm": args.push("-c:v", "libvpx", "-crf", crf); break;
    case "gif":  break;
    case "mp3":  args.push("-vn", "-acodec", "libmp3lame"); break;
    case "mov":  args.push("-c:v", "libx264", "-crf", crf, "-pix_fmt", "yuv420p"); break;
    case "avi":  args.push("-c:v", "libxvid", "-q:v", String(Math.round((1 - quality) * 10))); break;
    case "mkv":  args.push("-c:v", "libx264", "-crf", crf); break;
    case "flv":  args.push("-c:v", "libx264", "-crf", crf, "-f", "flv"); break;
    case "wmv":  args.push("-c:v", "wmv2", "-b:v", "2M"); break;
    case "wav":  args.push("-vn", "-acodec", "pcm_s16le"); break;
  }

  if (bitrate !== "auto" && !["gif", "mp3", "wav"].includes(format)) {
    args.push("-b:v", bitrate);
  }

  args.push("output");
  return args;
}

// ── Download from S3 ─────────────────────────────────────────────────────────
async function downloadFromS3(key: string): Promise<Buffer> {
  const { Body } = await s3.send(new GetObjectCommand({
    Bucket: S3.bucket, Key: key,
  }));
  return Buffer.from(await Body!.transformToByteArray());
}

async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: S3.bucket, Key: key, Body: body, ContentType: contentType,
  }));
}

// ── Notify Helper ────────────────────────────────────────────────────────────
async function notifyJob(job: any, status: string, progress: number, message: string) {
  const payload = JSON.stringify({
    tenant_id: job.tenant_id,
    job_id: job.id,
    status,
    progress,
    message,
  });
  await sql`SELECT pg_notify('job_updates', ${payload})`;
}

// ── Process a single job ─────────────────────────────────────────────────────
async function processJob(job: any): Promise<void> {
  const jobId = job.id;
  const tenantId = job.tenant_id;
  log(jobId, "START", `Converting .${job.input_format} → .${job.output_format}`);

  const tmpDir = await mkdtemp(join(tmpdir(), "urban-worker-"));
  const inputKey = job.input_file;
  const outputKey = inputKey.replace(`.${job.input_format}`, `.${job.output_format}`);

  try {
    // Mark as processing
    await sql`UPDATE conversion_jobs SET status = 'processing', started_at = now() WHERE id = ${jobId}`;
    await notifyJob(job, "processing", 10, "Iniciando descarga de video...");

    // 1. Download input
    log(jobId, "DL", `Downloading from s3://${S3.bucket}/${inputKey}`);
    const inputBuf = await downloadFromS3(inputKey);
    await writeFile(join(tmpDir, "input"), inputBuf);
    await notifyJob(job, "processing", 30, "Archivo descargado. Procesando con FFmpeg...");

    // 2. Run FFmpeg
    const args = buildArgs(job);
    log(jobId, "FFMPEG", `ffmpeg ${args.join(" ")}`);
    // Note: In a production worker, you'd parse stderr to get real % progress.
    // For now, we simulate the jump.
    execSync(`ffmpeg ${args.join(" ")}`, {
      cwd: tmpDir,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 600_000,
    });
    await notifyJob(job, "processing", 80, "Conversión terminada. Subiendo resultado...");

    // 3. Read output
    const outputBuf = await readFile(join(tmpDir, "output"));

    // 4. Upload output
    const mimeMap: Record<string, string> = {
      mp4: "video/mp4", webm: "video/webm", gif: "image/gif", mp3: "audio/mpeg",
      mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
      flv: "video/x-flv", wmv: "video/x-ms-wmv", wav: "audio/wav",
    };
    await uploadToS3(outputKey, outputBuf, mimeMap[job.output_format] || "application/octet-stream");

    // 5. Update job as completed
    await sql`
      UPDATE conversion_jobs
      SET status = 'completed', output_file = ${outputKey}, completed_at = now()
      WHERE id = ${jobId}
    `;
    await notifyJob(job, "completed", 100, "¡Conversión finalizada con éxito!");

    log(jobId, "DONE", `Output at s3://${S3.bucket}/${outputKey} (${(outputBuf.length / 1024 / 1024).toFixed(1)} MB)`);
  } catch (err: any) {
    const msg = err.stderr?.toString().slice(0, 1000) || err.message || "Unknown error";
    log(jobId, "FAIL", msg);
    await sql`
      UPDATE conversion_jobs
      SET status = 'failed', error_message = ${msg}, completed_at = now()
      WHERE id = ${jobId}
    `;
    await notifyJob(job, "failed", 0, `Error: ${msg}`);
  } finally {
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ── Poll loop ────────────────────────────────────────────────────────────────
async function poll() {
  log("WORKER", "POLL", "Checking for pending jobs…");

  const jobs = await sql`
    SELECT * FROM conversion_jobs
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT ${MAX_CONCURRENT}
    FOR UPDATE SKIP LOCKED
  `;

  if (jobs.length === 0) return;

  log("WORKER", "BATCH", `Found ${jobs.length} pending job(s)`);

  await Promise.all(jobs.map((job: any) => processJob(job)));
}

// ── Logger ───────────────────────────────────────────────────────────────────
function log(jobId: string, stage: string, msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`${ts} [${jobId.slice(0, 8)}] ${stage}: ${msg}`);
}

// ── Main loop ────────────────────────────────────────────────────────────────
async function main() {
  console.log("━━━ Urban FFmpeg Worker ━━━");
  console.log(`Poll interval: ${POLL_INTERVAL_MS}ms | Concurrency: ${MAX_CONCURRENT}`);
  console.log(`Database: ${DB_URL.replace(/\/\/.*@/, "//user:pass@")}`);
  console.log("──────────────────────────────");

  while (true) {
    try {
      await poll();
    } catch (err: any) {
      console.error("[WORKER] Poll error:", err.message);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("Fatal worker error:", err);
  process.exit(1);
});
