/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true
  },
  // Simple landing pages without i18n redirects
  reactStrictMode: false,
  experimental: { 
    largePageDataBytes: 128 * 1000,
    optimizeServerReact: false
  },
  generateEtags: false,
  swcMinify: true,
  poweredByHeader: false,
  // Optimalizace pro stabilitu development serveru
  ...(process.env.NODE_ENV === 'development' && {
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
    webpack: (config, { dev }) => {
      if (dev) {
        // Snížit memory consumption v development
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: /node_modules/,
        }
        // Optimalizovat cache
        config.cache = {
          type: 'filesystem',
          maxMemoryGenerations: 1,
        }
      }
      return config
    },
  }),
  // Konfigurace pro statické soubory na Vercel
  trailingSlash: false,
  // Asset prefix must be provided explicitly; no implicit fallback
  assetPrefix: (function(){
    const v = process.env.NEXT_PUBLIC_ASSET_PREFIX
    return typeof v === 'string' ? v : ''
  })(),
  // Výslovně označit screenshoty jako statické assets
  async headers() {
    return [
      {
        source: '/screenshots/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Canonicalize old advertiser/advertise routes to the current structure
      { source: '/company', destination: '/advertise', permanent: true },
      { source: '/company/dashboard', destination: '/company-admin', permanent: true },
      { source: '/company/billing', destination: '/company-admin/billing', permanent: true },
      { source: '/company/campaigns', destination: '/company-admin/campaigns', permanent: true },
      { source: '/company/products', destination: '/company-admin/products', permanent: true },
      { source: '/company/profile', destination: '/company-admin/profile', permanent: true },
      { source: '/company/settings', destination: '/company-admin/profile', permanent: true },
      { source: '/advertiser', destination: '/company-admin', permanent: true },
      { source: '/advertiser/login', destination: '/company-admin/login', permanent: true },
    ]
  }
}

export default nextConfig
