export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// Primary language configuration (single-lang in production for now)
export const PRIMARY_LANG = 'en'
export const PRIMARY_LOCALE = 'en-US'

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Strict public base URL getter
// - In production: requires valid absolute URL in NEXT_PUBLIC_BASE_URL (throws if missing/invalid)
// - In development: allows fallback to http://localhost:3000 if env is missing/invalid
export function getPublicBaseUrl(): string {
  const isProd = isProduction()

  if (isProd) {
    const raw = getRequiredEnv('NEXT_PUBLIC_BASE_URL').trim()
    try {
      // Validate absolute URL
      // eslint-disable-next-line no-new
      new URL(raw)
    } catch {
      throw new Error('Invalid NEXT_PUBLIC_BASE_URL: must be an absolute URL (e.g. https://example.com)')
    }
    // Normalize by stripping trailing slashes
    return raw.replace(/\/+$/, '')
  }

  // Development / local
  const raw = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim()
  try {
    // eslint-disable-next-line no-new
    new URL(raw)
    return raw.replace(/\/+$/, '')
  } catch {
    // Fallback to localhost if misconfigured in dev
    console.warn('getPublicBaseUrl(): invalid NEXT_PUBLIC_BASE_URL in development, falling back to http://localhost:3000')
    return 'http://localhost:3000'
  }
}

// Warn if a non-primary language is used in production (diagnostics only)
export function assertPrimaryLanguage(lang: string): void {
  if (isProduction() && lang && lang !== PRIMARY_LANG) {
    try {
      console.warn(`[i18n-frozen] Non-primary language detected: "${lang}" (primary is "${PRIMARY_LANG}")`)
    } catch {
      // ignore logging errors
    }
  }
}

// Backward-compatible constant (do not access process.env directly elsewhere)
export const PUBLIC_BASE_URL: string = getPublicBaseUrl()


