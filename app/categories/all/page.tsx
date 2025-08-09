import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

interface CategoryData {
  slug: string
  name: string
  description: string
  productCount: number
}

export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'All AI Tool Categories - Complete Directory | Comparee.ai',
  description: 'Browse all AI tool categories on Comparee.ai. Complete directory of AI tools organized by category including writing, image generation, automation, productivity and more. Find the perfect AI solution.',
  keywords: 'AI tools, AI categories, AI directory, artificial intelligence tools, AI solutions, AI software categories',
  openGraph: {
    title: 'All AI Tool Categories - Complete Directory | Comparee.ai',
    description: 'Browse all AI tool categories on Comparee.ai. Complete directory of AI tools organized by category.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/categories/all`,
    type: 'website'
  }
}

// Slugify function for converting category names to URL-friendly slugs
const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');

// Category descriptions for better SEO
const categoryDescriptions: Record<string, string> = {
  'ai-writing': 'Powerful AI writing assistants for content creation, copywriting, and automated text generation.',
  'image-generation': 'AI-powered image creators and generators for stunning visuals, artwork, and design.',
  'automation': 'Workflow automation tools to streamline business processes and increase productivity.',
  'video-generation': 'AI video creation tools for automated video production and editing.',
  'productivity': 'AI productivity tools to enhance workflow efficiency and task management.',
  'social-media': 'AI-powered social media management and content creation tools.',
  'data-analysis': 'Advanced AI analytics tools for data processing and business intelligence.',
  'website-builder': 'AI website builders for automated web design and development.',
  'customer-service': 'AI customer support tools including chatbots and automated service solutions.',
  'marketing': 'AI marketing tools for campaign optimization and audience targeting.',
  'sales': 'AI sales tools for lead generation and sales process automation.',
  'finance': 'AI financial tools for accounting, budgeting, and financial analysis.',
  'hr': 'AI human resources tools for recruitment, employee management, and HR automation.',
  'healthcare': 'AI healthcare solutions for medical analysis and patient care.',
  'education': 'AI educational tools for learning enhancement and training.',
  'design': 'AI design tools for creative workflows and automated design generation.'
}

async function getAllCategories(): Promise<CategoryData[]> {
  try {
    // Get all distinct categories from products table with counts
    const categoryResults = await prisma.$queryRaw<Array<{category: string, count: number}>>`
      SELECT 
        category as category,
        COUNT(*) as count
      FROM "Product"
      WHERE "isActive" = true
        AND category IS NOT NULL
        AND category != ''
      GROUP BY category
      ORDER BY count DESC, category ASC
    `

    // Also get categories from Category table if it exists
    const dbCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            Product: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }).catch(() => []) // Fallback if Category table doesn't exist

    // Convert results to unified format
    const categories: CategoryData[] = []
    const processedSlugs = new Set<string>()

    // Process legacy Product.category field
    for (const result of categoryResults) {
      if (result.category && result.category.trim()) {
        const name = result.category.trim()
        const slug = slugify(name)
        
        if (!processedSlugs.has(slug)) {
          processedSlugs.add(slug)
          categories.push({
            slug,
            name,
            description: categoryDescriptions[slug] || `Discover top ${name.toLowerCase()} tools and AI solutions for enhanced productivity.`,
            productCount: Number(result.count) || 0
          })
        }
      }
    }

    // Process Category table entries (if exists)
    for (const dbCategory of dbCategories) {
      const slug = slugify(dbCategory.name)
      if (!processedSlugs.has(slug)) {
        processedSlugs.add(slug)
        categories.push({
          slug,
          name: dbCategory.name,
          description: categoryDescriptions[slug] || `Discover top ${dbCategory.name.toLowerCase()} tools and AI solutions.`,
          productCount: dbCategory._count.Product
        })
      }
    }

    // Filter out categories with 0 products and sort by product count
    return categories
      .filter(cat => cat.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)

  } catch (error) {
    console.error('Error loading categories:', error)
    return []
  }
}

