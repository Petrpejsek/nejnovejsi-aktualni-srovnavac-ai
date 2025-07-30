-- AlterTable
ALTER TABLE "Reel" ADD COLUMN     "adEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adLink" TEXT,
ADD COLUMN     "adText" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "AdClick" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "costPerClick" DOUBLE PRECISION NOT NULL,
    "isValidClick" BOOLEAN NOT NULL DEFAULT true,
    "fraudReason" TEXT,
    "conversionTracked" BOOLEAN NOT NULL DEFAULT false,
    "conversionValue" DOUBLE PRECISION,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "pageType" TEXT NOT NULL,
    "categorySlug" TEXT,
    "ipAddress" TEXT NOT NULL,
    "country" TEXT,
    "displayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "paymentIntentId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "campaignId" TEXT,
    "clickId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "dailyBudget" DOUBLE PRECISION NOT NULL,
    "totalBudget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "targetCategories" JSONB,
    "targetCountries" JSONB,
    "todaySpent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "todayImpressions" INTEGER NOT NULL DEFAULT 0,
    "todayClicks" INTEGER NOT NULL DEFAULT 0,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "bid" DECIMAL(10,2) DEFAULT 1.00,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "parent_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "autoRecharge" BOOLEAN NOT NULL DEFAULT false,
    "autoRechargeAmount" DOUBLE PRECISION,
    "autoRechargeThreshold" DOUBLE PRECISION,
    "taxId" TEXT,
    "billingAddress" TEXT,
    "billingCountry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "assignedProductId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyApplications" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "website" TEXT,
    "productUrls" JSONB,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "CompanyApplications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "detailInfo" TEXT,
    "externalUrl" TEXT,
    "hasTrial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageApprovalStatus" TEXT,
    "pendingImageUrl" TEXT,
    "reviews" JSONB,
    "videoUrls" JSONB,
    "primary_category_id" TEXT,
    "secondary_category_id" TEXT,
    "tags" JSONB,
    "advantages" JSONB,
    "disadvantages" JSONB,
    "pricingInfo" JSONB,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adminNotes" TEXT,
    "changesApprovedAt" TIMESTAMP(3),
    "changesApprovedBy" TEXT,
    "changesStatus" TEXT,
    "changesSubmittedAt" TIMESTAMP(3),
    "changesSubmittedBy" TEXT,
    "hasPendingChanges" BOOLEAN NOT NULL DEFAULT false,
    "pendingChanges" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "externalUrl" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionalPackage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL,
    "savings" DOUBLE PRECISION,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "firstTime" BOOLEAN NOT NULL DEFAULT false,
    "minimumSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 1,
    "targetStatus" TEXT NOT NULL DEFAULT 'all',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionalPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "googleId" TEXT,
    "avatar" TEXT,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toolsUsed" INTEGER NOT NULL DEFAULT 0,
    "favoriteTools" JSONB DEFAULT '[]',
    "achievements" JSONB DEFAULT '[]',
    "preferences" JSONB DEFAULT '{}',
    "settings" JSONB DEFAULT '{}',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'super_admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdClick_campaignId_idx" ON "AdClick"("campaignId");

-- CreateIndex
CREATE INDEX "AdClick_clickedAt_idx" ON "AdClick"("clickedAt");

-- CreateIndex
CREATE INDEX "AdClick_companyId_idx" ON "AdClick"("companyId");

-- CreateIndex
CREATE INDEX "AdClick_ipAddress_idx" ON "AdClick"("ipAddress");

-- CreateIndex
CREATE INDEX "AdClick_isValidClick_idx" ON "AdClick"("isValidClick");

-- CreateIndex
CREATE INDEX "AdImpression_campaignId_idx" ON "AdImpression"("campaignId");

-- CreateIndex
CREATE INDEX "AdImpression_displayedAt_idx" ON "AdImpression"("displayedAt");

-- CreateIndex
CREATE INDEX "AdImpression_pageType_idx" ON "AdImpression"("pageType");

-- CreateIndex
CREATE INDEX "AdImpression_position_idx" ON "AdImpression"("position");

-- CreateIndex
CREATE INDEX "BillingRecord_companyId_idx" ON "BillingRecord"("companyId");

-- CreateIndex
CREATE INDEX "BillingRecord_createdAt_idx" ON "BillingRecord"("createdAt");

-- CreateIndex
CREATE INDEX "BillingRecord_status_idx" ON "BillingRecord"("status");

-- CreateIndex
CREATE INDEX "BillingRecord_type_idx" ON "BillingRecord"("type");

-- CreateIndex
CREATE INDEX "Campaign_companyId_idx" ON "Campaign"("companyId");

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_isApproved_idx" ON "Campaign"("isApproved");

-- CreateIndex
CREATE INDEX "Campaign_productId_idx" ON "Campaign"("productId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parent_id_idx" ON "Category"("parent_id");

-- CreateIndex
CREATE INDEX "Click_productId_idx" ON "Click"("productId");

-- CreateIndex
CREATE INDEX "Click_visitorId_idx" ON "Click"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "Company_email_idx" ON "Company"("email");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "CompanyApplications_businessEmail_idx" ON "CompanyApplications"("businessEmail");

-- CreateIndex
CREATE INDEX "CompanyApplications_status_idx" ON "CompanyApplications"("status");

-- CreateIndex
CREATE INDEX "CompanyApplications_submittedAt_idx" ON "CompanyApplications"("submittedAt");

-- CreateIndex
CREATE INDEX "Product_changesStatus_idx" ON "Product"("changesStatus");

-- CreateIndex
CREATE INDEX "Product_hasPendingChanges_idx" ON "Product"("hasPendingChanges");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_primary_category_id_idx" ON "Product"("primary_category_id");

-- CreateIndex
CREATE INDEX "Product_secondary_category_id_idx" ON "Product"("secondary_category_id");

-- CreateIndex
CREATE INDEX "SavedProduct_productId_idx" ON "SavedProduct"("productId");

-- CreateIndex
CREATE INDEX "SavedProduct_savedAt_idx" ON "SavedProduct"("savedAt");

-- CreateIndex
CREATE INDEX "SavedProduct_userId_idx" ON "SavedProduct"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedProduct_userId_productId_key" ON "SavedProduct"("userId", "productId");

-- CreateIndex
CREATE INDEX "ClickHistory_userId_idx" ON "ClickHistory"("userId");

-- CreateIndex
CREATE INDEX "ClickHistory_clickedAt_idx" ON "ClickHistory"("clickedAt");

-- CreateIndex
CREATE INDEX "ClickHistory_productId_idx" ON "ClickHistory"("productId");

-- CreateIndex
CREATE INDEX "PromotionalPackage_active_idx" ON "PromotionalPackage"("active");

-- CreateIndex
CREATE INDEX "PromotionalPackage_order_idx" ON "PromotionalPackage"("order");

-- CreateIndex
CREATE INDEX "PromotionalPackage_targetStatus_idx" ON "PromotionalPackage"("targetStatus");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_premium_idx" ON "User"("premium");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_isActive_idx" ON "Admin"("isActive");

-- AddForeignKey
ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingRecord" ADD CONSTRAINT "BillingRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_primary_category_id_fkey" FOREIGN KEY ("primary_category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedProduct" ADD CONSTRAINT "SavedProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickHistory" ADD CONSTRAINT "ClickHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
