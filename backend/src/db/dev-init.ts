/**
 * Dev-mode database initializer.
 * Creates SQLite tables equivalent to the PostgreSQL schema and seeds data.
 */
import initSqlJs from "sql.js";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

let initialized = false;

export async function ensureDevDb(dbPath?: string): Promise<void> {
  if (initialized) return;

  const SQL = await initSqlJs();

  let db: any;
  if (dbPath && fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA journal_mode=WAL");
  db.run("PRAGMA foreign_keys=ON");

  // ── Create tables ─────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS tenants (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      slug      TEXT NOT NULL UNIQUE,
      plan      TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
      is_active INTEGER NOT NULL DEFAULT 1,
      stripe_customer_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT,
      avatar_url    TEXT,
      password_hash TEXT,
      provider      TEXT,
      provider_id   TEXT,
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tenant_users (
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (tenant_id, user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usage_records (
      id          TEXT PRIMARY KEY,
      tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
      metric      TEXT NOT NULL,
      quantity    INTEGER NOT NULL DEFAULT 1,
      resource_id TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run("CREATE INDEX IF NOT EXISTS idx_usage_tenant_month ON usage_records (tenant_id)");

  db.run(`
    CREATE TABLE IF NOT EXISTS ai_generations (
      id            TEXT PRIMARY KEY,
      tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
      prompt        TEXT NOT NULL,
      url           TEXT NOT NULL,
      style         TEXT,
      aspect_ratio  TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run("CREATE INDEX IF NOT EXISTS idx_ai_tenant ON ai_generations (tenant_id, created_at)");

  db.run(`
    CREATE TABLE IF NOT EXISTS conversion_jobs (
      id            TEXT PRIMARY KEY,
      tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
      status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      input_format  TEXT NOT NULL,
      output_format TEXT NOT NULL,
      resolution    TEXT NOT NULL DEFAULT 'original',
      quality       REAL NOT NULL DEFAULT 0.8,
      bitrate       TEXT NOT NULL DEFAULT 'auto',
      input_file    TEXT NOT NULL,
      output_file   TEXT,
      file_size     INTEGER,
      error_message TEXT,
      started_at    TEXT,
      completed_at  TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run("CREATE INDEX IF NOT EXISTS idx_conversion_tenant ON conversion_jobs (tenant_id, created_at)");

  // ── Seed data ────────────────────────────────────────────────────────────
  const tenantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const userId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  const existingTenant = db.exec("SELECT id FROM tenants WHERE slug = 'demo'");
  if (existingTenant.length === 0 || existingTenant[0].values.length === 0) {
    const hash = "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfK1vYaJXsRmFpMoI5x3e5cQmzOq"; // "admin123"
    db.run("INSERT INTO tenants (id, name, slug, plan) VALUES (?, 'Mi Empresa', 'demo', 'pro')", [tenantId]);
    db.run("INSERT INTO users (id, email, name, password_hash, provider, provider_id) VALUES (?, 'admin@demo.com', 'Admin Demo', ?, 'email', 'admin@demo.com')", [userId, hash]);
    db.run("INSERT INTO tenant_users (tenant_id, user_id, role) VALUES (?, ?, 'admin')", [tenantId, userId]);
    console.log("  Dev DB seeded: admin@demo.com / admin123");
  }

  // Save to file for persistence across restarts
  if (dbPath) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log(`  Dev DB saved to ${dbPath}`);
  }

  initialized = true;
}
