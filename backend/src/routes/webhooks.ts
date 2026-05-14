import type { FastifyInstance } from "fastify";
import { sql } from "../db/index.js";
import { verifyWebhookEvent } from "../lib/stripe.js";

export async function webhookRoutes(app: FastifyInstance) {
  // ── POST /webhooks/stripe ──────────────────────────────────────────────────
  app.post("/webhooks/stripe", {
    config: { rawBody: true },
  }, async (request, reply) => {
    const sig = request.headers["stripe-signature"] as string;
    if (!sig) {
      return reply.status(400).send({ error: "Missing stripe-signature header" });
    }

    // Get raw body as string
    const bodyRaw = (request as any).rawBody as Buffer;

    let event;
    try {
      event = verifyWebhookEvent(bodyRaw, sig);
    } catch (err: any) {
      console.error("Stripe webhook verification failed:", err.message);
      return reply.status(401).send({ error: "Invalid signature" });
    }

    const eventType = event.type;
    console.log(`Stripe webhook: ${eventType}`);

    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const tenantId = session.metadata?.tenant_id;
        const plan = session.metadata?.plan || "pro";
        const customerId = session.customer as string;

        if (tenantId) {
          await sql`
            UPDATE tenants
            SET plan = ${plan}, updated_at = now()
            WHERE id = ${tenantId}
          `;

          // Store Stripe customer ID on the tenant for portal access
          await sql`
            UPDATE tenants
            SET stripe_customer_id = ${customerId}
            WHERE id = ${tenantId} AND stripe_customer_id IS NULL
          `;

          console.log(`Tenant ${tenantId} upgraded to ${plan} (customer: ${customerId})`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenant_id;

        if (tenantId && subscription.status === "past_due") {
          console.log(`Tenant ${tenantId} subscription is past due`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const tenantId = subscription.metadata?.tenant_id;

        if (tenantId) {
          await sql`
            UPDATE tenants
            SET plan = 'free', updated_at = now()
            WHERE id = ${tenantId}
          `;
          console.log(`Tenant ${tenantId} downgraded to free`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook: ${eventType}`);
    }

    return reply.status(200).send({ received: true });
  });
}
