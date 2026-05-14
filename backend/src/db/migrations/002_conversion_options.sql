-- ============================================================================
-- Migration 002: Add conversion options to conversion_jobs
-- ============================================================================

ALTER TABLE conversion_jobs
  ADD COLUMN IF NOT EXISTS resolution TEXT NOT NULL DEFAULT 'original',
  ADD COLUMN IF NOT EXISTS quality REAL NOT NULL DEFAULT 0.8,
  ADD COLUMN IF NOT EXISTS bitrate TEXT NOT NULL DEFAULT 'auto';
