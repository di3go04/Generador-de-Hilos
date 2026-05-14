/**
 * Database accessor — auto-detects PostgreSQL or falls back to SQLite (dev mode).
 */
import { config } from "../config.js";

interface SqlClient {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  begin: <T>(fn: (tx: SqlClient) => Promise<T>) => Promise<T>;
  end: () => Promise<void>;
  unsafe: (rawSql: string, params?: any[]) => Promise<any[]>;
}

let sql: SqlClient;

async function init() {
  const isDev = config.nodeEnv === "development" || process.env.DEV_DB === "1";

  if (isDev) {
    // Use SQLite in-memory for development
    const { devSql } = await import("./dev-db.js");
    const { ensureDevDb } = await import("./dev-init.js");

    const dbPath = process.env.DEV_DB_PATH || "./.dev-urban.db";
    await ensureDevDb(dbPath);

    sql = devSql as any;
    console.log(`📦 Dev DB: SQLite (${dbPath})`);
  } else {
    // Use PostgreSQL in production
    const { sql: pgSql } = await import("./client.js");
    sql = pgSql as any;
    console.log("🐘 PostgreSQL connected");
  }
}

// Initialize immediately
const initPromise = init().catch((err) => {
  console.error("Database init failed, falling back to dev SQLite:", err.message);
  return import("./dev-db.js").then(async ({ devSql }) => {
    const { ensureDevDb } = await import("./dev-init.js");
    await ensureDevDb();
    sql = devSql as any;
    console.log("📦 Fallback Dev DB: SQLite in-memory");
  });
});

export { sql, initPromise };
