import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const testProducts = [
  {
    name: "ChatGPT",
    description: "Pokročilý jazykový model pro konverzaci a generování textu",
    price: 20,
    category: "Chatbot",
    imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=ChatGPT",
    tags: JSON.stringify(["AI", "Chatbot", "Generování textu"]),
    advantages: JSON.stringify([
      "Přirozená konverzace",
      "Široké znalosti",
      "Rychlé odpovědi"
    ]),
    disadvantages: JSON.stringify([
      "Občasné nepřesnosti",
      "Omezení délky konverzace",
      "Potřeba ověřování faktů"
    ]),
    detailInfo: "ChatGPT je pokročilý jazykový model vyvinutý společností OpenAI. Dokáže vést přirozenou konverzaci, pomáhat s psaním, odpovídat na otázky a řešit různé úkoly.",
    pricingInfo: JSON.stringify({
      basic: "0",
      pro: "20",
      enterprise: "100"
    }),
    videoUrls: JSON.stringify([]),
    externalUrl: "https://chat.openai.com"
  },
  {
    name: "Claude",
    description: "Inteligentní AI asistent pro komplexní úkoly a analýzu",
    price: 25,
    category: "Chatbot",
    imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Claude",
    tags: JSON.stringify(["AI", "Chatbot", "Analýza"]),
    advantages: JSON.stringify([
      "Dlouhé konverzace",
      "Přesné odpovědi",
      "Práce s dokumenty"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cena",
      "Méně kreativní",
      "Omezená dostupnost"
    ]),
    detailInfo: "Claude je AI asistent vyvinutý společností Anthropic. Vyniká v dlouhých konverzacích, analýze dokumentů a řešení komplexních úkolů.",
    pricingInfo: JSON.stringify({
      basic: "10",
      pro: "25",
      enterprise: "150"
    }),
    videoUrls: JSON.stringify([]),
    externalUrl: "https://claude.ai"
  }
]

export async function GET() {
  try {
    // Kontrola SKIP_DB_RESET proměnné
    if (process.env.SKIP_DB_RESET === 'true') {
      console.log('SKIP_DB_RESET je nastaveno na true, přeskakuji reset databáze')
      return new NextResponse(
        JSON.stringify({ 
          message: 'Reset databáze přeskočen (SKIP_DB_RESET=true)'
        }, null, 2)
      )
    }

    console.log('Začínám seed proces...')
    
    // Smazat existující produkty
    console.log('Mažu existující produkty...')
    await prisma.product.deleteMany()
    console.log('Existující produkty smazány')

    // Přidat testovací produkty
    console.log('Přidávám nové produkty...')
    const products = await Promise.all(
      testProducts.map(product => {
        console.log('Vytvářím produkt:', product.name)
        return prisma.product.create({
          data: product
        })
      })
    )
    console.log('Nové produkty vytvořeny:', products)

    const response = new NextResponse(
      JSON.stringify({ 
        message: 'Testovací data byla úspěšně přidána',
        products 
      }, null, 2)
    )
    
    response.headers.set('Content-Type', 'application/json; charset=utf-8')
    return response

  } catch (error) {
    console.error('Chyba při přidávání testovacích dat:', error)
    
    const errorResponse = new NextResponse(
      JSON.stringify({ 
        error: 'Chyba při přidávání testovacích dat', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2)
    )
    
    errorResponse.headers.set('Content-Type', 'application/json; charset=utf-8')
    return errorResponse
  }
} 