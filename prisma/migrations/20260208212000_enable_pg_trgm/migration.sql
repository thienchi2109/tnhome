-- ========================================
-- Enable pg_trgm extension (Supabase Postgres on VPS)
-- Date: 2026-02-08
-- ========================================

-- 1) Guard: ensure pg_trgm is available in this Postgres build.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_available_extensions
    WHERE name = 'pg_trgm'
  ) THEN
    RAISE EXCEPTION 'pg_trgm is not available in this Postgres build';
  END IF;
END;
$$;

-- 2) Supabase image compatibility:
-- Some images expect role "supabase_admin" to exist and have elevated privileges
-- while running extension hooks.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'supabase_admin'
  ) THEN
    CREATE ROLE supabase_admin SUPERUSER CREATEROLE CREATEDB NOLOGIN;
  ELSE
    ALTER ROLE supabase_admin WITH SUPERUSER CREATEROLE CREATEDB;
  END IF;
END;
$$;

-- 3) Enable extension (idempotent).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4) Verification output.
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pg_trgm';
