import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCategoryBySlug, slugToCategory, categorySEO } from '../../../lib/seoCategories'
import prisma from '../../../lib/prisma'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryData = getCategoryBySlug(params.slug)
  
  if (!categoryData) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    }
  }

  return {
    title: categoryData.title,
    description: categoryData.description,
    alternates: {
      canonical: `https://comparee.ai/categories/${params.slug}`,
    },
    openGraph: {
      title: categoryData.title,
      description: categoryData.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: categoryData.title,
      description: categoryData.description,
    }
  }
}

// Product interface
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: any // JSON value from Prisma
  externalUrl: string | null
  hasTrial: boolean
}

async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    // Create search variations for better matching
    const searchVariations = [
      categoryName, // "AI Writing"
      categoryName.toLowerCase(), // "ai writing" 
      categoryName.replace(/\s+/g, ''), // "AIWriting"
      categoryName.replace(/\s+/g, '-'), // "AI-Writing"
      categoryName.replace(/\s+/g, '_'), // "AI_Writing"
    ]

    // Search products by multiple criteria
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { 
            OR: [
              // Exact category matches
              ...searchVariations.map(variation => ({ category: variation })),
              // Category contains
              ...searchVariations.map(variation => ({ 
                category: { contains: variation, mode: 'insensitive' as const } 
              })),
              // Search by individual words from category name
              ...categoryName.split(' ').filter(word => word.length > 2).map(word => ({
                OR: [
                  { category: { contains: word, mode: 'insensitive' as const } },
                  { name: { contains: word, mode: 'insensitive' as const } }
                ]
              }))
            ]
          },
          { isActive: true }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        tags: true,
        externalUrl: true,
        hasTrial: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 50 // Limit to 50 products per category
    })

    console.log(`Found ${products.length} products for category "${categoryName}"`)
    return products
  } catch (error) {
    console.error('Error loading products for category:', error)
    return []
  }
}

function ProductCard({ product }: { product: Product }) {
  const handleClick = () => {
    // Track click if needed
    if (product.externalUrl) {
      window.open(product.externalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
      <div className="aspect-video relative bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Price badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.price === 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {product.price === 0 ? 'Free' : `$${product.price}`}
          </span>
        </div>

        {/* Trial badge */}
        {product.hasTrial && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Free Trial
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {product.description || 'No description available'}
        </p>

        {/* Tags */}
        {product.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            {JSON.parse(product.tags).slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleClick}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          View Tool
        </button>
      </div>
    </div>
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryData = getCategoryBySlug(params.slug)
  
  if (!categoryData) {
    notFound()
  }

  const categoryName = slugToCategory(params.slug)
  const products = await getProductsByCategory(categoryName)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": categoryData.title,
            "description": categoryData.description,
            "itemListElement": products.map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://comparee.ai/products/${product.id}`,
              "name": product.name,
              "description": product.description
            }))
          })
        }}
      />
      
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
                <span className="text-gray-500">Categories</span>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">{categoryName}</span>
              </li>
            </ol>
          </nav>

          {/* Page Title and Description */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryData.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {categoryData.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {products.length} {categoryName} Tools
              </h2>
              <div className="text-sm text-gray-500">
                Showing {products.length} results
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-6">
              We don't have any {categoryName.toLowerCase()} tools in our database yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse All Tools
            </Link>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            About {categoryName} Tools
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">
              {categoryData.seoText}
            </p>
          </div>
        </div>

        {/* Related Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Related Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categorySEO)
              .filter(([slug]) => slug !== params.slug)
              .sort(() => Math.random() - 0.5) // Random shuffle
              .slice(0, 3) // Take only 3
              .map(([slug, data]) => (
                <Link
                  key={slug}
                  href={`/categories/${slug}`}
                  className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                    {data.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {data.description}
                  </p>
                  <span className="inline-flex items-center text-purple-600 text-sm font-medium mt-3 group-hover:text-purple-700">
                    Explore Tools
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  )
} 