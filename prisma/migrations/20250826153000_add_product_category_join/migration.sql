-- Create join table for additional categories
CREATE TABLE IF NOT EXISTS "ProductCategory" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique pair product-category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ProductCategory_productId_categoryId_key'
  ) THEN
    ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_categoryId_key" UNIQUE ("productId", "categoryId");
  END IF;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS "ProductCategory_productId_idx" ON "ProductCategory"("productId");
CREATE INDEX IF NOT EXISTS "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

