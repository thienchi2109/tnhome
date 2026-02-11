SELECT
  '📊 PRODUCT TABLE INDEXES' as info;

SELECT
  indexname,
  CASE
    WHEN indexname LIKE '%trgm%' THEN '🔍 Trigram (Text Search)'
    WHEN indexname LIKE '%covering%' THEN '📦 Covering Index'
    WHEN indexname LIKE '%active%' THEN '⚡ Partial Index'
    ELSE '📌 Standard Index'
  END as type
FROM pg_indexes
WHERE tablename = 'Product'
ORDER BY indexname;

SELECT
  '\n✅ EXTENSION STATUS' as info;

SELECT
  extname,
  extversion,
  '✅ Enabled' as status
FROM pg_extension
WHERE extname = 'pg_trgm';
