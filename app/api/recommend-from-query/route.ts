import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Jednoduchá NLP funkce pro analýzu dotazu
function analyzeQuery(query: string) {
  const lowercaseQuery = query.toLowerCase()
  
  // Detekce kategorie
  const categories = {
    text: ['text', 'psaní', 'copywriting', 'článk', 'obsah'],
    image: ['obraz', 'foto', 'obrázk', 'design'],
    video: ['video', 'film', 'střih'],
    audio: ['zvuk', 'hudba', 'audio'],
    code: ['kód', 'program', 'vývoj', 'web'],
    data: ['data', 'analýz', 'excel'],
  }

  let detectedCategory = null
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowercaseQuery.includes(keyword))) {
      detectedCategory = category
      break
    }
  }

  // Detekce rozpočtu
  const budgetMatch = lowercaseQuery.match(/do (\d+)\s*(?:kč|korun)/)
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : null

  // Detekce požadovaných funkcí
  const features = []
  if (lowercaseQuery.includes('export')) features.push('export')
  if (lowercaseQuery.includes('spolupráce')) features.push('collaboration')
  if (lowercaseQuery.includes('šablon')) features.push('templates')
  if (lowercaseQuery.includes('automatizace')) features.push('automation')

  return {
    category: detectedCategory,
    budget,
    features
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Analýza dotazu
    const requirements = analyzeQuery(query)

    // Sestavení dotazu pro databázi
    let dbQuery: any = {
      where: {}
    }

    if (requirements.category) {
      dbQuery.where.category = requirements.category
    }

    if (requirements.budget) {
      dbQuery.where.price = {
        lte: requirements.budget
      }
    }

    // Získání produktů
    const products = await prisma.product.findMany(dbQuery)

    // Filtrování podle funkcí po načtení dat
    let filteredProducts = products
    if (requirements.features.length > 0) {
      filteredProducts = products.filter(product => {
        const productTags = product.tags ? JSON.parse(product.tags) : []
        return requirements.features.some(feature => productTags.includes(feature))
      })
    }

    // Převedení JSON stringů na objekty
    const processedProducts = filteredProducts.map(product => ({
      ...product,
      tags: product.tags ? JSON.parse(product.tags) : [],
      advantages: product.advantages ? JSON.parse(product.advantages) : [],
      disadvantages: product.disadvantages ? JSON.parse(product.disadvantages) : [],
      reviews: product.reviews ? JSON.parse(product.reviews) : [],
      pricingInfo: product.pricingInfo ? JSON.parse(product.pricingInfo) : {},
      videoUrls: product.videoUrls ? JSON.parse(product.videoUrls) : []
    }))

    return NextResponse.json({
      analyzed_requirements: requirements,
      recommendations: processedProducts
    })
  } catch (error) {
    console.error('Error in /api/recommend-from-query:', error)
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
} 