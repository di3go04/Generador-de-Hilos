import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { publishThread, decrypt } from "@/lib/twitter";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(500),
  content: z.array(z.string()).min(1).max(25),
  tone: z.string().default("professional"),
  language: z.string().default("es"),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  scheduleAt: z.string().optional(),
  folderId: z.string().optional(),
});

// GET /api/threads — list user threads
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") ?? "";
  const folderId = searchParams.get("folderId");

  const where = {
    userId: session.user.id,
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
    ...(folderId && { folderId }),
  };

  const [threads, total] = await Promise.all([
    db.thread.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: { folder: { select: { name: true, color: true } } },
    }),
    db.thread.count({ where }),
  ]);

  return NextResponse.json({ threads, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/threads — create thread
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const userId = session.user.id;
    const now = new Date();

    // Create thread
    const thread = await db.thread.create({
      data: {
        userId, title: data.title, topic: data.topic,
        content: data.content, tone: data.tone, language: data.language,
        status: data.status, folderId: data.folderId ?? null,
      },
    });

    // Record usage
    await db.usageRecord.create({
      data: {
        userId, metric: "thread_generated", quantity: 1,
        month: now.getMonth() + 1, year: now.getFullYear(),
      },
    });

    // Schedule post if needed
    if (data.status === "SCHEDULED" && data.scheduleAt) {
      await db.scheduledPost.create({
        data: { userId, threadId: thread.id, scheduledAt: new Date(data.scheduleAt) },
      });
    }

    // Publish to Twitter immediately if requested
    if (data.status === "PUBLISHED") {
      const twitterToken = await db.twitterToken.findUnique({ where: { userId } });
      if (twitterToken?.accessToken) {
        const accessToken = decrypt(twitterToken.accessToken);
        const result = await publishThread(accessToken, data.content);
        if (result.success) {
          await db.thread.update({
            where: { id: thread.id },
            data: { twitterIds: result.tweetIds, publishedAt: new Date() },
          });
        }
      }
    }

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.issues }, { status: 400 });
    }
    console.error("Create thread error:", error);
    return NextResponse.json({ error: "Error al crear hilo" }, { status: 500 });
  }
}
