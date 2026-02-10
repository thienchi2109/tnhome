# Search/Filter Performance Audit (Admin + Customer)

Date: 2026-02-08

## Scope
- Customer storefront product search/filter (`getActiveProductsPaginated`)
- Admin product search/filter (`getProducts`)
- Admin order search/filter (`getOrders`)

## Findings
- No classic N+1 query pattern was found in search/filter reads.
- Pagination race window existed: `count` and `findMany` were separate queries, so concurrent writes could cause inconsistent page metadata vs returned rows.
- Ordering was not fully deterministic for equal `createdAt` values, which can cause unstable pagination under load.

## Changes Applied
1. Wrapped pagination read paths in `prisma.$transaction(..., { isolationLevel: RepeatableRead })`.
2. Added deterministic tie-break ordering: `ORDER BY createdAt DESC, id DESC`.
3. Normalized search/category/pagination inputs in server actions to reduce expensive/unbounded query shapes.
4. Added index hardening migration for these query patterns:
   - `prisma/migrations/harden_search_filter_indexes.sql`
5. Added a repeatable SQL audit script:
   - `scripts/audit-search-filter-performance.sql`
6. Added dedicated pg_trgm enablement migration documentation:
   - `docs/pg_trgm-extension-migration.md`
   - `prisma/migrations/enable_pg_trgm_extension.sql`

## How To Audit
1. Apply migration:
```bash
psql "$DATABASE_URL" -f prisma/migrations/harden_search_filter_indexes.sql
```
2. Run audit:
```bash
psql "$DATABASE_URL" -f scripts/audit-search-filter-performance.sql
```
3. Confirm:
- Product/Order plans prefer index scans over sequential scans on listing/filter paths.
- Search plans use trigram indexes when `pg_trgm` is enabled.
- `mean_exec_time` in `pg_stat_statements` decreases on Product/Order query families.
