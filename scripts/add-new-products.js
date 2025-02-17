import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addNewProducts() {
  const products = [
    {
      name: "ClickUp",
      description: "AI-enhanced project management and productivity platform",
      price: 7,
      category: "Project Management",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=ClickUp",
      tags: JSON.stringify(["Project Management", "Task Management", "Team Collaboration", "Productivity"]),
      advantages: JSON.stringify([
        "All-in-one solution",
        "Customizable workflows",
        "AI task management",
        "Multiple views"
      ]),
      disadvantages: JSON.stringify([
        "Learning curve",
        "Feature overwhelm",
        "Mobile app limitations",
        "Complex pricing"
      ]),
      detailInfo: "ClickUp combines project management, task tracking, and team collaboration with AI features. It offers customizable workflows, document management, and various productivity tools in one platform.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "7",
        enterprise: "19"
      }),
      externalUrl: "https://www.clickup.com",
      hasTrial: true
    },
    {
      name: "Sprout Social",
      description: "AI-powered social media management and analytics platform",
      price: 89,
      category: "Social Media",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Sprout+Social",
      tags: JSON.stringify(["Social Media", "Analytics", "Content Management", "Marketing"]),
      advantages: JSON.stringify([
        "Comprehensive analytics",
        "Smart scheduling",
        "Team collaboration",
        "CRM integration"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing",
        "Complex interface",
        "Limited free features",
        "Learning period"
      ]),
      detailInfo: "Sprout Social helps businesses manage their social media presence with AI-powered insights, scheduling, and analytics. It offers advanced reporting, team collaboration, and customer engagement tools.",
      pricingInfo: JSON.stringify({
        basic: "89",
        pro: "149",
        enterprise: "249"
      }),
      externalUrl: "https://www.sproutsocial.com",
      hasTrial: true
    },
    {
      name: "LiveChat",
      description: "AI-enhanced customer service and chat platform",
      price: 20,
      category: "Customer Service",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=LiveChat",
      tags: JSON.stringify(["Customer Service", "Live Chat", "AI Chat", "Support"]),
      advantages: JSON.stringify([
        "AI chatbot integration",
        "Real-time visitor tracking",
        "Multi-channel support",
        "Analytics dashboard"
      ]),
      disadvantages: JSON.stringify([
        "Per-agent pricing",
        "Limited free features",
        "Advanced features costly",
        "Setup time"
      ]),
      detailInfo: "LiveChat combines human support with AI capabilities to provide efficient customer service. Features include chatbots, visitor tracking, and integration with various platforms and CRM systems.",
      pricingInfo: JSON.stringify({
        basic: "20",
        pro: "33",
        enterprise: "59"
      }),
      externalUrl: "https://www.livechat.com",
      hasTrial: true
    },
    {
      name: "AdCreative.ai",
      description: "AI-powered ad creative generation platform",
      price: 29,
      category: "Marketing",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=AdCreative.ai",
      tags: JSON.stringify(["Advertising", "Creative Generation", "Marketing", "AI Design"]),
      advantages: JSON.stringify([
        "Quick ad generation",
        "Multiple formats",
        "Performance testing",
        "Brand consistency"
      ]),
      disadvantages: JSON.stringify([
        "Limited customization",
        "Usage limits",
        "Style restrictions",
        "Learning curve"
      ]),
      detailInfo: "AdCreative.ai helps marketers generate and optimize ad creatives using artificial intelligence. It creates various ad formats while maintaining brand consistency and offers performance testing features.",
      pricingInfo: JSON.stringify({
        basic: "29",
        pro: "59",
        enterprise: "299"
      }),
      externalUrl: "https://www.adcreative.ai",
      hasTrial: true
    },
    {
      name: "Lumen5",
      description: "AI video creation platform for social media and marketing",
      price: 29,
      category: "Video Creation",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Lumen5",
      tags: JSON.stringify(["Video Creation", "Social Media", "Content Marketing", "AI Video"]),
      advantages: JSON.stringify([
        "Text to video",
        "Template library",
        "Brand customization",
        "Stock media access"
      ]),
      disadvantages: JSON.stringify([
        "Limited animation options",
        "Basic editing tools",
        "Watermark in free",
        "Template limitations"
      ]),
      detailInfo: "Lumen5 transforms text content into engaging videos using AI. It offers templates, stock media, and brand customization features, making it easy to create professional videos for social media and marketing.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "29",
        enterprise: "149"
      }),
      externalUrl: "https://www.lumen5.com",
      hasTrial: true
    },
    {
      name: "Brandwatch",
      description: "AI-powered social listening and consumer intelligence platform",
      price: 108,
      category: "Analytics",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Brandwatch",
      tags: JSON.stringify(["Social Listening", "Analytics", "Market Research", "Consumer Intelligence"]),
      advantages: JSON.stringify([
        "Deep insights",
        "Real-time monitoring",
        "Advanced analytics",
        "Custom reporting"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise pricing",
        "Complex interface",
        "Steep learning curve",
        "Data overwhelm"
      ]),
      detailInfo: "Brandwatch uses AI to analyze social media, news, and online conversations to provide consumer insights. It offers real-time monitoring, trend analysis, and detailed reporting for brand and market intelligence.",
      pricingInfo: JSON.stringify({
        basic: "108",
        pro: "999",
        enterprise: "Custom"
      }),
      externalUrl: "https://www.brandwatch.com",
      hasTrial: true
    }
  ]

  for (const product of products) {
    try {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: product.name
        }
      })

      if (!existingProduct) {
        // Create new product
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            tags: product.tags,
            advantages: product.advantages,
            disadvantages: product.disadvantages,
            detailInfo: product.detailInfo,
            pricingInfo: product.pricingInfo,
            externalUrl: product.externalUrl,
            hasTrial: product.hasTrial
          }
        })
        console.log(`Product ${product.name} has been successfully added.`)
      } else {
        console.log(`Product ${product.name} already exists, skipping...`)
      }
    } catch (error) {
      console.error(`Error adding product ${product.name}:`, error)
    }
  }
}

addNewProducts()
  .catch((error) => {
    console.error('Error running script:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 