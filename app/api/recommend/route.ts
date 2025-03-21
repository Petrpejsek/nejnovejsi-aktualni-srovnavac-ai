import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    if (!query) {
      return NextResponse.json(
        { error: 'Chybí dotaz pro doporučení' },
        { status: 400 }
      )
    }

    // Načteme všechny produkty
    const products = await prisma.product.findMany()
    
    // Připravíme kontext pro AI
    const context = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
      advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || []
    }))

    // Vytvoříme prompt pro AI
    const prompt = `Na základě následujícího požadavku zákazníka: "${query}"

Analyzuj tyto produkty a jejich vlastnosti:
${JSON.stringify(context, null, 2)}

Vrať pole produktů seřazené podle relevance k požadavku zákazníka. Pro každý produkt uveď:
1. ID produktu
2. Skóre shody (0-1)
3. Stručné vysvětlení, proč je produkt vhodný pro daný požadavek

Odpověz pouze v JSON formátu:
[{
  "productId": "...",
  "score": 0.95,
  "reason": "..."
}]`

    // Získáme doporučení od AI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1500
    })

    const recommendations = JSON.parse(completion.choices[0].message.content || '[]')

    // Spojíme doporučení s detaily produktů
    const recommendedProducts = await Promise.all(
      recommendations.map(async (rec: any) => {
        const product = products.find(p => p.id === rec.productId)
        if (!product) return null

        return {
          ...product,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
          advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
          disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
          pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
          videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
          matchScore: rec.score,
          matchReason: rec.reason
        }
      })
    )

    // Odfiltrujeme null hodnoty a seřadíme podle skóre
    const filteredProducts = recommendedProducts
      .filter(Boolean)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Chyba při generování doporučení:', error)
    return NextResponse.json(
      { error: 'Chyba při generování doporučení' },
      { status: 500 }
    )
  }
} 