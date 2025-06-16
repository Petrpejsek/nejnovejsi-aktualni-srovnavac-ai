import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
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
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Najdi firmu podle ID z JWT tokenu
    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Parse FormData
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const tags = JSON.parse(formData.get('tags') as string)
    const externalUrl = formData.get('externalUrl') as string
    const hasTrial = formData.get('hasTrial') === 'true'
    const advantages = JSON.parse(formData.get('advantages') as string || '[]')
    const disadvantages = JSON.parse(formData.get('disadvantages') as string || '[]')
    const imageFile = formData.get('image') as File

    // Validace
    if (!name || !description || !category || !externalUrl) {
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

    // Validace URL - normalize by adding https:// if missing
    let normalizedUrl = externalUrl.trim()
    
    try {
      // If URL doesn't start with protocol, add https://
      if (!normalizedUrl.match(/^https?:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      
      new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ 
        error: 'Product URL must be in correct format (e.g., example.com or www.example.com)' 
      }, { status: 400 })
    }

    let imageUrl = ''

    // Zpracování obrázku pokud je nahraný
    if (imageFile && imageFile.size > 0) {
      // Kontrola velikosti souboru (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'Image is too large. Maximum size is 5MB.' 
        }, { status: 400 })
      }

      // Kontrola typu souboru
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: 'Only images are allowed' 
        }, { status: 400 })
      }

      // Vytvoř unikátní název souboru
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = imageFile.name.split('.').pop()
      const fileName = `company-${company.id}-${timestamp}-${randomString}.${extension}`

      // Cesta k uložení
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'company-products')
      const filePath = path.join(uploadDir, fileName)

      // Vytvoř adresář pokud neexistuje
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Adresář už existuje
      }

      // Ulož soubor
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      imageUrl = `/uploads/company-products/${fileName}`
    }

    // Vytvoř nový produkt s statusem "pending"
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

    // TODO: Pošli notifikaci super adminovi o novém produktu ke schválení
    // Můžeš přidat email notifikaci nebo webhook

    return NextResponse.json({
      success: true,
      productId: newProduct.id,
      message: 'Product successfully submitted for approval'
    })

  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 