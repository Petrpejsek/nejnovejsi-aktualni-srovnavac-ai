import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI content creation and data processing tools - batch 7
const aiContentProducts = [
  {
    externalUrl: "https://www.jasper.ai",
    data: {
      name: "Jasper",
      description: "Jasper is an AI content creation platform that helps marketers, writers, and businesses generate high-quality, SEO-optimized content at scale, with features for blog posts, social media, emails, and more.",
      price: 49,
      category: "AI Content Creation",
      imageUrl: "https://www.jasper.ai/images/logo-new.svg",
      tags: JSON.stringify(["ai writing", "content creation", "copywriting", "marketing content", "SEO content"]),
      advantages: JSON.stringify([
        "Advanced AI content generation capabilities",
        "Over 50 templates for different content types",
        "Built-in plagiarism checker",
        "SEO optimization features with Surfer SEO integration",
        "Brand voice customization",
        "Team collaboration features",
        "Chrome extension for writing anywhere on the web",
        "Content history and version control",
        "Multilingual support for over 25 languages",
        "Art generation capabilities for visual content"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing compared to basic AI writing tools",
        "Learning curve for advanced features",
        "Output quality varies by content type",
        "May still require human editing and oversight"
      ]),
      detailInfo: "Jasper (formerly Jarvis) is a comprehensive AI content creation platform designed to help businesses scale their content production while maintaining quality and brand consistency. The platform uses advanced GPT models trained on marketing and copywriting principles to generate various types of content, from long-form blog posts and articles to social media captions, email campaigns, and advertising copy. Jasper's Boss Mode provides more control over longer content pieces with features like document outlining, paragraph generation, and content commands. The platform's Jasper Chat offers a conversational interface for content brainstorming and generation, while Jasper Art enables users to create custom images based on text prompts. For brands and teams, Jasper provides robust collaboration tools, including shared workspaces, approval workflows, and brand voice settings that ensure all AI-generated content maintains consistent messaging and tone. The platform integrates with popular marketing tools such as Surfer SEO for optimization, Grammarly for proofreading, and various content management systems for seamless publishing workflows. With its templates, recipes (preset workflows), and AI training capabilities, Jasper helps marketing teams overcome content bottlenecks and scale their production while maintaining creative control.",
      pricingInfo: JSON.stringify({
        monthly: 49,
        yearly: 468,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Creator", "price": 49, "features": ["50,000 words/month", "Basic templates", "Single user", "Standard support"]},
          {"name": "Teams", "price": 125, "features": ["100,000 words/month", "All templates", "Up to 3 users", "Collaboration tools", "Priority support"]},
          {"name": "Business", "price": 0, "features": ["Custom word limit", "Custom user count", "Advanced brand controls", "Dedicated success manager", "API access"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=AIRlBE87TaQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.anyword.com",
    data: {
      name: "Anyword",
      description: "Anyword is an AI copywriting platform with predictive performance scoring that helps marketers create and optimize content for conversion, with specialized tools for ads, emails, landing pages, and more.",
      price: 29,
      category: "AI Copywriting",
      imageUrl: "https://www.anyword.com/wp-content/themes/anyword/img/logo.svg",
      tags: JSON.stringify(["copywriting", "conversion optimization", "predictive analytics", "ad copy", "marketing content"]),
      advantages: JSON.stringify([
        "Predictive performance scoring for copy",
        "Data-driven copy optimization for conversion",
        "A/B testing capabilities built in",
        "Specialized templates for different marketing channels",
        "Audience targeting features",
        "Custom trained AI for brand voice",
        "Continuous copy improvement suggestions",
        "One-click variations generation",
        "Landing page and website copy generation",
        "Integration with major ad platforms"
      ]),
      disadvantages: JSON.stringify([
        "Performance prediction accuracy varies by industry",
        "Higher word costs in lower-tier plans",
        "Limited collaboration features in basic plans",
        "May require more editing for technical content"
      ]),
      detailInfo: "Anyword distinguishes itself in the AI writing space by combining content generation with predictive performance scoring, helping marketers create copy that's not just creative but also effective. The platform analyzes billions of data points from advertising campaigns and conversion metrics to predict how well specific copy will perform with different audiences. This predictive capability allows marketers to test and optimize content before launching campaigns, significantly improving conversion rates and ROI. Anyword's Continuous Optimization feature automatically generates and tests multiple copy variations, learning from performance data to create increasingly effective content over time. The platform offers specialized tools for different marketing channels, including paid social ads, Google Ads, email campaigns, landing pages, and product descriptions. For brands seeking consistency, Anyword can be trained on existing content to learn and replicate specific brand voices and messaging guidelines. The platform also includes audience targeting features that tailor content to specific demographic segments, ensuring messaging resonates with intended audiences. With its data-driven approach to copy creation, Anyword helps marketers move beyond subjective creative decisions to performance-based content optimization.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 312,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 29, "features": ["20,000 words/month", "Basic predictive scoring", "One user", "Standard templates"]},
          {"name": "Data-Driven", "price": 99, "features": ["30,000 words/month", "Advanced predictive analytics", "Custom branded AI", "Custom templates", "Priority support"]},
          {"name": "Business", "price": 499, "features": ["200,000 words/month", "Multiple users", "Advanced integrations", "Custom training", "Dedicated account manager"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=0VZmBumJOHA"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.omneky.com",
    data: {
      name: "Omneky",
      description: "Omneky is an AI-powered creative performance platform that generates, tests, and optimizes personalized advertising creative across channels, using deep learning to analyze performance data and improve conversion rates.",
      price: 3000,
      category: "AI Advertising",
      imageUrl: "https://www.omneky.com/wp-content/uploads/2023/01/cropped-omneky-1.png",
      tags: JSON.stringify(["advertising automation", "creative optimization", "personalized ads", "performance marketing", "cross-channel advertising"]),
      advantages: JSON.stringify([
        "Automated generation of ad creative at scale",
        "Performance-based creative optimization",
        "Personalization across audience segments",
        "Cross-channel campaign management",
        "AI-driven creative insights and recommendations",
        "Continuous learning and improvement",
        "Integration with major ad platforms",
        "Real-time performance analytics",
        "Brand consistency controls",
        "Full-service and self-service options"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-level pricing",
        "Complex implementation for full platform utilization",
        "Requires sufficient historical data for optimal performance",
        "Best results need integration with multiple platforms"
      ]),
      detailInfo: "Omneky is an enterprise-grade platform that uses artificial intelligence to transform advertising creative processes, enabling brands to deploy personalized, high-performing ads at scale across digital channels. The platform uses deep learning to analyze performance data from existing campaigns, identifying patterns and insights that inform creative strategy and execution. Omneky's AI can generate thousands of personalized ad variants tailored to different audience segments, platforms, and campaign objectives, while maintaining brand guidelines and creative quality. The system continuously tests these creative variations, learning from performance metrics to optimize messaging, visuals, and calls to action in real-time. Omneky provides a unified dashboard for managing creative across multiple channels including social media, display networks, connected TV, and digital out-of-home, with integrations to major ad platforms for streamlined campaign management. For enterprise marketing teams, Omneky offers both self-service access to their platform and managed service options with strategic support. The platform's AI-driven insights help marketers understand which creative elements drive performance across different audience segments and channels, enabling data-backed creative decisions rather than subjective judgments.",
      pricingInfo: JSON.stringify({
        monthly: 3000,
        yearly: 36000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Growth", "price": 3000, "features": ["Basic ad generation", "Performance analytics", "Limited channels", "Email support"]},
          {"name": "Professional", "price": 5000, "features": ["Advanced creative generation", "Cross-channel optimization", "Creative insights", "Dedicated support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full platform access", "Custom integrations", "Dedicated success manager", "Strategic services"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=JqaQF2U_DQs"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.albert.ai",
    data: {
      name: "Albert",
      description: "Albert is an autonomous marketing AI platform that executes cross-channel digital campaigns, optimizing budget allocation, audience targeting, and creative performance across paid media to maximize marketing ROI.",
      price: 5000,
      category: "Autonomous Marketing",
      imageUrl: "https://www.albert.ai/wp-content/themes/albert/img/footer-logo.svg",
      tags: JSON.stringify(["autonomous marketing", "media buying", "campaign optimization", "cross-channel advertising", "marketing automation"]),
      advantages: JSON.stringify([
        "Fully autonomous campaign execution",
        "Cross-channel optimization and budget allocation",
        "Continuous testing and learning",
        "Real-time adjustments to campaign parameters",
        "Advanced audience discovery and expansion",
        "Creative performance analysis and optimization",
        "Transparent performance reporting",
        "Works with existing marketing technology stack",
        "Handles complex multi-variable decisions",
        "Reduces manual campaign management workload"
      ]),
      disadvantages: JSON.stringify([
        "High price point for small businesses",
        "Requires significant ad spend for optimal performance",
        "Learning curve for marketing teams to work with AI",
        "Less control over detailed campaign decisions"
      ]),
      detailInfo: "Albert is an artificial intelligence marketing platform that autonomously executes digital marketing campaigns across channels, making thousands of tactical decisions and optimizations that would typically require large teams of specialists. Unlike tools that assist human marketers, Albert can independently run campaigns from execution to optimization, acting as a digital team member with exceptional analytical capabilities. The platform integrates with existing marketing technology stacks and digital channels including paid search, social media, programmatic display, and more. Albert's core capabilities include autonomous media buying and optimization, where it allocates budget across channels based on performance, adjusts bids in real-time, and continuously tests new opportunities. For audience targeting, the AI identifies valuable customer segments, discovers new audiences with similar characteristics, and optimizes messaging for different segments. Albert also analyzes creative performance, identifying which elements drive results and making recommendations for improvement. The platform provides detailed, transparent reporting on its decision-making and performance, helping marketing teams understand the 'why' behind campaign results. Albert is particularly valuable for mid-size and enterprise businesses with complex, multi-channel marketing operations seeking to improve efficiency and performance at scale.",
      pricingInfo: JSON.stringify({
        monthly: 5000,
        yearly: 60000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Professional", "price": 5000, "features": ["Starting monthly fee", "Limited channel support", "Basic optimization", "Standard reporting"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full-channel support", "Advanced optimization", "Custom reporting", "Dedicated support team"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=hD6uTw3JrGE"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.typeface.ai",
    data: {
      name: "Typeface",
      description: "Typeface is an enterprise AI content platform that helps brands create personalized, on-brand content at scale, combining generative AI with brand controls to ensure consistency across channels and markets.",
      price: 5000,
      category: "Enterprise Content AI",
      imageUrl: "https://typeface.ai/images/typeface-logo-black-text-color-tf.svg",
      tags: JSON.stringify(["brand content", "enterprise AI", "content personalization", "omnichannel content", "brand consistency"]),
      advantages: JSON.stringify([
        "Enterprise-grade brand controls and governance",
        "Personalized content for different channels and markets",
        "Integration with brand asset management systems",
        "Advanced text and image generation capabilities",
        "Customizable content approval workflows",
        "Multi-user collaboration features",
        "Content analytics and performance tracking",
        "AI trained on brand-specific materials",
        "API access for integration with marketing stacks",
        "Supports multiple content types and formats"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise pricing model",
        "Complex implementation for full platform utilization",
        "Requires significant brand assets for optimal training",
        "Learning curve for content teams"
      ]),
      detailInfo: "Typeface is an enterprise-focused generative AI platform designed to help global brands create personalized, on-brand content at scale while maintaining strict controls over brand integrity. The platform combines the power of generative AI with enterprise-grade brand governance to solve the content bottlenecks faced by large organizations. At its core, Typeface can be trained on a brand's existing content, guidelines, and assets to understand and replicate specific tones, messaging frameworks, and visual styles. This enables teams across an organization to quickly generate content that remains consistently on-brand, from marketing copy and social media posts to product descriptions and internal communications. The platform's Contentbase™ technology acts as a centralized hub for brand content, connecting with existing digital asset management systems and marketing technology stacks. Typeface offers specialized features for different content needs, including Typecraft for text generation, Typeface Studio for combined text and image content, and workflows for collaborative content creation and approval. For multinational enterprises, the platform supports localization and personalization across markets and audience segments while maintaining global brand consistency. With its enterprise-grade security, permissions management, and content analytics, Typeface provides large organizations with both the creative acceleration of generative AI and the control needed to protect brand integrity.",
      pricingInfo: JSON.stringify({
        monthly: 5000,
        yearly: 54000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Growth", "price": 5000, "features": ["Starting monthly price", "Basic brand controls", "Limited users", "Standard support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Advanced brand governance", "Unlimited users", "Custom integrations", "Dedicated support", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=rQDa1tFbU5k"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.browse.ai",
    data: {
      name: "Browse AI",
      description: "Browse AI is a no-code web scraping and automation platform that enables businesses to extract data from websites, monitor changes, and automate workflows without programming knowledge.",
      price: 49,
      category: "Web Automation",
      imageUrl: "https://browse.ai/logo-black.svg",
      tags: JSON.stringify(["web scraping", "data extraction", "automation", "no-code", "web monitoring"]),
      advantages: JSON.stringify([
        "No-code interface for creating web robots",
        "Visual selection of data to extract",
        "Scheduled data extraction and monitoring",
        "Notifications for website changes",
        "Export options including API, CSV, and integrations",
        "Handles login-protected websites",
        "Processes multiple pages and pagination",
        "Cloud-based execution with no local setup",
        "Built-in data cleaning and formatting",
        "Advanced robots with conditional logic"
      ]),
      disadvantages: JSON.stringify([
        "Usage limits based on subscription tier",
        "May require adjustments when websites change",
        "Limited options for extremely complex scenarios",
        "Some websites may block automated access"
      ]),
      detailInfo: "Browse AI democratizes web data extraction and automation through an intuitive no-code platform that allows anyone to create 'web robots' that can extract data from websites, monitor for changes, and trigger automated workflows. The platform uses AI-powered visual selection tools that enable users to simply point and click at the data they want to extract, without needing to understand HTML or write code. Users can create robots for a wide range of use cases, including competitive price monitoring, lead generation, content aggregation, real estate listing extraction, job posting monitoring, and more. Each robot can be scheduled to run at specific intervals, monitoring target websites for changes and extracting fresh data automatically. When important changes are detected, Browse AI can send notifications via email, Slack, or other integrated platforms. The extracted data can be exported in various formats including CSV and JSON, accessed via API, or sent directly to thousands of applications through Zapier integration. Browse AI handles complex scenarios including login-protected websites, pagination, and dynamic content loading. For businesses, the platform offers significant time savings by automating manual data gathering processes and providing real-time insights from web data without requiring technical expertise or development resources.",
      pricingInfo: JSON.stringify({
        monthly: 49,
        yearly: 468,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["5 robots", "100 pages/month", "Daily runs", "Basic support"]},
          {"name": "Pro", "price": 49, "features": ["30 robots", "5,000 pages/month", "Hourly runs", "Priority support", "API access"]},
          {"name": "Business", "price": 99, "features": ["100 robots", "20,000 pages/month", "15-minute runs", "Dedicated support", "Advanced features"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom robot limit", "Custom page volume", "5-minute runs", "Dedicated manager", "Custom features"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=i0h3xrXsGns"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.lyro.ai",
    data: {
      name: "Lyro",
      description: "Lyro (formerly Remi AI) is an AI-powered inventory optimization platform that helps businesses automate forecasting, replenishment, and purchasing decisions to reduce costs and prevent stockouts.",
      price: 800,
      category: "Inventory Optimization",
      imageUrl: "https://www.lyro.ai/wp-content/uploads/2022/04/Group-9373.svg",
      tags: JSON.stringify(["inventory management", "demand forecasting", "supply chain optimization", "automated purchasing", "stock replenishment"]),
      advantages: JSON.stringify([
        "AI-powered demand forecasting",
        "Automated purchase order generation",
        "Dynamic safety stock calculation",
        "Multi-location inventory optimization",
        "Supplier lead time tracking and adjustment",
        "Integration with existing ERP systems",
        "Seasonality and trend detection",
        "Exception-based inventory management",
        "What-if scenario planning",
        "Real-time dashboards and analytics"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point for small businesses",
        "Requires clean historical data for best results",
        "Complex implementation with ERP systems",
        "Learning period for AI to optimize recommendations"
      ]),
      detailInfo: "Lyro (previously known as Remi AI) provides artificial intelligence solutions for inventory optimization, helping businesses automate and improve their forecasting, replenishment, and purchasing processes. The platform's core technology uses machine learning to analyze historical sales data, identify patterns, and generate accurate demand forecasts that account for seasonality, trends, promotions, and external factors. Based on these forecasts, Lyro automatically calculates optimal inventory levels and generates purchase recommendations or complete purchase orders that can be reviewed before submission to suppliers. The system continuously learns from new data and outcomes, improving its forecasting accuracy over time and adapting to changing market conditions. For businesses with multiple locations or warehouses, Lyro optimizes inventory distribution across the network to minimize total holding costs while maintaining service levels. The platform integrates with major ERP and inventory management systems including SAP, Microsoft Dynamics, NetSuite, and MYOB, enabling seamless data flow and execution. Lyro's exception-based management approach highlights only those items requiring attention, allowing inventory managers to focus on strategic decisions rather than routine ordering. For manufacturers and distributors, the platform also includes materials requirements planning capabilities that align raw material purchases with production schedules and finished goods demand.",
      pricingInfo: JSON.stringify({
        monthly: 800,
        yearly: 9120,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 800, "features": ["Starting monthly price", "Core forecasting", "Basic integrations", "Standard support"]},
          {"name": "Professional", "price": 1500, "features": ["Advanced forecasting models", "Full integrations", "Priority support", "Multi-location support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Advanced features", "Custom integrations", "Dedicated support", "Supply chain consulting"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=Ek-vFE4Rx2w"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.lily.ai",
    data: {
      name: "Lily AI",
      description: "Lily AI is a product attribute platform that uses deep learning to understand product features and customer preferences, enhancing e-commerce search, recommendations, and demand forecasting with detailed product intelligence.",
      price: 4000,
      category: "Product Intelligence",
      imageUrl: "https://www.lily.ai/wp-content/themes/lilyai/assets/img/lily-ai-logo.svg",
      tags: JSON.stringify(["product attributes", "e-commerce intelligence", "customer-centered taxonomy", "search enhancement", "product discovery"]),
      advantages: JSON.stringify([
        "Deep product attribute enrichment",
        "Customer-centered product taxonomy",
        "Enhanced search relevance and findability",
        "Improved product recommendations",
        "Detailed product insights for merchandising",
        "Cross-catalog attribute standardization",
        "Integration with existing e-commerce platforms",
        "Automated attribute tagging at scale",
        "Improvement in conversion rates",
        "Support for multiple product categories"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise pricing model",
        "Complex implementation for full utilization",
        "Best results require integration across systems",
        "Initial setup period for AI training"
      ]),
      detailInfo: "Lily AI transforms product data for e-commerce businesses by using deep learning to identify and extract hundreds of detailed attributes from each product, creating a rich, customer-centered product language that bridges the gap between merchant terminology and customer search behavior. The platform's core technology can analyze product images, descriptions, and existing metadata to generate a comprehensive attribute set that includes technical specifications, visual characteristics, functional features, and emotional attributes that influence purchasing decisions. This enriched product data fundamentally enhances multiple aspects of e-commerce operations. For product discovery, Lily AI enables more precise search results by matching customer queries with specific product attributes, even when customers use non-technical language. The platform also powers more accurate product recommendations by identifying detailed similarities between items beyond basic category or price matching. For merchandising teams, Lily AI provides deep insights into product performance based on specific attributes, helping identify trends and inform future buying decisions. The platform integrates with existing e-commerce systems including product information management (PIM), search engines, recommendation engines, and merchandising tools. By translating product data into customer-centric language, Lily AI helps retailers increase conversion rates, reduce return rates, and improve customer satisfaction across the shopping journey.",
      pricingInfo: JSON.stringify({
        monthly: 4000,
        yearly: 48000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Growth", "price": 4000, "features": ["Starting monthly price", "Basic attribute enrichment", "Standard integrations", "Email support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full attribute suite", "Advanced integrations", "Dedicated support", "Custom taxonomy development"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=gjO0diRPvwM"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI content creation and data processing tools in the database (English version - batch 7)...");
  
  for (const product of aiContentProducts) {
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