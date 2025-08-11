import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { isValidLocale, locales, defaultLocale } from '@/lib/i18n'

// TypeScript interfaces for the AI farma API with i18n support
interface TableRow {
  feature: string
  values: (string | number | boolean | null)[]
  highlight?: number[]
  type?: 'text' | 'number' | 'boolean' | 'price' | 'rating'
}

interface TableData {
  type: 'comparison' | 'pricing' | 'features' | 'specs'
  title: string
  subtitle?: string
  headers: string[]
  rows: TableRow[]
  highlightColumns?: number[]
  style?: 'modern' | 'classic' | 'minimal'
}

interface AiLandingPagePayload {
  slug?: string  // Optional - can be generated automatically
  title: string
  summary?: string
  contentHtml: string // HTML or Markdown content
  imageUrl?: string
  imageAlt?: string
  imageSourceName?: string
  imageSourceUrl?: string
  imageLicense?: string
  imageWidth?: number
  imageHeight?: number
  imageType?: string
  publishedAt?: string // ISO date string
  keywords: string[]
  category?: string
  language: string // Required - language code (cs, en, de, fr, es)
  faq?: {
    question: string
    answer: string
  }[]
  
  comparisonTables?: TableData[]
  pricingTables?: TableData[]
  featureTables?: TableData[]
  dataTables?: TableData[]
}

// Legacy interface for backward compatibility
interface LandingPagePayload {
  title: string
  slug?: string
  language: string
  meta: {
    description: string
    keywords: string[]
  }
  content_html: string
  visuals?: {
    position: string
    image_prompt: string
    description: string
    image_url?: string
    alt_text?: string
  }[]
  faq?: {
    question: string
    answer: string
  }[]
  schema_org?: string
  format: "html"
}

// Response format for AI farma
interface AiLandingPageResponse {
  status: "ok"
  url: string
  slug: string  // Include the used/generated slug
}

// Legacy response format
interface LandingPageResponse {
  id: string
  slug: string
  title: string
  language: string
  contentHtml: string
  metaDescription: string
  metaKeywords: string[]
  schemaOrg?: string
  visuals?: any[]
  faq?: any[]
  format: string
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
  finalSlug: string
}

// Function to transliterate Czech characters to ASCII
function transliterateCzech(text: string): string {
  const czechMap: Record<string, string> = {
    'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i', 'ň': 'n',
    'ó': 'o', 'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z',
    'Á': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Ě': 'E', 'Í': 'I', 'Ň': 'N',
    'Ó': 'O', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ú': 'U', 'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z'
  }
  
  return text.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, (match) => czechMap[match] || match)
}

// Function to generate slug from title
function generateSlug(title: string): string {
  return transliterateCzech(title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .substring(0, 100) // Limit slug length for database and URL compatibility
}

// Function to ensure unique slug for specific language
async function ensureUniqueSlug(baseSlug: string, language: string): Promise<string> {
  let uniqueSlug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.landing_pages.findUnique({
      where: { 
        slug_language: {
          slug: uniqueSlug,
          language: language
        }
      }
    })
    
    if (!existing) {
      return uniqueSlug
    }
    
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }
}

