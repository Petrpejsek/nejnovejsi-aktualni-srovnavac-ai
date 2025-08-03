'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { trackProductClick } from '../../../lib/utils'
import Modal from '../../../components/Modal'
import RegisterForm from '../../../components/RegisterForm'
import Head from 'next/head'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: string | null
  externalUrl: string | null
  hasTrial: boolean
  hasCredit?: boolean
  isActive?: boolean
}

// Lokální CategoryProductCard komponenta jen pro category stránky
interface CategoryProductCardProps {
  product: Product
  onVisit: (product: Product) => void
  isBookmarked?: boolean
  onBookmarkChange?: (productId: string, isBookmarked: boolean) => void
}

// Toast notification helper
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  }`
  toast.textContent = message
  document.body.appendChild(toast)
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

const CategoryProductCard: React.FC<CategoryProductCardProps> = ({ product, onVisit, isBookmarked = false, onBookmarkChange }) => {
  const { data: session } = useSession()
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)

  // Update local state when prop changes
  useEffect(() => {
    setLocalBookmarked(isBookmarked)
  }, [isBookmarked])

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🔖 BOOKMARK CLICK:', { productId: product.id, productName: product.name, sessionExists: !!session })
    
    // Check if user is authenticated
    if (!session) {
      console.log('❌ User not authenticated, showing signup modal')
      setShowSignUpModal(true)
      return
    }
    
    // Start animation
    setIsAnimating(true)
    
    // OPTIMISTIC UPDATE - update UI immediately
    const newBookmarkedState = !localBookmarked
    setLocalBookmarked(newBookmarkedState)
    
    console.log('🔄 OPTIMISTIC UPDATE:', { newBookmarkedState, productId: product.id })
    
    // Show toast immediately
    showToast(newBookmarkedState ? 'Saved!' : 'Removed!', 'success')
    
    // Call parent callback immediately for UI consistency
    if (onBookmarkChange) {
      onBookmarkChange(product.id, newBookmarkedState)
    }

    try {
      let response: Response
      
      if (newBookmarkedState) {
        // SAVE: POST to /api/users/saved-products
        response = await fetch('/api/users/saved-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            productId: product.id,
            productName: product.name,
            category: product.category,
            imageUrl: product.imageUrl,
            price: product.price
          }),
        })
      } else {
        // UNSAVE: DELETE to /api/users/saved-products with query param
        response = await fetch(`/api/users/saved-products?productId=${encodeURIComponent(product.id)}`, {
          method: 'DELETE'
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`✅ ${newBookmarkedState ? 'SAVE' : 'UNSAVE'} SUCCESS:`, { productId: product.id })
      
    } catch (error) {
      console.error('❌ BOOKMARK ERROR:', error)
      
      // ROLLBACK on API error
      setLocalBookmarked(!newBookmarkedState)
      if (onBookmarkChange) {
        onBookmarkChange(product.id, !newBookmarkedState)
      }
      
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden flex flex-col h-full">
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
        <div className="absolute bottom-3 left-3">
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

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          className={`absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-110 ${
            isAnimating ? 'animate-pulse transform -translate-y-1' : ''
          }`}
        >
          {localBookmarked ? (
            <BookmarkFilledIcon className="w-4 h-4 text-purple-600" />
          ) : (
            <BookmarkIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Flex container pro obsah - zajistí správné rozmístění */}
      <div className="p-6 flex flex-col justify-between flex-grow">
        {/* Obsah nahoře */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description || 'No description available'}
          </p>
          
          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-1 mb-4">
              {(() => {
                if (!product.tags) return []
                if (typeof product.tags === 'string') {
                  const trimmed = product.tags.trim()
                  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                    try {
                      return JSON.parse(trimmed)
                    } catch {
                      console.warn('Invalid JSON in product.tags:', trimmed)
                      return []
                    }
                  }
                  // fallback: comma-separated list
                  return trimmed.split(',').map(t => t.trim())
                }
                return Array.isArray(product.tags) ? product.tags : []
              })()?.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Tlačítko na spodku pomocí mt-auto */}
        <div className="mt-auto">
          <button
            onClick={() => onVisit(product)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            View Tool
          </button>
        </div>
      </div>

      {/* Signup modal */}
      <Modal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)}
        title="Save to Favorites"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Create an account to save your favorite tools and access them anytime.
          </p>
        </div>
        <RegisterForm 
          onSuccess={() => {
            setShowSignUpModal(false)
            // Optimistically add to saved products after successful registration
            setLocalBookmarked(true)
            if (onBookmarkChange) {
              onBookmarkChange(product.id, true)
            }
          }}
        />
      </Modal>
    </div>
  )
}

// Slugify function for converting category names to URL-friendly slugs
const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');

// Category mapping - maps URL slugs to actual database categories
const categoryMapping: Record<string, string[]> = {
  'ai-writing': ['Content & Writing', 'AI Content Creation', 'Content', 'Writing'],
  'image-generation': ['AI Design & Creative Tools', 'Design & Visual', 'Design Tools', 'Visual'],
  'automation': ['Workflow Automation', 'Marketing Automation', 'Automation', 'Business Automation'],
  'website-builder': ['AI Website Builder', 'Website Builder', 'Web Development'],
  'social-media': ['Marketing & Social Media', 'Social Media', 'Marketing'],
  'data-analysis': ['AI & Data Analysis', 'Analytics', 'Data Analytics'],
  'ai-music': ['Audio & Music', 'Music', 'Audio'],
  'ai-learning': ['Education', 'Learning', 'Training'],
  'video-generation': ['AI & Video', 'AI Video Generation', 'AI Video Editing', 'Video Editing'],
  'ai-chatbots': ['Conversational AI', 'Chatbots', 'AI Assistant'],
  'email-marketing': ['Email Marketing', 'Marketing Automation', 'Marketing'],
  'seo-tools': ['SEO', 'Marketing Tools', 'SEO Tools'],
  'ai-design': ['AI Design & Creative Tools', 'Design & Visual', 'Design Tools'],
  'ai-voice': ['Audio', 'Voice', 'Speech'],
  'productivity': ['Productivity', 'Productivity & Organization', 'Business'],
  'business-intelligence': ['Business Intelligence', 'Analytics', 'Business & Enterprise']
}

// Category SEO data with comprehensive content
const categoryInfo: Record<string, { title: string; description: string; seoText: string; metaDescription: string }> = {
  'ai-writing': {
    title: 'Best AI Writing Tools in 2025',
    description: 'Explore top AI writing software, copywriting assistants, and content automation tools.',
    metaDescription: 'Discover the best AI writing tools for 2025. Compare features, pricing, and reviews of top AI copywriting assistants and content generation platforms.',
    seoText: `AI writing tools have revolutionized the content creation landscape, offering unprecedented capabilities for generating high-quality text across various formats and styles. These intelligent platforms leverage advanced natural language processing and machine learning algorithms to understand context, tone, and audience requirements, making them indispensable for modern content creators.

