import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

async function requireAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return false
  }
  return true
}

// GET /api/admin/admins - list admin accounts
export async function GET(request: NextRequest) {
  try {
    const ok = await requireAdmin(request)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { admins } })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 })
  }
}

// PATCH /api/admin/admins - update admin (activate/deactivate, change role later)
export async function PATCH(request: NextRequest) {
  try {
    const ok = await requireAdmin(request)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const { adminId, isActive } = await request.json()
    if (!adminId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'adminId and isActive are required' }, { status: 400 })
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: { isActive },
    })

    return NextResponse.json({ success: true, admin: updated })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ success: false, error: 'Failed to update admin' }, { status: 500 })
  }
}


