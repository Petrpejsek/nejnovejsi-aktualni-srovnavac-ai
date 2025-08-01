import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestSession() {
  console.log('🔍 OVĚŘOVÁNÍ TVÉ TESTOVACÍ HISTORIE');
  console.log('=====================================\n');

  try {
    // 1. Ověření User testů
    console.log('👤 1. USER LOGIN TESTY...');
    
    const petrUser = await prisma.user.findUnique({
      where: { email: 'petr@petr.cz' },
      select: { 
        id: true, name: true, email: true, 
        lastLoginAt: true, isActive: true, hashedPassword: true 
      }
    });
    
    if (petrUser) {
      console.log(`   ✅ User nalezen: ${petrUser.email}`);
      console.log(`   📅 Poslední login: ${petrUser.lastLoginAt || 'NIKDY'}`);
      console.log(`   🔑 Má heslo: ${petrUser.hashedPassword ? 'ANO' : 'NE (Google OAuth)'}`);
      
      // Check if login was recent (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogin = petrUser.lastLoginAt && new Date(petrUser.lastLoginAt) > oneHourAgo;
      console.log(`   🕒 Nedávný login: ${recentLogin ? 'ANO - V POSLEDNÍCH 60 MIN' : 'NE'}`);
    } else {
      console.log(`   ❌ User petr@petr.cz NENALEZEN!`);
    }

    console.log('');

    // 2. Ověření Company registrace a login
    console.log('🏢 2. COMPANY REGISTRACE & LOGIN TESTY...');
    
    // Najdi nejnovější company registraci
    const recentCompanies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { 
        id: true, name: true, email: true, 
        createdAt: true, status: true, lastLoginAt: true 
      }
    });
    
    console.log('   📋 Nejnovější company registrace:');
    recentCompanies.forEach((company, index) => {
      const timeDiff = Date.now() - new Date(company.createdAt).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      console.log(`     ${index + 1}. ${company.email} (${company.name})`);
      console.log(`        Status: ${company.status} | Vytvořeno: před ${minutesAgo} min`);
      console.log(`        Poslední login: ${company.lastLoginAt || 'NIKDY'}`);
    });

    // Check specific company login from logs
    const firmickaCompany = await prisma.company.findUnique({
      where: { email: 'petr@firmicka.cz' },
      select: { 
        id: true, name: true, email: true, 
        lastLoginAt: true, status: true 
      }
    });
    
    if (firmickaCompany) {
      console.log(`   ✅ Test company login: ${firmickaCompany.email}`);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogin = firmickaCompany.lastLoginAt && new Date(firmickaCompany.lastLoginAt) > oneHourAgo;
      console.log(`   🕒 Nedávný login: ${recentLogin ? 'ANO - V POSLEDNÍCH 60 MIN' : 'NE'}`);
    }

    console.log('');

    // 3. Ověření Admin testů
    console.log('🔐 3. ADMIN LOGIN TESTY...');
    
    const adminAccount = await prisma.admin.findUnique({
      where: { email: 'admin@admin.com' },
      select: { 
        id: true, name: true, email: true, 
        lastLoginAt: true, role: true, isActive: true 
      }
    });
    
    if (adminAccount) {
      console.log(`   ✅ Admin nalezen: ${adminAccount.email}`);
      console.log(`   👑 Role: ${adminAccount.role}`);
      console.log(`   📅 Poslední login: ${adminAccount.lastLoginAt || 'NIKDY'}`);
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogin = adminAccount.lastLoginAt && new Date(adminAccount.lastLoginAt) > oneHourAgo;
      console.log(`   🕒 Nedávný login: ${recentLogin ? 'ANO - V POSLEDNÍCH 60 MIN' : 'NE'}`);
    } else {
      console.log(`   ❌ Admin admin@admin.com NENALEZEN!`);
    }

    console.log('');

    // 4. Ověření Admin akcí (schválení company)
    console.log('⚙️  4. ADMIN AKCE - SCHVÁLENÍ COMPANIES...');
    
    const approvedCompanies = await prisma.company.findMany({
      where: { 
        status: { in: ['approved', 'active'] },
        updatedAt: { 
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // last 2 hours
        }
      },
      orderBy: { updatedAt: 'desc' },
      select: { 
        id: true, name: true, email: true, 
        status: true, updatedAt: true 
      }
    });
    
    console.log(`   📊 Nedávno schválené/aktualizované companies: ${approvedCompanies.length}`);
    approvedCompanies.forEach(company => {
      const timeDiff = Date.now() - new Date(company.updatedAt).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      console.log(`     • ${company.email} - Status: ${company.status} (před ${minutesAgo} min)`);
    });

    console.log('');

    // 5. Souhrn databázových statistik
    console.log('📊 5. DATABÁZOVÉ STATISTIKY...');
    
    const stats = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({ where: { isActive: true } }),
      totalCompanies: await prisma.company.count(),
      activeCompanies: await prisma.company.count({ where: { status: 'active' } }),
      pendingCompanies: await prisma.company.count({ where: { status: 'pending' } }),
      totalAdmins: await prisma.admin.count(),
      activeAdmins: await prisma.admin.count({ where: { isActive: true } })
    };
    
    console.log(`   👥 Users: ${stats.totalUsers} celkem, ${stats.activeUsers} aktivních`);
    console.log(`   🏢 Companies: ${stats.totalCompanies} celkem, ${stats.activeCompanies} aktivních, ${stats.pendingCompanies} čekajících`);
    console.log(`   🔐 Admins: ${stats.totalAdmins} celkem, ${stats.activeAdmins} aktivních`);

    console.log('');

    // 6. Finální hodnocení
    console.log('🎯 FINÁLNÍ HODNOCENÍ TESTŮ');
    console.log('==========================');
    
    const userLoginOk = petrUser && petrUser.lastLoginAt;
    const adminLoginOk = adminAccount && adminAccount.lastLoginAt;
    const companyLoginOk = firmickaCompany && firmickaCompany.lastLoginAt;
    const registrationOk = recentCompanies.length > 0;
    const adminActionsOk = approvedCompanies.length > 0;
    
    console.log(`✅ User login test: ${userLoginOk ? 'ÚSPĚCH' : 'SELHÁNÍ'}`);
    console.log(`✅ Admin login test: ${adminLoginOk ? 'ÚSPĚCH' : 'SELHÁNÍ'}`);
    console.log(`✅ Company login test: ${companyLoginOk ? 'ÚSPĚCH' : 'SELHÁNÍ'}`);
    console.log(`✅ Company registrace: ${registrationOk ? 'ÚSPĚCH' : 'SELHÁNÍ'}`);
    console.log(`✅ Admin akce: ${adminActionsOk ? 'ÚSPĚCH' : 'SELHÁNÍ'}`);
    
    const allTestsOk = userLoginOk && adminLoginOk && companyLoginOk && registrationOk && adminActionsOk;
    console.log('');
    console.log(`🏆 CELKOVÉ HODNOCENÍ: ${allTestsOk ? '🟢 VŠECHNY TESTY ÚSPĚŠNÉ!' : '🔴 NĚKDE BYLY PROBLÉMY'}`);

  } catch (error) {
    console.error('❌ Chyba při ověřování:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyTestSession();