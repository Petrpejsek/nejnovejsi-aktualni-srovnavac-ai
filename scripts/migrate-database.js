// Database migration script for Vercel deployment
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Add pending changes columns if they don't exist
    await prisma.$executeRaw`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "hasPendingChanges" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "pendingChanges" JSONB,
      ADD COLUMN IF NOT EXISTS "changesStatus" TEXT,
      ADD COLUMN IF NOT EXISTS "changesSubmittedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "changesSubmittedBy" TEXT,
      ADD COLUMN IF NOT EXISTS "changesApprovedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "changesApprovedBy" TEXT,
      ADD COLUMN IF NOT EXISTS "pendingImageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "imageApprovalStatus" TEXT,
      ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
    `
    
    console.log('✅ Product table migration completed')
    
    // Ensure Company table has all needed columns
    await prisma.$executeRaw`
      ALTER TABLE "Company" 
      ADD COLUMN IF NOT EXISTS "balance" DECIMAL(10,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS "totalSpent" DECIMAL(10,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS "autoRecharge" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "autoRechargeAmount" DECIMAL(10,2) DEFAULT 100.00,
      ADD COLUMN IF NOT EXISTS "autoRechargeThreshold" DECIMAL(10,2) DEFAULT 10.00;
    `
    
    console.log('✅ Company table migration completed')
    
    // Ensure BillingRecord table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "BillingRecord" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "invoiceUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
      );
    `
    
    // Add foreign key constraint if it doesn't exist
    await prisma.$executeRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'BillingRecord_companyId_fkey'
        ) THEN
          ALTER TABLE "BillingRecord" 
          ADD CONSTRAINT "BillingRecord_companyId_fkey" 
          FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `
    
    console.log('✅ BillingRecord table migration completed')
    
    // Ensure Campaign table has bid and dailyBudget columns
    await prisma.$executeRaw`
      ALTER TABLE "Campaign" 
      ADD COLUMN IF NOT EXISTS "bid" DECIMAL(10,2) DEFAULT 1.00,
      ADD COLUMN IF NOT EXISTS "dailyBudget" DECIMAL(10,2) DEFAULT 50.00;
    `
    
    console.log('✅ Campaign table migration completed')
    
    console.log('🎉 All database migrations completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 