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

// Function for tag normalization
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

    console.log('🔄 ProductStore: Načítám produkty a tagy...')

    try {
      set({ loading: true, error: null })

      // OPTIMIZED: Load tags separately using fast endpoint
      const tagsUrl = new URL('/api/products', window.location.origin)
      tagsUrl.searchParams.set('tagsOnly', 'true')
      tagsUrl.searchParams.set('_t', now.toString()) // Cache busting

      console.log('🏷️ ProductStore: Načítám tagy (optimized):', tagsUrl.toString())

      const tagsResponse = await fetch(tagsUrl.toString(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      let availableTags: string[] = []
      
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json()
        availableTags = tagsData.tags || []
        console.log('✅ ProductStore: Načteny tagy:', availableTags.length)
      } else {
        console.warn('⚠️ ProductStore: Chyba při načítání tagů')
      }

      // Load products for display (smaller page size)
      const productsUrl = new URL('/api/products', window.location.origin)
      productsUrl.searchParams.set('page', page.toString())
      productsUrl.searchParams.set('pageSize', '50') // Smaller page size for better performance
      productsUrl.searchParams.set('_t', now.toString())

      console.log('📦 ProductStore: Načítám produkty:', productsUrl.toString())

      const productsResponse = await fetch(productsUrl.toString(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      })
      
      if (!productsResponse.ok) {
        const errorText = await productsResponse.text()
        console.error('❌ ProductStore: API chyba:', productsResponse.status, errorText)
        throw new Error(`API chyba: ${productsResponse.status} - ${errorText}`)
      }

      const productsData = await productsResponse.json()
      console.log('✅ ProductStore: Data z API:', {
        produkty: productsData.products?.length || 0,
        pagination: productsData.pagination
      })

      // Process products
      const processedProducts = productsData.products.map((product: Product) => {
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

      set({
        products: page === 1 ? processedProducts : [...store.products, ...processedProducts],
        pagination: productsData.pagination,
        availableTags: availableTags,
        loading: false,
        lastFetch: now
      })
    } catch (error) {
      console.error('❌ ProductStore: Chyba při načítání:', error)
      set({
        error: error instanceof Error ? error.message : 'Nastala chyba při načítání produktů',
        loading: false
      })
    }
  }
})) 