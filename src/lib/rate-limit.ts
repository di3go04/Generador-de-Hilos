import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
export type Plan = "FREE" | "PRO" | "ENTERPRISE";

// Initialize Redis - falls back gracefully if not configured
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch {}

const RATE_LIMITS: Record<Plan, { requests: number; window: string }> = {
  FREE: { requests: 10, window: "1 h" },
  PRO: { requests: 100, window: "1 h" },
  ENTERPRISE: { requests: 1000, window: "1 h" },
};

export async function checkRateLimit(identifier: string, plan: Plan): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  // If Redis is not configured, allow all requests (dev mode)
  if (!redis) {
    return { success: true, remaining: 999, reset: Date.now() + 3600000 };
  }

  const { requests, window } = RATE_LIMITS[plan];

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as any),
    analytics: true,
    prefix: `hilo-saas:${plan.toLowerCase()}`,
  });

  const result = await ratelimit.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
