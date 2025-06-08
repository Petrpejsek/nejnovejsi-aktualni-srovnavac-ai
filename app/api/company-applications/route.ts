import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Získání všech company applications pro admin  
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
        website: true,
        description: true,
        status: true,
        createdAt: true
      }
    })
    
    // Transformuj data pro admin komponentu
    const applications = companies.map(company => ({
      id: company.id,
      companyName: company.name,
      contactPerson: company.contactPerson,
      businessEmail: company.email,
      website: company.website,
      description: company.description,
      status: company.status,
      submittedAt: company.createdAt.toISOString(),
      isPPCAdvertiser: true // označí je jako PPC inzerenty
    }))
    
    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('Chyba při načítání company applications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Chyba při načítání firemních aplikací' 
      },
      { status: 500 }
    )
  }
}

// POST - Vytvoření nové company application
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validace požadovaných polí
    const { companyName, contactPerson, businessEmail, website, productUrls, description } = data
    
    if (!companyName || !contactPerson || !businessEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vyplňte prosím všechna povinná pole (název firmy, kontaktní osoba, email)' 
        },
        { status: 400 }
      )
    }

    // Validace email formátu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(businessEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zadejte prosím platný email' 
        },
        { status: 400 }
      )
    }

    // Vytvoření nové aplikace v databázi
    const newApplication = await prisma.companyApplications.create({
      data: {
        companyName,
        contactPerson,
        businessEmail,
        website: website || null,
        productUrls: productUrls || null,
        description: description || null,
        status: 'pending'
      }
    })

    console.log('📝 Nová firemní aplikace vytvořena:', newApplication.id)

    return NextResponse.json({
      success: true,
      message: 'Firemní aplikace byla úspěšně odeslána',
      data: newApplication
    })
  } catch (error) {
    console.error('Chyba při vytváření company application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Chyba při odesílání firemní aplikace' 
      },
      { status: 500 }
    )
  }
} 