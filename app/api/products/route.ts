import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

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
        
        // Clean products before sending
        const products = rawProducts.map(cleanProduct);
        
        console.log(`API: Successfully loaded ${products.length} products by IDs`);
        return NextResponse.json(products, { status: 200 });
      }
      
      // Reliable parameter parsing for pagination and filtering
      const pageParam = searchParams.get('page');
      const pageSizeParam = searchParams.get('pageSize');
      const categoryParam = searchParams.get('category');
      
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 50; // New default - show up to 50 products if client doesn't specify otherwise
      
      console.log('API: Processing request for products with params:', { 
        page, 
        pageSize,
        pageParam,
        pageSizeParam,
        category: categoryParam,
        url: request.url 
      });
      
      // Parameter validation
      const validPage = page > 0 ? page : 1;
      const validPageSize = Math.min(Math.max(pageSize, 1), 1000); // min 1, max 1000
      
      // Calculate offset for pagination
      const skip = (validPage - 1) * validPageSize;
      
      // Prepare where clause for filtering
      const whereClause: any = {};
      if (categoryParam) {
        whereClause.category = categoryParam;
      }
      
      // Get total count of products (with filter)
      const totalProducts = await prisma.product.count({
        where: whereClause
      });
      
      // Get paginated products (with filter) - random order for homepage
      const rawProducts = await prisma.$queryRaw`
        SELECT * FROM "Product" 
        ${categoryParam ? Prisma.sql`WHERE "category" = ${categoryParam}` : Prisma.empty}
        ORDER BY RANDOM()
        LIMIT ${validPageSize}
        OFFSET ${skip}
      ` as Product[];
      
      // Clean products before sending
      const products = rawProducts.map(cleanProduct);
      
      const totalPages = Math.ceil(totalProducts / validPageSize);
      
      console.log(`API: Successfully loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts})`);
      
      // Cache the product count for homepage animation
      try {
        await fetch(new URL('/api/product-count', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: totalProducts })
        });
      } catch (error) {
        console.warn('Failed to cache product count:', error);
      }
      
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

    // Process data before saving - SIMPLE VERSION
    const processedData = {
      name: data.name,
      description: data.description || '',
      price: typeof data.price === 'number' ? data.price : 0,
      category: data.category || '',
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
      data: processedData
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