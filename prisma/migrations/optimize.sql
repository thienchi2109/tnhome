-- ========================================
-- Performance Optimization Migration
-- Simplified for local PostgreSQL
-- ========================================

-- 1. Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN trigram index for text search
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING gin (name gin_trgm_ops);

-- 3. Composite index for filtered sorting
DROP INDEX IF EXISTS "Product_isActive_category_price_idx";
CREATE INDEX IF NOT EXISTS "Product_active_created_idx" ON "Product" ("isActive", "createdAt" DESC) WHERE "isActive" = true;

-- 4. Covering index for category filtering
CREATE INDEX IF NOT EXISTS "Product_category_covering_idx" ON "Product" (category, "createdAt" DESC) INCLUDE (id, name, price, images) WHERE "isActive" = true;

-- 5. Price range index
CREATE INDEX IF NOT EXISTS "Product_active_price_idx" ON "Product" ("isActive", price) WHERE "isActive" = true;

-- 6. Analyze table
ANALYZE "Product";
