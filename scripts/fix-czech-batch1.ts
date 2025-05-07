import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will update Czech products to English - batch 1 (first 10 products)
async function fixCzechProductsBatch1() {
  console.log('Starting to fix Czech language products - Batch 1...')

  try {
    // Mapping of Czech product info to English translations for first 10 products
    const czechToEnglishTranslations = [
      {
        // Klaviyo
        id: "ae2da4c1-830a-488c-a4b7-ba124316eebd",
        data: {
          description: "AI-powered email marketing platform specialized in personalization and automation for e-commerce.",
          tags: "email marketing, personalization, e-commerce, marketing automation, AI",
          advantages: "Advanced segmentation capabilities, Powerful automation workflows, Real-time analytics, E-commerce integrations",
          disadvantages: "Higher price point for small businesses, Complex interface for beginners, Advanced features require higher tier plans",
          detailInfo: "Klaviyo is an AI-driven email marketing platform specifically designed for e-commerce businesses. It combines customer data, analytics, and marketing automation to deliver highly personalized customer experiences. The platform uses AI to segment audiences, predict customer behavior, and optimize campaign timing and content. Klaviyo integrates seamlessly with major e-commerce platforms like Shopify, WooCommerce, and Magento.",
          pricingInfo: "Klaviyo offers tiered pricing based on the number of contacts: Free plan for up to 250 contacts and 500 email sends, then paid plans starting around $20/month for 500 contacts, scaling up as contact list grows. Features increase with higher tiers."
        }
      },
      {
        // Teikametrics
        id: "19c9b50c-7b75-4bab-9287-0df002d9eb95",
        data: {
          description: "AI platform for optimizing advertising on Amazon and other marketplace platforms using machine learning.",
          tags: "amazon advertising, marketplace optimization, e-commerce, PPC management, advertising AI",
          advantages: "Automated bid optimization, Amazon-specific insights, Comprehensive marketplace analytics, Profit-driven advertising strategy",
          disadvantages: "Primarily focused on Amazon and Walmart, Significant investment for small sellers, Learning curve for advanced features",
          detailInfo: "Teikametrics is an AI-powered advertising optimization platform designed specifically for marketplace sellers on Amazon and Walmart. The platform uses machine learning algorithms to analyze product data, market trends, and advertising performance to automate bid management and keyword strategies. Teikametrics focuses on maximizing profitability rather than just sales volume, taking into account all costs associated with selling products.",
          pricingInfo: "Teikametrics offers several pricing tiers based on monthly ad spend. Plans typically start at around $99/month for sellers with lower ad spend and scale up for enterprise sellers with higher advertising budgets. Custom pricing is available for large-scale operations."
        }
      },
      {
        // Reflektion
        id: "6fd2fc17-0d9b-466b-a9be-4c3cb96c730c",
        data: {
          description: "AI platform for personalizing e-commerce experiences with individualized product recommendations based on customer behavior.",
          tags: "e-commerce personalization, product recommendations, customer experience, retail AI, conversion optimization",
          advantages: "Real-time personalization, 1:1 individualized experiences, Advanced search functionality, Cross-channel consistency",
          disadvantages: "Enterprise-level solution not suited for small retailers, Complex implementation, Requires significant data volume for optimal results",
          detailInfo: "Reflektion is an AI-powered personalization platform that creates individualized shopping experiences across all customer touchpoints. Unlike traditional personalization that relies on segment-based personas, Reflektion creates 1:1 experiences in real-time based on individual shopper intent. The platform's technology encompasses site search, product recommendations, category and landing pages, and email, creating a consistent personalized experience across channels.",
          pricingInfo: "Reflektion prices its platform based on a customized model that considers site traffic, number of SKUs, and required features. As an enterprise solution, pricing typically starts in the thousands per month, with annual contracts being the standard offering model."
        }
      },
      {
        // Typeface.ai
        id: "a8196ba8-6c89-4259-aca0-fbab388b201c",
        data: {
          description: "AI platform for generating and personalizing branded content.",
          tags: "content generation, brand personalization, generative AI, marketing content, brand management",
          advantages: "Brand-consistent content generation, Enterprise-grade content controls, Multi-channel output formats, Integration with existing tech stacks",
          disadvantages: "Enterprise focus with premium pricing, Significant setup time for brand voice training, Complex user permissions system",
          detailInfo: "Typeface.ai is an enterprise-focused generative AI platform that enables companies to create on-brand content at scale. The platform combines generative AI with a company's brand guidelines, messaging, and visual identity to produce consistent content across marketing channels. Typeface allows teams to generate various content types including social media posts, blog articles, product descriptions, and visual assets while maintaining brand voice and compliance requirements.",
          pricingInfo: "Typeface.ai operates on an enterprise pricing model with customized quotes based on the organization's size and needs. Pricing typically starts at several thousand dollars per month, with annual contracts that include onboarding and training services for brand implementation."
        }
      },
      {
        // Assiduus AI
        id: "d13c5205-7f5a-429f-9080-26e0f87e8dad",
        data: {
          description: "AI platform for automating accounting and financial management for e-commerce businesses and online sellers.",
          tags: "accounting automation, e-commerce finance, financial management, AI bookkeeping, marketplace integration",
          advantages: "Automated reconciliation, Real-time financial reporting, Marketplace integration, Tax compliance automation",
          disadvantages: "Limited integrations with some smaller platforms, Regional tax compliance varies, Higher cost than basic accounting software",
          detailInfo: "Assiduus AI is a financial automation platform specifically designed for e-commerce businesses, offering automated accounting, reconciliation, and financial management services. The platform connects with major marketplaces, payment gateways, and banking systems to automatically reconcile transactions, categorize expenses, and generate financial reports. Using AI, Assiduus identifies patterns in financial data to provide insights and forecasting for e-commerce businesses.",
          pricingInfo: "Assiduus offers tiered subscription plans starting at approximately $199/month for basic services and scaling up to $499+/month for enterprise solutions with advanced features. Pricing is typically based on transaction volume, number of marketplace integrations, and level of service required."
        }
      },
      {
        // Kaiser Permanente AI Health Hub
        id: "37162e6d-95bb-41eb-b217-84f76cd6b485",
        data: {
          description: "Integrated healthcare system using AI for disease prevention, treatment personalization, and improved patient outcomes.",
          tags: "healthcare AI, preventive medicine, personalized treatment, health system, patient care",
          advantages: "Comprehensive integrated healthcare approach, Preventive care focus, Electronic health record integration, Data-driven treatment plans",
          disadvantages: "Limited to Kaiser Permanente members, Regional availability limitations, Requires digital literacy",
          detailInfo: "Kaiser Permanente's AI Health Hub represents the organization's integration of artificial intelligence into its comprehensive healthcare system. The platform leverages patient data from its extensive electronic health record system to predict health risks, personalize treatment plans, and improve preventive care. AI tools assist physicians in diagnosis, treatment selection, and patient monitoring, while also empowering patients through digital health interfaces and personalized health recommendations.",
          pricingInfo: "Access to Kaiser Permanente's AI health tools is included as part of membership in Kaiser Permanente health plans. These health plans vary in cost depending on coverage level, region, and whether they're individual or employer-sponsored plans. There is no separate pricing for the AI tools themselves."
        }
      },
      {
        // Mayo Clinic AI Healthcare Platform
        id: "6526fdbb-840f-4694-a9ef-06d40be74335",
        data: {
          description: "Prestigious healthcare institution using artificial intelligence for diagnostics, personalized treatment, and medical research.",
          tags: "healthcare AI, medical diagnostics, personalized medicine, clinical research, patient care",
          advantages: "World-class medical expertise, Advanced diagnostic capabilities, Integration with clinical workflow, Extensive research validation",
          disadvantages: "Primarily available through Mayo Clinic system, Higher cost specialized care, Geographic access limitations",
          detailInfo: "Mayo Clinic's AI Healthcare Platform represents the institution's implementation of artificial intelligence across its healthcare delivery system. The platform encompasses AI tools for diagnostic imaging analysis, clinical decision support, personalized treatment recommendations, and predictive analytics for patient outcomes. Mayo Clinic also leverages AI for research purposes, analyzing vast datasets to identify patterns and develop new approaches to treatment. The platform combines Mayo's clinical expertise with cutting-edge AI technology to enhance patient care.",
          pricingInfo: "Mayo Clinic's AI healthcare technologies are implemented within its healthcare system and accessible through normal patient care channels. Costs vary based on specific treatments, insurance coverage, and whether services are delivered at Mayo Clinic facilities or through partnership programs. Some specialized AI diagnostic services may involve additional fees."
        }
      },
      {
        // D-ID
        id: "0aa48306-60c9-41d0-8366-07fa77d3fc41",
        data: {
          description: "AI platform for creating and animating digital avatars and synthetic media.",
          tags: "digital avatars, synthetic media, AI video, face animation, virtual presenters",
          advantages: "High-quality realistic animations, Text-to-video capabilities, Multilingual support, Developer API access",
          disadvantages: "Premium pricing for commercial use, Limited customization in basic plans, Some cultural nuances may be missed",
          detailInfo: "D-ID is an advanced AI platform that specializes in creating and animating photorealistic digital avatars. The technology allows users to transform static images into speaking video avatars by combining facial animation technology with synthetic voice generation. D-ID's Creative Reality™ platform enables the creation of personalized videos at scale, supporting applications in employee training, education, marketing, customer service, and entertainment. The platform offers both self-service tools and API access for enterprise integration.",
          pricingInfo: "D-ID offers tiered pricing plans: A free trial with limited features, a Creator plan at approximately $5.99/month for personal use, Professional plans starting around $49/month with more features and higher usage limits, and Enterprise plans with custom pricing for high-volume needs and advanced features."
        }
      },
      {
        // Talkspace
        id: "b0da424b-58c7-4504-98fa-cc3766c858ae",
        data: {
          description: "Online therapy platform using AI to connect patients with therapists and provide digital mental health services.",
          tags: "online therapy, mental health, teletherapy, counseling, digital health",
          advantages: "Convenient access to licensed therapists, Flexible communication options, More affordable than traditional therapy, Privacy and anonymity",
          disadvantages: "Limited insurance coverage, Not suitable for severe mental health crises, Less personal than face-to-face therapy",
          detailInfo: "Talkspace is an online therapy platform that connects users with licensed mental health professionals through secure messaging, video, and audio communications. The platform uses AI to match patients with appropriate therapists based on their specific needs and preferences. Talkspace offers various therapy approaches including cognitive behavioral therapy, psychodynamic therapy, mindfulness, and more. Users can communicate with their therapists on their own schedule through the platform's encrypted messaging system, with therapists responding one to two times daily.",
          pricingInfo: "Talkspace subscription plans typically range from $65 to $99 per week, billed monthly, depending on the chosen communication methods and frequency. Options include text-only therapy, text with audio/video sessions, or couples therapy. Some insurance plans and employee assistance programs now cover Talkspace services."
        }
      },
      {
        // Ginger
        id: "53cdc676-f63f-4b9a-8399-a8ceaeff008c",
        data: {
          description: "Comprehensive mental health platform with AI coaching, therapy, and psychiatry care on demand.",
          tags: "mental health, behavioral health, teletherapy, emotional support, workplace benefits",
          advantages: "On-demand mental health support, Tiered care approach, Text-based coaching availability, Integration with employee benefits",
          disadvantages: "Primarily available through employers, Limited psychiatry appointment availability, Not designed for severe mental health conditions",
          detailInfo: "Ginger is a mental health platform that provides on-demand coaching, therapy, and psychiatry services through a digital platform. The service uses AI to match users with appropriate care levels and providers, while also supporting coaches with AI-driven recommendations based on clinical protocols. Ginger offers a stepped care model, starting with 24/7 behavioral health coaching via text, and escalating to video-based therapy and psychiatry when needed. The platform is primarily distributed through employers and health plans as a benefit.",
          pricingInfo: "Ginger is typically provided as an employee benefit through employers or health plans without direct cost to users. For organizations, pricing is typically per-employee-per-month, with rates varying based on organization size and service tier. When purchased individually (where available), coaching packages start around $129/month, with therapy sessions costing approximately $119-179 each."
        }
      }
    ]

    // Update each product
    for (const translation of czechToEnglishTranslations) {
      const product = await prisma.product.findUnique({
        where: { id: translation.id }
      })

      if (product) {
        await prisma.product.update({
          where: { id: translation.id },
          data: translation.data
        })
        console.log(`✅ Updated product to English: ${product.name}`)
      } else {
        console.log(`⚠️ Product with ID ${translation.id} not found`)
      }
    }

    console.log('✨ Batch 1 products updated to English!')
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCzechProductsBatch1() 