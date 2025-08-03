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
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_ASSET_PREFIX || '' : '',
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
  }
}

export default nextConfig
