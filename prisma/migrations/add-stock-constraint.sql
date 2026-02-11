-- Add CHECK constraint for non-negative stock
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Product_stock_non_negative'
  ) THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_stock_non_negative" CHECK ("stock" >= 0);
  END IF;
END
$$;

-- Migrate existing active products to stock=999 (so they don't appear as "Hết hàng")
UPDATE "Product" SET "stock" = 999 WHERE "isActive" = true AND "stock" = 0;
