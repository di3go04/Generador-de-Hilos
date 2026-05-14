import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publishThread, decrypt, refreshTwitterToken, encrypt } from "@/lib/twitter";

// Vercel Cron Job — runs every 5 minutes
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "*/5 * * * *" }] }

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all pending scheduled posts that are due
  const duePosts = await db.scheduledPost.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: now },
    },
    include: {
      thread: { select: { content: true, title: true } },
      user: { select: { id: true } },
    },
    take: 20, // Process max 20 per cron run
  });

  if (duePosts.length === 0) {
    return NextResponse.json({ processed: 0, message: "No posts due" });
  }

  const results = await Promise.allSettled(
    duePosts.map(async (post) => {
      const twitterToken = await db.twitterToken.findUnique({
        where: { userId: post.user.id },
      });

      if (!twitterToken) {
        await db.scheduledPost.update({
          where: { id: post.id },
          data: { status: "failed", error: "No Twitter token found" },
        });
        return;
      }

      let accessToken = decrypt(twitterToken.accessToken);

      // Refresh token if expired
      if (twitterToken.expiresAt && twitterToken.expiresAt < now && twitterToken.refreshToken) {
        const refreshed = await refreshTwitterToken(decrypt(twitterToken.refreshToken));
        if (refreshed) {
          accessToken = refreshed.accessToken;
          await db.twitterToken.update({
            where: { id: twitterToken.id },
            data: {
              accessToken: encrypt(refreshed.accessToken),
              refreshToken: encrypt(refreshed.refreshToken),
              expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
            },
          });
        }
      }

      const result = await publishThread(accessToken, post.thread.content);

      if (result.success) {
        await Promise.all([
          db.scheduledPost.update({
            where: { id: post.id },
            data: { status: "published", publishedAt: new Date() },
          }),
          db.thread.update({
            where: { id: post.threadId },
            data: { status: "PUBLISHED", twitterIds: result.tweetIds, publishedAt: new Date() },
          }),
        ]);
      } else {
        await db.scheduledPost.update({
          where: { id: post.id },
          data: { status: "failed", error: result.error ?? "Unknown error" },
        });
      }
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ processed: duePosts.length, succeeded, failed });
}
