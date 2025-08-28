import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { getCategoryNamesForSlug } from '@/lib/categoryMapping'
import { enhanceProductWithScreenshot, getScreenshotUrl } from '@/lib/screenshot-utils'
import { v4 as uuidv4 } from 'uuid'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: string | null
  advantages: string | null
  disadvantages: string | null
  detailInfo: string | null
  pricingInfo: string | null
  videoUrls: string | null
  externalUrl: string | null
  hasTrial: boolean
  createdAt: Date
  updatedAt: Date
}

// Function for safe JSON parsing
function safeJsonParse(jsonString: string | null | any, fallback: any = null): any {
  if (!jsonString) return fallback;
  
  // If it's already an object/array, return it as is
  if (typeof jsonString === 'object') {
    return jsonString;
  }
  
  // If it's a string, try to parse it
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonString, error);
      return fallback;
    }
  }
  
  return fallback;
}

// Function for cleaning product data
function cleanProduct(product: any): any {
  return {
    ...product,
    tags: safeJsonParse(product.tags, []),
    advantages: safeJsonParse(product.advantages, []),
    disadvantages: safeJsonParse(product.disadvantages, []),
    pricingInfo: safeJsonParse(product.pricingInfo, {}),
    videoUrls: safeJsonParse(product.videoUrls, []),
    // Ensure externalUrl is always included
    externalUrl: product.externalUrl || null
  };
}

// Configure API as dynamic so it can use request.url
export const dynamic = 'auto'

