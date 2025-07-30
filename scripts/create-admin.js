import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@admin.com' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email)
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@admin.com',
        name: 'Super Admin',
        hashedPassword: hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    })
    
    console.log('✅ Admin created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 