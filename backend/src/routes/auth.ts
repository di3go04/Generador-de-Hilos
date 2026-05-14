import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sql } from "../db/index.js";
import { signToken } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  tenantName: z.string().min(1).optional(),   // creates a new tenant
  tenantSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export async function authRoutes(app: FastifyInstance) {
  // ── POST /auth/login ──────────────────────────────────────────────────────
  app.post("/auth/login", async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);

    const [user] = await sql`
      SELECT u.*, tu.tenant_id, tu.role
      FROM users u
      JOIN tenant_users tu ON tu.user_id = u.id
      WHERE u.email = ${email} AND u.is_active = TRUE
      LIMIT 1
    `;

    if (!user?.password_hash) {
      throw new AppError(401, "Invalid email or password (or OAuth-only account)");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = await signToken({
      sub: user.id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    };
  });

  // ── POST /auth/register ───────────────────────────────────────────────────
  app.post("/auth/register", async (request, reply) => {
    const data = registerSchema.parse(request.body);

    // Check existing user
    const [existing] = await sql`SELECT id FROM users WHERE email = ${data.email}`;
    if (existing) {
      throw new AppError(409, "Email already registered");
    }

    const hash = await bcrypt.hash(data.password, 10);

    const result = await sql.begin(async (tx) => {
      // Create or reuse tenant
      let tenantId: string;
      if (data.tenantSlug) {
        const [existingTenant] = await tx`
          SELECT id FROM tenants WHERE slug = ${data.tenantSlug}
        `;
        if (existingTenant) {
          throw new AppError(409, `Tenant "${data.tenantSlug}" already exists`);
        }
        const [t] = await tx`
          INSERT INTO tenants (name, slug)
          VALUES (${data.tenantName || data.tenantSlug}, ${data.tenantSlug})
          RETURNING id
        `;
        tenantId = t.id;
      } else {
        // Create personal tenant from email
        const slug = data.email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-");
        const [t] = await tx`
          INSERT INTO tenants (name, slug)
          VALUES (${data.name || "Mi Espacio"}, ${slug})
          ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug || '-' || substr(gen_random_uuid()::text, 1, 6)
          RETURNING id
        `;
        tenantId = t.id;
      }

      // Create user
      const [user] = await tx`
        INSERT INTO users (email, name, password_hash, provider, provider_id)
        VALUES (${data.email}, ${data.name}, ${hash}, 'email', ${data.email})
        RETURNING id, email, name
      `;

      // Link as admin
      await tx`
        INSERT INTO tenant_users (tenant_id, user_id, role)
        VALUES (${tenantId}, ${user.id}, 'admin')
      `;

      return { user, tenantId };
    });

    const token = await signToken({
      sub: result.user.id,
      tenant_id: result.tenantId,
      role: "admin",
      email: result.user.email,
    });

    return reply.status(201).send({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: "admin",
        tenant_id: result.tenantId,
      },
    });
  });

  // ── POST /auth/oauth ──────────────────────────────────────────────────────
  app.post("/auth/oauth", async (request, reply) => {
    const { provider, code } = z.object({
      provider: z.enum(["google", "github"]),
      code: z.string(),
    }).parse(request.body);

    // Exchange code for tokens — in production, use the provider's API
    // This is a placeholder that demonstrates the flow.
    // You'd call Google or GitHub's token endpoint here.
    const providerUser = await exchangeOAuthCode(provider, code);

    // Find or create user
    let [user] = await sql`
      SELECT u.*, tu.tenant_id, tu.role
      FROM users u
      JOIN tenant_users tu ON tu.user_id = u.id
      WHERE u.provider = ${provider} AND u.provider_id = ${providerUser.id}
      LIMIT 1
    `;

    if (!user) {
      // First time — create user + personal tenant
      const slug = providerUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-");

      const result = await sql.begin(async (tx) => {
        const [t] = await tx`
          INSERT INTO tenants (name, slug)
          VALUES (${providerUser.name || "Mi Espacio"}, ${slug})
          ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug || '-' || substr(gen_random_uuid()::text, 1, 6)
          RETURNING id
        `;

        const [u] = await tx`
          INSERT INTO users (email, name, avatar_url, provider, provider_id)
          VALUES (${providerUser.email}, ${providerUser.name}, ${providerUser.avatar_url}, ${provider}, ${providerUser.id})
          RETURNING id, email, name, avatar_url
        `;

        await tx`
          INSERT INTO tenant_users (tenant_id, user_id, role)
          VALUES (${t.id}, ${u.id}, 'admin')
        `;

        return { ...u, tenant_id: t.id, role: "admin" as const };
      });

      user = result;
    }

    const token = await signToken({
      sub: user.id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    };
  });

  // ── GET /auth/me ───────────────────────────────────────────────────────────
  app.get("/auth/me", async (request, reply) => {
    if (!request.user) {
      throw new AppError(401, "Not authenticated");
    }

    const [user] = await sql`
      SELECT u.id, u.email, u.name, u.avatar_url, tu.role, tu.tenant_id, t.slug AS tenant_slug, t.name AS tenant_name, t.plan
      FROM users u
      JOIN tenant_users tu ON tu.user_id = u.id
      JOIN tenants t ON t.id = tu.tenant_id
      WHERE u.id = ${request.user.sub}
      LIMIT 1
    `;

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return { user };
  });
}

// ── OAuth helper (simplified — use a library in production) ──────────────
async function exchangeOAuthCode(provider: string, code: string): Promise<{
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}> {
  // In production, call the provider's token endpoint + userinfo endpoint.
  // Example with Google:
  //   POST https://oauth2.googleapis.com/token { code, client_id, client_secret, ... }
  //   GET  https://www.googleapis.com/oauth2/v2/userinfo { Bearer <access_token> }
  //
  // For now, return a placeholder — you'll wire this up with real credentials.
  throw new AppError(501, "OAuth exchange not yet implemented. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
}
