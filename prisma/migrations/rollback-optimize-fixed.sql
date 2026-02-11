-- ========================================
-- Rollback for optimize-fixed.sql
-- ========================================

-- Drop indexes in reverse order of creation
DROP INDEX CONCURRENTLY IF EXISTS "Product_description_trgm_active_idx";
DROP INDEX CONCURRENTLY IF EXISTS "Product_name_trgm_idx";
DROP INDEX CONCURRENTLY IF EXISTS "Product_active_price_idx";
DROP INDEX CONCURRENTLY IF EXISTS "Product_category_covering_idx";
DROP INDEX CONCURRENTLY IF EXISTS "Product_active_created_idx";

-- Note: DROP EXTENSION pg_trgm would affect other databases, usually skip
-- If you need to remove the extension, uncomment the following line:
-- DROP EXTENSION IF EXISTS pg_trgm;

SELECT 'Rollback completed! Indexes dropped.' as status;
