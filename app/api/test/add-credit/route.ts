import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { companyId, amount } = data

    if (!companyId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Company ID and amount are required' },
        { status: 400 }
      )
    }

    // Přidat kredit do účtu
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        balance: {
          increment: amount
        }
      }
    })

    // Vytvořit billing záznam
    await prisma.billingRecord.create({
      data: {
        companyId,
        type: 'credit',
        amount,
        description: `Test credit added: $${amount}`,
        status: 'completed'
      }
    })

    console.log(`💰 Test credit added: $${amount} to company ${companyId}`)

    return NextResponse.json({
      success: true,
      message: `Credit added successfully`,
      data: {
        newBalance: updatedCompany.balance
      }
    })

  } catch (error) {
    console.error('Error adding test credit:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add credit' },
      { status: 500 }
    )
  }
} 