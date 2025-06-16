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
  experimental: { largePageDataBytes: 128 * 1000 },
  generateEtags: false,
  swcMinify: true,
  poweredByHeader: false,
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
