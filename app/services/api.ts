// Typy pro API
export interface Product {
  id: string
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  rating: number
  price: string
  tags: string[]
}

export interface ComparisonResult {
  product1: Product
  product2: Product
  comparisonPoints: {
    category: string
    points: {
      title: string
      product1Value: string
      product2Value: string
    }[]
  }[]
  recommendation: string
}

// API endpoints
const API_BASE_URL = (() => {
  const v = process.env.NEXT_PUBLIC_API_URL
  if (!v) throw new Error('NEXT_PUBLIC_API_URL must be set')
  return v
})()

// API služba
export const api = {
  // Získání všech produktů
  async getProducts(filters?: { category?: string, provider?: string, minPrice?: number, maxPrice?: number }) {
    const queryParams = new URLSearchParams()
    if (filters?.category) queryParams.append('category', filters.category)
    if (filters?.provider) queryParams.append('provider', filters.provider)
    if (filters?.minPrice) queryParams.append('min_price', filters.minPrice.toString())
    if (filters?.maxPrice) queryParams.append('max_price', filters.maxPrice.toString())

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
  },

  // Získání detailu produktu
  async getProduct(id: string) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return response.json()
  },

  // Získání recenzí produktu
  async getProductReviews(id: string) {
    const response = await fetch(`${API_BASE_URL}/products/${id}/reviews`)
    if (!response.ok) throw new Error('Failed to fetch reviews')
    return response.json()
  },

  // Přidání recenze
  async addReview(productId: string, review: { rating: number, comment: string }) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    })
    if (!response.ok) throw new Error('Failed to add review')
    return response.json()
  },

  // Porovnání produktů
  async compareProducts(product1Id: string, product2Id: string): Promise<ComparisonResult> {
    const response = await fetch(`${API_BASE_URL}/compare/${product1Id}/${product2Id}`)
    if (!response.ok) throw new Error('Failed to compare products')
    return response.json()
  },

  // Získání doporučení
  async getRecommendations(requirements: { category?: string, budget?: number, features?: string[] }) {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requirements),
    })
    if (!response.ok) throw new Error('Failed to get recommendations')
    return response.json()
  }
} 