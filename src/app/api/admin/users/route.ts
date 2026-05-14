import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET — list users (admin only)
export async function GET(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 25;

  const where = search
    ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { name: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where, take: limit, skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, plan: true, role: true, banned: true, createdAt: true, _count: { select: { threads: true } } },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, pages: Math.ceil(total / limit) });
}

// PATCH — update user (admin: ban/unban, change plan)
export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, action, value } = await req.json();
  let update: Record<string, any> = {};

  if (action === "ban") update.banned = true;
  else if (action === "unban") update.banned = false;
  else if (action === "setPlan") update.plan = value;
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  await db.user.update({ where: { id: userId }, data: update });

  // Log admin action
  await db.adminLog.create({
    data: {
      adminId: session!.user!.id!,
      action, target: userId, details: JSON.stringify({ value }),
    },
  });

  return NextResponse.json({ success: true });
}
