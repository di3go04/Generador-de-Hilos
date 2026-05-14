import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Save lead to DB
    await db.user.upsert({
      where: { email },
      create: { 
        email, 
        role: "USER", 
        plan: "FREE",
        // Marking as non-registered yet if needed, but let's just use lead tracking
      },
      update: {}, // Don't overwrite if already exists
    });

    // Optional: Integration with Resend/Mailchimp here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
}
