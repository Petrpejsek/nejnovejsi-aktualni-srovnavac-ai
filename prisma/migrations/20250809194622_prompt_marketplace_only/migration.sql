-- AlterTable
ALTER TABLE "PageView" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PromptCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "modelTarget" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "priceUsd" DECIMAL(10,2) NOT NULL,
    "coverImage" TEXT,
    "previewVideoUrl" TEXT,
    "tags" JSONB,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptReview" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptCategory_slug_key" ON "PromptCategory"("slug");

-- CreateIndex
CREATE INDEX "PromptCategory_order_idx" ON "PromptCategory"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_slug_key" ON "Prompt"("slug");

-- CreateIndex
CREATE INDEX "Prompt_categoryId_idx" ON "Prompt"("categoryId");

-- CreateIndex
CREATE INDEX "Prompt_isFeatured_idx" ON "Prompt"("isFeatured");

-- CreateIndex
CREATE INDEX "Prompt_salesCount_idx" ON "Prompt"("salesCount");

-- CreateIndex
CREATE INDEX "PromptReview_promptId_idx" ON "PromptReview"("promptId");

-- CreateIndex
CREATE INDEX "PromptReview_rating_idx" ON "PromptReview"("rating");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PromptCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptReview" ADD CONSTRAINT "PromptReview_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

