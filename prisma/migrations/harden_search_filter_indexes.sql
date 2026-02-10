-- ========================================
-- Search/Filter Hardening for Admin + Storefront
-- Date: 2026-02-08
-- ========================================

-- Try enabling pg_trgm when privileges allow.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipping pg_trgm extension creation: %', SQLERRM;
END;
$$;

-- Product listing sort stability + pagination support
CREATE INDEX IF NOT EXISTS "Product_isActive_createdAt_id_idx"
ON "Product" ("isActive", "createdAt" DESC, id DESC);

CREATE INDEX IF NOT EXISTS "Product_isActive_category_createdAt_id_idx"
ON "Product" ("isActive", category, "createdAt" DESC, id DESC);

-- Admin order listing sort support
CREATE INDEX IF NOT EXISTS "Order_createdAt_id_idx"
ON "Order" ("createdAt" DESC, id DESC);

CREATE INDEX IF NOT EXISTS "Order_status_createdAt_id_idx"
ON "Order" (status, "createdAt" DESC, id DESC);

-- Trigram indexes for contains/ILIKE search paths (if pg_trgm is enabled).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    EXECUTE
      'CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING gin (name gin_trgm_ops)';
    EXECUTE
      'CREATE INDEX IF NOT EXISTS "Product_description_trgm_idx" ON "Product" USING gin (description gin_trgm_ops) WHERE description IS NOT NULL';
    EXECUTE
      'CREATE INDEX IF NOT EXISTS "Order_id_trgm_idx" ON "Order" USING gin (id gin_trgm_ops)';
    EXECUTE
      'CREATE INDEX IF NOT EXISTS "Order_shippingName_trgm_idx" ON "Order" USING gin ("shippingName" gin_trgm_ops)';
    EXECUTE
      'CREATE INDEX IF NOT EXISTS "Order_shippingPhone_trgm_idx" ON "Order" USING gin ("shippingPhone" gin_trgm_ops)';
  ELSE
    RAISE NOTICE 'pg_trgm is not enabled; trigram index creation skipped.';
  END IF;
END;
$$;

ANALYZE "Product";
ANALYZE "Order";
