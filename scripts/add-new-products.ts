import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addNewProducts() {
  const products = [
    {
      name: "GetResponse",
      description: "All-in-one marketing platform with email marketing, automation, and landing page builder powered by AI",
      price: 49,
      category: "Marketing",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=GetResponse",
      tags: JSON.stringify(["Email Marketing", "Marketing Automation", "AI Marketing", "Landing Pages"]),
      advantages: JSON.stringify([
        "Easy-to-use interface",
        "Comprehensive marketing tools",
        "AI-powered features",
        "Good value for money"
      ]),
      disadvantages: JSON.stringify([
        "Limited free plan",
        "Advanced features only in higher tiers",
        "Learning curve for automation",
        "Email template editor could be more flexible"
      ]),
      detailInfo: "GetResponse is a comprehensive marketing platform that combines email marketing, automation, and website building tools. It features AI-powered solutions for content creation, campaign optimization, and audience targeting. The platform offers advanced segmentation, A/B testing, and detailed analytics.",
      pricingInfo: JSON.stringify({
        basic: "49",
        pro: "99",
        enterprise: "Custom"
      }),
      externalUrl: "https://www.getresponse.com",
      hasTrial: true
    },
    {
      name: "Semrush",
      description: "Comprehensive SEO and digital marketing platform with AI-powered features",
      price: 119.95,
      category: "SEO",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Semrush",
      tags: JSON.stringify(["SEO", "Digital Marketing", "Content Marketing", "Market Research"]),
      advantages: JSON.stringify([
        "Comprehensive SEO tools",
        "Competitor analysis",
        "Content optimization",
        "Marketing analytics"
      ]),
      disadvantages: JSON.stringify([
        "Expensive for small businesses",
        "Complex interface",
        "Learning curve",
        "Limited features in basic plan"
      ]),
      detailInfo: "Semrush is an all-in-one digital marketing suite that offers tools for SEO, content marketing, competitor research, PPC and social media marketing. It uses AI to provide insights and recommendations for improving online visibility.",
      pricingInfo: JSON.stringify({
        basic: "119.95",
        pro: "229.95",
        enterprise: "449.95"
      }),
      externalUrl: "https://www.semrush.com",
      hasTrial: true
    },
    {
      name: "Anyword",
      description: "AI-powered copywriting platform for marketing and sales content",
      price: 39,
      category: "Copywriting",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Anyword",
      tags: JSON.stringify(["AI Writing", "Copywriting", "Marketing", "Content Generation"]),
      advantages: JSON.stringify([
        "Predictive performance scoring",
        "Multiple content types",
        "Easy to use",
        "Custom branded voice"
      ]),
      disadvantages: JSON.stringify([
        "Limited templates in basic plan",
        "Can be repetitive",
        "Higher plans needed for advanced features",
        "Limited language support"
      ]),
      detailInfo: "Anyword is an AI copywriting tool that helps create marketing copy with predictive performance scores. It can generate various types of content while maintaining your brand voice and style. The platform specializes in creating high-converting copy for ads, emails, and landing pages.",
      pricingInfo: JSON.stringify({
        basic: "39",
        pro: "99",
        enterprise: "299"
      }),
      externalUrl: "https://www.anyword.com",
      hasTrial: true
    },
    {
      name: "ProWritingAid",
      description: "Advanced AI writing assistant and style editor for professional writing",
      price: 20,
      category: "Writing",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=ProWritingAid",
      tags: JSON.stringify(["Writing", "Grammar", "Style Editing", "AI Writing"]),
      advantages: JSON.stringify([
        "Detailed writing analysis",
        "Style suggestions",
        "Integration with many platforms",
        "Comprehensive reports"
      ]),
      disadvantages: JSON.stringify([
        "Can be overwhelming",
        "Slower than some competitors",
        "Desktop app required for some features",
        "Learning curve for reports"
      ]),
      detailInfo: "ProWritingAid is a comprehensive writing assistant that combines grammar checking, style editing, and writing mentorship. It offers detailed reports and suggestions for improving your writing, with specialized features for different types of content including academic, business, and creative writing.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "20",
        enterprise: "79"
      }),
      externalUrl: "https://www.prowritingaid.com",
      hasTrial: true
    },
    {
      name: "Writesonic",
      description: "AI content generation platform for marketing and business content",
      price: 12.67,
      category: "Copywriting",
      imageUrl: "https://placehold.co/800x450/f3f4f6/94a3b8?text=Writesonic",
      tags: JSON.stringify(["AI Writing", "Content Generation", "Marketing", "SEO"]),
      advantages: JSON.stringify([
        "Affordable pricing",
        "Multiple content types",
        "Good output quality",
        "User-friendly interface"
      ]),
      disadvantages: JSON.stringify([
        "Credit-based system",
        "Inconsistent quality",
        "Limited customization",
        "Basic features in free plan"
      ]),
      detailInfo: "Writesonic is an AI writing tool that helps create various types of content, from blog posts to ad copy. It offers competitive pricing and a user-friendly interface for content generation. The platform includes features for SEO optimization and supports multiple languages.",
      pricingInfo: JSON.stringify({
        basic: "12.67",
        pro: "45",
        enterprise: "195"
      }),
      externalUrl: "https://www.writesonic.com",
      hasTrial: true
    }
  ]

  for (const product of products) {
    try {
      // Kontrola, zda produkt již existuje
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: product.name
        }
      })

      if (!existingProduct) {
        // Vytvoření nového produktu
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            tags: product.tags,
            advantages: JSON.stringify(product.advantages || []),
            disadvantages: JSON.stringify(product.disadvantages || []),
            detailInfo: product.detailInfo || '',
            pricingInfo: typeof product.pricingInfo === 'object' ? JSON.stringify(product.pricingInfo) : product.pricingInfo,
            externalUrl: product.externalUrl || '',
            hasTrial: Boolean(product.hasTrial)
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