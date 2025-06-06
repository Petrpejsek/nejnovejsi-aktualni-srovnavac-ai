import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface ReviewProduct {
  reviewId: string
  name: string
  description: string
  category: string
  price: number
  advantages: string[]
  disadvantages: string[]
  hasTrial: boolean
  tags: string[]
  detailInfo: string
  pricingInfo: any
  externalUrl: string
  screenshotUrl: string | null
  scrapedAt: string
}

// File path for persistent storage
const QUEUE_FILE_PATH = path.join(process.cwd(), 'tmp', 'review-queue.json')

// Ensure tmp directory exists
const tmpDir = path.dirname(QUEUE_FILE_PATH)
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

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
export function getReviewQueue(): ReviewProduct[] {
  return loadQueue()
}

export function removeFromReviewQueue(reviewId: string): boolean {
  const queue = loadQueue()
  const initialLength = queue.length
  const newQueue = queue.filter((p: ReviewProduct) => p.reviewId !== reviewId)
  saveQueue(newQueue)
  return newQueue.length < initialLength
}

export function updateInReviewQueue(reviewId: string, updatedData: Partial<ReviewProduct>): boolean {
  const queue = loadQueue()
  const index = queue.findIndex((p: ReviewProduct) => p.reviewId === reviewId)
  if (index === -1) return false
  
  queue[index] = { ...queue[index], ...updatedData }
  saveQueue(queue)
  return true
}

// GET - Získat všechny produkty v review queue
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = url.searchParams.get('limit')
    const queue = loadQueue()
    
    const products = limit 
      ? queue.slice(0, parseInt(limit)) 
      : queue

    return NextResponse.json({
      success: true,
      count: queue.length,
      maxCapacity: 50,
      products
    })
  } catch (error) {
    console.error('❌ Chyba při načítání review queue:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při načítání produktů'
    }, { status: 500 })
  }
}

// POST - Přidat produkty do review queue
export async function POST(request: NextRequest) {
  try {
    // Kontrola prostředí - blokace na produkci
    const isAdminUploadEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD === 'true'
    
    if (!isAdminUploadEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Review queue funkcionalita není dostupná na tomto prostředí'
      }, { status: 403 });
    }

    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({
        success: false,
        error: 'Neplatná data - očekává se pole produktů'
      }, { status: 400 })
    }

    const queue = loadQueue()
    // Kontrola kapacity (max 50 produktů)
    const availableSpace = 50 - queue.length
    if (availableSpace <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Review queue je plná! Prosím schvalte nebo smažte stávající produkty.',
        currentCount: queue.length,
        maxCapacity: 50
      }, { status: 400 })
    }

    const productsToAdd = products.slice(0, availableSpace)
    const overflow = products.length - productsToAdd.length

    // Přidat produkty do queue
    const newQueue = [...queue, ...productsToAdd]
    saveQueue(newQueue)

    console.log(`📝 Přidáno ${productsToAdd.length} produktů do review queue`)

    return NextResponse.json({
      success: true,
      addedCount: productsToAdd.length,
      totalInQueue: newQueue.length,
      overflow,
      maxCapacity: 50
    })

  } catch (error) {
    console.error('❌ Chyba při přidávání do review queue:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při přidávání produktů'
    }, { status: 500 })
  }
}

// DELETE - Smazat produkt(y) z review queue
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const reviewId = url.searchParams.get('reviewId')
    const action = url.searchParams.get('action') // 'single' nebo 'clear'

    if (action === 'clear') {
      // Smazat všechny produkty
      const queue = loadQueue()
      const deletedCount = queue.length
      saveQueue([])
      
      console.log(`🗑️ Vymazána celá review queue (${deletedCount} produktů)`)
      
      return NextResponse.json({
        success: true,
        deletedCount,
        message: 'Review queue byla vymazána'
      })
    }

    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'Chybí reviewId'
      }, { status: 400 })
    }

    // Smazat konkrétní produkt
    const queue = loadQueue()
    const initialLength = queue.length
    const newQueue = queue.filter((p: ReviewProduct) => p.reviewId !== reviewId)
    
    if (newQueue.length === initialLength) {
      return NextResponse.json({
        success: false,
        error: 'Produkt nebyl nalezen'
      }, { status: 404 })
    }

    saveQueue(newQueue)
    console.log(`🗑️ Smazán produkt ${reviewId} z review queue`)

    return NextResponse.json({
      success: true,
      deletedId: reviewId,
      remainingCount: newQueue.length
    })

  } catch (error) {
    console.error('❌ Chyba při mazání z review queue:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při mazání produktu'
    }, { status: 500 })
  }
} 