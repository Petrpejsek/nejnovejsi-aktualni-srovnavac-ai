import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        premium: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Označit super admina podle emailu
    const usersWithRole = users.map(user => ({
      ...user,
      isSuperAdmin: user.email === 'admin@admin.com'
    }))

    return Response.json({ users: usersWithRole })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { createAdminUser } = await req.json()
    
    if (createAdminUser) {
      // Vytvoří admin uživatele s emailem admin@admin.com
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {
          name: 'Super Admin',
          isActive: true,
        },
        create: {
          id: `admin-${Date.now()}`,
          email: 'admin@admin.com',
          name: 'Super Admin',
          hashedPassword: null, // Bude se přihlašovat přes Google
          isActive: true,
          premium: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        }
      })

      return Response.json({ user: adminUser, message: 'Admin user created/updated' })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Create admin error:', error)
    return Response.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
} 