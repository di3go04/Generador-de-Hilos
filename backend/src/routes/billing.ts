import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sql } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { createCheckoutSession, createPortalSession, PLAN_LIMITS } from "../lib/stripe.js";

export async function billingRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  // ── POST /billing/checkout ────────────────────────────────────────────────
  // Creates a Stripe Checkout Session for upgrading to Pro / Enterprise
  app.post("/billing/checkout", async (request, reply) => {
    const { plan } = z.object({
      plan: z.enum(["pro", "enterprise"]),
    }).parse(request.body);

    const user = request.user!;
    const tenant = request.tenant;

    if (!tenant) {
      throw new AppError(400, "Tenant context required");
    }

    if (plan === "pro" && tenant.plan === "pro") {
      throw new AppError(400, "You are already on the Pro plan");
    }
    if (plan === "enterprise" && tenant.plan === "enterprise") {
      throw new AppError(400, "You are already on the Enterprise plan");
    }

    const url = await createCheckoutSession({
      tenantId: tenant.tenantId,
      tenantSlug: tenant.slug,
      email: user.email,
      plan,
      successUrl: `${config.frontendUrl}/settings?upgrade=success`,
      cancelUrl: `${config.frontendUrl}/pricing`,
    });

    return { url };
  });

  // ── POST /billing/portal ──────────────────────────────────────────────────
  // Creates a Stripe Customer Portal for managing subscription
  app.post("/billing/portal", async (request, reply) => {
    const tenant = request.tenant;
    if (!tenant) {
      throw new AppError(400, "Tenant context required");
    }

    // Fetch stripe_customer_id from DB
    const [row] = await sql`
      SELECT stripe_customer_id FROM tenants WHERE id = ${tenant.tenantId}
    `;

    if (!row?.stripe_customer_id) {
      throw new AppError(400, "No subscription found. Please upgrade first.");
    }

    const url = await createPortalSession({
      customerId: row.stripe_customer_id,
      returnUrl: `${config.frontendUrl}/settings`,
    });

    return { url };
  });

  // ── GET /billing/limits ───────────────────────────────────────────────────
  // Returns usage limits for the current plan
  app.get("/billing/limits", async (request, reply) => {
    const tenant = request.tenant;
    const limits = PLAN_LIMITS[tenant?.plan || "free"];
    return { plan: tenant?.plan || "free", limits };
  });
}

// Import config for the URLs
import { config } from "../config.js";
