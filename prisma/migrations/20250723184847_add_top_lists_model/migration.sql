-- CreateTable
CREATE TABLE "TopList" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "products" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversion" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopList_category_idx" ON "TopList"("category");

-- CreateIndex
CREATE INDEX "TopList_status_idx" ON "TopList"("status");

-- CreateIndex
CREATE INDEX "TopList_createdAt_idx" ON "TopList"("createdAt"); 