import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const host = (() => {
    if (!base) return undefined
    try {
      return new URL(base).host
    } catch {
      return undefined
    }
  })()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/new-search',
          '/ai-tools-test',
          '/test',
          '/simple-test',
          '/admin',
          '/admin/',
          '/admin/*',
          '/company-admin/*',
          '/api/*',
          '/r'
        ]
      }
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
    host
  }
}


