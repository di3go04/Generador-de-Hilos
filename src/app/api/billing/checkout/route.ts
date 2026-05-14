import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createCheckoutSession, createStripeCustomer, stripe } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  priceId: z.string(),
  interval: z.enum(["month", "year"]).default("month"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { priceId } = schema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    let customerId = user?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer(user!.email!, user?.name ?? "");
      customerId = customer.id;
      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      userId: session.user.id,
      successUrl: `${appUrl}/dashboard?success=true`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Error al crear sesión de pago" }, { status: 500 });
  }
}
