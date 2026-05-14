import type { FastifyInstance } from "fastify";
import { sql } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export async function usageRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  // ── GET /usage ────────────────────────────────────────────────────────────
  // Returns usage metrics for the current tenant, grouped by month.
  app.get("/usage", async (request, reply) => {
    const months = Number(new URL(request.url, "http://localhost").searchParams.get("months")) || 6;

    const records = await sql`
      SELECT
        date_trunc('month', created_at) AS month,
        metric,
        SUM(quantity)::int AS total
      FROM usage_records
      WHERE tenant_id = ${request.user!.tenant_id}
        AND created_at >= now() - (${months} || ' months')::interval
      GROUP BY month, metric
      ORDER BY month DESC, metric
    `;

    return { records };
  });

  // ── GET /usage/current ─────────────────────────────────────────────────────
  // Quick summary of current billing period
  app.get("/usage/current", async (request, reply) => {
    const [conversions] = await sql`
      SELECT COALESCE(SUM(quantity), 0)::int AS total
      FROM usage_records
      WHERE tenant_id = ${request.user!.tenant_id}
        AND metric = 'conversion'
        AND date_trunc('month', created_at) = date_trunc('month', now())
    `;

    const [aiGenerations] = await sql`
      SELECT COALESCE(SUM(quantity), 0)::int AS total
      FROM usage_records
      WHERE tenant_id = ${request.user!.tenant_id}
        AND metric = 'ai_generation'
        AND date_trunc('month', created_at) = date_trunc('month', now())
    `;

    return {
      month: new Date().toISOString().slice(0, 7),
      conversions: Number(conversions?.total || 0),
      ai_generations: Number(aiGenerations?.total || 0),
    };
  });
}
