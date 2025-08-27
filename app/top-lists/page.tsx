import React from 'react'
import type { Metadata } from 'next'
import TopListsClient from './TopListsClient'

interface TopListData {
  id: string
  title: string
  description: string
  category: string
  products: string[]
  status: string
  clicks: number
  conversion: number
  createdAt: string
  updatedAt: string
}

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
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/top-lists`
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getTopListsData() {
  try {
    // Load top lists from API
    const baseUrl = 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/top-lists?status=published`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'TopLists-SSR'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch top lists: ${response.status}`)
    }

    const topLists: TopListData[] = await response.json()

    console.log(`TopLists: Loaded ${topLists.length} published top lists from API`)

    // Convert to CategoryWithProducts format for the frontend
    const categoriesWithProducts: CategoryWithProducts[] = await Promise.all(
      topLists.map(async (topList) => {
        // Get product details for top 3 products
        const topProducts = []
        
        try {
          const productIds = topList.products.slice(0, 3)
          if (productIds.length > 0) {
            const productsResponse = await fetch(`${baseUrl}/api/products?ids=${productIds.join(',')}`, {
              next: { revalidate: 3600 }
            })
            
            if (productsResponse.ok) {
              const products = await productsResponse.json()
              for (const product of products) {
                topProducts.push({
                  name: product.name,
                  description: product.description || 'Advanced AI tool for enhanced productivity and automation.'
                })
              }
            }
          }
        } catch (error) {
          console.error('Error fetching product details:', error)
        }

        // Fallback if no products found
        if (topProducts.length === 0) {
          topProducts.push(
            { name: 'AI Tool #1', description: 'Advanced AI tool for enhanced productivity.' },
            { name: 'AI Tool #2', description: 'Innovative solution for automation.' },
            { name: 'AI Tool #3', description: 'Professional AI assistant for workflows.' }
          )
        }

        return {
          slug: slugify(topList.category),
          name: topList.title,
          description: topList.description,
          productCount: topList.products.length,
          topProducts
        }
      })
    )

    return {
      categories: categoriesWithProducts,
      totalCategories: categoriesWithProducts.length,
      totalTools: topLists.reduce((sum, list) => sum + list.products.length, 0)
    }
  } catch (error) {
    console.error('Error fetching top lists data:', error)
    
    // Fallback data with realistic categories based on our products
    const fallbackCategories: CategoryWithProducts[] = [
      {
        slug: 'ai-writing',
        name: 'AI Writing',
        description: 'TOP 20 AI writing tools that are revolutionizing content creation in 2025.',
        productCount: 45,
        topProducts: [
          { name: 'ChatGPT', description: 'Advanced conversational AI for content generation.' },
          { name: 'Jasper AI', description: 'Professional AI writing assistant for marketers.' },
          { name: 'Copy.ai', description: 'AI copywriting tool for sales and marketing.' }
        ]
      },
      {
        slug: 'image-generation',
        name: 'Image Generation',
        description: 'TOP 20 AI image generation tools for creating stunning visuals and graphics.',
        productCount: 38,
        topProducts: [
          { name: 'DALL-E 3', description: 'Advanced AI image generation from OpenAI.' },
          { name: 'Midjourney', description: 'High-quality AI art generation platform.' },
          { name: 'Stable Diffusion', description: 'Open-source AI image generation model.' }
        ]
      },
      {
        slug: 'automation',
        name: 'Automation',
        description: 'TOP 20 AI automation tools that eliminate repetitive tasks and optimize workflows.',
        productCount: 32,
        topProducts: [
          { name: 'Zapier', description: 'Connect apps and automate workflows.' },
          { name: 'Make (Integromat)', description: 'Visual platform for workflow automation.' },
          { name: 'UiPath', description: 'Robotic Process Automation platform.' }
        ]
      }
    ]
    
    return {
      categories: fallbackCategories,
      totalCategories: fallbackCategories.length,
      totalTools: 506 // Realistic fallback based on actual DB count
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
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/top-lists`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": data.totalCategories,
              "itemListElement": data.categories.map((category, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": `TOP 20 ${category.name}`,
                "description": category.description,
                "url": `${process.env.NEXT_PUBLIC_BASE_URL}/top-lists/${category.slug}`,
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
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL}/top-lists`} />

      <TopListsClient
        categories={data.categories}
        totalCategories={data.totalCategories}
        totalTools={data.totalTools}
      />
    </>
  )
} 