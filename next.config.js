/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'auxia.ai',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['raw.githubusercontent.com', 'auxia.ai'],
  },
  env: {
    DATABASE_URL: "postgres://neondb_owner:npg_1DPXCjFSnvO2@ep-empty-sea-a2114k4k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15&pool_timeout=30&connection_limit=15",
    DATABASE_URL_UNPOOLED: "postgresql://neondb_owner:npg_1DPXCjFSnvO2@ep-empty-sea-a2114k4k.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    NEXT_PUBLIC_API_URL: "https://nejnovejsi-aktualni-srovnavac-ai.vercel.app",
    NEXT_PUBLIC_SITE_URL: "https://nejnovejsi-aktualni-srovnavac-ai.vercel.app"
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
    }
    return config
  },
  experimental: {
    largePageDataBytes: 512 * 1000,
  },
  generateEtags: false
}

export default nextConfig 