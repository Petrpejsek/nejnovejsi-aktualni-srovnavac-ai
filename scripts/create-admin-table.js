import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminTable() {
  try {
    console.log('🔧 Creating Admin table manually...');

    // Create Admin table with all necessary columns and indexes
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "hashedPassword" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'super_admin',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create unique index on email
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
    `;

    // Create indexes for performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Admin_email_idx" ON "Admin"("email");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Admin_isActive_idx" ON "Admin"("isActive");
    `;

    console.log('✅ Admin table created successfully!');

  } catch (error) {
    console.error('❌ Error creating Admin table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminTable();