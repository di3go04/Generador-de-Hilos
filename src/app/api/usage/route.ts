import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { recordToolUsage } from "@/lib/subscription";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { toolSlug } = await req.json();
  if (!toolSlug) {
    return new NextResponse("Missing toolSlug", { status: 400 });
  }

  try {
    const record = await recordToolUsage(session.user.id!, toolSlug);
    return NextResponse.json(record);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
