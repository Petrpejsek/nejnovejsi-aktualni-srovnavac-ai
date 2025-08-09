import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/users - list users for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100)
    const skip = (page - 1) * pageSize

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          premium: true,
          level: true
        }
      }),
      prisma.user.count()
    ])

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

// PATCH /api/admin/users - update user (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, isActive } = await request.json()
    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'userId and isActive are required' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}

