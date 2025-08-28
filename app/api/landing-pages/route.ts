import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { isValidLocale, locales, defaultLocale } from '@/lib/i18n'
import crypto from 'crypto'
// Lightweight sanitizer to avoid adding new deps during deploy
function sanitizeHtml(input: string, options?: any): string {
  try {
    let out = String(input || '')
    // Remove script/style and dangerous event handlers; allow basic content
    out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
             .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '')
             .replace(/on[a-z]+\s*=\s*'[^']*'/gi, '')
             .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, '')
             .replace(/javascript:/gi, '')
    return out
  } catch {
    return ''
  }
}

// Remove invisible characters and common LLM watermark marks from raw JSON text
// Important: Do NOT normalize whitespace for JSON payloads – it may change string
// literals and break parsing. Only strip truly invisible/control characters.
function sanitizeIncomingJson(rawJsonText: string): { sanitized: string, removedChars: number } {
  const originalLength = rawJsonText.length
  let cleaned = rawJsonText
    // BOM + zero-width characters
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060-\u206F]/g, '')
    // Invisible separators and formatting marks
    .replace(/[\u180E\u061C\u2066-\u2069]/g, '')
    // Soft hyphen + misc control chars sometimes used as watermarks
    .replace(/[\u00AD\u034F\u115F\u1160\u17B4\u17B5]/g, '')
    // Variation selectors (BMP + supplementary plane) – requires Unicode flag
    .replace(/[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu, '')
    // Remaining control characters except tab/newline/carriage-return
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')

  return { sanitized: cleaned, removedChars: originalLength - cleaned.length }
}

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
  heroImage?: {
    imageUrl: string
    imageAlt?: string
    imageSourceName?: string
    imageSourceUrl?: string
    imageLicense?: string
    imageWidth?: number
    imageHeight?: number
    imageType?: string
  }
  
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

  // Validate only allowed fields: title, slug, language, contentHtml, keywords
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string')
  }

  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string' || data.slug.trim().length === 0) {
      errors.push('slug must be a non-empty string when provided')
    } else {
      const slugPattern = /^[a-z0-9-]+$/
      if (!slugPattern.test(data.slug)) {
        errors.push('slug must contain only lowercase letters, numbers, and hyphens')
      }
      if (data.slug.length > 100) {
        errors.push('slug must be 100 characters or less')
      }
    }
  }

  if (!data.language || typeof data.language !== 'string' || data.language.trim().length === 0) {
    errors.push('language is required and must be a non-empty string')
  } else if (!isValidLocale(data.language)) {
    errors.push(`language must be one of: ${locales.join(', ')}`)
  }

  if (!data.contentHtml || typeof data.contentHtml !== 'string' || data.contentHtml.trim().length === 0) {
    errors.push('contentHtml is required and must be a non-empty string')
  }

  if (!Array.isArray(data.keywords) || data.keywords.length === 0) {
    errors.push('keywords is required and must be a non-empty array of strings')
  } else {
    for (let i = 0; i < data.keywords.length; i++) {
      const kw = data.keywords[i]
      if (typeof kw !== 'string' || kw.trim().length === 0) {
        errors.push(`keywords[${i}] must be a non-empty string`)
      }
    }
  }

  // Validate optional FAQ – must be an array of objects with non-empty question/answer
  if (typeof data.faq !== 'undefined') {
    if (!Array.isArray(data.faq)) {
      errors.push('faq must be an array of objects {question, answer}')
    } else {
      const malformed: number[] = []
      for (let i = 0; i < data.faq.length; i++) {
        const item = data.faq[i]
        const ok = item && typeof item === 'object'
          && typeof item.question === 'string' && item.question.trim().length > 0
          && typeof item.answer === 'string' && item.answer.trim().length > 0
        if (!ok) malformed.push(i)
      }
      if (malformed.length > 0) {
        errors.push(`faq items malformed at indices: ${malformed.join(', ')}`)
      }
    }
  }

  // Validate image fields if provided
  if (data.imageUrl !== undefined && typeof data.imageUrl !== 'string') {
    errors.push('imageUrl must be a string when provided')
  }
  if (data.heroImage !== undefined) {
    if (!data.heroImage || typeof data.heroImage !== 'object') {
      errors.push('heroImage must be an object when provided')
    } else {
      if (typeof data.heroImage.imageUrl !== 'string' || data.heroImage.imageUrl.trim().length === 0) {
        errors.push('heroImage.imageUrl must be a non-empty string')
      }
      if (typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
        if (data.imageUrl.trim() !== data.heroImage.imageUrl.trim()) {
          errors.push('imageUrl and heroImage.imageUrl conflict – provide only one or ensure they match')
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
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

  // Validate FAQ shape if provided
  if (data.faq !== undefined) {
    if (!Array.isArray(data.faq)) {
      errors.push('faq must be an array when provided')
    } else {
      data.faq.forEach((item: any, idx: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`faq[${idx}] must be an object`)
          return
        }
        if (typeof item.question !== 'string' || item.question.trim().length === 0) {
          errors.push(`faq[${idx}].question must be a non-empty string`)
        }
        if (typeof item.answer !== 'string' || item.answer.trim().length === 0) {
          errors.push(`faq[${idx}].answer must be a non-empty string`)
        }
      })
    }
  }

  // Validate image fields if provided
  if (data.imageUrl !== undefined && typeof data.imageUrl !== 'string') {
    errors.push('imageUrl must be a string when provided')
  }
  if (data.heroImage !== undefined) {
    if (!data.heroImage || typeof data.heroImage !== 'object') {
      errors.push('heroImage must be an object when provided')
    } else {
      if (typeof data.heroImage.imageUrl !== 'string' || data.heroImage.imageUrl.trim().length === 0) {
        errors.push('heroImage.imageUrl must be a non-empty string')
      }
      if (typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
        if (data.imageUrl.trim() !== data.heroImage.imageUrl.trim()) {
          errors.push('imageUrl and heroImage.imageUrl conflict – provide only one or ensure they match')
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Rate limiting for sitemap updates to avoid excessive file writes
let lastSitemapUpdate = 0
const SITEMAP_UPDATE_COOLDOWN = 60000 // 1 minute

// Disable local sitemap writer here – single source of truth is /api/sitemap
async function updateSitemap(): Promise<void> {
  console.log('ℹ️ Skipping sitemap write in /api/landing-pages. Use /api/sitemap as the single generator.')
  return
}

// Function to ping search engines
async function pingSearchEngines(): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    console.warn('⚠️ NEXT_PUBLIC_BASE_URL not set; skipping search engine ping')
    return
  }
  const sitemapUrl = `${baseUrl}/sitemap.xml`
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
  // Ensure requestId and rawData are available in catch scope
  let requestId = crypto.randomUUID()
  let rawData: any
  try {
    console.log('📥 Received landing page creation request')
    
    // Optional webhook security for production with dual-active rotation
    const providedSecret = request.headers.get('x-webhook-secret') || ''
    const providedSecretId = (request.headers.get('x-secret-id') || '').toLowerCase()
    const primarySecret = process.env.WEBHOOK_SECRET
    const secondarySecret = process.env.WEBHOOK_SECRET_SECONDARY
    let verifiedSecretValue: string | null = null
    let verifiedSecretId: 'primary' | 'secondary' | null = null

    if (primarySecret || secondarySecret) {
      if (!providedSecret) {
        console.log('❌ Missing x-webhook-secret while secrets are configured')
        const res = NextResponse.json(
          { error: 'Unauthorized webhook call' },
          { status: 401 }
        )
        res.headers.set('X-Request-Id', requestId)
        return res
      }

      if (providedSecretId) {
        if ((providedSecretId === 'primary' || providedSecretId === '1')) {
          if (!primarySecret || providedSecret !== primarySecret) {
            console.log('❌ Invalid primary x-webhook-secret')
            const res = NextResponse.json(
              { error: 'Unauthorized webhook call' },
              { status: 401 }
            )
            res.headers.set('X-Request-Id', requestId)
            res.headers.set('X-Secret-Id', 'primary')
            return res
          }
          verifiedSecretValue = primarySecret
          verifiedSecretId = 'primary'
        } else if ((providedSecretId === 'secondary' || providedSecretId === '2')) {
          if (!secondarySecret || providedSecret !== secondarySecret) {
            console.log('❌ Invalid secondary x-webhook-secret')
            const res = NextResponse.json(
              { error: 'Unauthorized webhook call' },
              { status: 401 }
            )
            res.headers.set('X-Request-Id', requestId)
            res.headers.set('X-Secret-Id', 'secondary')
            return res
          }
          verifiedSecretValue = secondarySecret
          verifiedSecretId = 'secondary'
        } else {
          console.log('❌ Unknown x-secret-id')
          const res = NextResponse.json(
            { error: 'Unauthorized webhook call' },
            { status: 401 }
          )
          res.headers.set('X-Request-Id', requestId)
          return res
        }
      } else {
        if (primarySecret && providedSecret === primarySecret) {
          verifiedSecretValue = primarySecret
          verifiedSecretId = 'primary'
        } else if (secondarySecret && providedSecret === secondarySecret) {
          verifiedSecretValue = secondarySecret
          verifiedSecretId = 'secondary'
        } else {
          console.log('❌ Invalid x-webhook-secret (no x-secret-id)')
          const res = NextResponse.json(
            { error: 'Unauthorized webhook call' },
            { status: 401 }
          )
          res.headers.set('X-Request-Id', requestId)
          return res
        }
      }
    }
    
    const rawBody = await request.text()
    // Parse JSON first, no regex on raw body
    try {
      rawData = JSON.parse(rawBody)
    } catch (e) {
      const res = NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      res.headers.set('X-Request-Id', requestId)
      return res
    }
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
    
    // Optional HMAC signature (anti‑replay). Only verify if both headers present and secret configured
    try {
      const sigHeader = request.headers.get('x-signature') || ''
      const tsHeader = request.headers.get('x-signature-timestamp') || ''
      const haveSig = sigHeader.length > 0 && tsHeader.length > 0
      if (haveSig && verifiedSecretValue) {
        const maxSkewSec = 300
        const tsSec = parseInt(tsHeader, 10)
        if (!Number.isFinite(tsSec) || Math.abs(Math.floor(Date.now() / 1000) - tsSec) > maxSkewSec) {
          const res = NextResponse.json({ error: 'Invalid signature timestamp' }, { status: 401 })
          res.headers.set('X-Request-Id', requestId)
          return res
        }
        const provided = sigHeader.startsWith('sha256=') ? sigHeader.slice(7) : sigHeader
        const hmac = crypto
          .createHmac('sha256', verifiedSecretValue)
          .update(`${tsHeader}\n${rawBody}`)
          .digest('hex')
        if (!crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(hmac))) {
          const res = NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
          res.headers.set('X-Request-Id', requestId)
          return res
        }
      }
    } catch (e) {
      console.error('⚠️ Signature verification error:', e)
      const res = NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
      res.headers.set('X-Request-Id', requestId)
      return res
    }

    // Idempotency handling (only for AI format)
    const idemKey = request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key')
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex')

    if (isAiFormat && idemKey) {
      const existing = await prisma.idempotencyKey.findUnique({ where: { key: idemKey } })
      if (existing) {
        if (existing.payloadHash !== payloadHash) {
          const res = NextResponse.json(
            { error: 'Idempotency Mismatch', details: 'Payload differs for the same Idempotency-Key' },
            { status: 409 }
          )
          res.headers.set('X-Request-Id', requestId)
          res.headers.set('Idempotency-Key', idemKey)
          return res
        }
        // Replayed – return saved response
        const res = NextResponse.json(existing.response as any, { status: existing.statusCode })
        res.headers.set('Idempotency-Replayed', 'true')
        res.headers.set('Idempotency-Key', idemKey)
        res.headers.set('X-Request-Id', requestId)
        return res
      }
    }

    if (isAiFormat) {
      console.log('🤖 Processing AI farma format')
      const response = await handleAiFormatPayload(rawData, requestId)
      // Save idempotency record if key present and success
      if (idemKey && response?.status === 201) {
        try {
          const body = await response.clone().json()
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          await prisma.idempotencyKey.create({
            data: {
              key: idemKey,
              payloadHash,
              slug: body?.slug || null,
              language: body?.language || null,
              statusCode: 201,
              response: body,
              expiresAt,
            }
          })
          // Async cleanup of expired keys (best-effort)
          prisma.idempotencyKey.deleteMany({ where: { expiresAt: { lt: new Date() } } })
            .catch((err) => console.error('⚠️ Idempotency cleanup failed:', err))
        } catch (e) {
          console.error('⚠️ Failed to persist idempotency record:', e)
        }
      }
      if (idemKey) {
        response.headers.set('Idempotency-Key', idemKey)
      }
      response.headers.set('X-Request-Id', requestId)
      // Persist webhook log (best-effort, non-blocking)
      try {
        await prisma.webhookLog.create({
          data: {
            requestId,
            method: 'POST',
            endpoint: '/api/landing-pages',
            statusCode: response.status,
            idempotencyKey: idemKey || null,
            slug: (rawData?.slug || rawData?.data?.slug) || null,
            language: (rawData?.language || rawData?.data?.language) || null,
            secretId: verifiedSecretId || undefined,
            payloadHash,
            signatureValid: undefined,
            signatureTimestamp: request.headers.get('x-signature-timestamp') || undefined,
          }
        })
      } catch (e) {
        console.warn('⚠️ WebhookLog insert failed:', e)
      }
      return response
    } else {
      console.log('🔄 Processing legacy format')
      return await handleLegacyFormatPayload(rawData, requestId)
    }

  } catch (error) {
    console.error('💥 Error in POST handler:', error)
    const res = NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    res.headers.set('X-Request-Id', requestId)
    // Persist error log (best-effort)
    try {
      await prisma.webhookLog.create({
        data: {
          requestId,
          method: 'POST',
          endpoint: '/api/landing-pages',
          statusCode: 500,
          idempotencyKey: request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key') || undefined,
          slug: (rawData as any)?.slug || (rawData as any)?.data?.slug || undefined,
          language: (rawData as any)?.language || (rawData as any)?.data?.language || undefined,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: undefined,
          secretId: undefined,
          payloadHash: undefined,
          signatureValid: undefined,
          signatureTimestamp: request.headers.get('x-signature-timestamp') || undefined,
        }
      })
    } catch (e) {
      console.warn('⚠️ WebhookLog error insert failed:', e)
    }
    return res
  }
}

// Handle AI farma format payload
async function handleAiFormatPayload(data: any, requestId: string) {
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
        faq: data.data.faq || data.faq,
        heroImage: data.data.heroImage || data.heroImage
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

    // Whitelist sanitization only for contentHtml
    payload.contentHtml = sanitizeHtml(payload.contentHtml || '')

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
      const res = NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors,
          warnings: validation.warnings
        },
        { status: 422 } // 422 Unprocessable Entity for validation errors
      )
      res.headers.set('X-Request-Id', requestId)
      return res
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

    // Generate meta description from summary or content (strip tags on sanitized HTML)
    const metaDescription = payload.summary || 
      (payload.contentHtml || '').replace(/<[^>]*>/g, '').substring(0, 160) + '...'

    // Create landing page record with i18n support
    const landingPage = await prisma.landing_pages.create({
      data: {
        id: uuidv4(),
        slug: payload.slug,
        title: payload.title,
        summary: payload.summary || null,
        language: payload.language, // Use provided language
        content_html: payload.contentHtml,
        image_url: (payload.heroImage?.imageUrl ?? payload.imageUrl) || null,
        category: payload.category || null,
        meta_description: metaDescription,
        meta_keywords: JSON.stringify(payload.keywords),
        faq: payload.faq || undefined,
        visuals: JSON.parse(JSON.stringify({
          heroImage: payload.heroImage
            ? payload.heroImage
            : (payload.imageUrl
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
              : undefined),
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
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      console.log(`🚀 Available at: ${process.env.NEXT_PUBLIC_BASE_URL}/landing/${payload.slug}`)
    }

    const res = NextResponse.json(response, { status: 201 })
    res.headers.set('X-Request-Id', requestId)
    return res
    
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
        case 'P2002': { // Unique constraint violation
          const res = NextResponse.json(
            { 
              error: 'Slug and language conflict', 
              details: 'A landing page with this slug and language combination already exists',
              field: prismaError.meta?.target || ['slug', 'language']
            },
            { status: 409 }
          )
          res.headers.set('X-Request-Id', requestId)
          return res
        }
        case 'P2025': { // Record not found
          const res = NextResponse.json(
            { 
              error: 'Database error', 
              details: 'Referenced record not found'
            },
            { status: 400 }
          )
          res.headers.set('X-Request-Id', requestId)
          return res
        }
        default: {
          console.error('❌ Unhandled Prisma error:', prismaError.code, prismaError.message)
          const res = NextResponse.json(
            { 
              error: 'Database error', 
              details: 'An internal database error occurred'
            },
            { status: 500 }
          )
          res.headers.set('X-Request-Id', requestId)
          return res
        }
      }
    }

    // Handle validation errors that slipped through
    if (error instanceof Error && error.message.includes('validation')) {
      const res = NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.message
        },
        { status: 422 }
      )
      res.headers.set('X-Request-Id', requestId)
      return res
    }

    const res = NextResponse.json(
      { 
        error: 'Failed to create landing page', 
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
    res.headers.set('X-Request-Id', requestId)
    return res
  }
}

// Handle legacy format payload (backward compatibility)
async function handleLegacyFormatPayload(data: any, requestId: string) {
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
      const res = NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
      res.headers.set('X-Request-Id', requestId)
      return res
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
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      console.log('🚀 Available at: ' + `${process.env.NEXT_PUBLIC_BASE_URL}/landing/${uniqueSlug}`)
    }

    const res = NextResponse.json(response, { status: 201 })
    res.headers.set('X-Request-Id', requestId)
    return res

  } catch (error) {
    console.error('💥 Error in legacy format handler:', error)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if ((error as any).code === 'P2002') {
        const res = NextResponse.json(
          { 
            error: 'Slug conflict', 
            details: 'A landing page with this slug already exists' 
          },
          { status: 409 }
        )
        res.headers.set('X-Request-Id', requestId)
        return res
      }
    }

    const res = NextResponse.json(
      { 
        error: 'Failed to create landing page', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    res.headers.set('X-Request-Id', requestId)
    return res
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

    // Augment with latest ping status per landing (real data, no fallbacks)
    const withPing = await Promise.all(
      landingPages.map(async (lp) => {
        try {
      const ping = await prisma.landingPingQueue.findFirst({
            where: { landingId: lp.id },
            orderBy: [{ scheduledAt: 'desc' }, { createdAt: 'desc' }]
          })
          return {
            ...lp,
            pingStatus: (ping?.status as 'scheduled' | 'sent' | 'failed' | undefined) ?? 'not_scheduled',
            pingScheduledAt: ping?.scheduledAt ?? null,
            pingSentAt: ping?.sentAt ?? null,
            pingHttpStatus: ping?.httpStatus ?? null,
          }
        } catch {
          // If ping queue is not yet available, still return the page data
          return {
            ...lp,
            pingStatus: 'not_scheduled' as const,
            pingScheduledAt: null,
            pingSentAt: null,
            pingHttpStatus: null,
          }
        }
      })
    )

    return NextResponse.json({
      landingPages: withPing,
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