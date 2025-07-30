import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🏢 Creating test company...');
  
  try {
    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: 'firma@firma.cz' }
    });
    
    if (existingCompany) {
      console.log('⚠️  Company firma@firma.cz already exists, deleting...');
      await prisma.company.delete({
        where: { email: 'firma@firma.cz' }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('firma123', 10);
    
    // Create test company
    const testCompany = await prisma.company.create({
      data: {
        id: uuidv4(),
        name: 'Test Firma s.r.o.',
        email: 'firma@firma.cz',
        hashedPassword: hashedPassword,
        contactPerson: 'Jan Novák',
        website: 'https://testfirma.cz',
        description: 'Testovací firma pro development',
        status: 'active',
        isVerified: true,
        balance: 1000.0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test company created successfully!');
    console.log('🏢 Company: Test Firma s.r.o.');
    console.log('📧 Email: firma@firma.cz');
    console.log('🔑 Password: firma123');
    console.log('🆔 Company ID:', testCompany.id);
    
  } catch (error) {
    console.error('❌ Error creating test company:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔒 Database connection closed');
  }); 