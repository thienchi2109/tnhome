-- ========================================
-- Search/Filter Performance Audit
-- Covers: storefront products + admin products + admin orders
-- ========================================

-- 1) Index inventory for Product and Order
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('Product', 'Order')
ORDER BY tablename, indexname;

-- 2) Extension status (for trigram search acceleration)
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pg_trgm';

-- 3) Storefront filter profile:
-- active + category + price + newest
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, price, category, images
FROM "Product"
WHERE "isActive" = true
  AND category = 'Living Room'
  AND price BETWEEN 1000000 AND 5000000
ORDER BY "createdAt" DESC, id DESC
LIMIT 20 OFFSET 0;

-- 4) Storefront/admin product search profile:
-- contains search over name/description + newest
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, description, price, category, images
FROM "Product"
WHERE (
  name ILIKE '%chair%'
  OR description ILIKE '%chair%'
)
ORDER BY "createdAt" DESC, id DESC
LIMIT 20 OFFSET 0;

-- 5) Admin order listing profile:
-- status filter + optional search + newest
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total, status, "shippingName", "shippingPhone", "createdAt"
FROM "Order"
WHERE status = 'PENDING'
ORDER BY "createdAt" DESC, id DESC
LIMIT 20 OFFSET 0;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total, status, "shippingName", "shippingPhone", "createdAt"
FROM "Order"
WHERE (
  id ILIKE '%abc%'
  OR "shippingName" ILIKE '%abc%'
  OR "shippingPhone" ILIKE '%abc%'
)
ORDER BY "createdAt" DESC, id DESC
LIMIT 20 OFFSET 0;

-- 6) Runtime query hotspots from pg_stat_statements (if enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    RAISE NOTICE 'pg_stat_statements is enabled. Run this query manually for hotspots:';
    RAISE NOTICE '%',
      'SELECT calls, mean_exec_time, rows, query FROM pg_stat_statements ' ||
      'WHERE query ILIKE ''%FROM "Product"%'' OR query ILIKE ''%FROM "Order"%'' ' ||
      'ORDER BY mean_exec_time DESC LIMIT 20;';
  ELSE
    RAISE NOTICE 'pg_stat_statements extension is not enabled; skipping hotspot query.';
  END IF;
END;
$$;
