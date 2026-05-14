import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const userId = session.metadata?.userId;
        if (userId) {
          await db.user.update({ where: { id: userId }, data: { plan } });
          await upsertSubscription(userId, sub);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await getUserIdFromCustomer(sub.customer as string);
      if (userId) {
        const priceId = sub.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const isActive = sub.status === "active" || sub.status === "trialing";
        await db.user.update({
          where: { id: userId },
          data: { plan: isActive ? plan : "FREE" },
        });
        await upsertSubscription(userId, sub);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await getUserIdFromCustomer(sub.customer as string);
      if (userId) {
        await db.user.update({ where: { id: userId }, data: { plan: "FREE" } });
        await db.subscription.deleteMany({ where: { stripeSubscriptionId: sub.id } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPriceId(priceId?: string): "FREE" | "PRO" | "ENTERPRISE" {
  if (!priceId) return "FREE";
  const proPrices = [process.env.STRIPE_PRICE_PRO_MONTHLY, process.env.STRIPE_PRICE_PRO_ANNUAL];
  const entPrices = [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY, process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL];
  if (proPrices.includes(priceId)) return "PRO";
  if (entPrices.includes(priceId)) return "ENTERPRISE";
  return "FREE";
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const periodEnd = new Date(((sub as any).current_period_end as number) * 1000);
  await db.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId, stripeSubscriptionId: sub.id,
      stripePriceId: sub.items.data[0]?.price.id ?? "",
      stripeCurrentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripePriceId: sub.items.data[0]?.price.id ?? "",
      stripeCurrentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}
