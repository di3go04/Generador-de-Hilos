import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    threadLimit: 5,
    apiRateLimit: 10,
    features: ["5 hilos/mes", "Editor básico", "Exportar texto"],
  },
  PRO: {
    name: "Pro",
    threadLimit: 50,
    apiRateLimit: 100,
    stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL,
    features: [
      "50 hilos/mes",
      "Publicación Twitter",
      "Programar posts",
      "Analytics avanzado",
      "API access (100 req/h)",
      "Soporte prioritario",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    threadLimit: Infinity,
    apiRateLimit: 1000,
    stripePriceMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
    features: [
      "Hilos ilimitados",
      "API completa (1000 req/h)",
      "Multi-cuenta Twitter",
      "Panel de analytics",
      "White-label",
      "SLA garantizado",
      "Soporte 24/7",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name });
}

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
