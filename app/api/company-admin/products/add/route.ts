import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Ověření JWT tokenu
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('advertiser-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Starting product creation...')
    
    const user = verifyToken(request)
    
    if (!user) {
      console.log('❌ API: Unauthorized - no valid token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ API: User authenticated:', user.companyId)

    // Najdi firmu podle ID z JWT tokenu
    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    })

    if (!company) {
      console.log('❌ API: Company not found for ID:', user.companyId)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    console.log('✅ API: Company found:', company.name)

    // Parse FormData
    let formData
    try {
      formData = await request.formData()
      console.log('✅ API: FormData parsed successfully')
    } catch (error) {
      console.error('❌ API: Error parsing FormData:', error)
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    
    console.log('📝 API: Basic fields parsed:', { name, category, price })
    
    let tags, advantages, disadvantages
    try {
      tags = JSON.parse(formData.get('tags') as string)
      advantages = JSON.parse(formData.get('advantages') as string || '[]')
      disadvantages = JSON.parse(formData.get('disadvantages') as string || '[]')
      console.log('✅ API: JSON fields parsed successfully')
    } catch (error) {
      console.error('❌ API: Error parsing JSON fields:', error)
      return NextResponse.json({ error: 'Invalid JSON data in form' }, { status: 400 })
    }
    
    const externalUrl = formData.get('externalUrl') as string
    const hasTrial = formData.get('hasTrial') === 'true'
    const imageFile = formData.get('image') as File

    console.log('📋 API: All form data parsed:', { 
      name, category, tagsCount: tags.length, 
      advantagesCount: advantages.length, 
      hasImage: imageFile && imageFile.size > 0 
    })

    // Validace
    if (!name || !description || !category || !externalUrl) {
      console.log('❌ API: Validation failed - missing required fields')
      return NextResponse.json({ 
        error: 'All required fields must be filled' 
      }, { status: 400 })
    }

    // Validace počtu tagů, výhod a nevýhod
    if (tags.length > 5) {
      return NextResponse.json({ 
        error: 'Maximum 5 tags allowed' 
      }, { status: 400 })
    }
    
    if (advantages.length > 5) {
      return NextResponse.json({ 
        error: 'Maximum 5 advantages allowed' 
      }, { status: 400 })
    }
    
    if (disadvantages.length > 5) {
      return NextResponse.json({ 
        error: 'Maximum 5 disadvantages allowed' 
      }, { status: 400 })
    }

    console.log('✅ API: Validation passed')

    // Validace URL - normalize by adding https:// if missing
    let normalizedUrl = externalUrl.trim()
    
    try {
      // If URL doesn't start with protocol, add https://
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      
      new URL(normalizedUrl)
      console.log('✅ API: URL validation passed:', normalizedUrl)
    } catch (error) {
      console.log('❌ API: URL validation failed:', externalUrl)
      return NextResponse.json({ 
        error: 'Product URL must be in correct format (e.g., example.com or www.example.com)' 
      }, { status: 400 })
    }

    let imageUrl = ''

    // Zpracování obrázku pokud je nahraný
    if (imageFile && imageFile.size > 0) {
      console.log('📷 API: Processing image upload...')
      
      // Kontrola velikosti souboru (max 2MB pro base64)
      if (imageFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'Image is too large. Maximum size is 2MB for Vercel deployment.' 
        }, { status: 400 })
      }

      // Kontrola typu souboru
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: 'Only images are allowed' 
        }, { status: 400 })
      }

      try {
        // Convert image to base64 data URL for Vercel compatibility
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        imageUrl = `data:${imageFile.type};base64,${base64}`
        
        console.log('✅ API: Image converted to base64 successfully')
      } catch (error) {
        console.error('❌ API: Error processing image:', error)
        return NextResponse.json({ 
          error: 'Failed to process image file' 
        }, { status: 500 })
      }
    }

    console.log('💾 API: Creating product in database...')

    // Vytvoř nový produkt s statusem "pending"
    try {
      const newProduct = await prisma.product.create({
        data: {
          id: uuidv4(),
          name,
          description,
          price,
          category,
          tags: JSON.stringify(tags),
          externalUrl: normalizedUrl,
          hasTrial,
          imageUrl,
          advantages: JSON.stringify(advantages),
          disadvantages: JSON.stringify(disadvantages),
          isActive: false, // Neaktivní dokud není schválen
          updatedAt: new Date(),
          // Použij existující sloupce pro tracking
          changesStatus: 'pending',
          changesSubmittedAt: new Date(),
          changesSubmittedBy: company.id,
          hasPendingChanges: true,
          // Označení typu - NEW_PRODUCT pro nové produkty vs EDIT_PRODUCT pro úpravy
          imageApprovalStatus: 'NEW_PRODUCT', // Použijeme toto pole pro označení typu
          // Poznámka, že toto je nový produkt od firmy
          adminNotes: `NEW PRODUCT: Submitted by company ${company.name} (${company.email}) for approval`
        }
      })

      console.log('✅ API: Product created successfully:', newProduct.id)

      // TODO: Pošli notifikaci super adminovi o novém produktu ke schválení
      // Můžeš přidat email notifikaci nebo webhook

      return NextResponse.json({
        success: true,
        productId: newProduct.id,
        message: 'Product successfully submitted for approval'
      })
    } catch (dbError) {
      console.error('❌ API: Database error creating product:', dbError)
      return NextResponse.json({ 
        error: 'Database error - failed to create product' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ API: Unexpected error in add product:', error)
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
} 