import type { MetadataRoute } from 'next'
import { getPublicBaseUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  // Derive base safely; in dev this can be localhost
  let base: string | undefined
  let host: string | undefined
  try {
    base = getPublicBaseUrl()
    host = new URL(base).host
  } catch {
    // In development or misconfiguration, we omit sitemap and host
    if (process.env.NODE_ENV !== 'production') {
      console.warn('robots(): NEXT_PUBLIC_BASE_URL not set or invalid; omitting sitemap and host')
    }
  }

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


