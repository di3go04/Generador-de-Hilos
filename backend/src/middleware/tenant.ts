import type { FastifyRequest, FastifyReply } from "fastify";
import { sql } from "../db/index.js";
import { AppError } from "../lib/errors.js";

/**
 * Tenant resolution strategy (in order of precedence):
 *
 * 1. X-Tenant-ID header  → for API clients / machine-to-machine
 * 2. Subdomain            → *.urban.localhost or *.urban.app
 * 3. From authenticated user's default tenant (via JWT)
 */

export interface TenantContext {
  tenantId: string;
  slug: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
}

declare module "fastify" {
  interface FastifyRequest {
    tenant?: TenantContext;
  }
}

function extractSlugFromHost(host: string): string | null {
  const match = host.match(/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\.(?:localhost|urban\.app|urban\.localhost)/);
  return match?.[1] ?? null;
}

export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // 1. Header-based (explicit)
  let slug: string | null | undefined = request.headers["x-tenant-id"] as string | undefined;

  // 2. Subdomain-based
  if (!slug) {
    slug = extractSlugFromHost(request.hostname);
  }

  // 3. From authenticated user's tenant
  if (!slug && request.user) {
    slug = request.user.tenant_id;
  }

  if (!slug) {
    throw new AppError(400, "Tenant not identified. Provide X-Tenant-ID header or use a subdomain.");
  }

  // Resolve tenant by slug (or by ID if UUID)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const [tenant] = isUuid
    ? await sql`SELECT id, slug, name, plan FROM tenants WHERE id = ${slug} AND is_active = TRUE`
    : await sql`SELECT id, slug, name, plan FROM tenants WHERE slug = ${slug} AND is_active = TRUE`;

  if (!tenant) {
    throw new AppError(404, "Tenant not found or inactive");
  }

  // Set tenant context for the entire request
  request.tenant = {
    tenantId: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    plan: tenant.plan,
  };

  // Inject tenant_id into PostgreSQL session for RLS
  await sql`SELECT set_tenant_context(${tenant.id}::UUID)`;
}
