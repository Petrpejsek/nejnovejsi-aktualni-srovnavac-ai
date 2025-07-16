import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface SimilarProduct {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: string | null
  externalUrl: string | null
  hasTrial: boolean
  hasCredit?: boolean
  isActive?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentCategory = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '12')

    if (!currentCategory) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      )
    }

    console.log(`📚 Finding similar products for category: "${currentCategory}"`)

    // 1. Najdeme produkty s kreditem a aktivními kampaněmi (priorita #1)
    // Nejdříve najdeme aktivní kampaně s pozitivním balanceem
    const activeCampaigns = await prisma.campaign.findMany({
      where: {
        AND: [
          { status: 'active' },
          { isApproved: true },
          {
            Company: {
              AND: [
                { balance: { gt: 0 } },
                { status: 'active' }
              ]
            }
          }
        ]
      },
      select: {
        productId: true,
        Company: {
          select: {
            balance: true,
            status: true
          }
        }
      }
    })

    // Získáme ID produktů s kreditem
    const productIdsWithCredit = [...new Set(activeCampaigns.map(c => c.productId))]

    // Najdeme produkty s kreditem (jiné kategorie)
    const productsWithCredit = await prisma.product.findMany({
      where: {
        AND: [
          { id: { in: productIdsWithCredit } },
          { category: { not: currentCategory } },
          { isActive: true }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        tags: true,
        externalUrl: true,
        hasTrial: true
      },
      take: 8 // Maximálně 8 s kreditem
    })

    // 2. Najdeme podobné kategorie a produkty bez kreditu
    const whereConditions: any[] = [
      { category: { not: currentCategory } },
      { isActive: true }
    ]
    
    // Vylučujeme produkty s kreditem pouze pokud nějaké existují
    if (productIdsWithCredit.length > 0) {
      whereConditions.push({ id: { notIn: productIdsWithCredit } })
    }

    const categorySimilarProducts = await prisma.product.findMany({
      where: {
        AND: whereConditions
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        tags: true,
        externalUrl: true,
        hasTrial: true
      },
      take: limit // Doplníme zbývající místa
    })

    // 3. Kombinujeme a označíme produkty s kreditem
    const productsWithCreditMarked: SimilarProduct[] = productsWithCredit.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      tags: product.tags,
      externalUrl: product.externalUrl,
      hasTrial: product.hasTrial,
      hasCredit: true,
      isActive: true
    }))

    const productsWithoutCredit: SimilarProduct[] = categorySimilarProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      tags: product.tags,
      externalUrl: product.externalUrl,
      hasTrial: product.hasTrial,
      hasCredit: false,
      isActive: true
    }))

    // 4. Spojíme produkty (s kreditem mají prioritu)
    const allSimilarProducts = [
      ...productsWithCreditMarked,
      ...productsWithoutCredit
    ]

    // 5. Odebereme duplicity a omezíme na požadovaný počet
    const uniqueProducts = allSimilarProducts
      .filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      .slice(0, limit)

    console.log(`✅ Found ${uniqueProducts.length} similar products:`)
    console.log(`   - ${productsWithCreditMarked.length} with credit`)
    console.log(`   - ${productsWithoutCredit.length} without credit`)

    return NextResponse.json({
      products: uniqueProducts,
      totalFound: uniqueProducts.length,
      withCredit: productsWithCreditMarked.length,
      withoutCredit: productsWithoutCredit.length
    })

  } catch (error) {
    console.error('❌ Error fetching similar products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 