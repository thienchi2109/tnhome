-- ========================================
-- Database Optimization Verification Script
-- Run this after applying the migration
-- ========================================

-- 1. Verify pg_trgm extension is enabled
SELECT
  extname as "Extension",
  extversion as "Version",
  CASE WHEN extname = 'pg_trgm' THEN '✅ Enabled' ELSE '❌ Missing' END as "Status"
FROM pg_extension
WHERE extname = 'pg_trgm';

-- 2. List all indexes on Product table
SELECT
  schemaname as "Schema",
  tablename as "Table",
  indexname as "Index Name",
  indexdef as "Definition"
FROM pg_indexes
WHERE tablename = 'Product'
ORDER BY indexname;

-- 3. Check index sizes (to verify partial indexes are smaller)
SELECT
  schemaname as "Schema",
  tablename as "Table",
  indexname as "Index Name",
  pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as "Size",
  idx_scan as "Scans",
  idx_tup_read as "Tuples Read",
  idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes
WHERE tablename = 'Product'
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;

-- 4. Test query plans for optimized queries

-- 4a. Text search query (should use Product_name_trgm_idx)
EXPLAIN ANALYZE
SELECT id, name, price, category, images
FROM "Product"
WHERE name ILIKE '%chair%' AND "isActive" = true;

-- 4b. Category filter with sort (should use Product_category_covering_idx)
EXPLAIN ANALYZE
SELECT id, name, price, category, images
FROM "Product"
WHERE "isActive" = true AND category = 'Living Room'
ORDER BY "createdAt" DESC
LIMIT 20;

-- 4c. Price range query (should use Product_active_price_idx)
EXPLAIN ANALYZE
SELECT id, name, price, category, images
FROM "Product"
WHERE "isActive" = true
  AND price BETWEEN 1000000 AND 5000000
ORDER BY "createdAt" DESC
LIMIT 20;

-- 5. Check for unused indexes (cleanup candidates)
SELECT
  schemaname as "Schema",
  tablename as "Table",
  indexname as "Index Name",
  idx_scan as "Times Used",
  pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as "Size",
  CASE
    WHEN idx_scan = 0 THEN '⚠️ Never used - consider dropping'
    WHEN idx_scan < 100 THEN '🟡 Rarely used'
    ELSE '✅ Frequently used'
  END as "Status"
FROM pg_stat_user_indexes
WHERE tablename = 'Product'
ORDER BY idx_scan ASC;

-- 6. Check table statistics (should show ANALYZE has run)
SELECT
  schemaname as "Schema",
  tablename as "Table",
  n_live_tup as "Live Rows",
  n_dead_tup as "Dead Rows",
  last_vacuum as "Last Vacuum",
  last_autovacuum as "Last Autovacuum",
  last_analyze as "Last Analyze",
  last_autoanalyze as "Last Autoanalyze"
FROM pg_stat_user_tables
WHERE tablename = 'Product';

-- ========================================
-- Expected Results
-- ========================================
-- 1. pg_trgm extension should show "✅ Enabled"
-- 2. Should see 6-7 indexes on Product table including new optimized ones
-- 3. Partial indexes should be smaller than full table indexes
-- 4. Query plans should show "Index Scan" or "Index Only Scan" (not "Seq Scan")
-- 5. All new indexes should show usage after running queries
-- 6. Last Analyze should be recent (within minutes)
