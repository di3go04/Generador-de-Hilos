/**
 * Seed script — creates a dev tenant and admin user.
 * Usage: npm run seed
 */
import { sql } from "./index.js";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database…");

  const [tenant] = await sql`
    INSERT INTO tenants (name, slug, plan)
    VALUES ('Mi Empresa', 'demo', 'pro')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  const hash = await bcrypt.hash("admin123", 10);

  const [user] = await sql`
    INSERT INTO users (email, name, password_hash, provider, provider_id)
    VALUES ('admin@demo.com', 'Admin Demo', ${hash}, 'email', 'admin@demo.com')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  await sql`
    INSERT INTO tenant_users (tenant_id, user_id, role)
    VALUES (${tenant.id}, ${user.id}, 'admin')
    ON CONFLICT DO NOTHING
  `;

  console.log(`  Tenant:  ${tenant.id} (slug: demo)`);
  console.log(`  Admin:   ${user.id} (admin@demo.com / admin123)`);

  await sql.end();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
