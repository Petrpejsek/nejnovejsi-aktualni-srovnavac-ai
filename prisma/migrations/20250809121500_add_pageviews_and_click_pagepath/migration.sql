-- Add optional pagePath to Click for CTR per page
ALTER TABLE "Click" ADD COLUMN IF NOT EXISTS "pagePath" TEXT;
CREATE INDEX IF NOT EXISTS "Click_pagePath_idx" ON "Click"("pagePath");

-- Create PageView table for most-visited pages analytics
CREATE TABLE IF NOT EXISTS "PageView" (
  "id" TEXT PRIMARY KEY,
  "path" TEXT NOT NULL,
  "visitorId" TEXT,
  "referrer" TEXT,
  "userAgent" TEXT,
  "country" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "PageView_path_idx" ON "PageView"("path");
CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx" ON "PageView"("createdAt");
CREATE INDEX IF NOT EXISTS "PageView_visitorId_idx" ON "PageView"("visitorId");