// GET /api/products - Get all products with pagination and filters
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      
      // Return only unique categories if requested
      const categoriesOnlyParam = searchParams.get('categoriesOnly');

      if (categoriesOnlyParam === 'true') {
        const rawCats = await prisma.product.findMany({ select: { category: true } });
        const allCats = new Set<string>();
        rawCats.forEach(p => { if (p.category && p.category.trim()) allCats.add(p.category.trim()); });
        const uniqueCats = Array.from(allCats).sort();
        return NextResponse.json({ categories: uniqueCats }, { status: 200 });
      }
      
      // Check if this is a request for tags only (optimized)
      const tagsOnlyParam = searchParams.get('tagsOnly');
      
      if (tagsOnlyParam === 'true') {
        console.log('API: Loading tags only (optimized)...');
        
        // Load only tags field for all products - much faster
        const rawProducts = await prisma.product.findMany({
          select: {
            tags: true
          }
        });
        
        // Extract all unique tags
        const allTags = new Set<string>();
        
        rawProducts.forEach(product => {
          const tags = safeJsonParse(product.tags, []);
          if (Array.isArray(tags)) {
            tags.forEach((tag: string) => {
              if (tag && typeof tag === 'string' && tag.trim()) {
                allTags.add(tag.trim());
              }
            });
          }
        });
        
        const uniqueTags = Array.from(allTags).sort();
        
        console.log(`API: Successfully extracted ${uniqueTags.length} unique tags from ${rawProducts.length} products`);
        
        return NextResponse.json({ tags: uniqueTags }, { status: 200 });
      }
      
      // Check if this is a query for specific IDs
      const idsParam = searchParams.get('ids');
      
      if (idsParam) {
        // Load products by specific IDs
        const ids = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);
        console.log('API: Loading products by IDs:', ids);
        
        if (ids.length === 0) {
          return NextResponse.json([], { status: 200 });
        }
        
        const rawProducts = await prisma.product.findMany({
          where: {
            id: {
              in: ids
            }
          },
          orderBy: { name: 'asc' }
        });
        
        // Clean products and enhance with screenshots before sending
        const products = rawProducts.map(product => enhanceProductWithScreenshot(cleanProduct(product)));
        
        console.log(`API: Successfully loaded ${products.length} products by IDs`);
        return NextResponse.json(products, { status: 200 });
      }
      
      // Reliable parameter parsing for pagination and filtering
      const pageParam = searchParams.get('page');
      const pageSizeParam = searchParams.get('pageSize');
      const categoryParam = searchParams.get('category');
      const categorySlugParam = searchParams.get('categorySlug');
      const categoriesParam = searchParams.get('categories'); // comma-separated list of categories
      let categoriesList = categoriesParam
        ? categoriesParam.split(',').map((c) => c.trim()).filter((c) => c.length > 0)
        : []
      // If client provides a canonical slug, expand to human names + synonyms
      if (categoriesList.length === 0 && categorySlugParam) {
        try {
          categoriesList = getCategoryNamesForSlug(categorySlugParam)
        } catch {}
      }
      const forHomepage = searchParams.get('forHomepage') === 'true'; // optimalizace pro homepage
      
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 50; // New default - show up to 50 products if client doesn't specify otherwise
      
      console.log('API: Processing request for products with params:', { 
        page, 
        pageSize,
        pageParam,
        pageSizeParam,
        category: categoryParam,
        categorySlug: categorySlugParam,
        categories: categoriesList,
        url: request.url 
      });
      
      // Parameter validation
      const validPage = page > 0 ? page : 1;
      const validPageSize = Math.min(Math.max(pageSize, 1), 1000); // min 1, max 1000
      
      // Calculate offset for pagination
      const skip = (validPage - 1) * validPageSize;
      
      // Prepare where clause for filtering - include soft delete filter
      const whereClause: any = {
        isActive: true,
        name: { not: '' }
      };
      // String-based filter handled later in raw SQL for performance and to include secondary category id
      
      // Get total count of products (with filter)
      const totalProducts = await prisma.product.count({
        where: whereClause
      });
      
      // NEW ALGORITHM (fixed): Prioritize products whose assigned company has active approved campaign
      // and sufficient credit. Source of credit: billing_accounts.credit_balance OR fallback Company.balance.
      const rawProducts = await prisma.$queryRaw`
        SELECT 
          p.*,
          c."id"  AS company_id,
          c."name" AS company_name,
          COALESCE(ba."credit_balance", c."balance", 0) AS effective_balance,
          CASE 
            WHEN EXISTS (
              SELECT 1
              FROM "Campaign" camp
              WHERE camp."productId" = p."id"
                AND camp."companyId" = c."id"
                AND camp."status" = 'active'
                AND camp."isApproved" = true
                AND COALESCE(ba."credit_balance", c."balance", 0) >= camp."bidAmount"
            ) THEN 1 ELSE 0
          END AS has_campaign,
          CASE 
            WHEN EXISTS (
              SELECT 1
              FROM "monetization_configs" mc
              WHERE mc."is_active" = true
                AND mc."monetizable_id" = p."id"
                AND mc."monetizable_type" IN ('product', 'Product')
                AND mc."mode" IN ('affiliate', 'hybrid')
            ) THEN 1 ELSE 0
          END AS has_affiliate
        FROM "Product" p
        LEFT JOIN "Company" c ON c."assignedProductId" = p."id"
        LEFT JOIN "billing_accounts" ba ON ba."partner_id" = c."id"
        WHERE p."isActive" = true
          AND p."name" IS NOT NULL 
          AND p."name" != ''
          ${categoriesList.length > 0
            ? Prisma.sql`AND (
                LOWER(TRIM(p."category")) IN (${Prisma.join(categoriesList.map(c => c.toLowerCase().trim()))})
                OR EXISTS (
                  SELECT 1 FROM "Category" cat
                  WHERE cat."id" = p."primary_category_id"
                    AND LOWER(TRIM(cat."name")) IN (${Prisma.join(categoriesList.map(c => c.toLowerCase().trim()))})
                )
                OR EXISTS (
                  SELECT 1 FROM "Category" cat2
                  WHERE cat2."id" = p."secondary_category_id"
                    AND LOWER(TRIM(cat2."name")) IN (${Prisma.join(categoriesList.map(c => c.toLowerCase().trim()))})
                )
                OR EXISTS (
                  SELECT 1 FROM "ProductCategory" pc
                  JOIN "Category" c3 ON c3."id" = pc."categoryId"
                  WHERE pc."productId" = p."id"
                    AND LOWER(TRIM(c3."name")) IN (${Prisma.join(categoriesList.map(c => c.toLowerCase().trim()))})
                )
              )`
            : (categoryParam 
                ? Prisma.sql`AND (
                    LOWER(TRIM(p."category")) = ${categoryParam.toLowerCase().trim()}
                    OR EXISTS (
                      SELECT 1 FROM "Category" cat
                      WHERE cat."id" = p."primary_category_id"
                        AND LOWER(TRIM(cat."name")) = ${categoryParam.toLowerCase().trim()}
                    )
                    OR EXISTS (
                      SELECT 1 FROM "Category" cat2
                      WHERE cat2."id" = p."secondary_category_id"
                        AND LOWER(TRIM(cat2."name")) = ${categoryParam.toLowerCase().trim()}
                    )
                    OR EXISTS (
                      SELECT 1 FROM "ProductCategory" pc
                      JOIN "Category" c3 ON c3."id" = pc."categoryId"
                      WHERE pc."productId" = p."id"
                        AND LOWER(TRIM(c3."name")) = ${categoryParam.toLowerCase().trim()}
                    )
                  )`
                : Prisma.empty)
          }
        ORDER BY 
          has_campaign DESC,
          has_affiliate DESC,
          CASE WHEN (CASE 
            WHEN EXISTS (
              SELECT 1
              FROM "Campaign" camp
              WHERE camp."productId" = p."id"
                AND camp."companyId" = c."id"
                AND camp."status" = 'active'
                AND camp."isApproved" = true
                AND COALESCE(ba."credit_balance", c."balance", 0) >= camp."bidAmount"
            ) THEN 1 ELSE 0 END) = 1 THEN COALESCE(ba."credit_balance", c."balance", 0) ELSE 0 END DESC,
          RANDOM()
        LIMIT ${validPageSize}
        OFFSET ${skip}
      ` as (Product & { company_id: string | null; company_name: string | null; effective_balance: number; has_campaign: number; has_affiliate: number })[];
      
      // Clean products and enhance with screenshots before sending
      const products = rawProducts.map(product => {
        if (forHomepage) {
          // Optimalizovaná data pro homepage/kategorie, ale vždy preferuj skutečné imageUrl z DB
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price || 0,
            category: product.category,
            imageUrl: product.imageUrl && product.imageUrl.trim()
              ? product.imageUrl
              : (product.name ? getScreenshotUrl(product.name) : '/img/placeholder.svg'),
            tags: safeJsonParse(product.tags, []),
            externalUrl: product.externalUrl,
            hasTrial: Boolean(product.hasTrial),
            updatedAt: product.updatedAt
          } as any;
        } else {
          // Plná data pro ostatní endpointy
          const cleanedProduct = enhanceProductWithScreenshot(cleanProduct(product));
          return cleanedProduct;
        }
      });
      
      const totalPages = Math.ceil(totalProducts / validPageSize);
      
      console.log(`API: Successfully loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts}) - SORTED BY CREDIT + ACTIVE CAMPAIGNS`);
      
      // PREVENTIVNÍ KONTROLA: Pauzni kampaně bez dostatečného kreditu
      try {
        await prisma.$executeRaw`
          UPDATE "Campaign" 
          SET "status" = 'paused'
          WHERE "status" = 'active' 
          AND "isApproved" = true
          AND EXISTS (
            SELECT 1 FROM "Company" c 
            WHERE c."id" = "Campaign"."companyId" 
            AND c."balance" < "Campaign"."bidAmount"
          )
        `;
        console.log('🔧 Preventive check: Auto-paused campaigns with insufficient credit');
      } catch (pauseError) {
        console.log('⚠️ Error during preventive campaign pausing:', pauseError);
      }
      
      // Cache systém byl odstraněn - již se neukládá do cache
      
      const response = {
        products,
        pagination: {
          page: validPage,
          pageSize: validPageSize,
          totalProducts,
          totalPages
        }
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error loading products:', error);
        return NextResponse.json(
        { 
          error: 'Failed to load products', 
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
        );
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Received data for product creation:', data)

    // Check required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }
    if (!data.category || !String(data.category).trim()) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Process data before saving - SIMPLE VERSION
    const processedData = {
      name: data.name,
      description: data.description || '',
      price: typeof data.price === 'number' ? data.price : 0,
      category: String(data.category).trim(),
      imageUrl: data.imageUrl || '',
      tags: '[]',
      advantages: '[]',
      disadvantages: '[]',
      detailInfo: data.detailInfo || '',
      pricingInfo: '{}',
      videoUrls: '[]',
      externalUrl: data.externalUrl || null,
      hasTrial: Boolean(data.hasTrial)
    }

    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        ...processedData,
        updatedAt: new Date()
      }
    })

    // No data processing - return as is
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 