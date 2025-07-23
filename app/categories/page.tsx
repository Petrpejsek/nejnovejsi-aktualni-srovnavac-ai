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
  title: 'All AI Tool Categories | Compare the Best AI Tools 2025',
  description: 'Explore all AI tool categories on Comparee.ai. Find the best AI tools for writing, image generation, automation, productivity, and more. Compare features and reviews of top AI solutions.',
  keywords: 'AI tools, AI categories, best AI tools 2025, AI solutions for business, AI productivity tools, artificial intelligence software',
  openGraph: {
    title: 'All AI Tool Categories | Compare the Best AI Tools 2025',
    description: 'Explore all AI tool categories on Comparee.ai. Find the best AI tools for writing, image generation, automation, productivity, and more.',
    type: 'website',
    url: 'https://comparee.ai/categories',
  },
  alternates: {
    canonical: 'https://comparee.ai/categories'
  },
  robots: 'index, follow'
}

async function getCategoriesData(): Promise<{ categories: CategoryData[]; totalTools: number }> {
  try {
    // Get real categories from database with product counts
    const categoriesWithCounts = await prisma.category.findMany({
      select: {
        slug: true,
        name: true,
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
        Product: {
          _count: 'desc'
        }
      }
    })

    // Also count products that use the old category field
    const productsWithOldCategories = await prisma.product.findMany({
      where: {
        isActive: true,
        category: { not: null },
        primary_category_id: null
      },
      select: {
        category: true
      }
    })

    // Create category map with counts
    const categoryMap = new Map<string, { name: string; count: number }>()

    // Add categories from Category table
    categoriesWithCounts.forEach(cat => {
      if (cat._count.Product > 0) {
        categoryMap.set(cat.slug, {
          name: cat.name,
          count: cat._count.Product
        })
      }
    })

    // Add legacy categories from product.category field
    const slugify = (name: string) =>
      name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')

    productsWithOldCategories.forEach(product => {
      if (product.category) {
        const slug = slugify(product.category)
        const existing = categoryMap.get(slug)
        if (existing) {
          categoryMap.set(slug, {
            name: existing.name,
            count: existing.count + 1
          })
        } else {
          categoryMap.set(slug, {
            name: product.category,
            count: 1
          })
        }
      }
    })

    // Convert to array and filter categories with at least 1 product
    const categories: CategoryData[] = []
    for (const [slug, data] of categoryMap.entries()) {
      if (data.count > 0) {
        categories.push({
          slug,
          name: data.name,
          description: generateCategoryDescription(data.name),
          productCount: data.count
        })
      }
    }

    // Sort by product count (descending)
    categories.sort((a, b) => b.productCount - a.productCount)

    // Get total number of active products
    const totalTools = await prisma.product.count({
      where: {
        isActive: true
      }
    })

    return { categories, totalTools }
  } catch (error) {
    console.error('Error loading categories:', error)
    return { categories: [], totalTools: 0 }
  }
}

// Generate simple category descriptions
function generateCategoryDescription(categoryName: string): string {
  const name = categoryName.toLowerCase()
  
  if (name.includes('writing') || name.includes('content')) {
    return 'Discover powerful AI writing assistants that help create compelling content, from blog posts to marketing copy.'
  }
  if (name.includes('image') || name.includes('design') || name.includes('visual')) {
    return 'Create stunning visuals and artwork with AI-powered image generators and design tools.'
  }
  if (name.includes('video')) {
    return 'Produce professional videos with AI-powered editing, generation, and enhancement tools.'
  }
  if (name.includes('automation') || name.includes('workflow')) {
    return 'Streamline your workflows with intelligent automation platforms that save time and boost productivity.'
  }
  if (name.includes('productivity') || name.includes('organization')) {
    return 'Boost your efficiency with task management, note-taking, and workflow optimization tools.'
  }
  if (name.includes('social') || name.includes('marketing')) {
    return 'Manage, schedule, and optimize your social media presence with advanced marketing tools.'
  }
  if (name.includes('data') || name.includes('analytics') || name.includes('intelligence')) {
    return 'Transform raw data into actionable insights with powerful analytics and visualization platforms.'
  }
  if (name.includes('voice') || name.includes('audio') || name.includes('speech')) {
    return 'Generate realistic voices and speech with advanced text-to-speech and voice synthesis.'
  }
  if (name.includes('music')) {
    return 'Create original music and soundtracks using artificial intelligence and machine learning.'
  }
  if (name.includes('website') || name.includes('web')) {
    return 'Build professional websites effortlessly with AI-powered website builders and design platforms.'
  }
  if (name.includes('chat') || name.includes('bot')) {
    return 'Build intelligent conversational agents for customer service and user engagement.'
  }
  if (name.includes('email')) {
    return 'Create effective email campaigns with automation, analytics, and personalization features.'
  }
  if (name.includes('seo')) {
    return 'Optimize your website for search engines with comprehensive SEO analysis and optimization tools.'
  }
  if (name.includes('learning') || name.includes('education')) {
    return 'Enhance your education with AI-powered learning platforms and personalized tutoring systems.'
  }
  
  return `Explore ${categoryName.toLowerCase()} tools and solutions powered by artificial intelligence.`
}