The best AI writing tools in 2025 offer a comprehensive suite of features including blog post generation, marketing copy creation, product descriptions, email campaigns, and social media content. Leading platforms like ChatGPT, Jasper, Copy.ai, and Writesonic have set new standards for AI-assisted writing, combining powerful language models with user-friendly interfaces.

Modern AI writing assistants excel at maintaining brand voice consistency while adapting to different content types and target audiences. They can generate everything from technical documentation and academic papers to creative fiction and persuasive sales copy. Advanced features include SEO optimization, plagiarism checking, grammar correction, and multi-language support.

For businesses, AI writing tools offer significant advantages in scaling content production while maintaining quality standards. Marketing teams can generate compelling ad copy, email sequences, and landing page content in minutes rather than hours. Content marketers leverage these tools for blog posts, social media campaigns, and thought leadership articles that drive engagement and conversions.

The integration of AI writing tools with existing workflows has become seamless, with many platforms offering APIs, browser extensions, and integrations with popular content management systems. This accessibility ensures that teams can incorporate AI assistance into their existing processes without disrupting established workflows.

As we advance through 2025, AI writing tools continue to evolve with improved understanding of context, better fact-checking capabilities, and enhanced creativity features. The most successful implementations combine AI efficiency with human oversight, creating a collaborative approach that maximizes both speed and quality in content production.`
  },
  'image-generation': {
    title: 'Top AI Image Generation Tools',
    description: 'Create stunning visuals, illustrations, and AI art effortlessly.',
    metaDescription: 'Find the best AI image generation tools for creating stunning visuals, artwork, and designs. Compare Midjourney, DALL-E, Stable Diffusion and more.',
    seoText: `AI image generation has transformed the creative industry, democratizing access to high-quality visual content creation through advanced artificial intelligence technologies. These powerful tools enable anyone to create professional-grade images, artwork, and designs without traditional artistic skills or expensive software.