// Function to validate AI farma payload
function validateAiPayload(data: any): { isValid: boolean, errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string')
  } else if (data.title.length > 200) {
    warnings.push('title is longer than 200 characters, consider shortening for SEO')
  }

  // Slug validation (only if provided)
  if (data.slug) {
    if (typeof data.slug !== 'string' || data.slug.trim().length === 0) {
      errors.push('slug must be a non-empty string when provided')
    } else {
      // Validate slug format
      const slugPattern = /^[a-z0-9-]+$/
      if (!slugPattern.test(data.slug)) {
        errors.push('slug must contain only lowercase letters, numbers, and hyphens')
      }
      if (data.slug.length > 100) {
        errors.push('slug must be 100 characters or less')
      }
    }
  }

  if (!data.contentHtml || typeof data.contentHtml !== 'string' || data.contentHtml.trim().length === 0) {
    errors.push('contentHtml is required and must be a non-empty string')
  } else if (data.contentHtml.length < 100) {
    warnings.push('contentHtml is shorter than 100 characters, consider adding more content for SEO')
  }

  if (!data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) {
    errors.push('keywords is required and must be a non-empty array')
  } else {
    // Validate each keyword
    data.keywords.forEach((keyword: any, index: number) => {
      if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        errors.push(`keywords[${index}] must be a non-empty string`)
      }
    })
    if (data.keywords.length > 20) {
      warnings.push('more than 20 keywords provided, consider reducing for better SEO focus')
    }
  }

  // Language validation (required for i18n support)
  if (!data.language || typeof data.language !== 'string' || data.language.trim().length === 0) {
    errors.push('language is required and must be a non-empty string')
  } else if (!isValidLocale(data.language)) {
    errors.push(`language must be one of: ${locales.join(', ')}`)
  }

  // Optional fields validation
  if (data.summary !== undefined) {
    if (typeof data.summary !== 'string') {
      errors.push('summary must be a string')
    } else if (data.summary.length > 300) {
      warnings.push('summary is longer than 300 characters, consider shortening for meta description')
    }
  }

  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl !== 'string') {
      errors.push('imageUrl must be a string')
    } else {
      try {
        new URL(data.imageUrl)
      } catch {
        errors.push('imageUrl must be a valid URL')
      }
    }
  }

  // Optional hero image metadata validation
  if (data.imageAlt !== undefined && typeof data.imageAlt !== 'string') {
    errors.push('imageAlt must be a string')
  }
  if (data.imageSourceName !== undefined && typeof data.imageSourceName !== 'string') {
    errors.push('imageSourceName must be a string')
  }
  if (data.imageSourceUrl !== undefined) {
    if (typeof data.imageSourceUrl !== 'string') {
      errors.push('imageSourceUrl must be a string')
    } else {
      try {
        new URL(data.imageSourceUrl)
      } catch {
        errors.push('imageSourceUrl must be a valid URL')
      }
    }
  }
  if (data.imageLicense !== undefined && typeof data.imageLicense !== 'string') {
    errors.push('imageLicense must be a string')
  }
  if (data.imageWidth !== undefined && (typeof data.imageWidth !== 'number' || data.imageWidth <= 0)) {
    errors.push('imageWidth must be a positive number')
  }
  if (data.imageHeight !== undefined && (typeof data.imageHeight !== 'number' || data.imageHeight <= 0)) {
    errors.push('imageHeight must be a positive number')
  }
  if (data.imageType !== undefined && typeof data.imageType !== 'string') {
    errors.push('imageType must be a string')
  }

  if (data.category !== undefined && typeof data.category !== 'string') {
    errors.push('category must be a string')
  }

  if (data.publishedAt !== undefined) {
    if (typeof data.publishedAt !== 'string') {
      errors.push('publishedAt must be an ISO date string')
    } else {
      try {
        const date = new Date(data.publishedAt)
        if (isNaN(date.getTime())) {
          errors.push('publishedAt must be a valid ISO date string')
        }
      } catch {
        errors.push('publishedAt must be a valid ISO date string')
      }
    }
  }

  if (data.faq !== undefined) {
    if (!Array.isArray(data.faq)) {
      errors.push('faq must be an array')
    } else {
      data.faq.forEach((item: any, index: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`faq[${index}] must be an object`)
          return
        }
        if (!item.question || typeof item.question !== 'string' || item.question.trim().length === 0) {
          errors.push(`faq[${index}].question is required and must be a non-empty string`)
        }
        if (!item.answer || typeof item.answer !== 'string' || item.answer.trim().length === 0) {
          errors.push(`faq[${index}].answer is required and must be a non-empty string`)
        }
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Legacy validation function for backward compatibility
function validateLegacyPayload(data: any): { isValid: boolean, errors: string[] } {
  const errors: string[] = []

  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string')
  }

  if (!data.language || typeof data.language !== 'string') {
    errors.push('language is required and must be a string')
  }

  if (!data.meta || typeof data.meta !== 'object') {
    errors.push('meta is required and must be an object')
  } else {
    if (!data.meta.description || typeof data.meta.description !== 'string') {
      errors.push('meta.description is required and must be a string')
    }
    if (!data.meta.keywords || !Array.isArray(data.meta.keywords)) {
      errors.push('meta.keywords is required and must be an array')
    }
  }

  if (!data.content_html || typeof data.content_html !== 'string') {
    errors.push('content_html is required and must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Rate limiting for sitemap updates to avoid excessive file writes
let lastSitemapUpdate = 0
const SITEMAP_UPDATE_COOLDOWN = 60000 // 1 minute

// Function to update sitemap with performance optimization
async function updateSitemap(): Promise<void> {
  try {
    // Rate limiting - avoid updating sitemap too frequently
    const now = Date.now()
    if (now - lastSitemapUpdate < SITEMAP_UPDATE_COOLDOWN) {
      console.log('⏱️ Sitemap update skipped (rate limited)')
      return
    }
    
    lastSitemapUpdate = now
    
    // Get all published landing pages with minimal data
    const landingPages = await prisma.landing_pages.findMany({
      select: {
        slug: true,
        updated_at: true,
        published_at: true
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 5000 // Limit for performance, adjust as needed
    })

    // Basic sitemap structure
    const baseUrl = (() => { const v = process.env.NEXT_PUBLIC_BASE_URL; if (!v) throw new Error('NEXT_PUBLIC_BASE_URL is required'); return v })()
    const currentDate = new Date().toISOString().split('T')[0]

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`

    // Add landing pages to sitemap
    landingPages.forEach(page => {
      const lastmod = page.updated_at.toISOString().split('T')[0]
      sitemapContent += `
  <url>
    <loc>${baseUrl}/landing/${encodeURIComponent(page.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    sitemapContent += `
</urlset>`

    // Write sitemap to public directory with error handling
    const fs = require('fs')
    const path = require('path')
    
    const publicDir = path.join(process.cwd(), 'public')
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    const sitemapPath = path.join(publicDir, 'sitemap.xml')
    
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8')
    console.log(`✅ Sitemap updated successfully with ${landingPages.length} pages`)
  } catch (error) {
    console.error('❌ Error updating sitemap:', error)
    // Don't throw error to avoid breaking the main request
  }
}

// Function to ping search engines
async function pingSearchEngines(): Promise<void> {
  const sitemapUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sitemap.xml`
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
  ]

  try {
    const pingPromises = pingUrls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'GET' })
        console.log(`✅ Successfully pinged: ${url} (Status: ${response.status})`)
        return { url, success: true, status: response.status }
      } catch (error) {
        console.error(`❌ Failed to ping: ${url}`, error)
        return { url, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    await Promise.all(pingPromises)
  } catch (error) {
    console.error('❌ Error during search engine pinging:', error)
    // Don't throw - pinging is not critical for the API response
  }
}

// POST /api/landing-pages - Create a new landing page
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received landing page creation request')
    
    // Optional webhook security for production
    const webhookSecret = request.headers.get('x-webhook-secret')
    const expectedSecret = process.env.WEBHOOK_SECRET
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.log('❌ Invalid webhook secret')
      return NextResponse.json(
        { error: 'Unauthorized webhook call' },
        { status: 401 }
      )
    }
    
    const rawData = await request.json()
    console.log('📋 Raw payload keys:', Object.keys(rawData))

    // Detect payload format (AI farma vs legacy)
    // AI format: has contentHtml and keywords (check both top level and data object, including meta.keywords)
    // Legacy format: has content_html (with underscore)
    const hasContentHtml = 'contentHtml' in rawData || (rawData.data && 'contentHtml' in rawData.data)
    const hasKeywords = 'keywords' in rawData || 
                       (rawData.data && 'keywords' in rawData.data) || 
                       (rawData.data && rawData.data.meta && 'keywords' in rawData.data.meta) ||
                       (rawData.meta && 'keywords' in rawData.meta)
    const hasLegacyContentHtml = 'content_html' in rawData
    
    const isAiFormat = (hasContentHtml && hasKeywords) && !hasLegacyContentHtml
    
    if (isAiFormat) {
      console.log('🤖 Processing AI farma format')
      return await handleAiFormatPayload(rawData)
    } else {
      console.log('🔄 Processing legacy format')
      return await handleLegacyFormatPayload(rawData)
    }

  } catch (error) {
    console.error('💥 Error in POST handler:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle AI farma format payload
async function handleAiFormatPayload(data: any) {
  try {
    // Extract payload - check if data is in 'data' object or at root level
    let payload: AiLandingPagePayload
    
    if (data.data && typeof data.data === 'object') {
      // Data is in 'data' object - extract it
      payload = {
        title: data.data.title || data.title,
        slug: data.data.slug || data.slug,
        summary: data.data.summary || data.summary,
        contentHtml: data.data.contentHtml || data.contentHtml,
        imageUrl: data.data.imageUrl || data.imageUrl,
        imageAlt: data.data.imageAlt || data.imageAlt,
        imageSourceName: data.data.imageSourceName || data.imageSourceName,
        imageSourceUrl: data.data.imageSourceUrl || data.imageSourceUrl,
        imageLicense: data.data.imageLicense || data.imageLicense,
        imageWidth: data.data.imageWidth || data.imageWidth,
        imageHeight: data.data.imageHeight || data.imageHeight,
        imageType: data.data.imageType || data.imageType,
        publishedAt: data.data.publishedAt || data.publishedAt,
        keywords: data.data.meta?.keywords || data.meta?.keywords || data.data.keywords || data.keywords,
        category: data.data.category || data.category,
        language: data.data.language || data.language,
        faq: data.data.faq || data.faq
      }
    } else {
      // Data is at root level
      payload = {
        ...data,
        keywords: data.meta?.keywords || data.keywords
      } as AiLandingPagePayload
    }
    console.log('📋 AI Payload received:', { 
      title: payload.title, 
      slug: payload.slug,
      hasContent: !!payload.contentHtml,
      contentLength: payload.contentHtml?.length,
      keywordsCount: payload.keywords?.length
    })

    // Generate slug if not provided
    if (!payload.slug) {
      // Simple slug generation from title
      payload.slug = payload.title
        .toLowerCase()
        .normalize('NFD') // Decompose diacritics
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Keep only letters, numbers, spaces, hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .slice(0, 90) // Limit to 90 characters to leave room for uniqueness suffix
      
      // Add timestamp suffix for uniqueness
      const timestamp = new Date().toISOString()
        .replace(/[^0-9]/g, '')
        .slice(8, 14) // Take DDHHMM (6 digits)
      
      payload.slug = `${payload.slug}-${timestamp}`.slice(0, 100)
      
      console.log('🔧 Generated slug:', payload.slug)
    }

    // Validate AI payload
    const validation = validateAiPayload(payload)
    if (!validation.isValid) {
      console.log('❌ AI Validation failed:', {
        errors: validation.errors,
        warnings: validation.warnings,
        payload: {
          title: payload.title?.substring(0, 50) + '...',
          slug: payload.slug,
          hasContent: !!payload.contentHtml,
          contentLength: payload.contentHtml?.length
        }
      })
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors,
          warnings: validation.warnings
        },
        { status: 422 } // 422 Unprocessable Entity for validation errors
      )
    }
    
    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.log('⚠️ AI Validation warnings:', validation.warnings)
    }

    // Check if slug already exists for this language
    const existingPage = await prisma.landing_pages.findUnique({
      where: { 
        slug_language: {
          slug: payload.slug,
          language: payload.language
        }
      },
      select: { id: true, title: true, created_at: true, language: true }
    })
    
    if (existingPage) {
      console.log('❌ Slug and language conflict:', {
        requestedSlug: payload.slug,
        requestedLanguage: payload.language,
        existingPage: {
          id: existingPage.id,
          title: existingPage.title,
          language: existingPage.language,
          createdAt: existingPage.created_at
        }
      })
      return NextResponse.json(
        { 
          error: 'Slug and language conflict', 
          details: `A landing page with slug '${payload.slug}' and language '${payload.language}' already exists`,
          conflictingPage: {
            title: existingPage.title,
            language: existingPage.language,
            createdAt: existingPage.created_at
          }
        },
        { status: 409 }
      )
    }

    // Parse publishedAt if provided
    let publishedAt = new Date()
    if (payload.publishedAt) {
      try {
        publishedAt = new Date(payload.publishedAt)
        if (isNaN(publishedAt.getTime())) {
          throw new Error('Invalid date format')
        }
      } catch (error) {
        console.log('⚠️ Invalid publishedAt date, using current time')
        publishedAt = new Date()
      }
    }

    // Generate meta description from summary or content
    const metaDescription = payload.summary || 
      payload.contentHtml.replace(/<[^>]*>/g, '').substring(0, 160) + '...'

    // Create landing page record with i18n support
    const landingPage = await prisma.landing_pages.create({
      data: {
        id: uuidv4(),
        slug: payload.slug,
        title: payload.title,
        summary: payload.summary || null,
        language: payload.language, // Use provided language
        content_html: payload.contentHtml,
        image_url: payload.imageUrl || null,
        category: payload.category || null,
        meta_description: metaDescription,
        meta_keywords: JSON.stringify(payload.keywords),
        faq: payload.faq || undefined,
        visuals: JSON.parse(JSON.stringify({
          heroImage: payload.imageUrl
            ? {
                imageUrl: payload.imageUrl,
                imageAlt: payload.imageAlt,
                imageSourceName: payload.imageSourceName,
                imageSourceUrl: payload.imageSourceUrl,
                imageLicense: payload.imageLicense,
                imageWidth: payload.imageWidth,
                imageHeight: payload.imageHeight,
                imageType: payload.imageType
              }
            : undefined,
          comparisonTables: payload.comparisonTables || [],
          pricingTables: payload.pricingTables || [],
          featureTables: payload.featureTables || [],
          dataTables: payload.dataTables || []
        })),
        format: 'html',
        published_at: publishedAt,
        updated_at: new Date()
      }
    })

    console.log('💾 AI Landing page created with ID:', landingPage.id)

    // Update sitemap (async, don't block response)
    updateSitemap().catch(error => {
      console.error('⚠️ Sitemap update failed (non-blocking):', error)
    })

    // Ping search engines (async, don't block response)
    pingSearchEngines().catch(error => {
      console.error('⚠️ Search engine ping failed (non-blocking):', error)
    })

    // AI farma response format with simple URL (no i18n)
    const response: AiLandingPageResponse = {
      status: 'ok',
      url: `/landing/${payload.slug}`,
      slug: payload.slug
    }

    console.log('✅ AI Landing page successfully created and published')
    console.log(`🚀 Available at: ${(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')}/landing/${payload.slug}`)

    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('💥 Error in AI format handler:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      payload: {
        slug: data?.slug,
        title: data?.title?.substring(0, 50) + '...',
        contentLength: data?.contentHtml?.length
      }
    })
    
    // Handle specific database errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      
      switch (prismaError.code) {
        case 'P2002': // Unique constraint violation
          return NextResponse.json(
            { 
              error: 'Slug and language conflict', 
              details: 'A landing page with this slug and language combination already exists',
              field: prismaError.meta?.target || ['slug', 'language']
            },
            { status: 409 }
          )
        
        case 'P2025': // Record not found
          return NextResponse.json(
            { 
              error: 'Database error', 
              details: 'Referenced record not found'
            },
            { status: 400 }
          )
        
        default:
          console.error('❌ Unhandled Prisma error:', prismaError.code, prismaError.message)
          return NextResponse.json(
            { 
              error: 'Database error', 
              details: 'An internal database error occurred'
            },
            { status: 500 }
          )
      }
    }

    // Handle validation errors that slipped through
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.message
        },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create landing page', 
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Handle legacy format payload (backward compatibility)
async function handleLegacyFormatPayload(data: any) {
  try {
    const payload = data as LandingPagePayload
    console.log('📋 Legacy Payload received:', { 
      title: payload.title, 
      slug: payload.slug, 
      language: payload.language,
      hasContent: !!payload.content_html,
      contentLength: payload.content_html?.length
    })

    // Validate legacy payload
    const validation = validateLegacyPayload(payload)
    if (!validation.isValid) {
      console.log('❌ Legacy Validation failed:', validation.errors)
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    // Generate or use provided slug
    let baseSlug = payload.slug || generateSlug(payload.title)
    baseSlug = generateSlug(baseSlug) // Ensure proper slug format
    
    console.log('🔗 Generated base slug:', baseSlug)

    // Ensure slug is unique for this language
    const uniqueSlug = await ensureUniqueSlug(baseSlug, payload.language)
    console.log('✨ Final unique slug:', uniqueSlug)

    // Create landing page record (legacy format)
    const landingPage = await prisma.landing_pages.create({
      data: {
        id: uuidv4(),
        slug: uniqueSlug,
        title: payload.title,
        language: payload.language,
        content_html: payload.content_html,
        meta_description: payload.meta.description,
        meta_keywords: JSON.stringify(payload.meta.keywords),
        schema_org: payload.schema_org ? JSON.stringify(payload.schema_org) : null,
        visuals: payload.visuals || undefined,
        faq: payload.faq || undefined,
        format: payload.format || 'html',
        updated_at: new Date()
      }
    })

    console.log('💾 Legacy Landing page created with ID:', landingPage.id)

    // Update sitemap (async, don't block response)
    updateSitemap().catch(error => {
      console.error('⚠️ Sitemap update failed (non-blocking):', error)
    })

    // Ping search engines (async, don't block response)
    pingSearchEngines().catch(error => {
      console.error('⚠️ Search engine ping failed (non-blocking):', error)
    })

    // Legacy response format
    const response: LandingPageResponse = {
      id: landingPage.id,
      slug: landingPage.slug,
      title: landingPage.title,
      language: landingPage.language,
      contentHtml: landingPage.content_html,
      metaDescription: landingPage.meta_description,
      metaKeywords: JSON.parse(landingPage.meta_keywords),
      schemaOrg: landingPage.schema_org || undefined,
      visuals: landingPage.visuals ? (landingPage.visuals as any[]) : undefined,
      faq: landingPage.faq ? (landingPage.faq as any[]) : undefined,
      format: landingPage.format,
      publishedAt: landingPage.published_at,
      createdAt: landingPage.created_at,
      updatedAt: landingPage.updated_at,
      finalSlug: landingPage.slug
    }

    console.log('✅ Legacy Landing page successfully created and published')
    console.log('🚀 Available at: ' + `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/landing/${uniqueSlug}`)

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('💥 Error in legacy format handler:', error)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if ((error as any).code === 'P2002') {
        return NextResponse.json(
          { 
            error: 'Slug conflict', 
            details: 'A landing page with this slug already exists' 
          },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to create landing page', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/landing-pages - List all landing pages (optional, for debugging)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100)
    const skip = (page - 1) * pageSize

    const [landingPages, total] = await Promise.all([
      prisma.landing_pages.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          language: true,
                  meta_description: true,
        format: true,
        published_at: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.landing_pages.count()
    ])

    return NextResponse.json({
      landingPages,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })

  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch landing pages', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}