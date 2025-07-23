import React from 'react'
import type { Metadata } from 'next'
import TopListsClient from './TopListsClient'

interface CategoryWithProducts {
  slug: string
  name: string
  description: string
  productCount: number
  topProducts: Array<{
    name: string
    description: string
  }>
}

export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'TOP AI Tools Lists - Curated Rankings of Best AI Tools | Comparee.ai',
  description: 'Discover curated TOP 20 lists of the best AI tools in each category. From AI writing to automation, find the highest-rated tools for 2025.',
  keywords: 'TOP 20 AI tools, best AI tools lists, curated AI tools, top AI tools rankings, AI tools directory 2025',
  openGraph: {
    title: 'TOP AI Tools Lists - Curated Rankings | Comparee.ai',
    description: 'Discover curated TOP 20 lists of the best AI tools in each category. From AI writing to automation, find the highest-rated tools for 2025.',
    type: 'website',
    url: 'https://comparee.ai/top-lists'
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate category descriptions for TOP 20 lists
function generateTopListDescription(categoryName: string): string {
  const descriptions: Record<string, string> = {
    'content-and-writing': 'Discover the TOP 20 AI writing tools that are revolutionizing content creation in 2025.',
    'productivity-and-organization': 'The TOP 20 AI productivity tools that boost efficiency and streamline workflows.',
    'ai-design-and-creative-tools': 'TOP 20 AI design tools for creating stunning visuals and graphics without design experience.',
    'marketing-and-social-media': 'The TOP 20 AI marketing tools for social media automation and campaign optimization.',
    'workflow-automation': 'TOP 20 AI automation tools that eliminate repetitive tasks and optimize business processes.',
    'ai-video-generation': 'The TOP 20 AI video tools for creating professional video content effortlessly.',
    'business-automation': 'TOP 20 AI business tools for process automation and operational efficiency.',
    'communication': 'The TOP 20 AI communication tools for enhanced team collaboration and messaging.',
    'default': 'TOP 20 carefully selected AI tools that lead this category in performance and innovation.'
  }
  
  const slug = slugify(categoryName)
  return descriptions[slug] || descriptions.default
}

async function getTopListsData() {
  try {
    // Get all products from products API
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://comparee.ai' 
      : 'http://localhost:3000'
    
    // Fetch products with large page size to get all
    const response = await fetch(`${baseUrl}/api/products?pageSize=1000`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'TopLists-SSR'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()
    const products = data.products || []

    console.log(`TopLists: Loaded ${products.length} products from API`)

    // Group products by category
    const categoryProductsMap = new Map<string, any[]>()
    
    products.forEach((product: any) => {
      if (product.category && product.category.trim()) {
        const category = product.category.trim()
        if (!categoryProductsMap.has(category)) {
          categoryProductsMap.set(category, [])
        }
        categoryProductsMap.get(category)!.push(product)
      }
    })

    // Process categories - only include those with 20+ products for TOP 20 lists
    const categoriesWithProducts: CategoryWithProducts[] = []
    
    for (const [categoryName, categoryProducts] of categoryProductsMap.entries()) {
      if (categoryProducts.length >= 20) {
        // Get top 3 products for preview
        const topProducts = categoryProducts
          .slice(0, 3)
          .map(product => ({
            name: product.name,
            description: product.description || 'Advanced AI tool for enhanced productivity and automation.'
          }))

        categoriesWithProducts.push({
          slug: slugify(categoryName),
          name: categoryName,
          description: generateTopListDescription(categoryName),
          productCount: categoryProducts.length,
          topProducts
        })
      }
    }

    // Sort by product count (descending) then alphabetically
    categoriesWithProducts.sort((a, b) => {
      if (b.productCount !== a.productCount) {
        return b.productCount - a.productCount
      }
      return a.name.localeCompare(b.name)
    })

    console.log(`TopLists: Found ${categoriesWithProducts.length} categories with 20+ products`)

    return {
      categories: categoriesWithProducts,
      totalCategories: categoriesWithProducts.length,
      totalTools: products.length
    }
  } catch (error) {
    console.error('Error fetching top lists data:', error)
    
    // Fallback data
    return {
      categories: [],
      totalCategories: 0,
      totalTools: 0
    }
  }
}

export default async function TopListsPage() {
  const data = await getTopListsData()

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "TOP AI Tools Lists - Curated Rankings of Best AI Tools",
            "description": "Discover curated TOP 20 lists of the best AI tools in each category. From AI writing to automation, find the highest-rated tools for 2025.",
            "url": "https://comparee.ai/top-lists",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": data.totalCategories,
              "itemListElement": data.categories.map((category, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": `TOP 20 ${category.name}`,
                "description": category.description,
                "url": `https://comparee.ai/top-lists/${category.slug}`,
                "additionalProperty": {
                  "@type": "PropertyValue",
                  "name": "numberOfItems",
                  "value": Math.min(category.productCount, 20)
                }
              }))
            }
          })
        }}
      />

      {/* Canonical link */}
      <link rel="canonical" href="https://comparee.ai/top-lists" />

      <TopListsClient
        categories={data.categories}
        totalCategories={data.totalCategories}
        totalTools={data.totalTools}
      />
    </>
  )
} 