import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Creating test user...');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'petr@testovacka.cz' }
    });
    
    if (existingUser) {
      console.log('⚠️  User petr@testovacka.cz already exists, deleting...');
      await prisma.user.delete({
        where: { email: 'petr@testovacka.cz' }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('test1234', 10);
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'petr@testovacka.cz',
        name: 'Petr Test',
        hashedPassword: hashedPassword,
        isActive: true,
        premium: false,
        points: 100,
        level: 'Beginner', // ✅ String value
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: petr@testovacka.cz');
    console.log('🔑 Password: test1234');
    console.log('🆔 User ID:', testUser.id);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
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