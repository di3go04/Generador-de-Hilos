import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.TWITTER_ENCRYPTION_KEY || "dev-key-32-bytes-fallback-value!";
  return Buffer.from(key.padEnd(KEY_LENGTH, "0").slice(0, KEY_LENGTH));
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export interface TwitterPublishResult {
  tweetIds: string[];
  success: boolean;
  error?: string;
}

export async function publishThread(
  accessToken: string,
  tweets: string[]
): Promise<TwitterPublishResult> {
  if (!accessToken) {
    return { tweetIds: [], success: false, error: "No Twitter token" };
  }

  const tweetIds: string[] = [];

  try {
    let replyToId: string | undefined;

    for (const tweetText of tweets) {
      const body: Record<string, unknown> = { text: tweetText };
      if (replyToId) {
        body.reply = { in_reply_to_tweet_id: replyToId };
      }

      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Twitter API error: ${error}`);
      }

      const data = await res.json();
      const tweetId = data.data?.id;
      if (tweetId) {
        tweetIds.push(tweetId);
        replyToId = tweetId;
      }
    }

    return { tweetIds, success: true };
  } catch (error: any) {
    return { tweetIds, success: false, error: error.message };
  }
}

export async function refreshTwitterToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID!;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch {
    return null;
  }
}
