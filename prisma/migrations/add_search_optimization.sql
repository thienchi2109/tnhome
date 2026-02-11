-- ========================================
-- Performance Optimization Migration
-- Following Supabase PostgreSQL Best Practices
-- ========================================

-- 1. Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add GIN trigram index for product name search
-- This replaces the slow ILIKE '%search%' pattern with fast trigram search
-- Impact: 10-100x faster text search on product names
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING gin (name gin_trgm_ops);

-- 3. Optimize composite index for filtered sorting
-- Rule 1.3: Multi-column queries need composite indexes
-- Column order: equality first (isActive), then range/sort (createdAt DESC)
DROP INDEX IF EXISTS "Product_isActive_category_price_idx";
CREATE INDEX IF NOT EXISTS "Product_active_created_idx" ON "Product" (isActive, createdAt DESC)
WHERE isActive = true;  -- Partial index: only active products (Rule 1.5)

-- 4. Add covering index for category filtering
-- Rule 1.4: Include columns needed in SELECT to avoid heap lookups
CREATE INDEX IF NOT EXISTS "Product_category_covering_idx" ON "Product" (category, createdAt DESC)
INCLUDE (id, name, price, images)
WHERE isActive = true;

-- 5. Optimize price range queries
-- Composite index for price filtering with category
CREATE INDEX IF NOT EXISTS "Product_active_price_idx" ON "Product" (isActive, price)
WHERE isActive = true;

-- 6. Add statistics collection for query planner
-- Ensures PostgreSQL has accurate cardinality estimates
ANALYZE "Product";

-- ========================================
-- Index Summary
-- ========================================
-- Old indexes (keep for backward compatibility):
--   - Product_category_idx (single column)
--   - Product_isActive_idx (single column)
--
-- New optimized indexes:
--   - Product_name_trgm_idx (GIN trigram for text search)
--   - Product_active_created_idx (partial composite for sorting active products)
--   - Product_category_covering_idx (covering index for category filtering)
--   - Product_active_price_idx (partial for price range filtering)
