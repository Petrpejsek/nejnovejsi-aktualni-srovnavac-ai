import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/products/translate - Translate all products to English
export async function POST() {
  try {
    // First, get all products to get their IDs
    const existingProducts = await prisma.product.findMany({
      select: { id: true }
    })

    console.log('Existing products:', existingProducts)

    // Update all products with English translations
    const updates = await Promise.all(existingProducts.map(async (product) => {
      // Get the translation data based on the product ID
      const translationData = getTranslationData(product.id)
      
      if (!translationData) {
        console.log(`No translation data for product ${product.id}`)
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

function getTranslationData(productId: string) {
  const translations: Record<string, any> = {
    "clsb7kk4g0000v5089jk0qw0p": {
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
    "clsb7kk4g0001v508yl3lw9q2": {
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
    "clsb7kk4g0002v508kc9lw9q3": {
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
    "clsb7kk4g0003v508kc9lw9q4": {
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
    "clsb7kk4g0004v508kc9lw9q5": {
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
    }
  }

  return translations[productId]
} 