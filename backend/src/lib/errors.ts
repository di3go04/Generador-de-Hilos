import type { FastifyReply } from "fastify";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(reply: FastifyReply, err: unknown) {
  if (err instanceof AppError) {
    return reply.status(err.statusCode).send({
      error: err.name,
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);
  return reply.status(500).send({
    error: "InternalServerError",
    message: "An unexpected error occurred",
  });
}
