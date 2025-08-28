-- Extend seo_gsc_status with additional URL Inspection fields and indexes
-- Safe, non-breaking (NULLable) additions; adjust raw to nullable and add updated_at

ALTER TABLE "seo_gsc_status"
  ADD COLUMN "page_fetch_state" TEXT,
  ADD COLUMN "last_crawl_time" TIMESTAMP,
  ADD COLUMN "google_canonical" TEXT,
  ADD COLUMN "user_canonical" TEXT,
  ADD COLUMN "mobile_usability" TEXT,
  ADD COLUMN "rich_results" TEXT;

-- raw -> nullable
ALTER TABLE "seo_gsc_status" ALTER COLUMN "raw" DROP NOT NULL;

-- updated_at column (maintained by application layer via Prisma @updatedAt)
ALTER TABLE "seo_gsc_status" ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT NOW();

-- Helpful indexes for queries and scheduling
CREATE INDEX IF NOT EXISTS "idx_seo_gsc_status_checked_at" ON "seo_gsc_status" ("checked_at");
CREATE INDEX IF NOT EXISTS "idx_seo_gsc_status_indexed_checked_at" ON "seo_gsc_status" ("indexed", "checked_at");

