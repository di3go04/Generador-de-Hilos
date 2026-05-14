import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config.js";
import { initPromise } from "./db/index.js";
import { tenantMiddleware } from "./middleware/tenant.js";
import { requireAuth } from "./middleware/auth.js";
import { handleError } from "./lib/errors.js";
import { authRoutes } from "./routes/auth.js";
import { conversionRoutes } from "./routes/conversions.js";
import { tenantRoutes } from "./routes/tenants.js";
import { usageRoutes } from "./routes/usage.js";
import { billingRoutes } from "./routes/billing.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { notificationRoutes } from "./routes/notifications.js";
import aiImageRoutes from "./routes/ai-images.js";

export async function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv === "development",
    bodyLimit: 50 * 1024 * 1024, // 50 MB
  });

  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
  });

  await app.register(multipart, {
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB for video uploads
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Preserve raw body for Stripe webhook signature verification
  app.addContentTypeParser("application/json", { parseAs: "buffer", bodyLimit: 1e6 }, (req, body, done) => {
    (req as any).rawBody = body;
    try {
      done(null, JSON.parse(body.toString("utf-8")));
    } catch (err: any) {
      done(err);
    }
  });

  // ── Global error handler ──────────────────────────────────────────────────
  app.setErrorHandler((error: unknown, request, reply) => {
    const err = error as any;
    if (err.name === "ZodError") {
      return reply.status(400).send({
        error: "ValidationError",
        message: "Invalid request data",
        details: err.issues,
      });
    }
    handleError(reply, error);
  });

  // ── Middleware: tenant context on every request (except webhooks) ─────────
  app.addHook("onRequest", async (request, reply) => {
    // Skip tenant resolution for webhooks (they have their own auth)
    if (request.url.startsWith("/webhooks")) {
      return;
    }
    await tenantMiddleware(request, reply);
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  await app.register(authRoutes);
  await app.register(conversionRoutes);
  await app.register(tenantRoutes);
  await app.register(usageRoutes);
  await app.register(billingRoutes);
  await app.register(webhookRoutes);
  await app.register(notificationRoutes);
  await app.register(aiImageRoutes, { prefix: "/api/ai" });

  // ── Health check ──────────────────────────────────────────────────────────
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // Wait for database initialization
  await initPromise;

  return app;
}

// ── Start ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  buildApp().then(async (app) => {
    try {
      await app.listen({ port: config.port, host: "0.0.0.0" });
      console.log(`🚀 Urban API running on http://localhost:${config.port}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}
