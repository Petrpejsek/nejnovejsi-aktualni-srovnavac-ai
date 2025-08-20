/**
 * Opens URL in new tab without triggering popup blockers
 * This uses a temporary anchor element instead of window.open()
 */
export function openInNewTab(url: string): void {
  const tempLink = document.createElement('a')
  tempLink.href = url
  tempLink.target = '_blank'
  tempLink.rel = 'noopener,noreferrer'
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
}

/**
 * Safely opens URL with error handling
 */
export function safeOpenInNewTab(url: string | null | undefined): void {
  if (!url) {
    console.log('❌ Missing URL!')
    return
  }

  try {
    openInNewTab(url)
  } catch (error) {
    console.error('❌ Error opening URL:', error)
  }
}

/**
 * Generates a unique slug for landing pages
 * Returns a URL-safe string with timestamp-based uniqueness
 */
export function generateSlug(): string {
  const timestamp = new Date().toISOString()
    .replace(/[^0-9]/g, '') // Remove all non-numeric characters
    .slice(0, 12) // Take first 12 digits (YYYYMMDDHHMM)
  
  return `test-landing-${timestamp}`
}

/**
 * Validates if a slug meets API requirements
 * Rules: only lowercase letters, numbers, hyphens, no diacritics, max 100 chars
 */
export function validateSlug(slug: string): boolean {
  // Check length
  if (slug.length > 100) return false
  
  // Check format: only lowercase letters, numbers, and hyphens
  const validSlugRegex = /^[a-z0-9-]+$/
  return validSlugRegex.test(slug)
}

/**
 * Sanitizes a string to be a valid slug
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD') // Decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Keep only letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 100) // Limit to 100 characters
}

/**
 * Track product click with full monetization support
 * Uses the same tracking logic as ProductCard for consistency
 */
export function trackProductClick(product: {
  id: string
  name: string
  externalUrl: string | null
  category?: string | null
  imageUrl?: string | null
  price?: number | null
  tags?: string | string[] | null
}): void {
  if (!product.externalUrl) {
    console.log('❌ Chybí externí URL!')
    return
  }

  console.log('🚀 Opening product:', product.id)

  // PŘÍMÉ OTEVŘENÍ – nejprve pošli tracking, pak otevři novou kartu (aby session/cookie zůstal dostupný)

  // Optimistic update pro click history - okamžitě
  if (typeof window !== 'undefined' && window.addToClickHistory) {
    let category = product.category
    if (!category && product.tags) {
      // Extract category from tags if available
      const tags = typeof product.tags === 'string' 
        ? (product.tags.startsWith('[') ? JSON.parse(product.tags) : [product.tags])
        : product.tags
      category = Array.isArray(tags) && tags.length > 0 ? tags[0] : null
    }

    window.addToClickHistory({
      id: product.id,
      name: product.name,
      category: category || undefined,
      imageUrl: product.imageUrl || undefined,
      price: product.price || undefined,
      externalUrl: product.externalUrl || undefined
    })
  }

  // SPOLEHLIVÉ tracking - používáme fetch s keepalive pro garantované odeslání
  sendTrackingFetch()
  
  function sendFallbackTracking() {
    // Fallback tracking pomocí POST na /api/redirect (spolehlivější než GET)
    fetch('/api/redirect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        externalUrl: product.externalUrl || ''
      })
    }).then(response => {
      if (response.ok) {
        console.log('✅ Fallback tracking successful')
      } else {
        console.log('⚠️ Fallback tracking failed:', response.status)
      }
    }).catch(fallbackError => {
      console.log('⚠️ Fallback tracking error:', fallbackError)
    })
  }

  async function sendTrackingFetch() {
    const trackData = { productId: product.id }
    
    try {
      const ppcResponse = await fetch('/api/ads/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackData),
      keepalive: true  // Zajistí odeslání i když se stránka zavře
      })

      if (ppcResponse.ok) {
        const ppcResult = await ppcResponse.json()
        console.log('💰 PPC click successful (fetch):', ppcResult)
      } else {
        console.log('⚠️ PPC click failed, using free tracking:', ppcResponse.status)
        await sendFallbackTracking()
      }
    } catch (error) {
      console.log('⚠️ PPC click error, using free tracking fallback:', error)
      await sendFallbackTracking()
    }
    
    // Otevři až po pokusu o tracking (minimalizuje ztrátu session při přesměrování)
    if (product.externalUrl) {
      openInNewTab(product.externalUrl)
    }
  }
}

/**
 * Sestaví správnou URL pro obrázek s ohledem na produkční konfiguraci
 * Řeší problém s assetPrefix na produkci
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/img/placeholder.svg'
  }

  // Pokud je to už absolutní URL, vrať ji tak jak je
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Pokud je to data URL (base64), vrať ji tak jak je
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  // Pro relativní cesty (např. /screenshots/image.png)
  if (imageUrl.startsWith('/')) {
    const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || ''

    // Preferuj same-origin URL, aby nedocházelo k mixed content (HTTPS stránka → HTTP asset)
    // a k blokaci přes CSP na cross-origin. Asset prefix použij jen pokud je bezpečný a shodný s původem.
    if (assetPrefix && process.env.NODE_ENV === 'production') {
      try {
        if (typeof window !== 'undefined') {
          const pageOrigin = window.location.origin
          const pageProtocol = window.location.protocol
          const prefixUrl = new URL(assetPrefix, pageOrigin)

          // Zabraň mixed content: nikdy nepřepínej na http: na https: stránce
          if (pageProtocol === 'https:' && prefixUrl.protocol === 'http:') {
            return imageUrl
          }

          // Použij prefix jen pokud je stejného původu (vyhne se CSP/CORS problémům)
          if (prefixUrl.origin === pageOrigin) {
            // Normalizuj trailing slash
            const normalizedPrefix = prefixUrl.toString().replace(/\/$/, '')
            return `${normalizedPrefix}${imageUrl}`
          }

          // V ostatních případech raději vrať relativní cestu (same-origin)
          return imageUrl
        }
      } catch {
        // Při chybě parsování prefixu vrať bezpečně relativní cestu
        return imageUrl
      }
    }

    // Lokálně nebo bez bezpečného prefixu vrať relativní cestu
    return imageUrl
  }

  // Pro ostatní případy (relativní bez /) přidej / na začátek
  return getImageUrl(`/${imageUrl}`)
} 