export default async function CategoriesPage() {
  const { categories, totalTools } = await getCategoriesData()
  
  // Show only top 16 categories (2 rows of 8)
  const topCategories = categories.slice(0, 16)
  const hasMoreCategories = categories.length > 16

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AI Tool Categories",
    "description": "Complete list of AI tool categories available on Comparee.ai",
    "url": "https://comparee.ai/categories",
    "numberOfItems": categories.length,
    "itemListElement": topCategories.map((category, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": category.name,
      "description": category.description,
      "url": `https://comparee.ai/categories/${category.slug}`,
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
                  <span className="text-gray-900 font-medium">Categories</span>
                </li>
              </ol>
            </nav>

            {/* Page Title and Description */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All AI Tool Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-8">
              Discover the complete collection of AI tool categories. From content creation to automation, 
              find the perfect AI solutions for your specific needs and boost your productivity with the best AI tools 2025.
            </p>

            {/* Statistics */}
            <div className="flex items-center text-lg text-gray-600">
              <span className="font-semibold text-purple-600">{categories.length} Categories Available</span>
              <span className="mx-2">·</span>
              <span className="font-semibold text-purple-600">{totalTools} AI Tools</span>
            </div>
          </div>
        </div>

        {/* Top Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {topCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {topCategories.map((category) => (
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

              {/* View All Categories Button */}
              {hasMoreCategories && (
                <div className="text-center mb-16">
                  <Link
                    href="/categories/all"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View All Categories
                    <span className="ml-2 text-purple-200">({categories.length - 16} more)</span>
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
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
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">
                Complete Guide to AI Tool Categories
              </h2>
              
              <div className="text-gray-700 leading-relaxed space-y-6">
                <p className="text-lg">
                  The artificial intelligence landscape has evolved dramatically in 2025, creating distinct categories of <strong>AI tools</strong> that serve different business needs and creative purposes. Understanding these <strong>AI categories</strong> is essential for selecting the right <strong>AI solutions for business</strong> that can transform your workflow, boost productivity, and drive innovation in your organization.
                </p>

                <p>
                  Our comprehensive collection spans <strong>{categories.length} major AI tool categories</strong>, each containing specialized platforms designed to solve specific challenges. From content creation and visual design to business automation and data analysis, these categories represent the cutting-edge of <strong>AI productivity tools</strong> and artificial intelligence applications in today's digital economy.
                </p>

                <p>
                  Whether you're looking for <strong>best AI tools 2025</strong> for content creation, customer service automation, or data analytics, our categorized approach helps you quickly identify the most relevant solutions for your specific use case. Each category contains carefully curated tools with detailed comparisons, pricing information, and user reviews to support informed decision-making.
                </p>

                <p>
                  <strong>AI tools</strong> continue to reshape industries by automating complex tasks, enhancing creative processes, and providing intelligent insights that drive business growth. The <strong>AI solutions for business</strong> available today offer unprecedented opportunities to streamline operations, improve customer experiences, and gain competitive advantages through intelligent automation and data-driven decision making.
                </p>

                <p>
                  The most successful businesses in 2025 are those that strategically implement <strong>AI productivity tools</strong> across multiple categories, creating integrated workflows that automate entire processes from content creation to customer service. By exploring our categorized directory, you can build a comprehensive AI toolkit that addresses your organization's specific needs and growth objectives.
                </p>

                <p className="bg-purple-50 border-l-4 border-purple-500 p-4 mt-8">
                  <strong>Stay Updated:</strong> The AI landscape evolves rapidly, with new tools and features launching regularly. Our directory is continuously updated to ensure you have access to the latest and most effective <strong>AI solutions for business</strong> across all categories. New categories are automatically added as innovative tools emerge in the market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 