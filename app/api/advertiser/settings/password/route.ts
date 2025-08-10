import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token || token.role !== 'company' || !token.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body || {}
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json({ success: false, error: 'Password too short' }, { status: 400 })
    }

    const company = await prisma.company.findFirst({ where: { email: token.email as string } })
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(String(currentPassword), company.hashedPassword)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(String(newPassword), 10)
    await prisma.company.update({
      where: { id: company.id },
      data: { hashedPassword: hashed, updatedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error updating company password:', e)
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 })
  }
}


