import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://comparee.ai/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

# Allow specific paths
Allow: /api/sitemap.xml`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
} 