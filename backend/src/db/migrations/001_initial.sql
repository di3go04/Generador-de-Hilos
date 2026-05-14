-- ============================================================================
-- Migration 001: Initial schema — Multi-tenant SaaS foundation
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tenants (organizations / accounts) ──────────────────────────────────────
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,             -- used as subdomain: slug.urban.app
  plan        TEXT NOT NULL DEFAULT 'free'      -- free | pro | enterprise
                    CHECK (plan IN ('free', 'pro', 'enterprise')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Users (belong to a tenant, can be in multiple) ─────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  avatar_url      TEXT,
  password_hash   TEXT,                         -- NULL if OAuth-only
  provider        TEXT,                         -- 'google' | 'github' | 'email'
  provider_id     TEXT,                         -- ID from OAuth provider
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Tenant membership (many-to-many with role) ────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'member');

CREATE TABLE tenant_users (
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- ── Usage metering (per-tenant, per-month) ────────────────────────────────
CREATE TABLE usage_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  metric        TEXT NOT NULL,                  -- 'conversion' | 'ai_generation' | 'ocr_page'
  quantity      INTEGER NOT NULL DEFAULT 1,
  resource_id   TEXT,                           -- optional: filename or resource identifier
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_tenant_month ON usage_records (tenant_id, date_trunc('month', created_at));

-- ── Conversion jobs (tracks server-side processing) ───────────────────────
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE conversion_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  status          job_status NOT NULL DEFAULT 'pending',
  input_format    TEXT NOT NULL,
  output_format   TEXT NOT NULL,
  input_file      TEXT NOT NULL,                -- S3 key or local path
  output_file     TEXT,                         -- S3 key (set on completion)
  file_size       BIGINT,                       -- bytes
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversion_tenant ON conversion_jobs (tenant_id, created_at DESC);

-- ============================================================================
-- Row-Level Security (RLS) — THE critical piece for multi-tenant isolation
-- ============================================================================

-- Each tenant only sees their own rows.
-- The tenant_id is injected via a session variable set by the middleware.

-- ── Helper: set tenant context ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', p_tenant_id::TEXT, TRUE);
END;
$$ LANGUAGE plpgsql;

-- ── Helper: get current tenant_id from session ────────────────────────────
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.tenant_id', TRUE), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- ── Enable RLS on all tenant-scoped tables ────────────────────────────────
ALTER TABLE usage_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_jobs ENABLE ROW LEVEL SECURITY;

-- ── Tenant isolation policies ─────────────────────────────────────────────
-- Every SELECT/INSERT/UPDATE/DELETE automatically filters by tenant_id.

CREATE POLICY tenant_isolation ON usage_records
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON conversion_jobs
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- ── Tenant users: a tenant can see its own members ────────────────────────
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_users_isolation ON tenant_users
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- ============================================================================
-- Indexes & performance
-- ============================================================================

CREATE INDEX idx_users_provider ON users (provider, provider_id)
  WHERE provider IS NOT NULL;
