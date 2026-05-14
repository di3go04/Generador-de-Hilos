import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken, type TokenPayload } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

/**
 * Requires a valid JWT Bearer token.
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid Authorization header");
  }

  const token = header.slice(7);
  try {
    request.user = await verifyToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}

/**
 * Requires the authenticated user to have a specific role.
 */
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError(401, "Authentication required");
    }
    if (!roles.includes(request.user.role)) {
      throw new AppError(403, `Requires one of: ${roles.join(", ")}`);
    }
  };
}
