import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Sitemap management API
// GET /api/sitemap - Force regenerate sitemap
// POST /api/sitemap - Force regenerate sitemap (admin only)

// Base URL configuration
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://comparee.ai' 
    : 'http://localhost:3000'
}

// Function to generate complete sitemap
async function generateSitemap(): Promise<string> {
  try {
    console.log('🗺️  Starting sitemap generation...')
    
    // Get all published landing pages
    const landingPages = await prisma.landingPage.findMany({
      select: {
        slug: true,
        language: true,
        updatedAt: true,
        publishedAt: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    console.log(`📋 Found ${landingPages.length} landing pages`)

    const baseUrl = getBaseUrl()
    const currentDate = new Date().toISOString().split('T')[0]

    // Start sitemap
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/how-it-works</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/company</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/recommendations</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/top-lists</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/gdpr</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`

    // Add landing pages (with i18n support)
    console.log('📝 Adding landing pages to sitemap...')
    landingPages.forEach(page => {
      const lastmod = page.updatedAt.toISOString().split('T')[0]
      
      // i18n URL format: /[lang]/landing/[slug]
      sitemapContent += `
  <url>
    <loc>${baseUrl}/${page.language}/landing/${encodeURIComponent(page.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // Get AI course categories for additional URLs
    try {
      const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
        where: {
          category: {
            not: null
          }
        }
      })

      console.log(`📂 Adding ${categories.length} category pages...`)
      categories.forEach(cat => {
        if (cat.category) {
          const slug = cat.category.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
          
          sitemapContent += `
  <url>
    <loc>${baseUrl}/categories/${encodeURIComponent(slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
        }
      })
    } catch (error) {
      console.warn('⚠️  Could not fetch categories for sitemap:', error)
    }

    sitemapContent += `
</urlset>`

    console.log('✅ Sitemap generation completed')
    return sitemapContent
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    throw error
  }
}

// Function to save sitemap to file
async function saveSitemapToFile(content: string): Promise<void> {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const publicDir = path.join(process.cwd(), 'public')
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    const sitemapPath = path.join(publicDir, 'sitemap.xml')
    
    fs.writeFileSync(sitemapPath, content, 'utf8')
    console.log(`💾 Sitemap saved to: ${sitemapPath}`)
  } catch (error) {
    console.error('❌ Error saving sitemap:', error)
    throw error
  }
}

// Function to ping search engines
async function pingSearchEngines(): Promise<{ google: boolean, bing: boolean }> {
  const baseUrl = getBaseUrl()
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  
  const results = { google: false, bing: false }
  
  try {
    // Ping Google
    try {
      const googleResponse = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        { method: 'GET', signal: AbortSignal.timeout(5000) }
      )
      results.google = googleResponse.ok
      console.log(`🔍 Google ping: ${googleResponse.status}`)
    } catch (error) {
      console.warn('⚠️  Google ping failed:', error)
    }

    // Ping Bing
    try {
      const bingResponse = await fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        { method: 'GET', signal: AbortSignal.timeout(5000) }
      )
      results.bing = bingResponse.ok
      console.log(`🔍 Bing ping: ${bingResponse.status}`)
    } catch (error) {
      console.warn('⚠️  Bing ping failed:', error)
    }
  } catch (error) {
    console.error('❌ Error pinging search engines:', error)
  }

  return results
}

// GET /api/sitemap - Force regenerate and return current sitemap
export async function GET(request: NextRequest) {
  try {
    console.log('🗺️  GET /api/sitemap - Regenerating sitemap...')
    
    const startTime = Date.now()
    
    // Generate new sitemap
    const sitemapContent = await generateSitemap()
    
    // Save to file
    await saveSitemapToFile(sitemapContent)
    
    // Ping search engines (don't wait for completion)
    pingSearchEngines().catch(error => {
      console.error('⚠️  Search engine ping failed (non-blocking):', error)
    })
    
    const duration = Date.now() - startTime
    
    console.log(`✅ Sitemap regenerated in ${duration}ms`)
    
    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('❌ Error in GET /api/sitemap:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate sitemap', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/sitemap - Admin only: Force regenerate sitemap with stats
export async function POST(request: NextRequest) {
  try {
    console.log('🗺️  POST /api/sitemap - Admin sitemap regeneration...')
    
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }
    
    const startTime = Date.now()
    
    // Generate new sitemap
    const sitemapContent = await generateSitemap()
    
    // Save to file
    await saveSitemapToFile(sitemapContent)
    
    // Ping search engines and wait for results
    const pingResults = await pingSearchEngines()
    
    const duration = Date.now() - startTime
    
    // Count URLs in sitemap
    const urlCount = (sitemapContent.match(/<url>/g) || []).length
    
    console.log(`✅ Admin sitemap regeneration completed in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap successfully regenerated',
      stats: {
        urlCount,
        duration: `${duration}ms`,
        fileSize: Buffer.byteLength(sitemapContent, 'utf8'),
        lastGenerated: new Date().toISOString(),
        searchEngines: {
          google: pingResults.google ? 'pinged successfully' : 'ping failed',
          bing: pingResults.bing ? 'pinged successfully' : 'ping failed'
        }
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error in POST /api/sitemap:', error)
    return NextResponse.json(
      { 
        error: 'Failed to regenerate sitemap', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}