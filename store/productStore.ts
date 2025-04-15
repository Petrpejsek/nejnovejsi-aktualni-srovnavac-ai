import { create } from 'zustand'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags?: string[]
  advantages?: string[]
  disadvantages?: string[]
  reviews?: Array<{
    author: string
    rating: number
    text: string
  }>
  detailInfo?: string
  pricingInfo?: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  externalUrl?: string
  videoUrls?: string[]
  hasTrial?: boolean
}

interface Pagination {
  page: number
  pageSize: number
  totalProducts: number
  totalPages: number
}

interface ProductStore {
  products: Product[]
  pagination: Pagination
  loading: boolean
  error: string | null
  lastFetch: number
  selectedTags: Set<string>
  availableTags: string[]
  fetchProducts: (page: number) => Promise<void>
  setSelectedTags: (tags: Set<string>) => void
  normalizeTag: (tag: string) => string
}

// Cache duration in milliseconds (1 minute)
const CACHE_DURATION = 60 * 1000

// Funkce pro normalizaci tagů
const normalizeTag = (tag: string): string => {
  const normalizedTag = tag.trim()
  
  // Unify similar tags
  const tagMap: { [key: string]: string } = {
    'text na řeč': 'Text to Speech',
    'text to speech': 'Text to Speech',
    'úprava fotek': 'Image Editing',
    'úprava obrázků': 'Image Editing',
    'generování obrázků': 'Image Generation',
    'generování obrázkú': 'Image Generation',
    'zákaznický servis': 'Customer Support',
    'zákaznická podpora': 'Customer Support',
    'projektové řízení': 'Project Management',
    'projektový management': 'Project Management',
    'avatary': 'Digital Avatars',
    'digitální avatary': 'Digital Avatars',
    'video': 'Video Creation',
    'video tvorba': 'Video Creation',
    'voiceover': 'Text to Speech'
  }

  return tagMap[normalizedTag.toLowerCase()] || normalizedTag
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  pagination: {
    page: 1,
    pageSize: 9,
    totalProducts: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  lastFetch: 0,
  selectedTags: new Set<string>(),
  availableTags: [],
  normalizeTag,

  setSelectedTags: (tags: Set<string>) => {
    set({ selectedTags: tags })
  },

  fetchProducts: async (page: number) => {
    const now = Date.now()
    const store = get()

    // Kontrola, zda už načítáme
    if (store.loading) return

    // Pokud máme data v cache a nejsou starší než CACHE_DURATION
    if (
      store.products.length > 0 &&
      store.pagination.page === page &&
      now - store.lastFetch < CACHE_DURATION
    ) {
      return
    }

    try {
      set({ loading: true, error: null })

      // Vytvoření URL s parametry
      const url = new URL('/api/products', window.location.origin)
      url.searchParams.set('page', page.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst produkty')
      }

      const data = await response.json()

      // Zpracování produktů a tagů
      const processedProducts = data.products.map((product: Product) => {
        const processedProduct = {
          ...product,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
          advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
          disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
          pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
          videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
          hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false
        }

        // Normalize tags
        processedProduct.tags = processedProduct.tags.map((tag: string) => normalizeTag(tag))
        return processedProduct
      })

      // Extract and normalize all unique tags
      const allTags = new Set<string>()
      processedProducts.forEach((product: Product) => {
        product.tags?.forEach((tag: string) => allTags.add(tag))
      })

      set({
        products: page === 1 ? processedProducts : [...store.products, ...processedProducts],
        pagination: data.pagination,
        availableTags: Array.from(allTags).sort(),
        loading: false,
        lastFetch: now
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Nastala chyba při načítání produktů',
        loading: false
      })
    }
  }
})) 