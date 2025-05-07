import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will update Czech products to English - batch 2 (products 11-20)
async function fixCzechProductsBatch2() {
  console.log('Starting to fix Czech language products - Batch 2...')

  try {
    // Mapping of Czech product info to English translations for products 11-20
    const czechToEnglishTranslations = [
      {
        // Runway ML
        id: "64a789b9-ea6d-4216-a873-754f32e4744a",
        data: {
          description: "Creative AI toolkit for video editing and visual effects creation.",
          tags: "AI video editing, creative tools, visual effects, generative AI, video production",
          advantages: "Advanced AI-powered editing tools, Professional-grade output quality, Unique generative capabilities, Integration with standard workflows",
          disadvantages: "Steep learning curve for advanced features, Higher cost for professional tiers, Requires significant computing resources",
          detailInfo: "Runway ML is a cutting-edge AI creative suite that empowers creators, filmmakers, and artists to leverage artificial intelligence in their video workflows. The platform offers tools for video editing, visual effects generation, motion tracking, background removal, and generative content creation. Runway's technology includes features like Gen-2 for text-to-video creation, inpainting, image-to-image transformation, and sophisticated video effects that would traditionally require extensive expertise and expensive software.",
          pricingInfo: "Runway offers multiple pricing tiers: A free Basic plan with limited usage, a Standard plan at approximately $15/month with increased generation limits, and a Pro plan at around $35/month with priority access and higher resolution outputs. Enterprise pricing is available for teams and businesses requiring higher volume and custom solutions."
        }
      },
      {
        // Shopify
        id: "e4374dca-c97e-4025-829b-c379a9779536",
        data: {
          description: "Comprehensive e-commerce platform with integrated AI features for personalization, automation, and optimization.",
          tags: "e-commerce, online store, retail, digital commerce, business tools",
          advantages: "User-friendly interface, Extensive app ecosystem, Built-in marketing tools, Mobile-responsive designs",
          disadvantages: "Transaction fees outside Shopify Payments, Premium features require higher-tier plans, Advanced customization can be complex",
          detailInfo: "Shopify is a leading e-commerce platform that enables businesses of all sizes to create and manage online stores. The platform has increasingly integrated AI-powered features to enhance merchant capabilities, including product recommendations, customer segmentation, inventory management, fraud detection, and marketing automation. Shopify's ecosystem includes themes, apps, and tools that help merchants optimize their stores, improve customer experience, and increase sales through data-driven insights.",
          pricingInfo: "Shopify offers several plans: Basic Shopify at $29/month, Shopify at $79/month, and Advanced Shopify at $299/month. All plans include core e-commerce functionality, with higher tiers offering reduced transaction fees and additional features. Shopify Plus, the enterprise solution, starts around $2,000/month. A 10% discount is available with annual billing."
        }
      },
      {
        // K Health
        id: "b29198e3-728e-4462-8c45-5bdebd21a73e",
        data: {
          description: "AI-powered health platform combining symptom diagnosis with virtual doctor consultations.",
          tags: "telehealth, digital health, symptom checker, virtual care, primary care",
          advantages: "Affordable healthcare access, 24/7 availability, AI symptom assessment, Prescription service where available",
          disadvantages: "Not suitable for emergencies, Limited specialist care, Not a replacement for in-person examinations in complex cases",
          detailInfo: "K Health is a digital healthcare platform that uses artificial intelligence to provide personalized health assessments and connect users with medical professionals. The platform's AI system is trained on millions of clinical data points and medical records to help users understand how doctors have diagnosed and treated patients with similar symptoms. Users can chat with the AI about their symptoms, receive potential condition matches, and then connect with licensed physicians for diagnosis, treatment plans, and prescriptions when needed.",
          pricingInfo: "K Health offers several pricing options: A free symptom checker tool, pay-as-you-go virtual visits starting around $35, and a membership program at approximately $29/month (or $99/year) that includes unlimited virtual primary care visits and chronic condition management. Additional fees may apply for certain medications or specialized services."
        }
      },
      {
        // This Person Does Not Exist
        id: "ea860d5f-8809-4e6b-a071-c1d2b6e94f60",
        data: {
          description: "AI generator of realistic portraits of non-existent people.",
          tags: "generative AI, synthetic media, GAN, artificial faces, digital identity",
          advantages: "Infinite unique face generation, Photo-realistic quality, Free to use, Educational tool for AI capabilities",
          disadvantages: "Limited control over generated outputs, No commercial usage rights clarity, Cannot generate consistent identities across multiple images",
          detailInfo: "This Person Does Not Exist is a website that uses a generative adversarial network (GAN) called StyleGAN to create hyper-realistic images of people who don't actually exist. Each time the page is refreshed, the AI generates a completely new, synthetic face with remarkable detail and realism. The project demonstrates the capabilities of modern AI in creating convincing synthetic media and has applications in privacy protection, entertainment, and artistic projects, while also raising awareness about the potential for AI-generated media.",
          pricingInfo: "This Person Does Not Exist is a free web service with no direct monetization. The underlying StyleGAN technology is open source, though commercial applications developed using similar technology may have associated costs. For high-volume or specific use cases, developers typically need to implement their own StyleGAN infrastructure."
        }
      },
      {
        // Voicemod
        id: "5c4fba04-be22-43c1-b9ad-a392495f07de",
        data: {
          description: "AI software for real-time voice modification.",
          tags: "voice changer, voice effects, audio modification, gaming, streaming",
          advantages: "Real-time voice transformation, Extensive voice effect library, Gaming platform integration, Custom voice creation",
          disadvantages: "Best features require premium subscription, Some effects sound artificial, Occasional latency issues in high-demand settings",
          detailInfo: "Voicemod is an AI-powered voice changing software that allows users to modify their voice in real-time during gaming, streaming, or online communication. The technology uses machine learning to transform voices with various effects, character voices, and sound effects while maintaining natural speech patterns. Voicemod integrates with popular platforms like Discord, Zoom, Skype, and gaming communication tools. The Pro version includes features like Voicelab for custom voice creation and Voice AI for developing unique voice skins.",
          pricingInfo: "Voicemod offers a free version with limited voices and features. The Pro subscription costs approximately $35/year and provides access to all voices, the Voicelab creator, and premium effects. Lifetime licenses are occasionally offered as special promotions. Business licensing is available for commercial applications."
        }
      },
      {
        // Artbreeder
        id: "a211c18b-d067-4068-89d2-2ba5d0532445",
        data: {
          description: "AI platform for creative mixing and generating artistic images.",
          tags: "generative art, AI art, creative tools, image synthesis, digital art",
          advantages: "Intuitive creative control, Unique image breeding concept, Wide variety of output styles, Community sharing features",
          disadvantages: "Limited export resolution in free tier, Advanced features require subscription, Some image categories have restrictions",
          detailInfo: "Artbreeder is a creative platform that uses artificial intelligence to enable users to create and blend images in innovative ways. The system is based on StyleGAN and BigGAN technologies, allowing users to 'breed' images by combining characteristics from multiple parent images or adjusting various artistic parameters. Artbreeder offers different models specialized for portraits, landscapes, paintings, album covers, and more. The platform has become popular among artists, game developers, and creative professionals for ideation, concept art, and generating unique visual assets.",
          pricingInfo: "Artbreeder operates on a freemium model. The free tier offers basic functionality with limited resolution and creation slots. Premium subscriptions start at around $9/month, offering higher-resolution exports, more creation slots, batch downloading, and commercial usage rights. Business and enterprise options are available for professional creative teams."
        }
      },
      {
        // LALAL.AI
        id: "b12f78ac-f2ce-4fb3-b9f0-6dcc15ebf300",
        data: {
          description: "AI tool for separating music into individual tracks.",
          tags: "audio separation, stem extraction, music production, sound engineering, vocal isolation",
          advantages: "High-quality stem separation, Multiple stem extraction options, Fast processing, Simple user interface",
          disadvantages: "Limited free processing minutes, Complete accuracy not guaranteed for all audio types, Higher cost for professional needs",
          detailInfo: "LALAL.AI is an advanced audio processing service that uses artificial intelligence to separate music into isolated components such as vocals, drums, bass, piano, and other instruments. The platform employs proprietary neural network technology that enables high-quality extraction with minimal artifacts. LALAL.AI supports various audio formats and allows users to upload tracks from their devices or via URL. The service is widely used by music producers, DJs, remix artists, karaoke creators, and music students for various creative and educational purposes.",
          pricingInfo: "LALAL.AI offers a free tier with limited processing minutes. Paid plans include Lite (approximately $15 for 90 minutes of processing), Plus ($40 for 300 minutes), and Professional ($80 for 600 minutes). The service also offers a subscription model with monthly plans starting at around $30/month for regular users. Enterprise solutions are available for businesses with high-volume needs."
        }
      },
      {
        // Mubert
        id: "065ac8da-c87b-48ea-a1b0-e81a6a07652d",
        data: {
          description: "AI platform for generating adaptive music and soundscapes.",
          tags: "generative music, AI composition, royalty-free music, audio generation, adaptive sounds",
          advantages: "Unlimited unique music generation, Royalty-free licensing, Mood and genre customization, API access for developers",
          disadvantages: "Limited fine-grained control in basic versions, Some generated tracks can sound similar, Advanced customization requires technical knowledge",
          detailInfo: "Mubert is an AI-powered music generation platform that creates endless, royalty-free music for various applications. The technology uses generative models trained on original samples from musicians to create continuous, non-repeating compositions in various genres and moods. Mubert offers solutions for content creators, businesses, app developers, and individuals who need background music for videos, streams, apps, retail environments, or personal enjoyment. The platform also provides an API for developers to integrate adaptive music generation into their own applications.",
          pricingInfo: "Mubert offers several pricing tiers: A free plan with limited features, a Pro plan for individuals at approximately $8-12/month with unlimited generation and downloads, and Business plans starting around $20/month. Enterprise and API pricing is customized based on usage requirements. Commercial licensing options are available for businesses needing music for public spaces or commercial content."
        }
      },
      {
        // Amper Music
        id: "53970a9c-fb92-4b37-82f9-de4a96d8472a",
        data: {
          description: "AI compositional platform for creating professional music.",
          tags: "AI music composition, soundtrack generation, royalty-free music, content creation, music production",
          advantages: "Professional-quality output, Easy customization interface, Commercial licensing included, Fast production timeline",
          disadvantages: "Limited advanced musical control, Now primarily available through enterprise API, Original consumer platform discontinued",
          detailInfo: "Amper Music (now part of Shutterstock as Shutterstock Music) is an AI music composition platform that enables users to create customized, royalty-free music tracks. The technology employs artificial intelligence to compose original music based on user-selected parameters like genre, mood, length, and instrumentation. Originally available as a standalone platform, Amper's technology is now integrated into Shutterstock's offerings, providing content creators with tools to generate unique soundtracks for videos, podcasts, games, and other media without requiring musical expertise or expensive licensing.",
          pricingInfo: "Amper Music's consumer platform has been acquired by Shutterstock and integrated into their services. Current pricing is structured through Shutterstock's subscription models, typically ranging from $16-49/month for standard subscriptions with music capabilities. Enterprise API access for companies looking to integrate AI music generation is available with custom pricing based on volume and specific requirements."
        }
      },
      {
        // Soundraw
        id: "ce39c909-c250-4cc9-ba79-b05503a31f2c",
        data: {
          description: "AI platform for generating unique royalty-free music.",
          tags: "AI music generation, royalty-free music, content creation, soundtrack, music production",
          advantages: "High-quality music generation, Intuitive customization controls, Full copyright clearance, Regular updates with new styles",
          disadvantages: "Limited free plan options, Advanced edits require musical knowledge, Some genres better represented than others",
          detailInfo: "Soundraw is an AI-powered music creation platform that enables content creators to generate original, royalty-free music tracks customized to their specific needs. Users can specify parameters such as genre, mood, length, tempo, and instruments, and the AI will compose a unique piece of music matching those requirements. Soundraw's technology creates complete arrangements with multiple instrument tracks that can be individually adjusted. The platform is designed for YouTubers, podcast producers, filmmakers, and other content creators who need custom music without copyright concerns.",
          pricingInfo: "Soundraw offers several subscription options: A limited free plan for evaluation, a Basic plan at approximately $19/month with standard quality exports and limited monthly generations, and a Pro plan at around $39/month with unlimited generations, high-quality exports, and advanced editing features. Annual subscriptions offer a discount. Business licenses for high-volume needs are available with custom pricing."
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

    console.log('✨ Batch 2 products updated to English!')
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCzechProductsBatch2() 