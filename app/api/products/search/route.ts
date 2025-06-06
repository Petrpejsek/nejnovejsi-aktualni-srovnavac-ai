import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import prismaClient from '@/lib/prisma'

interface SearchRequest {
  urls?: string[]
  companyName: string
  website?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { urls = [], companyName, website } = body

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    let products = []

    // Jednoduché vyhledávání podle názvu firmy
    if (companyName) {
      const nameProducts = await prismaClient.product.findMany({
        where: {
          OR: [
            { name: { contains: companyName } },
            { description: { contains: companyName } }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          externalUrl: true,
          imageUrl: true,
          category: true,
          price: true,
          hasTrial: true,
          createdAt: true
        }
      })
      products.push(...nameProducts)
    }

    // Vyhledávání podle URL
    if (urls.length > 0) {
      for (const url of urls) {
        try {
          const domain = new URL(url).hostname.replace('www.', '')
          const urlProducts = await prismaClient.product.findMany({
            where: {
              externalUrl: { contains: domain }
            },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              description: true,
              externalUrl: true,
              imageUrl: true,
              category: true,
              price: true,
              hasTrial: true,
              createdAt: true
            }
          })
          products.push(...urlProducts)
        } catch {
          // Ignoruj neplatné URL
        }
      }
    }

    // Vyhledávání podle webové stránky
    if (website) {
      try {
        const websiteDomain = new URL(website).hostname.replace('www.', '')
        const websiteProducts = await prismaClient.product.findMany({
          where: {
            externalUrl: { contains: websiteDomain }
          },
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            description: true,
            externalUrl: true,
            imageUrl: true,
            category: true,
            price: true,
            hasTrial: true,
            createdAt: true
          }
        })
        products.push(...websiteProducts)
      } catch {
        // Ignoruj neplatné URL
      }
    }

    // Odstraň duplikáty podle ID
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    )

    return NextResponse.json({ 
      products: uniqueProducts.slice(0, 10), // Maximálně 10 výsledků
      searchCriteria: {
        companyName,
        urlCount: urls.length,
        website: website || null
      }
    })

  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 