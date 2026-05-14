import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sql } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
});

export async function tenantRoutes(app: FastifyInstance) {
  // All tenant routes require auth
  app.addHook("preHandler", requireAuth);

  // ── GET /tenants/me ────────────────────────────────────────────────────────
  app.get("/tenants/me", async (request, reply) => {
    const [tenant] = await sql`
      SELECT id, name, slug, plan, is_active, created_at, updated_at
      FROM tenants
      WHERE id = ${request.user!.tenant_id}
    `;

    if (!tenant) {
      throw new AppError(404, "Tenant not found");
    }

    // Get member count
    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM tenant_users WHERE tenant_id = ${tenant.id}
    `;

    // Get current month usage
    const [usage] = await sql`
      SELECT COALESCE(SUM(quantity), 0) AS conversions
      FROM usage_records
      WHERE tenant_id = ${tenant.id}
        AND metric = 'conversion'
        AND date_trunc('month', created_at) = date_trunc('month', now())
    `;

    return { tenant: { ...tenant, member_count: count, monthly_conversions: Number(usage?.conversions || 0) } };
  });

  // ── PATCH /tenants/me ──────────────────────────────────────────────────────
  app.patch("/tenants/me", {
    preHandler: [requireRole("admin")],
  }, async (request, reply) => {
    const data = updateTenantSchema.parse(request.body);

    const setClauses: string[] = [];
    const setValues: any[] = [];
    if (data.name !== undefined) { setClauses.push("name = ?"); setValues.push(data.name); }
    if (data.plan !== undefined) { setClauses.push("plan = ?"); setValues.push(data.plan); }
    setClauses.push("updated_at = datetime('now')");

    const [tenant] = await sql`
      UPDATE tenants
      SET ${sql.unsafe(setClauses.join(", "))}
      WHERE id = ${request.user!.tenant_id}
      RETURNING id, name, slug, plan, is_active, updated_at
    `;

    return { tenant };
  });

  // ── GET /tenants/me/members ────────────────────────────────────────────────
  app.get("/tenants/me/members", async (request, reply) => {
    const members = await sql`
      SELECT u.id, u.email, u.name, u.avatar_url, tu.role, tu.joined_at
      FROM tenant_users tu
      JOIN users u ON u.id = tu.user_id
      WHERE tu.tenant_id = ${request.user!.tenant_id}
      ORDER BY tu.joined_at ASC
    `;

    return { members };
  });

  // ── POST /tenants/me/members ───────────────────────────────────────────────
  app.post("/tenants/me/members", {
    preHandler: [requireRole("admin")],
  }, async (request, reply) => {
    const { email, role } = z.object({
      email: z.string().email(),
      role: z.enum(["admin", "member"]).default("member"),
    }).parse(request.body);

    const [user] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (!user) {
      throw new AppError(404, "User not found. Ask them to register first.");
    }

    await sql`
      INSERT INTO tenant_users (tenant_id, user_id, role)
      VALUES (${request.user!.tenant_id}, ${user.id}, ${role})
      ON CONFLICT DO NOTHING
    `;

    return reply.status(201).send({ invited: true, email });
  });
}
