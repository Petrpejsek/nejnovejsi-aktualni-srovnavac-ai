import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthSystem() {
  console.log('🧪 TESTOVÁNÍ AUTHENTICATION SYSTÉMU');
  console.log('====================================\n');

  let results = {
    admin: { exists: false, canLogin: false },
    users: { count: 0, tested: false },
    companies: { count: 0, tested: false }
  };

  try {
    // 1. Test Admin table and accounts
    console.log('🔐 1. TESTING ADMIN ACCOUNTS...');
    const adminCount = await prisma.admin.count();
    console.log(`   📊 Admin accounts in database: ${adminCount}`);
    
    if (adminCount > 0) {
      results.admin.exists = true;
      const admins = await prisma.admin.findMany({
        select: { email: true, name: true, role: true, isActive: true }
      });
      
      console.log('   📋 Admin accounts:');
      admins.forEach(admin => {
        console.log(`     • ${admin.email} (${admin.name}) - Role: ${admin.role} - Active: ${admin.isActive}`);
      });
      
      // Test default admin
      const defaultAdmin = await prisma.admin.findUnique({
        where: { email: 'admin@admin.com' }
      });
      
      if (defaultAdmin) {
        console.log('   ✅ Default admin account (admin@admin.com) exists');
        results.admin.canLogin = true;
      } else {
        console.log('   ❌ Default admin account not found');
      }
    } else {
      console.log('   ❌ No admin accounts found');
    }

    console.log('');

    // 2. Test User accounts
    console.log('👤 2. TESTING USER ACCOUNTS...');
    const userCount = await prisma.user.count();
    results.users.count = userCount;
    console.log(`   📊 User accounts in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, name: true, hashedPassword: true, googleId: true, isActive: true },
        take: 5
      });
      
      console.log('   📋 Sample user accounts:');
      users.forEach(user => {
        const authType = user.hashedPassword ? 'Password' : 'Google OAuth';
        console.log(`     • ${user.email} (${user.name}) - Auth: ${authType} - Active: ${user.isActive}`);
      });
      
      // Check for test user
      const testUser = await prisma.user.findUnique({
        where: { email: 'petr@comparee.cz' }
      });
      
      if (testUser) {
        console.log('   ✅ Test user account (petr@comparee.cz) exists');
        results.users.tested = true;
      } else {
        console.log('   ⚠️  Test user account not found');
      }
    } else {
      console.log('   ❌ No user accounts found');
    }

    console.log('');

    // 3. Test Company accounts  
    console.log('🏢 3. TESTING COMPANY ACCOUNTS...');
    const companyCount = await prisma.company.count();
    results.companies.count = companyCount;
    console.log(`   📊 Company accounts in database: ${companyCount}`);
    
    if (companyCount > 0) {
      const companies = await prisma.company.findMany({
        select: { email: true, name: true, status: true, isVerified: true },
        take: 5
      });
      
      console.log('   📋 Sample company accounts:');
      companies.forEach(company => {
        console.log(`     • ${company.email} (${company.name}) - Status: ${company.status} - Verified: ${company.isVerified}`);
      });
      
      // Check for test company
      const testCompany = await prisma.company.findUnique({
        where: { email: 'firma@firma.cz' }
      });
      
      if (testCompany) {
        console.log('   ✅ Test company account (firma@firma.cz) exists');
        results.companies.tested = true;
      } else {
        console.log('   ⚠️  Test company account not found');
      }
    } else {
      console.log('   ❌ No company accounts found');
    }

    console.log('');

    // 4. Generate Report
    console.log('📊 SUMMARY REPORT');
    console.log('================');
    console.log(`✅ Admin System: ${results.admin.exists ? 'Ready' : 'NOT READY'}`);
    console.log(`✅ User System: ${results.users.count > 0 ? 'Ready' : 'NOT READY'} (${results.users.count} accounts)`);
    console.log(`✅ Company System: ${results.companies.count > 0 ? 'Ready' : 'NOT READY'} (${results.companies.count} accounts)`);
    
    console.log('');
    console.log('🔐 TEST CREDENTIALS FOR NEXTAUTH:');
    console.log('Admin: admin@admin.com / admin123');
    console.log('User: petr@comparee.cz / user123');  
    console.log('Company: firma@firma.cz / firma123');
    
    console.log('');
    console.log('🌐 TEST URLS:');
    console.log('Admin Panel: http://localhost:3000/admin');
    console.log('User Area: http://localhost:3000/user-area');
    console.log('Company Portal: http://localhost:3000/company');

  } catch (error) {
    console.error('❌ Error testing auth system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuthSystem();