import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { z } from "zod";

// GET /api/v1/keys — list API keys
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: { id: true, name: true, key: true, lastUsed: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Mask keys: show first 8 and last 4 chars
  const masked = keys.map((k) => ({
    ...k,
    key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
    fullKey: undefined,
  }));

  return NextResponse.json({ keys: masked });
}

// POST /api/v1/keys — create new API key
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const name = z.string().min(1).max(50).parse(body.name ?? "Default");

  // Limit: max 5 active API keys
  const count = await db.apiKey.count({
    where: { userId: session.user.id, revokedAt: null },
  });
  if (count >= 5) {
    return NextResponse.json({ error: "Máximo 5 API keys activas" }, { status: 400 });
  }

  // Check plan allows API access
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (user?.plan === "FREE") {
    return NextResponse.json(
      { error: "El acceso a API requiere plan Pro o Enterprise" },
      { status: 403 }
    );
  }

  const key = `ghk_${randomUUID().replace(/-/g, "")}`;
  const apiKey = await db.apiKey.create({
    data: { userId: session.user.id, name, key },
  });

  return NextResponse.json({
    key: { id: apiKey.id, name: apiKey.name, key, createdAt: apiKey.createdAt },
    message: "Guarda esta key, no podrás verla de nuevo completa.",
  }, { status: 201 });
}

// DELETE /api/v1/keys/:id — revoke key
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await req.json();
  await db.apiKey.updateMany({
    where: { id, userId: session.user.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
