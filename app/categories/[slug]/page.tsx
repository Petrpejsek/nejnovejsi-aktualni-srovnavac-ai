import React from 'react'
import { PUBLIC_BASE_URL } from '@/lib/env'
import prisma from '@/lib/prisma'
import { getCategoryNamesForSlug } from '@/lib/categoryMapping'
import { SEO_MIN_CATEGORY_COUNT, SEO_INDEX_ALLOWLIST } from '@/lib/seo/config'
import { buildCategoryItemList } from '@/lib/seo/schema'
import ClientCategoryPage from './ClientCategoryPage'
import { notFound } from 'next/navigation'

// Server-side metadata generation handled below with params-aware generateMetadata

// Slugify function for converting category names to URL-friendly slugs
const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');

// Category mapping is now centralized in lib/categoryMapping.ts

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

export const dynamic = 'force-static'

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Params }) {
  const slug = params?.slug
  if (!slug) {
    return { robots: { index: true, follow: true } } as any
  }
  // Resolve category name from slug using DB Category or mapping
  const categoryRecord = await prisma.category.findFirst({ where: { slug } })
  const categoryName = categoryRecord?.name || slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
  // Count products in this category (primary or via mapping if needed)
  const count = await prisma.product.count({ where: { OR: [ { category: categoryName }, { Category: { name: categoryName } } ] } })

  const canonical = `${PUBLIC_BASE_URL}/categories/${slug}`

  const gscUrl = `${PUBLIC_BASE_URL}/categories/${slug}`
  const gsc = await prisma.seo_gsc_status.findUnique({ where: { url: gscUrl } }).catch(() => null)
  const forceIndex = gsc?.indexed === true
  if (count < SEO_MIN_CATEGORY_COUNT && !SEO_INDEX_ALLOWLIST.has(slug) && !forceIndex) {
    return {
      alternates: { canonical },
      robots: { index: false, follow: true },
    } as any
  }

  // Only use description if stored in DB (e.g., Category.description or dedicated SEO table); otherwise omit
  const dbDescription: string | undefined = (categoryRecord as any)?.description && String((categoryRecord as any).description).trim().length > 0
    ? (categoryRecord as any).description
    : undefined

  return {
    title: `${categoryName} AI Tools – Comparee`,
    ...(dbDescription ? { description: dbDescription } : {}),
    alternates: { canonical },
    robots: { index: true, follow: true },
  } as any
}

export default function CategoryPage({ params }: { params: Params }) {
  const slug = params?.slug
  if (!slug) {
    notFound()
  }
  return <ServerWrappedCategory slug={slug} />
} 

async function ServerWrappedCategory({ slug }: { slug: string }) {
  const categoryRecord = await prisma.category.findFirst({ where: { slug } })
  const categoryName = categoryRecord?.name || slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
  const count = await prisma.product.count({ where: { OR: [ { category: categoryName }, { Category: { name: categoryName } } ] } })

  // Build synonyms from centralized mapping
  const synonyms = getCategoryNamesForSlug(slug)
  const namesForQuery = (synonyms && synonyms.length > 0 ? synonyms : [categoryName])
  const orFilters = namesForQuery.map(s => ({ category: { equals: s, mode: 'insensitive' as const } }))
  const reps = (count >= SEO_MIN_CATEGORY_COUNT || SEO_INDEX_ALLOWLIST.has(slug))
    ? await prisma.landing_pages.findMany({
        where: { OR: orFilters },
        select: { slug: true, title: true },
        orderBy: { published_at: 'desc' },
        take: 3
      })
    : []

  const itemList = ((count >= SEO_MIN_CATEGORY_COUNT || SEO_INDEX_ALLOWLIST.has(slug)) && reps.length >= 3)
    ? buildCategoryItemList(categoryName, reps)
    : null

  return (
    <>
      {itemList ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      ) : null}
      <ClientCategoryPage slug={slug} />
    </>
  )
}