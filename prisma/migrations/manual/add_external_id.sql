-- Add external_id column to Product table
-- Step 1: Add nullable column
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "external_id" TEXT;

-- Step 2: Backfill existing rows with id value
UPDATE "Product" SET "external_id" = "id" WHERE "external_id" IS NULL;

-- Step 3: Set NOT NULL constraint
ALTER TABLE "Product" ALTER COLUMN "external_id" SET NOT NULL;

-- Step 4: Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Product_external_id_key" ON "Product"("external_id");
