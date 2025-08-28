export function getNumberEnv(name: string, defaultValue: number): number {
  const v = process.env[name]
  if (!v) return defaultValue
  const n = Number(v)
  return Number.isFinite(n) ? n : defaultValue
}

export function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const v = process.env[name]
  if (!v) return defaultValue
  if (/^(1|true|yes)$/i.test(v)) return true
  if (/^(0|false|no)$/i.test(v)) return false
  return defaultValue
}

export function getSetEnv(name: string): Set<string> {
  const v = process.env[name]
  if (!v) return new Set()
  return new Set(
    v
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  )
}

export const SEO_MIN_LANDING_CHARS = getNumberEnv('SEO_MIN_LANDING_CHARS', 300)
export const SEO_MIN_CATEGORY_COUNT = getNumberEnv('SEO_MIN_CATEGORY_COUNT', 3)
export const SEO_ENFORCE_STRICT = getBooleanEnv('SEO_ENFORCE_STRICT', true)
export const SEO_INDEX_ALLOWLIST = getSetEnv('SEO_INDEX_ALLOWLIST')

// Phase 2 i18n note: when multi-language goes live, consider locale-specific thresholds.
// For now the application is single-language (en-US) and these thresholds are global.

// Helper: determine if content is strong enough for indexing
export function isStrongContent(html: string, slug?: string): boolean {
  const text = (html || '').replace(/<[^>]*>/g, '').trim()
  if (slug && SEO_INDEX_ALLOWLIST.has(slug)) return true
  return text.length >= SEO_MIN_LANDING_CHARS
}


