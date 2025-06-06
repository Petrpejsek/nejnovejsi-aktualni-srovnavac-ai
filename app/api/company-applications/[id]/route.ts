import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - Aktualizace statusu company application (schválení/zamítnutí)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    const { action, adminNotes } = data

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Neplatná akce. Povolené hodnoty: approve, reject' 
        },
        { status: 400 }
      )
    }

    // Najdeme aplikaci
    const application = await prisma.companyApplications.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Aplikace nebyla nalezena' 
        },
        { status: 404 }
      )
    }

    // Aktualizujeme status
    const updatedApplication = await prisma.companyApplications.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
        reviewedBy: 'admin' // V budoucnu můžeme přidat skutečného uživatele
      }
    })

    console.log(`📝 Company application ${action}d:`, application.companyName)

    return NextResponse.json({
      success: true,
      message: `Aplikace byla ${action === 'approve' ? 'schválena' : 'zamítnuta'}`,
      data: updatedApplication
    })
  } catch (error) {
    console.error('Chyba při aktualizaci company application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Chyba při zpracování žádosti' 
      },
      { status: 500 }
    )
  }
}

// GET - Získání konkrétní company application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const application = await prisma.companyApplications.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Aplikace nebyla nalezena' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('Chyba při načítání company application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Chyba při načítání aplikace' 
      },
      { status: 500 }
    )
  }
} 