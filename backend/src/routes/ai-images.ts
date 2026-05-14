import { FastifyInstance } from "fastify";
import { z } from "zod";
import { StabilityService } from "../services/stability.js";
import { BillingService } from "../services/billing.js";
import { AppError } from "../lib/errors.js";

const GenerationSchema = z.object({
  prompt: z.string().min(10),
  style: z.string(),
  aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3"]),
});

export default async function aiImageRoutes(fastify: FastifyInstance) {
  // GET: Obtener estado de uso
  fastify.get("/usage-status", async (request) => {
    const tenant = request.tenant;
    if (!tenant) throw new AppError(401, "Tenant no identificado");

    // Lógica de límites según plan
    const limits = { free: 5, pro: 100, enterprise: 999999 };
    const limit = (limits as any)[tenant.plan] || 5;
    
    // Aquí consultarías usage_records para obtener el conteo de hoy
    const currentUsage = 3; // Mock por ahora

    return {
      limit,
      used: currentUsage,
      remaining: limit - currentUsage,
      plan: tenant.plan
    };
  });

  // POST: Generar Imagen
  fastify.post("/generate", async (request, reply) => {
    const tenant = request.tenant;
    if (!tenant) throw new AppError(401, "Sesión no válida");

    const { prompt, style, aspect_ratio } = GenerationSchema.parse(request.body);

    // 1. Verificar Créditos (Simulado con lógica de negocio)
    const usageStatus = { remaining: 2 }; // Mock: consultar DB/Lago aquí
    if (usageStatus.remaining <= 0) {
      return reply.status(402).send({
        error: "QuotaExceeded",
        message: "Has agotado tus generaciones diarias. Mejora tu plan para continuar."
      });
    }

    // 2. Llamada real a Stability SD3
    try {
      const imageUrl = await StabilityService.generate({
        prompt: `${prompt}, style: ${style}`,
        aspect_ratio: aspect_ratio.replace(":", "/"), // SD3 usa formato 16/9
      });

      // 3. Registrar uso y guardar en historial (DB)
      // await sql`INSERT INTO ai_generations ...`
      await BillingService.recordGeneration(tenant.tenantId, "sd3-generation");

      return {
        url: imageUrl,
        remaining: usageStatus.remaining - 1,
        message: "¡Tu obra maestra está lista!"
      };
    } catch (err: any) {
      console.error("[AI-IMAGES ROUTE ERROR]", err);
      throw new AppError(500, `Error en la generación: ${err.message}`);
    }
  });
}
