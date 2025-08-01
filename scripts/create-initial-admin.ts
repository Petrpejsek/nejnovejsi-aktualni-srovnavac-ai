#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createInitialAdmin() {
  try {
    console.log('🔐 Creating initial admin account...');

    // Check if any admin already exists
    const existingAdmin = await prisma.admin.findFirst();
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists:', existingAdmin.email);
      console.log('🔍 Use this account to create additional admins via /api/admin/register');
      return;
    }

    // Create initial admin
    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.admin.create({
      data: {
        id: uuidv4(),
        name: 'Super Admin',
        email: adminEmail,
        hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('✅ Initial admin created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change these credentials immediately!');
    console.log('🔗 Login at: /admin or via NextAuth');

  } catch (error) {
    console.error('❌ Error creating initial admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createInitialAdmin();