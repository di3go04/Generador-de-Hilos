import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateThread } from "@/lib/ai-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  topic: z.string().min(5).max(500),
  tone: z.enum(["professional", "casual", "educational", "viral", "storytelling"]).default("professional"),
  language: z.enum(["es", "en"]).default("es"),
  tweetCount: z.number().int().min(3).max(20).default(7),
  includeEmojis: z.boolean().default(true),
  includeHashtags: z.boolean().default(true),
  categoryId: z.string().optional(),
});

async function getApiKeyUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  const apiKey = await db.apiKey.findUnique({
    where: { key: token },
    include: { user: { select: { id: true, plan: true, banned: true } } },
  });

  if (!apiKey || apiKey.revokedAt || apiKey.user.banned) return null;

  // Update last used
  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } });
  return apiKey.user;
}

export async function POST(req: Request) {
  try {
    // Auth via API key
    const user = await getApiKeyUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "API key inválida o revocada" },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitKey = `${user.id}:${ip}`;
    const { success, remaining, reset } = await checkRateLimit(rateLimitKey, user.plan);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit excedido. Espera antes de hacer otra petición." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }

    const body = await req.json();
    const options = schema.parse(body);

    const result = await generateThread(options);

    // Save to DB
    const now = new Date();
    const thread = await db.thread.create({
      data: {
        userId: user.id, title: result.title, topic: options.topic,
        content: JSON.stringify(result.tweets), tone: options.tone, language: options.language,
        status: "DRAFT",
        ...(options.categoryId && {
          categories: { create: [{ categoryId: options.categoryId }] },
        }),
      },
    });

    await db.usageRecord.create({
      data: {
        userId: user.id, metric: "thread_generated", quantity: 1,
        month: now.getMonth() + 1, year: now.getFullYear(),
      },
    });

    return NextResponse.json({
      thread: { id: thread.id, title: result.title, tweets: result.tweets },
      meta: { remaining, reset },
    }, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.issues }, { status: 400 });
    }
    console.error("API v1 error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
