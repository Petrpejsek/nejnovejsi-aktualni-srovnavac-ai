#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Source database (Neon)
const sourceClient = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_1DPXCjFSnvO2@ep-empty-sea-a2114k4k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

// Target database (Hetzner)  
const targetClient = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://comparee_user:comparee_secure_password_2024!@195.201.219.128:5432/comparee_production"
    }
  }
});

async function migrateMainData() {
  try {
    console.log('🚀 Starting MAIN data migration from Neon to Hetzner...');
    
    // Test connections
    console.log('📡 Testing database connections...');
    await sourceClient.$connect();
    await targetClient.$connect();
    console.log('✅ Both databases connected successfully');

    // Get counts from source
    const sourceProducts = await sourceClient.product.count();
    const sourceUsers = await sourceClient.user.count();
    
    console.log(`📊 Source database stats:`);
    console.log(`   - Products: ${sourceProducts}`);
    console.log(`   - Users: ${sourceUsers}`);

    // Clear main tables in target database
    console.log('🧹 Clearing main tables in target database...');
    
    // Clear products first (to handle foreign key dependencies)
    try {
      await targetClient.product.deleteMany();
      console.log('✅ Products table cleared');
    } catch (e) {
      console.log('ℹ️  Products table was empty or error:', e.message);
    }

    // Clear users
    try {
      await targetClient.user.deleteMany();
      console.log('✅ Users table cleared');
    } catch (e) {
      console.log('ℹ️  Users table was empty or error:', e.message);
    }

    // Migrate users first (for foreign key dependencies)
    console.log('👥 Migrating users...');
    const users = await sourceClient.user.findMany();
    if (users.length > 0) {
      await targetClient.user.createMany({
        data: users,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${users.length} users`);
    } else {
      console.log('ℹ️  No users to migrate');
    }

    // Migrate products (MAIN DATA)
    console.log('📦 Migrating products (MAIN DATA)...');
    const products = await sourceClient.product.findMany();
    if (products.length > 0) {
      // Migrate in batches to avoid memory issues
      const batchSize = 50;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await targetClient.product.createMany({
          data: batch,
          skipDuplicates: true
        });
        console.log(`   ↳ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} products`);
      }
      console.log(`✅ Migrated ${products.length} products`);
    } else {
      console.log('ℹ️  No products to migrate');
    }

    // Final verification
    console.log('🔍 Verifying migration...');
    const targetProductCount = await targetClient.product.count();
    const targetUserCount = await targetClient.user.count();
    
    console.log(`📊 Target database stats after migration:`);
    console.log(`   - Products: ${targetProductCount} (should be ${sourceProducts})`);
    console.log(`   - Users: ${targetUserCount} (should be ${sourceUsers})`);

    if (targetProductCount === sourceProducts) {
      console.log('🎉 MIGRATION SUCCESSFUL! All main data transferred correctly.');
      console.log('📊 Database migration completed:');
      console.log(`   ✅ ${targetProductCount} products migrated`);
      console.log(`   ✅ ${targetUserCount} users migrated`);
    } else {
      console.log(`⚠️  WARNING: Product count mismatch! Expected: ${sourceProducts}, Got: ${targetProductCount}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sourceClient.$disconnect();
    await targetClient.$disconnect();
  }
}

// Run migration
migrateMainData()
  .then(() => {
    console.log('✅ Main data migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 