export default async function AllCategoriesPage() {
  const categories = await getAllCategories()
  const totalTools = categories.reduce((sum, cat) => sum + cat.productCount, 0)

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "All AI Tool Categories",
    "description": "Complete directory of AI tool categories",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/categories/all`,
    "itemListElement": categories.map((category, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": category.name,
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/categories/${category.slug}`,
      "description": category.description,
      "numberOfItems": category.productCount
    }))
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Canonical Link */}
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/categories/all`} />

      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <Link href="/categories" className="text-gray-500 hover:text-gray-700">
                    Categories
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">All Categories</span>
                </li>
              </ol>
            </nav>

            {/* Page Title and Description */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All AI Tool Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-8">
              Explore our complete directory of AI tool categories. Find specialized tools for every use case, 
              from content creation and automation to data analysis and productivity enhancement.
            </p>

            {/* Statistics */}
            <div className="flex items-center text-lg text-gray-600">
              <span className="font-semibold text-purple-600">{categories.length} Categories Available</span>
              <span className="mx-2">·</span>
              <span className="font-semibold text-purple-600">{totalTools} AI Tools Total</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {categories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {categories.map((category) => (
                  <div
                    key={category.slug}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Content */}
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 flex-1">
                        {category.description}
                      </p>

                      {/* Product Count & CTA - Fixed at bottom */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-gray-500 font-medium">
                          {category.productCount} tools
                        </span>
                        <Link
                          href={`/categories/${category.slug}`}
                          className="inline-flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700 hover:underline"
                        >
                          Explore
                          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* No Categories Fallback */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600">
                Categories will appear here as products are added to the database.
              </p>
            </div>
          )}
        </div>

        {/* SEO Content Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Complete Guide to AI Tool Categories
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Our comprehensive AI tools directory organizes over {totalTools} cutting-edge AI solutions across {categories.length} specialized categories. 
                  Whether you're looking for <Link href="/categories/ai-writing" className="text-purple-600 hover:text-purple-700">AI writing tools</Link> to enhance your content creation, 
                  <Link href="/categories/image-generation" className="text-purple-600 hover:text-purple-700"> image generation platforms</Link> for stunning visuals, 
                  or <Link href="/categories/automation" className="text-purple-600 hover:text-purple-700">automation solutions</Link> to streamline your workflow, 
                  we've carefully categorized every tool to help you find exactly what you need.
                </p>
                
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Each category features detailed comparisons, pricing information, and user reviews to help you make informed decisions. 
                  Our AI tool database is constantly updated with the latest innovations in artificial intelligence, ensuring you always have access to 
                  the most current and effective AI solutions for business and personal use.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                  Popular AI Tool Categories
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <strong>AI Writing & Content Creation:</strong> From blog posts and marketing copy to technical documentation, 
                  <Link href="/categories/ai-writing" className="text-purple-600 hover:text-purple-700"> AI writing tools</Link> are revolutionizing content creation with 
                  advanced natural language processing capabilities.
                </p>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <strong>AI Image & Video Generation:</strong> Create professional-quality visuals without design experience using 
                  <Link href="/categories/image-generation" className="text-purple-600 hover:text-purple-700">AI image generators</Link> and 
                  <Link href="/categories/video-generation" className="text-purple-600 hover:text-purple-700">video creation tools</Link> that transform text prompts into stunning media.
                </p>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <strong>Business Automation & Productivity:</strong> Streamline operations with 
                  <Link href="/categories/automation" className="text-purple-600 hover:text-purple-700">workflow automation tools</Link> and 
                  <Link href="/categories/productivity" className="text-purple-600 hover:text-purple-700">productivity enhancers</Link> that reduce manual work and boost efficiency.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                  Find Your Perfect AI Solution
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Every AI tool in our directory is carefully evaluated for functionality, ease of use, pricing, and customer satisfaction. 
                  We provide detailed feature comparisons, pricing breakdowns, and real user reviews to help you choose the best AI tools 2025 
                  for your specific requirements. Whether you're a startup looking for cost-effective solutions or an enterprise seeking 
                  scalable AI platforms, our categorized directory makes it easy to discover and compare the perfect tools for your needs.
                </p>
              </div>

              {/* CTA Section */}
              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Explore Specific Categories?
                  </h3>
                  <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                    Start browsing our specialized AI tool categories to find the perfect solutions for your projects and workflows.
                  </p>
                  <Link
                    href="/categories"
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Browse Featured Categories
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 