-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT,
    "advantages" TEXT,
    "disadvantages" TEXT,
    "reviews" TEXT,
    "detailInfo" TEXT,
    "pricingInfo" TEXT,
    "videoUrls" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