Leading AI image generators like Midjourney, DALL-E 3, Stable Diffusion, and Adobe Firefly have established new benchmarks for quality and versatility. These platforms can produce everything from photorealistic portraits and landscapes to abstract art, logos, illustrations, and marketing materials with simple text prompts.

The technology behind AI image generation utilizes sophisticated neural networks trained on vast datasets of images and their descriptions. This training enables the AI to understand relationships between textual descriptions and visual elements, allowing for precise control over style, composition, lighting, and artistic techniques.

Modern AI image tools offer extensive customization options including aspect ratios, art styles, quality settings, and refinement controls. Users can specify everything from camera angles and lighting conditions to artistic movements and color palettes, giving unprecedented creative control over the final output.

For businesses and content creators, AI image generation provides cost-effective solutions for marketing materials, social media content, website graphics, and product mockups. The speed of generation allows for rapid iteration and A/B testing of visual concepts, significantly reducing the time from concept to final design.

Professional applications include architectural visualization, product design prototyping, concept art for entertainment industries, and educational materials. The ability to generate consistent visual styles across large content libraries makes these tools invaluable for brand coherence and scalability.

As AI image generation technology advances, we're seeing improvements in prompt understanding, consistency across generations, and integration with traditional design workflows. The future promises even more sophisticated control mechanisms and specialized tools for specific industries and creative applications.`
  },
  'automation': {
    title: 'Best Automation Tools for 2025',
    description: 'Streamline workflows and boost productivity with automation software.',
    metaDescription: 'Discover the best automation tools for 2025. Compare workflow automation, business process automation, and productivity tools to streamline operations.',
    seoText: `Business automation tools have become essential for organizations seeking to optimize operations, reduce manual tasks, and improve overall efficiency. These powerful platforms enable businesses to streamline complex workflows, eliminate repetitive processes, and focus human resources on high-value strategic activities.

The automation landscape in 2025 encompasses a wide range of solutions, from simple task automation to sophisticated AI-powered workflow orchestration. Leading platforms like Zapier, Microsoft Power Automate, UiPath, and Automation Anywhere offer comprehensive automation capabilities that integrate with hundreds of business applications.

Modern automation tools excel at connecting disparate systems and applications, creating seamless data flows between CRM systems, marketing platforms, accounting software, and project management tools. This integration capability eliminates data silos and ensures consistent information across all business functions.

Robotic Process Automation (RPA) has evolved to handle increasingly complex tasks, including document processing, data entry, customer service interactions, and compliance reporting. AI-enhanced automation can now make decisions, learn from patterns, and adapt to changing conditions without human intervention.

For small and medium businesses, no-code automation platforms have democratized access to powerful automation capabilities. These visual workflow builders allow non-technical users to create sophisticated automations without programming knowledge, dramatically expanding the accessibility of automation technologies.

Enterprise-level automation solutions focus on scalability, security, and governance, providing centralized management of automation portfolios across large organizations. These platforms include monitoring, analytics, and optimization features that ensure automation investments deliver measurable business value.

The ROI of automation implementation is substantial, with organizations typically seeing significant reductions in processing time, error rates, and operational costs. As automation technology continues to advance, the integration of AI and machine learning promises even more intelligent and adaptive automation solutions.`
  },
  'website-builder': {
    title: 'Top Website Builder Tools',
    description: 'Build professional websites without coding knowledge.',
    metaDescription: 'Find the best website builders for 2025. Compare drag-and-drop builders, templates, and features for creating professional websites without coding.',
    seoText: `Website builders have revolutionized web development by making professional website creation accessible to users without technical expertise. These intuitive platforms combine powerful design tools with user-friendly interfaces, enabling anyone to build responsive, feature-rich websites quickly and efficiently.

Modern website builders like WordPress.com, Wix, Squarespace, and Webflow offer sophisticated drag-and-drop interfaces that eliminate the need for coding while maintaining professional design standards. These platforms provide extensive template libraries, customization options, and built-in functionality for various business needs.

The evolution of website builders has introduced AI-powered design assistance, automatic responsive design optimization, and intelligent content suggestions. These features streamline the design process while ensuring websites perform well across all devices and screen sizes.

For businesses, website builders provide comprehensive solutions including e-commerce functionality, SEO tools, analytics integration, and marketing automation features. Advanced platforms offer custom domain management, professional email services, and enterprise-grade security features.

Modern website builders excel at specific use cases, with specialized platforms for e-commerce stores, portfolios, blogs, and business websites. Integration capabilities with third-party services enable complex functionality including payment processing, inventory management, and customer relationship management.

The performance and reliability of website builders have improved significantly, with most platforms offering robust hosting infrastructure, content delivery networks, and automated backups. These technical foundations ensure websites remain fast, secure, and accessible to visitors worldwide.

As the web development landscape continues to evolve, website builders are incorporating cutting-edge technologies like AI design assistance, voice interfaces, and advanced personalization features. The future of website building promises even more intelligent and automated design processes while maintaining the flexibility and control that users demand.`
  },
  'social-media': {
    title: 'Best Social Media Management Tools',
    description: 'Manage, schedule, and analyze your social media presence.',
    metaDescription: 'Discover the best social media management tools for 2025. Compare scheduling, analytics, and automation features for effective social media marketing.',
    seoText: `Social media management tools have become indispensable for businesses and content creators seeking to maintain consistent, engaging presence across multiple platforms. These comprehensive solutions streamline content creation, scheduling, monitoring, and analytics while enabling effective community management and audience engagement.

Leading social media management platforms like Hootsuite, Buffer, Sprout Social, and Later offer unified dashboards that consolidate management of Facebook, Instagram, Twitter, LinkedIn, TikTok, and other major platforms. This centralization saves time and ensures consistent brand messaging across all channels.

Advanced scheduling capabilities allow users to plan content calendars weeks or months in advance, with optimal posting time recommendations based on audience engagement patterns. AI-powered content optimization suggests improvements to captions, hashtags, and posting schedules to maximize reach and engagement.

Modern social media tools provide comprehensive analytics and reporting features that track key performance indicators including reach, engagement rates, click-through rates, and conversion metrics. These insights enable data-driven decision making and continuous optimization of social media strategies.

Content creation features have evolved to include built-in design tools, video editing capabilities, and AI-powered content generation. Many platforms offer extensive libraries of templates, stock images, and design elements that enable professional-quality content creation without external tools.

Team collaboration features facilitate coordinated social media management with approval workflows, role-based permissions, and collaborative content calendars. These capabilities are essential for organizations with multiple team members contributing to social media efforts.

The integration of social listening and monitoring features provides valuable insights into brand mentions, competitor activity, and industry trends. This intelligence enables proactive reputation management and identifies opportunities for engagement and content creation.

As social media platforms continue to evolve and new channels emerge, management tools are adapting with support for emerging platforms, enhanced AI capabilities, and more sophisticated automation features. The future of social media management promises even more intelligent and efficient solutions for building and maintaining online communities.`
  },
  'productivity': {
    title: 'Best Productivity Tools for 2025',
    description: 'Boost efficiency and manage tasks with productivity software.',
    metaDescription: 'Find the best productivity tools for 2025. Compare task management, project planning, and workflow optimization software to boost efficiency.',
    seoText: `Productivity tools have evolved into sophisticated platforms that transform how individuals and teams organize work, manage time, and achieve goals. These essential applications combine task management, project planning, collaboration features, and analytics to create comprehensive productivity ecosystems.

Modern productivity platforms like Notion, Asana, Monday.com, and Todoist offer flexible frameworks that adapt to various work styles and organizational needs. These tools provide powerful features including project templates, automated workflows, time tracking, and intelligent prioritization systems.

The integration of AI technology has enhanced productivity tools with smart scheduling, predictive analytics, and automated task creation. These intelligent features help users optimize their time allocation and identify productivity patterns that lead to better performance.

Task management capabilities have expanded beyond simple to-do lists to include complex project hierarchies, dependency tracking, and resource allocation. Advanced features like Gantt charts, Kanban boards, and timeline views provide multiple perspectives on project progress and bottlenecks.

Collaboration features enable seamless teamwork with real-time editing, comment systems, file sharing, and communication channels integrated directly into project workflows. These capabilities reduce context switching and ensure all team members stay aligned on project objectives and deadlines.

Time tracking and analytics provide valuable insights into productivity patterns, helping users identify their most productive hours, optimize workload distribution, and make data-driven decisions about resource allocation. These metrics are essential for improving personal efficiency and team performance.

Mobile accessibility ensures productivity tools remain useful regardless of location, with offline capabilities and synchronization features that maintain productivity even without internet connectivity. This flexibility is crucial for modern distributed work environments.

As the future of work continues to evolve, productivity tools are incorporating advanced AI capabilities, enhanced automation features, and deeper integrations with business systems. The next generation of productivity software promises even more intelligent assistance for managing complex work environments and achieving ambitious goals.`
  }
}

