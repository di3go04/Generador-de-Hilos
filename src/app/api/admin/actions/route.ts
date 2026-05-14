import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { action, userId, target, details } = await req.json();

    // Perform action
    if (action === "BAN_USER") {
      await db.user.update({ where: { id: userId }, data: { banned: true } });
    } else if (action === "UNBAN_USER") {
      await db.user.update({ where: { id: userId }, data: { banned: false } });
    } else if (action === "CHANGE_PLAN") {
      await db.user.update({ where: { id: userId }, data: { plan: target } });
    }

    // Record log
    await db.adminLog.create({
      data: {
        adminId: session.user.id,
        action,
        target: userId || target,
        details,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
