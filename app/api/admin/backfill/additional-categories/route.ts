import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type BackfillPayload = {
  byPrimaryCategory?: Record<string, string[]>
  byProductId?: Record<string, string[]>
}

function normalizeName(name: string): string {
  return String(name || '').trim()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = Boolean((session as any)?.user?.isAdmin) || (session as any)?.user?.role === 'admin' || (session as any)?.user?.email === 'admin@admin.com'
    const isDevAdmin = process.env.NODE_ENV === 'development' && request.headers.get('referer')?.includes('/admin/')
    if (!isAdmin && !isDevAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') === '1' || searchParams.get('dryRun') === 'true'

    const payload = (await request.json()) as BackfillPayload

    const byPrimaryCategoryRaw = payload?.byPrimaryCategory || {}
    const byProductIdRaw = payload?.byProductId || {}

    // Validate input types
    if (typeof byPrimaryCategoryRaw !== 'object' || typeof byProductIdRaw !== 'object') {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
    }

    // Normalize and collect all category names we need to resolve to IDs
    const requestedCategoryNames = new Set<string>()
    const byPrimaryCategory: Record<string, string[]> = {}
    for (const [primaryName, additionalList] of Object.entries(byPrimaryCategoryRaw)) {
      const p = normalizeName(primaryName)
      if (!p) continue
      const normalizedAdditional = (additionalList || [])
        .map(normalizeName)
        .filter(Boolean)
      if (normalizedAdditional.length === 0) continue
      byPrimaryCategory[p] = normalizedAdditional
      normalizedAdditional.forEach((n) => requestedCategoryNames.add(n))
      requestedCategoryNames.add(p)
    }

    const byProductId: Record<string, string[]> = {}
    for (const [productId, additionalList] of Object.entries(byProductIdRaw)) {
      const pid = String(productId || '').trim()
      if (!pid) continue
      const normalizedAdditional = (additionalList || [])
        .map(normalizeName)
        .filter(Boolean)
      if (normalizedAdditional.length === 0) continue
      byProductId[pid] = normalizedAdditional
      normalizedAdditional.forEach((n) => requestedCategoryNames.add(n))
    }

    if (requestedCategoryNames.size === 0 && Object.keys(byPrimaryCategory).length === 0 && Object.keys(byProductId).length === 0) {
      return NextResponse.json({ error: 'Nothing to process' }, { status: 400 })
    }

    // Resolve categories by names using normalized (trim + lower) comparison
    const categoryNameArray = Array.from(requestedCategoryNames)
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    })
    const nameToId = new Map<string, string>()
    categories.forEach((c) => nameToId.set(normalizeName(c.name).toLowerCase(), c.id))

    // Verify that all requested additional categories exist
    const missingCategoryNames = categoryNameArray.filter((n) => !nameToId.has(normalizeName(n).toLowerCase()))
    if (missingCategoryNames.length > 0) {
      return NextResponse.json(
        { error: 'Unknown categories', missing: missingCategoryNames },
        { status: 400 }
      )
    }

    // Build desired pairs from byPrimaryCategory
    const pairs: Array<{ productId: string; categoryId: string }> = []

    if (Object.keys(byPrimaryCategory).length > 0) {
      // Resolve primary category IDs
      const primaryNames = Object.keys(byPrimaryCategory)
      const primaryCategories = await prisma.category.findMany({
        select: { id: true, name: true }
      })
      const primaryNameToId = new Map<string, string>()
      primaryCategories.forEach((c) => primaryNameToId.set(normalizeName(c.name).toLowerCase(), c.id))

      const missingPrimary = primaryNames.filter((n) => !primaryNameToId.has(n.toLowerCase()))
      if (missingPrimary.length > 0) {
        return NextResponse.json(
          { error: 'Unknown primary categories', missing: missingPrimary },
          { status: 400 }
        )
      }

      // For each primary category, load products that have it as primary_category_id
      for (const [primaryName, additionalList] of Object.entries(byPrimaryCategory)) {
        const primaryId = primaryNameToId.get(normalizeName(primaryName).toLowerCase())!
        const productsWithPrimary = await prisma.product.findMany({
          where: { primary_category_id: primaryId, isActive: true },
          select: { id: true, primary_category_id: true }
        })
        const additionalIds = additionalList.map((n) => nameToId.get(normalizeName(n).toLowerCase())!).filter(Boolean)
        for (const prod of productsWithPrimary) {
          for (const addId of additionalIds) {
            if (addId === prod.primary_category_id) continue
            pairs.push({ productId: prod.id, categoryId: addId })
          }
        }
      }
    }

    if (Object.keys(byProductId).length > 0) {
      const productIds = Object.keys(byProductId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, primary_category_id: true }
      })
      const existingProductIds = new Set(products.map((p) => p.id))
      const missingProducts = productIds.filter((id) => !existingProductIds.has(id))
      if (missingProducts.length > 0) {
        return NextResponse.json({ error: 'Unknown products', missingProducts }, { status: 400 })
      }
      const productIdToPrimary = new Map(products.map((p) => [p.id, p.primary_category_id]))

      for (const [pid, additionalList] of Object.entries(byProductId)) {
        const additionalIds = additionalList.map((n) => nameToId.get(normalizeName(n).toLowerCase())!).filter(Boolean)
        const primaryId = productIdToPrimary.get(pid)
        for (const addId of additionalIds) {
          if (primaryId && addId === primaryId) continue
          pairs.push({ productId: pid, categoryId: addId })
        }
      }
    }

    if (pairs.length === 0) {
      return NextResponse.json({ success: true, created: 0, skipped: 0, preview: [] })
    }

    // Filter out pairs already existing in ProductCategory
    const productIdsToCheck = Array.from(new Set(pairs.map((p) => p.productId)))
    const existingJoins = await prisma.productCategory.findMany({
      where: { productId: { in: productIdsToCheck } },
      select: { productId: true, categoryId: true }
    })
    const existingSet = new Set(existingJoins.map((j) => `${j.productId}|${j.categoryId}`))

    const uniquePairs: Array<{ productId: string; categoryId: string }> = []
    const seen = new Set<string>()
    for (const p of pairs) {
      const key = `${p.productId}|${p.categoryId}`
      if (existingSet.has(key)) continue
      if (seen.has(key)) continue
      seen.add(key)
      uniquePairs.push(p)
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        toCreate: uniquePairs.length,
        skippedExisting: pairs.length - uniquePairs.length,
        sample: uniquePairs.slice(0, 20)
      })
    }

    // Create in chunks with skipDuplicates for extra safety
    let createdTotal = 0
    const chunkSize = 1000
    for (let i = 0; i < uniquePairs.length; i += chunkSize) {
      const chunk = uniquePairs.slice(i, i + chunkSize)
      const created = await prisma.productCategory.createMany({
        data: chunk.map((c) => ({ productId: c.productId, categoryId: c.categoryId })),
        skipDuplicates: true
      })
      createdTotal += created.count
    }

    return NextResponse.json({ success: true, created: createdTotal })
  } catch (error) {
    console.error('Backfill additional categories failed:', error)
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}


