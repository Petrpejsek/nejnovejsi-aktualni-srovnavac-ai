import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Import typu z hlavního route
import type { ReviewProduct } from '../route'

// File path for persistent storage
const QUEUE_FILE_PATH = path.join(process.cwd(), 'tmp', 'review-queue.json')

// Load queue from file
function loadQueue(): ReviewProduct[] {
  try {
    if (fs.existsSync(QUEUE_FILE_PATH)) {
      const data = fs.readFileSync(QUEUE_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('❌ Error loading queue from file:', error)
  }
  return []
}

// Save queue to file
function saveQueue(queue: ReviewProduct[]): void {
  try {
    fs.writeFileSync(QUEUE_FILE_PATH, JSON.stringify(queue, null, 2))
  } catch (error) {
    console.error('❌ Error saving queue to file:', error)
  }
}

// Helper funkce pro manipulaci s queue
function getReviewQueue(): ReviewProduct[] {
  return loadQueue()
}

function removeFromReviewQueue(reviewId: string): boolean {
  const queue = loadQueue()
  const initialLength = queue.length
  const newQueue = queue.filter((p: ReviewProduct) => p.reviewId !== reviewId)
  saveQueue(newQueue)
  return newQueue.length < initialLength
}

function updateInReviewQueue(reviewId: string, updatedData: Partial<ReviewProduct>): boolean {
  const queue = loadQueue()
  const index = queue.findIndex((p: ReviewProduct) => p.reviewId === reviewId)
  if (index === -1) return false
  
  queue[index] = { ...queue[index], ...updatedData }
  saveQueue(queue)
  return true
}

// POST - Schválit produkty a uložit do databáze
export async function POST(request: NextRequest) {
  try {
    const { reviewIds, action } = await request.json()

    if (!reviewIds || !Array.isArray(reviewIds)) {
      return NextResponse.json({
        success: false,
        error: 'Neplatná data - očekává se pole reviewIds'
      }, { status: 400 })
    }

    const approvedProducts = []
    const failedProducts = []

    for (const reviewId of reviewIds) {
      try {
        // Najít produkt v review queue
        const reviewProduct = getReviewQueue().find((p: ReviewProduct) => p.reviewId === reviewId)
        
        if (!reviewProduct) {
          failedProducts.push({
            reviewId,
            error: 'Produkt nebyl nalezen v review queue'
          })
          continue
        }

        // URL normalizace pro uložení
        const normalizeUrl = (url: string) => url.replace(/\/$/, '').toLowerCase()
        const cleanUrl = normalizeUrl(reviewProduct.externalUrl)
        
        // Duplikáty už byly zkontrolovány před scrapingem, takže přímo ukládáme

        console.log(`✅ Přidávám produkt: ${reviewProduct.name}`)
        console.log(`📊 Data pro uložení:`, {
          name: reviewProduct.name,
          externalUrl: cleanUrl,
          tags: reviewProduct.tags,
          advantages: reviewProduct.advantages
        })

        // Uložit do databáze
        const savedProduct = await prisma.product.create({
          data: {
            name: reviewProduct.name,
            description: reviewProduct.description,
            category: reviewProduct.category,
            price: reviewProduct.price,
            imageUrl: reviewProduct.screenshotUrl,
            tags: JSON.stringify(reviewProduct.tags),
            advantages: JSON.stringify(reviewProduct.advantages),
            disadvantages: JSON.stringify(reviewProduct.disadvantages),
            detailInfo: reviewProduct.detailInfo,
            pricingInfo: JSON.stringify(reviewProduct.pricingInfo),
            externalUrl: cleanUrl,
            hasTrial: reviewProduct.hasTrial
          }
        })
        
        console.log(`💾 Produkt úspěšně uložen do DB:`, savedProduct.id)

        // Odebrat z review queue
        removeFromReviewQueue(reviewId)

        approvedProducts.push({
          reviewId,
          productId: savedProduct.id,
          productName: savedProduct.name
        })

        console.log(`✅ Schválen a uložen produkt: ${savedProduct.name}`)

      } catch (error) {
        console.error(`❌ Chyba při schvalování ${reviewId}:`, error)
        failedProducts.push({
          reviewId,
          error: error instanceof Error ? error.message : 'Neočekávaná chyba'
        })
      }
    }

    const successCount = approvedProducts.length
    const failCount = failedProducts.length
    const remainingInQueue = getReviewQueue().length

    console.log(`🎯 Schválení dokončeno: ${successCount} úspěšných, ${failCount} neúspěšných`)

    // API je úspěšné pouze pokud se alespoň jeden produkt podařilo schválit
    const isSuccess = successCount > 0

    return NextResponse.json({
      success: isSuccess,
      approvedCount: successCount,
      failedCount: failCount,
      remainingInQueue,
      approvedProducts,
      failedProducts
    })

  } catch (error) {
    console.error('❌ Kritická chyba při schvalování:', error)
    return NextResponse.json({
      success: false,
      error: 'Vnitřní chyba serveru'
    }, { status: 500 })
  }
}

// PUT - Aktualizovat produkt v review queue
export async function PUT(request: NextRequest) {
  try {
    const { reviewId, updatedData } = await request.json()

    if (!reviewId || !updatedData) {
      return NextResponse.json({
        success: false,
        error: 'Chybí reviewId nebo updatedData'
      }, { status: 400 })
    }

    const success = updateInReviewQueue(reviewId, updatedData)

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Produkt nebyl nalezen v review queue'
      }, { status: 404 })
    }

    console.log(`📝 Aktualizován produkt v review: ${reviewId}`)

    return NextResponse.json({
      success: true,
      reviewId,
      message: 'Produkt byl úspěšně aktualizován'
    })

  } catch (error) {
    console.error('❌ Chyba při aktualizaci produktu:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při aktualizaci produktu'
    }, { status: 500 })
  }
} 