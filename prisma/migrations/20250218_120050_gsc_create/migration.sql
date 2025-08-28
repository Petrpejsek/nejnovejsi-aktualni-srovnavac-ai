-- Create seo_gsc_status table if it does not exist (initial MVP schema)
CREATE TABLE IF NOT EXISTS "seo_gsc_status" (
  "url"              TEXT PRIMARY KEY,
  "indexed"          BOOLEAN NOT NULL,
  "coverage_state"   TEXT,
  "last_crawl"       TIMESTAMP,
  "checked_at"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "raw"              JSONB,
  "page_fetch_state" TEXT,
  "last_crawl_time"  TIMESTAMP,
  "google_canonical" TEXT,
  "user_canonical"   TEXT,
  "mobile_usability" TEXT,
  "rich_results"     TEXT,
  "updated_at"       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_seo_gsc_status_checked_at" ON "seo_gsc_status" ("checked_at");
CREATE INDEX IF NOT EXISTS "idx_seo_gsc_status_indexed_checked_at" ON "seo_gsc_status" ("indexed", "checked_at");

