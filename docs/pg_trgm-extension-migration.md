# pg_trgm Extension Migration (VPS + Supabase Postgres 15)

Date: 2026-02-08

## Why this migration exists
Search queries in admin/storefront use `contains`/`ILIKE` patterns. Without `pg_trgm`, PostgreSQL falls back to sequential scans for `%term%` patterns.

In some Supabase Postgres Docker images, `CREATE EXTENSION pg_trgm` can fail with:
`role "supabase_admin" does not exist`.

This migration handles that case and enables `pg_trgm` safely.

## Migration file
`prisma/migrations/enable_pg_trgm_extension.sql`

What it does:
1. Verifies `pg_trgm` is available in the current Postgres build.
2. Ensures `supabase_admin` exists and has `SUPERUSER/CREATEROLE/CREATEDB` (required by some Supabase extension hooks).
3. Runs `CREATE EXTENSION IF NOT EXISTS pg_trgm`.
4. Prints installed extension version for verification.

## Run in Docker
PowerShell one-command helper (recommended on Windows):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-pgtrgm-migration.ps1
```

Linux/macOS (bash):
```bash
docker compose exec -T postgres psql -U postgres -d tnhome -f - < prisma/migrations/enable_pg_trgm_extension.sql
```

Windows PowerShell:
```powershell
Get-Content -Raw "prisma/migrations/enable_pg_trgm_extension.sql" |
  docker compose exec -T postgres psql -U postgres -d tnhome -f -
```

Script options:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-pgtrgm-migration.ps1 -Service postgres -DbUser postgres -Database tnhome
powershell -ExecutionPolicy Bypass -File .\scripts\run-pgtrgm-migration.ps1 -SkipHardening
powershell -ExecutionPolicy Bypass -File .\scripts\run-pgtrgm-migration.ps1 -SkipVerify
```

## Verify
```bash
docker compose exec -T postgres psql -U postgres -d tnhome -c "SELECT extname, extversion FROM pg_extension WHERE extname='pg_trgm';"
docker compose exec -T postgres psql -U postgres -d tnhome -c "SELECT rolname, rolsuper FROM pg_roles WHERE rolname='supabase_admin';"
```

Expected result: one row with `extname = pg_trgm`.
`supabase_admin` should have `rolsuper = t`.

## After enabling pg_trgm
Apply search/filter index migration so trigram indexes can be created:
```bash
docker compose exec -T postgres psql -U postgres -d tnhome -f - < prisma/migrations/harden_search_filter_indexes.sql
```

## Rollback (only if needed)
If you must remove the extension:
```sql
DROP EXTENSION IF EXISTS pg_trgm;
```

Note: dropping extension can invalidate dependent trigram indexes.

## Security note
This flow is intended for self-hosted VPS deployments where you control the database.
It grants elevated privileges to `supabase_admin` to match Supabase extension-hook expectations.
