import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateThread } from "@/lib/ai-service";
import { PLANS } from "@/lib/stripe";
import { z } from "zod";

const generateSchema = z.object({
  topic: z.string().min(5).max(500),
  tone: z.enum(["professional", "casual", "educational", "viral", "storytelling"]),
  language: z.enum(["es", "en"]),
  tweetCount: z.number().int().min(3).max(20),
  includeEmojis: z.boolean(),
  includeHashtags: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const options = generateSchema.parse(body);

    // Check plan limits
    const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const plan = user?.plan ?? "FREE";
    const planConfig = PLANS[plan];

    if (planConfig.threadLimit !== Infinity) {
      const now = new Date();
      const usage = await db.usageRecord.aggregate({
        where: {
          userId,
          metric: "thread_generated",
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        _sum: { quantity: true },
      });
      const used = usage._sum.quantity ?? 0;
      if (used >= planConfig.threadLimit) {
        return NextResponse.json(
          { error: `Límite del plan ${plan} alcanzado (${planConfig.threadLimit}/mes). Actualiza tu plan.` },
          { status: 429 }
        );
      }
    }

    const result = await generateThread(options);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.issues }, { status: 400 });
    }
    console.error("Generate thread error:", error);
    return NextResponse.json({ error: "Error al generar" }, { status: 500 });
  }
}