// Add more category definitions with comprehensive SEO content...
const getDefaultCategoryInfo = (slug: string, categoryName: string) => ({
  title: `Best ${categoryName} Tools`,
  description: `Discover top ${categoryName.toLowerCase()} tools and software.`,
  metaDescription: `Find the best ${categoryName.toLowerCase()} tools for 2025. Compare features, pricing, and reviews of top ${categoryName.toLowerCase()} software solutions.`,
  seoText: `Explore the best ${categoryName.toLowerCase()} tools available today. These innovative platforms help you achieve your goals with advanced features, user-friendly interfaces, and comprehensive functionality. Whether you're a professional, business owner, or individual user, these ${categoryName.toLowerCase()} solutions provide the capabilities you need to succeed in today's competitive landscape. Compare features, pricing, and user reviews to find the perfect ${categoryName.toLowerCase()} tool for your specific requirements.`
})

// All available categories for related categories
const allCategories = [
  { slug: 'ai-writing', name: 'AI Writing' },
  { slug: 'image-generation', name: 'Image Generation' },
  { slug: 'automation', name: 'Automation' },
  { slug: 'website-builder', name: 'Website Builder' },
  { slug: 'social-media', name: 'Social Media' },
  { slug: 'data-analysis', name: 'Data Analysis' },
  { slug: 'ai-music', name: 'AI Music' },
  { slug: 'ai-learning', name: 'AI Learning' },
  { slug: 'video-generation', name: 'Video Generation' },
  { slug: 'ai-chatbots', name: 'AI Chatbots' },
  { slug: 'email-marketing', name: 'Email Marketing' },
  { slug: 'seo-tools', name: 'SEO Tools' },
  { slug: 'ai-design', name: 'AI Design' },
  { slug: 'ai-voice', name: 'AI Voice' },
  { slug: 'productivity', name: 'Productivity' },
  { slug: 'business-intelligence', name: 'Business Intelligence' }
]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  const { data: session } = useSession()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())
  
  const PAGE_SIZE = 12

  // Get category info with fallback
  const categoryData = categoryInfo[slug] || getDefaultCategoryInfo(slug, categoryName)

  // Get related categories (3 random categories excluding current one)
  const relatedCategories = allCategories
    .filter(cat => cat.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  // Load saved products when user is authenticated
  useEffect(() => {
    const loadSavedProducts = async () => {
      if (!session) {
        setSavedProducts(new Set())
        return
      }

      try {
        const response = await fetch('/api/users/saved-products')
        if (response.ok) {
          const data = await response.json()
          const savedProductIds = new Set<string>(data.map((product: any) => product.id))
          setSavedProducts(savedProductIds)
          console.log('📖 Loaded saved products for category page:', savedProductIds.size)
        }
      } catch (error) {
        console.error('Error loading saved products:', error)
      }
    }

    loadSavedProducts()
  }, [session])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let allProducts: Product[] = []
        const mappedCategories = categoryMapping[slug] || [categoryName]
        
        // Try each mapped category
        for (const category of mappedCategories) {
          try {
            const response = await fetch(`/api/products?category=${encodeURIComponent(category)}&page=1&pageSize=500`)
            if (response.ok) {
              const data = await response.json()
              if (data.products && data.products.length > 0) {
                allProducts.push(...data.products)
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch products for category ${category}:`, e)
          }
        }
        
        // If no products found with exact category matches, try searching by tags
        if (allProducts.length === 0) {
          try {
            const allProductsResponse = await fetch(`/api/products?page=1&pageSize=500`)
            if (allProductsResponse.ok) {
              const allData = await allProductsResponse.json()
              if (allData.products) {
                // Filter products that have matching tags
                const keywords = [
                  slug.replace('-', ' '),
                  slug.replace('-', ''),
                  categoryName.toLowerCase(),
                  ...mappedCategories.map(c => c.toLowerCase())
                ]
                
                allProducts = allData.products.filter((product: Product) => {
                  if (!product.tags && !product.category) return false
                  
                  // Check category
                  if (product.category) {
                    const catLower = product.category.toLowerCase()
                    if (keywords.some(keyword => catLower.includes(keyword.toLowerCase()))) {
                      return true
                    }
                  }
                  
                  // Check tags
                  if (product.tags) {
                    try {
                      const tags = (() => {
                        if (!product.tags) return []
                        if (typeof product.tags === 'string') {
                          const trimmed = product.tags.trim()
                          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                            try {
                              return JSON.parse(trimmed)
                            } catch {
                              console.warn('Invalid JSON in product.tags:', trimmed)
                              return []
                            }
                          }
                          // fallback: comma-separated list
                          return trimmed.split(',').map(t => t.trim())
                        }
                        return Array.isArray(product.tags) ? product.tags : []
                      })()
                      if (Array.isArray(tags)) {
                        return tags.some(tag => {
                          const tagLower = tag.toLowerCase()
                          return keywords.some(keyword => 
                            tagLower.includes(keyword.toLowerCase()) ||
                            keyword.toLowerCase().includes(tagLower)
                          )
                        })
                      }
                    } catch (e) {
                      // If tags parsing fails, check if string contains slug
                      const tagsLower = product.tags.toLowerCase()
                      return keywords.some(keyword => 
                        tagsLower.includes(keyword.toLowerCase()) ||
                        keyword.toLowerCase().includes(tagsLower)
                      )
                    }
                  }
                  
                  return false
                })
              }
            }
          } catch (e) {
            console.warn('Failed to fetch all products for tag filtering:', e)
          }
        }

        // Remove duplicates
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )

        // Paginate results
        const startIndex = (currentPage - 1) * PAGE_SIZE
        const endIndex = startIndex + PAGE_SIZE
        const paginatedProducts = uniqueProducts.slice(startIndex, endIndex)

        setProducts(paginatedProducts)
        setTotalPages(Math.ceil(uniqueProducts.length / PAGE_SIZE))
        setTotalProducts(uniqueProducts.length)
      } catch (err) {
        console.error('Error loading products:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [slug, categoryName, currentPage])

  const handleVisit = (product: Product) => {
    // Use shared tracking function for consistency
    trackProductClick({
      id: product.id,
      name: product.name,
      externalUrl: product.externalUrl,
      category: product.category,
      imageUrl: product.imageUrl,
      price: product.price,
      tags: product.tags
    })
  }

  const handleBookmarkChange = (productId: string, isBookmarked: boolean) => {
    setSavedProducts(prev => {
      const newSavedProducts = new Set(prev)
      if (isBookmarked) {
        newSavedProducts.add(productId)
      } else {
        newSavedProducts.delete(productId)
      }
      return newSavedProducts
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Loading Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{categoryData.title} | Comparee.ai</title>
        <meta name="description" content={categoryData.metaDescription} />
        <meta property="og:title" content={`${categoryData.title} | Comparee.ai`} />
        <meta property="og:description" content={categoryData.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://comparee.ai/categories/${slug}`} />
        <link rel="canonical" href={`https://comparee.ai/categories/${slug}`} />
        <meta name="robots" content="index, follow" />
      </Head>

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
                  {totalProducts} {categoryName} Tools
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {products.length} results
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {products.map((product) => (
                  <CategoryProductCard
                    key={product.id}
                    product={product}
                    onVisit={handleVisit}
                    isBookmarked={savedProducts.has(product.id)}
                    onBookmarkChange={handleBookmarkChange}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-16">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
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
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Best {categoryName} AI Tools
            </h2>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                {categoryData.seoText}
              </div>
            </div>
          </div>

          {/* Related Categories */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Related Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                    {categoryInfo[category.slug]?.title || `Best ${category.name} Tools`}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {categoryInfo[category.slug]?.description || `Discover top ${category.name.toLowerCase()} tools and software.`}
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
    </>
  )
} 