/**
 * Utility funkce pro práci s video thumbnaily
 * Automatické generování náhledových snímků z video souborů
 */

interface VideoThumbnailOptions {
  timeOffset?: number // Čas v sekundách, ze kterého se má extrahovat frame (default: 2s)
  width?: number // Šířka výsledného obrázku (default: 216px)
  height?: number // Výška výsledného obrázku (default: 384px)
  format?: 'image/jpeg' | 'image/png' // Formát výsledného obrázku (default: jpeg)
  quality?: number // Kvalita pro JPEG (0-1, default: 0.8)
}

/**
 * Generuje thumbnail z video URL pomocí HTML5 video elementu
 */
export const generateVideoThumbnail = async (
  videoUrl: string,
  options: VideoThumbnailOptions = {}
): Promise<string> => {
  const {
    timeOffset = 2, // 2 sekundy pro přeskočení černého začátku
    width = 216,
    height = 384,
    format = 'image/jpeg',
    quality = 0.8
  } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    // Nastavení rozměrů canvas
    canvas.width = width
    canvas.height = height

    // Konfigurace video elementu
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'

    // Event listener pro načtení video metadat
    video.addEventListener('loadedmetadata', () => {
      // Nastavíme čas na požadovanou sekundu (ale ne více než délka videa)
      video.currentTime = Math.min(timeOffset, video.duration - 0.1)
    })

    // Event listener pro načtení konkrétního frame
    video.addEventListener('seeked', () => {
      try {
        // Nakreslíme video frame na canvas
        ctx.drawImage(video, 0, 0, width, height)
        
        // Převedeme canvas na data URL
        const dataURL = canvas.toDataURL(format, quality)
        
        // Cleanup
        video.removeAttribute('src')
        video.load()
        
        resolve(dataURL)
      } catch (error) {
        reject(error)
      }
    })

    // Error handling
    video.addEventListener('error', (e) => {
      reject(new Error(`Video loading failed: ${e.type}`))
    })

    // Timeout pro případ, že video se načítá příliš dlouho
    const timeoutId = setTimeout(() => {
      reject(new Error('Video thumbnail generation timeout'))
    }, 10000) // 10 sekund timeout

    // Cleanup timeout po úspěchu
    video.addEventListener('seeked', () => {
      clearTimeout(timeoutId)
    })

    // Spustíme načítání videa
    video.src = videoUrl
  })
}

/**
 * Hook pro práci s video thumbnaily v React komponentách
 */
export const useVideoThumbnail = (videoUrl: string, thumbnailUrl?: string | null) => {
  const [generatedThumbnail, setGeneratedThumbnail] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Pokud už máme thumbnail URL, nemusíme generovat
    if (thumbnailUrl) {
      return
    }

    // Pokud už jsme generovali thumbnail pro toto video, nemusíme znovu
    if (generatedThumbnail) {
      return
    }

    // Generujeme thumbnail pouze v browseru
    if (typeof window === 'undefined') {
      return
    }

    const generateThumbnail = async () => {
      setIsGenerating(true)
      setError(null)

      try {
        const thumbnail = await generateVideoThumbnail(videoUrl)
        setGeneratedThumbnail(thumbnail)
      } catch (err) {
        console.warn('Failed to generate video thumbnail:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsGenerating(false)
      }
    }

    generateThumbnail()
  }, [videoUrl, thumbnailUrl, generatedThumbnail])

  return {
    thumbnail: generatedThumbnail,
    isGenerating,
    error
  }
}

/**
 * Získá nejlepší dostupný thumbnail pro reel
 */
export const getReelThumbnail = (
  thumbnailUrl: string | null,
  generatedThumbnail: string | null,
  fallbackUrl: string = '/img/reel-placeholder.svg'
): string => {
  // 1. Priorita: Explicitní thumbnail URL
  if (thumbnailUrl) {
    if (thumbnailUrl.startsWith('/uploads/thumbnails/') || thumbnailUrl.startsWith('http')) {
      return thumbnailUrl
    }
    return `/uploads/thumbnails/${thumbnailUrl}`
  }

  // 2. Priorita: Generovaný thumbnail z videa
  if (generatedThumbnail) {
    return generatedThumbnail
  }

  // 3. Priorita: Fallback placeholder
  return fallbackUrl
}

/**
 * Cache pro již vygenerované thumbnaily
 * Předchází opakovanému generování stejných videí
 */
class ThumbnailCache {
  private cache = new Map<string, string>()
  private maxSize = 50 // Maximální počet cached thumbnailů

  get(videoUrl: string): string | null {
    return this.cache.get(videoUrl) || null
  }

  set(videoUrl: string, thumbnail: string): void {
    // Pokud cache přesáhne limit, odstraníme nejstarší položku
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(videoUrl, thumbnail)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Globální instance cache
export const thumbnailCache = new ThumbnailCache()

// Import React pro hook
import React from 'react'

/**
 * Detekce mobilních zařízení
 */
export const isMobile = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
} 