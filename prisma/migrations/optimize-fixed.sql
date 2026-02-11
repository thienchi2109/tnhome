-- ========================================
-- Performance Optimization Migration
-- Fixed for PostgreSQL syntax
-- ========================================

-- 1. Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN trigram index for text search
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx"
ON "Product" USING gin (name gin_trgm_ops);

-- 3. Composite index for filtered sorting (drop old one first)
CREATE INDEX IF NOT EXISTS "Product_active_created_idx"
ON "Product" ("isActive", "createdAt" DESC)
WHERE "isActive" = true;

-- 4. Covering index for category filtering
CREATE INDEX IF NOT EXISTS "Product_category_covering_idx"
ON "Product" (category, "createdAt" DESC)
INCLUDE (id, name, price, images)
WHERE "isActive" = true;

-- 5. Price range index
CREATE INDEX IF NOT EXISTS "Product_active_price_idx"
ON "Product" ("isActive", price)
WHERE "isActive" = true;

-- 6. GIN trigram index for description search (requires pg_trgm extension)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_description_trgm_active_idx"
ON "Product" USING gin (description gin_trgm_ops)
WHERE "isActive" = true AND description IS NOT NULL;

-- 7. Analyze table
ANALYZE "Product";

-- Show results
SELECT 'Migration completed! New indexes:' as status;
SELECT indexname FROM pg_indexes WHERE tablename = 'Product' AND indexname LIKE '%trgm%' OR indexname LIKE '%active%' OR indexname LIKE '%covering%';
