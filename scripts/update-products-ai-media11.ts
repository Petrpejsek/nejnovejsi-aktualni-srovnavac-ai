import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI media generation and content creation tools - batch 11
const aiMediaProducts = [
  {
    externalUrl: "https://www.vidnoz.com",
    data: {
      name: "Vidnoz",
      description: "Vidnoz is an AI video generation platform that creates professional videos with lifelike AI avatars, text-to-speech voiceovers, and customizable templates for marketing, training, and educational content.",
      price: 29.99,
      category: "AI Video Generation",
      imageUrl: "https://www.vidnoz.com/assets/img/vidnoz-logo.svg",
      tags: JSON.stringify(["AI video creation", "AI avatars", "text-to-speech", "video templates", "explainer videos"]),
      advantages: JSON.stringify([
        "Lifelike AI avatars with natural movements",
        "High-quality text-to-speech in multiple languages",
        "Pre-made video templates for different industries",
        "No video editing skills required",
        "Customizable backgrounds and scenes",
        "Screen recording with AI avatar",
        "Auto-generation from text scripts",
        "Commercial usage rights included",
        "Cloud-based with no software installation",
        "Batch video creation capabilities"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced video editing options",
        "Premium avatars and features require higher tiers",
        "Some AI voices sound less natural than others",
        "Video length limitations on lower-tier plans"
      ]),
      detailInfo: "Vidnoz provides an AI-powered video creation platform that enables users to produce professional-quality videos featuring realistic digital avatars without requiring video production expertise or equipment. The platform offers over 80 AI avatars with diverse appearances, speaking styles, and languages, allowing users to select presenters that best represent their brand. These avatars are designed with natural facial expressions, gestures, and lip-syncing to create an engaging and authentic viewing experience. Vidnoz's text-to-speech technology converts written scripts into natural-sounding voiceovers available in more than 70 languages and 300+ voice options, with the ability to adjust tone, pace, and emphasis for optimal delivery. For streamlined video creation, the platform provides hundreds of customizable templates tailored to specific industries and use cases, including marketing videos, product demonstrations, e-learning modules, and corporate communications. Beyond avatars, Vidnoz offers a comprehensive set of video creation tools including screen recording with AI avatar overlays, background customization, media asset libraries, and the ability to combine multiple scenes and avatars in a single video. The platform is particularly valuable for businesses creating customer-facing content, internal training materials, educational resources, and personalized video messages at scale. Vidnoz's cloud-based architecture eliminates the need for high-performance computers or specialized software, making professional video production accessible to users regardless of technical expertise.",
      pricingInfo: JSON.stringify({
        monthly: 29.99,
        yearly: 299.99,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["720p video quality", "Basic AI avatars", "Limited usage minutes", "Standard text-to-speech", "Watermarked videos"]},
          {"name": "Standard", "price": 29.99, "features": ["Monthly subscription", "1080p video quality", "30+ AI avatars", "120 minutes monthly", "Watermark removal", "Priority rendering"]},
          {"name": "Premium", "price": 59.99, "features": ["Monthly subscription", "4K video quality", "All 80+ AI avatars", "300 minutes monthly", "Advanced editing tools", "Premium support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited usage", "API access", "Dedicated success manager", "Custom avatar creation"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=ZCDjRZnSY_A"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.fliki.ai",
    data: {
      name: "Fliki",
      description: "Fliki is an AI-powered text-to-video and text-to-speech platform that transforms written content into engaging videos with realistic voiceovers, stock footage, and automated editing.",
      price: 12,
      category: "Text-to-Video",
      imageUrl: "https://www.fliki.ai/static/media/fliki-logo-new.bac9af71.svg",
      tags: JSON.stringify(["text-to-video", "AI voiceover", "content repurposing", "video marketing", "social media content"]),
      advantages: JSON.stringify([
        "Convert blog posts to videos in minutes",
        "Natural-sounding AI voices in 75+ languages",
        "Automatic scene selection based on content",
        "Millions of stock media assets included",
        "No video editing skills required",
        "Customizable templates and themes",
        "One-click video aspect ratio adjustment",
        "Commercial usage rights for all videos",
        "Easy content repurposing workflow",
        "Regular new AI voice and feature updates"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced video customization",
        "Some AI voices sound better than others",
        "Usage limits based on subscription tier",
        "Template variety less extensive than specialized platforms"
      ]),
      detailInfo: "Fliki streamlines video creation through its AI-powered platform that converts text into fully produced videos with realistic voiceovers and relevant visuals. The core technology combines advanced text-to-speech capabilities with intelligent scene selection algorithms to transform written content into engaging video presentations automatically. The platform's text-to-speech engine features over 900 realistic AI voices across more than 75 languages, with natural-sounding intonation, emphasis, and pronunciations that closely resemble human speech patterns. For visuals, Fliki's AI analyzes the text content to automatically select relevant footage, images, and animations from its library of millions of stock media assets, intelligently matching visual elements to the narrative. Users can simply paste blog posts, articles, scripts, or other text content into the platform, and Fliki will generate a complete video draft within minutes, drastically reducing the time and skills traditionally required for video production. The platform includes customizable templates with various themes, color schemes, and transition effects to align with brand aesthetics, while the multi-format export feature allows videos to be instantly optimized for different social media platforms and aspect ratios. Fliki is particularly valuable for content marketers, educators, and businesses looking to repurpose existing content into video format or create fresh video content without specialized production resources.",
      pricingInfo: JSON.stringify({
        monthly: 12,
        yearly: 108,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["3 mins content/month", "720p video quality", "Limited AI voices", "Basic editing", "Fliki watermark"]},
          {"name": "Basic", "price": 12, "features": ["Monthly price", "60 mins content/month", "1080p quality", "All AI voices", "Watermark removal", "Commercial license"]},
          {"name": "Standard", "price": 35, "features": ["Monthly price", "200 mins content/month", "Priority generation", "Advanced editing", "Team sharing", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited content", "API access", "Dedicated account manager", "Custom brand kit"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=xR5Dlsr3wCE"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.elai.io",
    data: {
      name: "Elai",
      description: "Elai is an AI video platform that enables users to create presenter-led videos with digital avatars from text, eliminating the need for cameras, studios, or actors.",
      price: 29,
      category: "AI Video Creation",
      imageUrl: "https://elai.io/logos/elai-logo.svg",
      tags: JSON.stringify(["digital avatars", "presenter videos", "explainer videos", "AI video generation", "text-to-video"]),
      advantages: JSON.stringify([
        "Create presenter videos without filming",
        "Diverse AI avatars with natural expressions",
        "Text-to-speech in 25+ languages",
        "Simple drag-and-drop video builder",
        "Custom backgrounds and branding options",
        "Screen recording integration",
        "Multiple presenters in single video",
        "Content localization in multiple languages",
        "Video templates for different use cases",
        "Cloud-based platform with no downloads"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced video editing features",
        "Premium avatars require higher tier plans",
        "Some AI voices sound more natural than others",
        "Video export limits on lower-tier plans"
      ]),
      detailInfo: "Elai provides a no-code AI video generation platform that allows users to create professional presenter-led videos without cameras, actors, or studios. The platform specializes in generating realistic digital avatars that serve as video presenters, complete with natural facial expressions, body language, and lip-syncing. Users can create videos by simply typing or pasting text, which Elai converts into a script and generates a video featuring the chosen AI presenter delivering the content. The platform offers a diverse selection of digital avatars with different appearances, clothing styles, and presentation manners, enabling users to select presenters that align with their brand identity and target audience. Elai's text-to-speech technology supports over 25 languages with multiple voice options, allowing for both global reach and localization of content. The video creation process uses a simple drag-and-drop interface where users can customize scenes, add media elements such as images and charts, incorporate screen recordings, and adjust the avatar's positioning. For faster video production, Elai provides a library of templates for various use cases including product demonstrations, educational content, corporate communications, and marketing videos. The platform is particularly valuable for e-learning providers, marketing teams, HR departments, and businesses that need to produce regular video content without the resources for traditional video production. All videos can be easily exported in multiple formats optimized for different platforms and use cases.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["3 minutes video/month", "Basic avatars", "720p quality", "Watermarked videos", "Community support"]},
          {"name": "Pro", "price": 29, "features": ["Monthly subscription", "30 minutes video/month", "Standard avatars", "1080p quality", "Watermark removal", "Priority support"]},
          {"name": "Business", "price": 89, "features": ["Monthly subscription", "90 minutes video/month", "Premium avatars", "Multiple team seats", "Advanced customization", "Dedicated support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited video minutes", "Custom avatars", "API access", "Account manager", "SLA guarantees"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=eZIVZv0oJ0k"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.runwayml.com",
    data: {
      name: "Runway",
      description: "Runway is an advanced AI video generation platform that enables creators to produce, edit, and transform video content using text prompts, generative models, and creative tools without technical expertise.",
      price: 15,
      category: "Generative AI Video",
      imageUrl: "https://runwayml.com/images/logo.svg",
      tags: JSON.stringify(["AI video generation", "text-to-video", "video editing", "motion graphics", "content creation"]),
      advantages: JSON.stringify([
        "Text-to-video generation with Gen-2 model",
        "Video-to-video style transfer and modification",
        "AI-powered motion tracking and masking",
        "Green screen and background removal",
        "Frame interpolation for smooth slow motion",
        "Text and image-guided video editing",
        "Inpainting and outpainting for video expansion",
        "Collaborative editing capabilities",
        "Cloud-based with no GPU requirements",
        "Regular model and feature updates"
      ]),
      disadvantages: JSON.stringify([
        "Higher learning curve than basic video tools",
        "Significant rendering time for complex generations",
        "Generation limits based on subscription tier",
        "Best results require well-crafted prompts"
      ]),
      detailInfo: "Runway is a cutting-edge AI creative suite that empowers filmmakers, artists, and content creators to generate and manipulate video content through the power of generative AI. The platform's flagship feature is its Gen-2 text-to-video model, which can create original video clips from text descriptions or transform existing videos into new styles and scenarios. This technology allows users to generate completely new footage or modify existing content through simple text prompts, without requiring traditional filming or animation skills. Beyond generation, Runway offers a comprehensive set of AI-powered video editing tools including automated masking, which can identify and isolate subjects in footage; motion tracking that follows objects through a scene; and frame interpolation that creates smooth slow-motion effects by generating intermediate frames. The platform's inpainting and outpainting features enable users to remove unwanted elements from videos or expand scenes beyond their original boundaries. For seamless integration into professional workflows, Runway supports various video formats and resolutions, offers cloud rendering capabilities, and provides collaboration features for team projects. The technology has been used in various high-profile productions, from independent films to commercial projects, helping creators achieve effects and visuals that would be prohibitively expensive or impossible with traditional methods. Unlike many AI tools that focus on still images, Runway specializes in the complexities of temporal coherence and motion, making it particularly valuable for video-focused creative work.",
      pricingInfo: JSON.stringify({
        monthly: 15,
        yearly: 144,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Limited generations", "Basic resolution", "Standard rendering priority", "Community support", "Select AI tools"]},
          {"name": "Standard", "price": 15, "features": ["Monthly subscription", "Increased generations", "Higher resolution", "Faster rendering", "All AI tools", "Priority support"]},
          {"name": "Pro", "price": 35, "features": ["Monthly subscription", "More generations", "Maximum resolution", "Fastest rendering", "Advanced features", "Priority support"]},
          {"name": "Unlimited", "price": 95, "features": ["Monthly subscription", "Unlimited generations", "Maximum resolution", "Fastest rendering", "All features", "Priority support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=7ZBe1SHbDUk"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.mubert.com",
    data: {
      name: "Mubert",
      description: "Mubert is an AI music generation platform that creates royalty-free, adaptive music tracks for various purposes including content creation, streaming, gaming, and commercial applications.",
      price: 14.99,
      category: "AI Music Generation",
      imageUrl: "https://mubert.com/static/images/mubert-logo.svg",
      tags: JSON.stringify(["AI music", "royalty-free music", "adaptive audio", "generative music", "soundtrack creation"]),
      advantages: JSON.stringify([
        "Unlimited royalty-free music generation",
        "Text-to-music capabilities",
        "Genre and mood-based custom tracks",
        "Commercial usage rights included",
        "Adaptive music that changes with content",
        "Real-time music streaming API",
        "Professionally designed sound samples",
        "No repetition in generated tracks",
        "Quick generation for content creators",
        "Music that matches specific timing needs"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced music editing capabilities",
        "Some genres represented better than others",
        "API access limited to higher tier plans",
        "Download limitations on lower-tier plans"
      ]),
      detailInfo: "Mubert provides an AI-powered music generation platform that creates unique, royalty-free music tracks tailored to specific needs, moods, and content requirements. The platform uses a combination of generative algorithms and professionally recorded sound samples to compose original music that sounds authentic and emotionally resonant. Unlike conventional stock music, Mubert's tracks are created on-demand and can be infinitely varied, eliminating repetition issues in longer content. The platform's core technology enables several approaches to music creation: text-to-music allows users to describe the desired sound in natural language; mood and genre selection offers a more structured approach through predefined categories; and adaptive music generation creates soundtracks that dynamically respond to content timing, intensity, or user interactions. For content creators, Mubert solves copyright concerns by providing full commercial usage rights for all generated music, while offering seamless integration with video editing software, streaming platforms, and social media channels. The platform supports various formats and durations, from short social media clips to long-form videos and live streams. Beyond individual creators, Mubert provides API access for businesses to integrate adaptive music generation into apps, games, retail environments, and wellness applications. The technology has been trained on a vast library of professional sound samples across numerous genres, ensuring high-quality output that matches the production standards of commercially released music while maintaining the flexibility of AI-generated content.",
      pricingInfo: JSON.stringify({
        monthly: 14.99,
        yearly: 149.99,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Limited tracks per month", "Standard quality", "Personal use only", "Basic text-to-music", "Community support"]},
          {"name": "Pro", "price": 14.99, "features": ["Monthly subscription", "Unlimited music generation", "High quality audio", "Commercial license", "Advanced text-to-music", "Priority rendering"]},
          {"name": "Business", "price": 69.99, "features": ["Monthly subscription", "Team accounts", "Highest quality audio", "Extended commercial rights", "Priority support", "Analytics dashboard"]},
          {"name": "API", "price": 0, "features": ["Custom pricing", "API access", "Streaming capabilities", "Adaptive music generation", "SLA guarantees", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=DMaOu7xmSMM"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI media generation and content creation tools in the database (English version - batch 11)...");
  
  for (const product of aiMediaProducts) {
    try {
      // Find product by externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Updating existing product: ${existingProduct.name}`);
        
        // Update product with new data
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Updated: ${product.data.name}`);
      } else {
        console.log(`Creating new product: ${product.data.name}`);
        
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Created: ${product.data.name} with ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`Error processing product ${product.externalUrl}:`, error);
    }
  }
  
  console.log("All products have been successfully stored!");
}

// Run the update
updateOrCreateProducts()
  .catch((e) => {
    console.error("Error during process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 