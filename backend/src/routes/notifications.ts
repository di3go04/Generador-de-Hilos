import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { EventEmitter } from "events";
import { sql, initPromise } from "../db/index.js";

// Global event emitter for job updates
export const jobEvents = new EventEmitter();

// Initialize listener safely after DB is ready
initPromise.then(() => {
  if (sql && typeof (sql as any).listen === "function") {
    (sql as any).listen("job_updates", (payload: string) => {
      try {
        const data = JSON.parse(payload);
        jobEvents.emit("update", data);
      } catch (err) {
        console.error("Error parsing DB notification:", err);
      }
    });
    console.log("🔔 DB Notification listener active");
  } else {
    console.warn("⚠️ DB Client does not support 'listen' (Normal in SQLite dev mode)");
  }
});

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/notifications/subscribe", async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = request.tenant?.tenantId;
    if (!tenantId) {
      return reply.status(401).send({ error: "Unauthorized: No tenant context" });
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const onUpdate = (data: any) => {
      if (data.tenant_id === tenantId) {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    jobEvents.on("update", onUpdate);

    const keepAlive = setInterval(() => {
      reply.raw.write(": keep-alive\n\n");
    }, 30000);

    request.raw.on("close", () => {
      clearInterval(keepAlive);
      jobEvents.off("update", onUpdate);
    });
  });
}
