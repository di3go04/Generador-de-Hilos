-- ============================================================================
-- Migration 003: Stripe customer ID on tenants
-- ============================================================================

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
