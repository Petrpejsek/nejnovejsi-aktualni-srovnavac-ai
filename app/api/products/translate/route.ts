import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/products/translate - Translate all products to English
export async function POST() {
  try {
    // Načtení všech produktů včetně jejich názvů
    const existingProducts = await prisma.product.findMany()

    console.log('Existing products:', existingProducts.map(p => p.name))

    // Update all products with English translations
    const updates = await Promise.all(existingProducts.map(async (product) => {
      // Get the translation data based on the product name
      const translationData = getTranslationData(product.name)
      
      if (!translationData) {
        console.log(`No translation data for product ${product.name}`)
        return null
      }

      // Update the product
      return prisma.product.update({
        where: { id: product.id },
        data: translationData
      })
    }))

    const successfulUpdates = updates.filter(Boolean)

    return NextResponse.json({ 
      message: "Successfully translated products to English",
      updated: successfulUpdates.length,
      total: existingProducts.length
    })
  } catch (error) {
    console.error('Error translating products:', error)
    return NextResponse.json(
      { error: 'Error translating products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function getTranslationData(productName: string) {
  const translations: Record<string, any> = {
    "ChatGPT": {
      name: "ChatGPT",
      description: "Advanced AI chatbot for natural conversations and task assistance",
      category: "AI Assistant",
      tags: JSON.stringify(["AI Assistant", "Text Generation", "Customer Support"]),
      advantages: JSON.stringify([
        "Very versatile and capable of handling various tasks",
        "Natural conversation flow",
        "Regular updates and improvements",
        "Extensive knowledge base"
      ]),
      disadvantages: JSON.stringify([
        "May occasionally provide incorrect information",
        "Limited context window",
        "No real-time information",
        "Can be inconsistent in responses"
      ]),
      detailInfo: "ChatGPT is an AI language model developed by OpenAI that can engage in conversations, answer questions, help with writing, and assist with various tasks. It uses advanced machine learning to understand and generate human-like text responses.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "20",
        enterprise: "Custom"
      })
    },
    "Claude": {
      name: "Claude",
      description: "Advanced AI assistant by Anthropic with enhanced reasoning and analysis capabilities",
      category: "AI Assistant",
      tags: JSON.stringify(["AI Assistant", "Text Generation", "Data Analysis"]),
      advantages: JSON.stringify([
        "Strong analytical capabilities",
        "Excellent at complex tasks",
        "More nuanced responses",
        "Good at following instructions"
      ]),
      disadvantages: JSON.stringify([
        "Limited availability",
        "Can be overly cautious",
        "Slower response times",
        "Higher pricing than some alternatives"
      ]),
      detailInfo: "Claude is an AI assistant developed by Anthropic, known for its strong analytical capabilities and ability to handle complex tasks. It excels at detailed analysis, writing, and providing well-reasoned responses.",
      pricingInfo: JSON.stringify({
        basic: "20",
        pro: "50",
        enterprise: "Custom"
      })
    },
    "Adobe Firefly": {
      name: "Adobe Firefly",
      description: "Advanced AI tool for image generation and editing by Adobe",
      category: "Image Generation",
      tags: JSON.stringify(["Image Generation", "Image Editing", "Adobe", "AI Art"]),
      advantages: JSON.stringify([
        "High-quality outputs",
        "Adobe products integration",
        "Easy to use",
        "Commercial license"
      ]),
      disadvantages: JSON.stringify([
        "Some features only in paid version",
        "Requires Adobe account",
        "Limited free generations"
      ]),
      detailInfo: "Adobe Firefly is a revolutionary AI tool for generating and editing images. It offers advanced features like text-to-image generation, image editing, style changes, and more. It's fully integrated with Adobe Creative Cloud and offers commercial licensing for created content.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "20",
        enterprise: "Custom"
      })
    },
    "Midjourney": {
      name: "Midjourney",
      description: "AI-powered image generation tool for creating stunning artwork and illustrations",
      category: "Image Generation",
      tags: JSON.stringify(["Image Generation", "AI Art", "Digital Design"]),
      advantages: JSON.stringify([
        "Exceptional image quality",
        "Unique artistic style",
        "Active community",
        "Regular feature updates"
      ]),
      disadvantages: JSON.stringify([
        "Learning curve for prompts",
        "Queue times during peak hours",
        "Limited control over specific details",
        "Subscription required for full access"
      ]),
      detailInfo: "Midjourney is an AI image generation tool that creates high-quality, artistic images from text descriptions. It's particularly known for its distinctive aesthetic and ability to create stunning artwork, illustrations, and concept designs.",
      pricingInfo: JSON.stringify({
        basic: "10",
        pro: "30",
        enterprise: "60"
      })
    },
    "DALL-E": {
      name: "DALL-E",
      description: "OpenAI's advanced image generation AI with precise control and editing capabilities",
      category: "Image Generation",
      tags: JSON.stringify(["Image Generation", "AI Art", "Image Editing"]),
      advantages: JSON.stringify([
        "High accuracy in following prompts",
        "Built-in image editing features",
        "User-friendly interface",
        "Consistent quality"
      ]),
      disadvantages: JSON.stringify([
        "Credit-based system",
        "Limited style options",
        "No unlimited plan available",
        "Some creative limitations"
      ]),
      detailInfo: "DALL-E is OpenAI's image generation AI that creates, edits, and modifies images based on text descriptions. It offers precise control over the generated images and includes features for editing existing images.",
      pricingInfo: JSON.stringify({
        basic: "15",
        pro: "40",
        enterprise: "Custom"
      })
    },
    "Stable Diffusion": {
      name: "Stable Diffusion",
      description: "Open-source AI image generation model with extensive customization options",
      category: "Image Generation",
      tags: JSON.stringify(["Image Generation", "AI Art", "Open Source"]),
      advantages: JSON.stringify([
        "Free open-source version available",
        "High degree of customization",
        "Can be run locally",
        "Active development community"
      ]),
      disadvantages: JSON.stringify([
        "Requires technical knowledge for local setup",
        "High hardware requirements for local use",
        "Results can be inconsistent",
        "Learning curve for optimal results"
      ]),
      detailInfo: "Stable Diffusion is an open-source AI model for generating images from text descriptions. It can be run locally on your own hardware or used through various cloud services. The platform offers extensive customization options and is continuously improved by the community.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "20",
        enterprise: "Custom"
      })
    },
    "Jasper": {
      name: "Jasper",
      description: "AI copywriting assistant for marketing content",
      category: "Copywriting",
      tags: JSON.stringify(["AI", "Copywriting", "Marketing"]),
      advantages: JSON.stringify([
        "Marketing specialization",
        "Many templates",
        "SEO optimization",
        "Team collaboration"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point",
        "Occasional repetitive content",
        "Requires review",
        "Learning curve"
      ]),
      detailInfo: "Jasper is an AI tool specialized in creating marketing content, including blogs, ads, and social media posts. It offers advanced features for content creation and team collaboration.",
      pricingInfo: JSON.stringify({
        basic: "40",
        pro: "70",
        enterprise: "200"
      })
    },
    "Copy.ai": {
      name: "Copy.ai",
      description: "AI tool for generating marketing copy",
      category: "Copywriting",
      tags: JSON.stringify(["AI", "Copywriting", "Marketing"]),
      advantages: JSON.stringify([
        "Easy to use",
        "Quality outputs",
        "Multiple formats",
        "Free plan available"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing",
        "Basic version limitations",
        "English only",
        "Sometimes generic content"
      ]),
      detailInfo: "Copy.ai helps create marketing copy, emails, product descriptions, and other content using AI. It offers a user-friendly interface and supports multiple content formats.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "35",
        enterprise: "150"
      })
    },
    "Grammarly": {
      name: "Grammarly",
      description: "AI assistant for text checking and improvement",
      category: "Writing",
      tags: JSON.stringify(["AI", "Grammar", "Writing"]),
      advantages: JSON.stringify([
        "Accurate error detection",
        "Style suggestions",
        "Cross-platform",
        "Real-time checking"
      ]),
      disadvantages: JSON.stringify([
        "Monthly subscription",
        "Occasional false positives",
        "Limited language support",
        "Premium features cost"
      ]),
      detailInfo: "Grammarly is an advanced AI tool for checking spelling, grammar, and style. It offers real-time suggestions and integrates with various platforms and applications.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "30",
        enterprise: "100"
      })
    },
    "Notion AI": {
      name: "Notion AI",
      description: "AI assistant integrated into Notion for writing and organization",
      category: "Productivity",
      tags: JSON.stringify(["AI", "Productivity", "Organization"]),
      advantages: JSON.stringify([
        "Notion integration",
        "Versatile use",
        "Context understanding",
        "Writing assistance"
      ]),
      disadvantages: JSON.stringify([
        "Requires Notion",
        "Token limit",
        "Basic AI features",
        "Additional cost"
      ]),
      detailInfo: "Notion AI is an integrated assistant in Notion that helps with writing, summarizing, and organizing information. It enhances the Notion experience with AI-powered features.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "15",
        enterprise: "50"
      })
    },
    "CapCut": {
      name: "CapCut",
      description: "Versatile video editor with advanced AI features",
      category: "Video Editing",
      tags: JSON.stringify(["AI", "Video Editing", "Social Media"]),
      advantages: JSON.stringify([
        "Free basic version",
        "Easy to use",
        "Advanced AI features",
        "Mobile and desktop versions"
      ]),
      disadvantages: JSON.stringify([
        "Watermark in free version",
        "Limited export resolution in free",
        "Some advanced features PRO only",
        "Internet required"
      ]),
      detailInfo: "CapCut is a modern video editor with integrated AI features. It offers a simple interface for beginners and advanced features for professionals. Automatic edits, effects, and transitions make CapCut great for social media video creation.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "12",
        enterprise: "Custom"
      })
    },
    "InVideo": {
      name: "InVideo",
      description: "Online platform for creating professional videos with AI assistance",
      category: "Video Creation",
      tags: JSON.stringify(["AI", "Video Creation", "Online Tool"]),
      advantages: JSON.stringify([
        "Extensive template library",
        "Automatic translations",
        "Text to video",
        "Cloud storage"
      ]),
      disadvantages: JSON.stringify([
        "Requires internet connection",
        "Free version limitations",
        "Complex advanced features",
        "Learning curve"
      ]),
      detailInfo: "InVideo is a web platform for creating professional videos. It uses AI for automatic video generation from text, offers thousands of templates, and enables easy team collaboration. Suitable for marketers, businesses, and content creators.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "15",
        enterprise: "30"
      })
    }
  }

  return translations[productName]
} 