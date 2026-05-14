/**
 * Dev-mode database — SQLite via sql.js (zero native deps).
 * Replaces postgres.js when PostgreSQL is not available.
 * Supports the same tagged-template-literal API and persists to disk.
 */
import initSqlJs, { type Database as SqlJsDb } from "sql.js";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

let dbPromise: Promise<SqlJsDb> | null = null;
const DB_PATH = process.env.DEV_DB_PATH || "./.dev-urban.db";

async function getDb(): Promise<SqlJsDb> {
  if (!dbPromise) {
    const SQL = await initSqlJs();
    let db: SqlJsDb;

    const absPath = path.resolve(DB_PATH);
    if (fs.existsSync(absPath)) {
      const fileBuffer = fs.readFileSync(absPath);
      db = new SQL.Database(fileBuffer);
      console.log(`📂 Cargada DB de desarrollo desde: ${absPath}`);
    } else {
      db = new SQL.Database();
      console.log("⚠️ Iniciada DB de desarrollo en blanco (memoria)");
    }

    dbPromise = Promise.resolve(db);
  }
  return dbPromise;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function toSqliteSQL(sql: string): string {
  return sql
    .replace(/gen_random_uuid\(\)/gi, () => `'${randomUUID()}'`)
    .replace(/date_trunc\('month',\s*(\w+(?:\.\w+)?)\)/gi, "strftime('%Y-%m-01', $1)")
    // Eliminar casts de Postgres ::type
    .replace(/::\w+/g, "")
    .replace(/\s+FOR UPDATE SKIP LOCKED/gi, "")
    .replace(/\buuid\b/gi, (match, offset, str) => {
      const before = str.slice(Math.max(0, offset - 20), offset).toUpperCase();
      if (before.includes("CREATE") || before.includes("ALTER") || before.includes("TYPE")) return "TEXT";
      return match;
    })
    .replace(/\btimestamptz\b/gi, "TEXT")
    .replace(/\bboolean\b/gi, "INTEGER")
    .replace(/user_role/g, "TEXT");
    // NO reemplazamos set_tenant_context aquí para que el interceptor pueda verlo
}

function transformArgs(strings: TemplateStringsArray, values: any[]): { sql: string; params: any[] } {
  let rawSql = "";
  for (let i = 0; i < strings.length; i++) {
    rawSql += strings[i];
    if (i < values.length) {
      const v = values[i];
      if (v?.constructor?.name === "UUID") {
        rawSql += `?`;
        values[i] = v.toString();
      } else if (v instanceof Date) {
        rawSql += `?`;
        values[i] = v.toISOString();
      } else {
        rawSql += `?`;
      }
    }
  }
  return { sql: toSqliteSQL(rawSql), params: values };
}

function rowsToObjects(stmt: any): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    for (const key of Object.keys(row)) {
      if (typeof row[key] === "bigint") row[key] = Number(row[key]);
    }
    rows.push(row);
  }
  stmt.free();
  return rows;
}

// ── Main query function ─────────────────────────────────────────────────────
const tenantContext: { tenantId: string | null } = { tenantId: null };

async function query(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  const db = await getDb();
  const { sql, params } = transformArgs(strings, values);
  const normalizedSql = sql.replace(/\s+/g, " ").trim();
  const upSql = normalizedSql.toUpperCase();

  // Interceptor de Configuración de Tenant (Multi-tenancy)
  if (upSql.includes("SET_CONFIG") || upSql.includes("SET_TENANT_CONTEXT")) {
    if (params && params.length > 0) {
      tenantContext.tenantId = params[0];
    }
    return []; // No enviamos nada a SQLite
  }
  
  if (upSql.includes("CURRENT_SETTING")) {
    return [{ current_setting: tenantContext.tenantId || "" }];
  }

  try {
    const isMutation = normalizedSql.startsWith("INSERT") || normalizedSql.startsWith("UPDATE") || normalizedSql.startsWith("DELETE");
    const stmt = db.prepare(normalizedSql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    const rows = rowsToObjects(stmt);

    if (isMutation) {
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    }

    return rows;
  } catch (err: any) {
    try {
      db.run(normalizedSql, params);
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
      return [];
    } catch (innerErr: any) {
      console.error(`❌ SQL Error en SQLite: ${normalizedSql}`);
      throw innerErr;
    }
  }
}

async function begin<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  const db = await getDb();
  db.run("BEGIN");
  try {
    const result = await fn(devSql);
    db.run("COMMIT");
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    return result;
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }
}

async function end() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

function unsafe(rawSql: string, params?: any[]): Promise<any[]> {
  return query(Object.assign([rawSql], { raw: [rawSql] }), ...(params || []));
}

export const devSql = Object.assign(query, {
  begin,
  end,
  unsafe,
}) as any;
