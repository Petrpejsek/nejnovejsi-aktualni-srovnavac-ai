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

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from Neon to Hetzner...');
    
    // Test connections
    console.log('📡 Testing database connections...');
    await sourceClient.$connect();
    await targetClient.$connect();
    console.log('✅ Both databases connected successfully');

    // Get counts from source
    const sourceProducts = await sourceClient.product.count();
    const sourceUsers = await sourceClient.user.count();
    const sourceCompanies = await sourceClient.company.count();
    
    console.log(`📊 Source database stats:`);
    console.log(`   - Products: ${sourceProducts}`);
    console.log(`   - Users: ${sourceUsers}`);
    console.log(`   - Companies: ${sourceCompanies}`);

    // Clear target database first (safety)
    console.log('🧹 Clearing target database...');
    await targetClient.adClick.deleteMany();
    await targetClient.campaignBid.deleteMany();
    await targetClient.campaign.deleteMany();
    await targetClient.companyUser.deleteMany();
    await targetClient.promotionalPackage.deleteMany();
    await targetClient.company.deleteMany();
    await targetClient.bookmark.deleteMany();
    await targetClient.productRecommendation.deleteMany();
    await targetClient.product.deleteMany();
    await targetClient.user.deleteMany();
    console.log('✅ Target database cleared');

    // Migrate users first (needed for foreign keys)
    console.log('👥 Migrating users...');
    const users = await sourceClient.user.findMany();
    if (users.length > 0) {
      await targetClient.user.createMany({
        data: users,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${users.length} users`);
    }

    // Migrate companies
    console.log('🏢 Migrating companies...');
    const companies = await sourceClient.company.findMany();
    if (companies.length > 0) {
      await targetClient.company.createMany({
        data: companies,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${companies.length} companies`);
    }

    // Migrate products (main data)
    console.log('📦 Migrating products...');
    const products = await sourceClient.product.findMany();
    if (products.length > 0) {
      await targetClient.product.createMany({
        data: products,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${products.length} products`);
    }

    // Migrate bookmarks
    console.log('🔖 Migrating bookmarks...');
    const bookmarks = await sourceClient.bookmark.findMany();
    if (bookmarks.length > 0) {
      await targetClient.bookmark.createMany({
        data: bookmarks,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${bookmarks.length} bookmarks`);
    }

    // Migrate product recommendations
    console.log('🎯 Migrating product recommendations...');
    const recommendations = await sourceClient.productRecommendation.findMany();
    if (recommendations.length > 0) {
      await targetClient.productRecommendation.createMany({
        data: recommendations,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${recommendations.length} recommendations`);
    }

    // Migrate promotional packages
    console.log('🎁 Migrating promotional packages...');
    const packages = await sourceClient.promotionalPackage.findMany();
    if (packages.length > 0) {
      await targetClient.promotionalPackage.createMany({
        data: packages,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${packages.length} promotional packages`);
    }

    // Migrate company users
    console.log('👤 Migrating company users...');
    const companyUsers = await sourceClient.companyUser.findMany();
    if (companyUsers.length > 0) {
      await targetClient.companyUser.createMany({
        data: companyUsers,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${companyUsers.length} company users`);
    }

    // Migrate campaigns
    console.log('📢 Migrating campaigns...');
    const campaigns = await sourceClient.campaign.findMany();
    if (campaigns.length > 0) {
      await targetClient.campaign.createMany({
        data: campaigns,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${campaigns.length} campaigns`);
    }

    // Migrate campaign bids
    console.log('💰 Migrating campaign bids...');
    const bids = await sourceClient.campaignBid.findMany();
    if (bids.length > 0) {
      await targetClient.campaignBid.createMany({
        data: bids,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${bids.length} campaign bids`);
    }

    // Migrate ad clicks
    console.log('👆 Migrating ad clicks...');
    const clicks = await sourceClient.adClick.findMany();
    if (clicks.length > 0) {
      await targetClient.adClick.createMany({
        data: clicks,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${clicks.length} ad clicks`);
    }

    // Final verification
    console.log('🔍 Verifying migration...');
    const targetProductCount = await targetClient.product.count();
    const targetUserCount = await targetClient.user.count();
    const targetCompanyCount = await targetClient.company.count();
    
    console.log(`📊 Target database stats after migration:`);
    console.log(`   - Products: ${targetProductCount} (should be ${sourceProducts})`);
    console.log(`   - Users: ${targetUserCount} (should be ${sourceUsers})`);
    console.log(`   - Companies: ${targetCompanyCount} (should be ${sourceCompanies})`);

    if (targetProductCount === sourceProducts) {
      console.log('🎉 MIGRATION SUCCESSFUL! All data transferred correctly.');
    } else {
      console.log('⚠️  WARNING: Product count mismatch! Check for errors.');
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
migrateData()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 