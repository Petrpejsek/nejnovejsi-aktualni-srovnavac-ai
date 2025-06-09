import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Force dynamic rendering to fix Vercel build error with headers()
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validace vstupních dat
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Najít uživatele v databázi
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, hashedPassword: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.hashedPassword) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }

    // Ověřit současné heslo
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Ověřit, že nové heslo není stejné jako současné
    const isSamePassword = await bcrypt.compare(newPassword, user.hashedPassword)
    
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Zahashovat nové heslo
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Aktualizovat heslo v databázi
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: hashedNewPassword }
    })

    console.log(`Password changed successfully for user: ${user.email}`)

    return NextResponse.json(
      { 
        success: true,
        message: 'Password changed successfully' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 