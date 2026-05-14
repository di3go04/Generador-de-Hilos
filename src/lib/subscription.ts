import { db } from "./db";
import { startOfDay, endOfDay } from "date-fns";

export const PLANS = {
  FREE: {
    id: "FREE",
    name: "Gratis",
    dailyLimit: 3,
    tools: "Basic",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    dailyLimit: Infinity,
    tools: "Unlimited",
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Empresarial",
    dailyLimit: Infinity,
    tools: "Unlimited + Teams",
  },
};

export async function getUserUsage(userId: string) {
  const today = new Date();
  const usageCount = await db.usageRecord.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
    },
  });
  return usageCount;
}

export async function canUserUseTool(userId: string, userPlan: string) {
  if (userPlan === "PRO" || userPlan === "ENTERPRISE") return true;

  const usage = await getUserUsage(userId);
  return usage < PLANS.FREE.dailyLimit;
}

export async function recordToolUsage(userId: string, toolSlug: string) {
  return db.usageRecord.create({
    data: {
      userId,
      toolSlug,
    },
  });
}
