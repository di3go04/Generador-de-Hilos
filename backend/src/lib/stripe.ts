import Stripe from "stripe";
import { config } from "../config.js";

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

/**
 * Price IDs in Stripe for each plan.
 * These are created once in the Stripe dashboard and referenced here.
 *
 * Fallback lookup: if not configured via env, creates products/prices on first use.
 */
export const PRICE_IDS: Record<string, string> = {
  pro: config.stripe.proPriceId || "",
  enterprise: config.stripe.enterprisePriceId || "",
};

export const PLAN_LIMITS = {
  free: { conversions: 5, ai_generations: 10 },
  pro: { conversions: 100, ai_generations: 500 },
  enterprise: { conversions: -1, ai_generations: -1 },
} as const;

/**
 * Create a Stripe Checkout Session for subscription.
 */
export async function createCheckoutSession(params: {
  tenantId: string;
  tenantSlug: string;
  email: string;
  plan: "pro" | "enterprise";
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const priceId = PRICE_IDS[params.plan];
  if (!priceId) {
    throw new Error(`No Stripe price ID configured for plan: ${params.plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      tenant_id: params.tenantId,
      tenant_slug: params.tenantSlug,
      plan: params.plan,
    },
    subscription_data: {
      metadata: {
        tenant_id: params.tenantId,
        tenant_slug: params.tenantSlug,
        plan: params.plan,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session.url!;
}

/**
 * Create a Stripe Customer Portal session for managing subscription.
 * Requires stripe_customer_id to be set on the tenant (done via webhook).
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session.url;
}

/**
 * Verify and parse a Stripe webhook event.
 */
export function verifyWebhookEvent(body: string | Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
}
