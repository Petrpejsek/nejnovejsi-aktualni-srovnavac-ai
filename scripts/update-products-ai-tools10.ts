import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI marketing, SEO and content optimization tools - batch 10
const aiToolsProducts = [
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
    externalUrl: "https://www.replo.app",
    data: {
      name: "Replo",
      description: "Replo is an AI-powered e-commerce page builder that enables merchants to create high-converting storefronts and landing pages without coding, featuring automatic content generation and optimization.",
      price: 79,
      category: "E-commerce Page Builder",
      imageUrl: "https://assets-global.website-files.com/63a49822ee2304acc9094fa5/63f1c25b3d93a87ad81f5b51_Logo%20(1).svg",
      tags: JSON.stringify(["e-commerce", "page builder", "landing pages", "storefront design", "conversion optimization"]),
      advantages: JSON.stringify([
        "AI-powered content generation for product pages",
        "No-code visual editor with drag-and-drop interface",
        "Conversion-optimized page templates",
        "Native Shopify integration",
        "Mobile-responsive design automation",
        "A/B testing capabilities",
        "Real-time collaboration for teams",
        "Built-in SEO optimization tools",
        "Dynamic content personalization",
        "Performance analytics dashboard"
      ]),
      disadvantages: JSON.stringify([
        "Limited to Shopify ecosystem currently",
        "Advanced features require higher pricing tiers",
        "Learning curve for maximizing AI capabilities",
        "Some customization limitations compared to custom coding"
      ]),
      detailInfo: "Replo is revolutionizing e-commerce storefront creation with its AI-powered page builder designed specifically for online merchants. The platform enables brands to create high-converting product pages, landing pages, and full storefronts without requiring coding skills or design expertise. At the heart of Replo's offering is its visual editor, which combines drag-and-drop simplicity with powerful customization options, allowing merchants to build pages that align perfectly with their brand while maintaining professional design standards. The platform's AI capabilities extend to automatic content generation, where it can analyze product information to create compelling descriptions, feature highlights, and even suggest effective calls to action based on conversion data. Replo's template library includes dozens of pre-built, conversion-optimized page designs for various product categories and campaign types, all of which serve as customizable starting points. The platform's deep integration with Shopify ensures seamless product data synchronization, inventory management, and checkout processes, while its responsive design engine automatically optimizes pages for all device types. For marketing teams, Replo offers built-in A/B testing functionality to compare different page versions and identify the highest-converting designs. The collaboration features allow multiple team members to work on pages simultaneously with role-based permissions and approval workflows. Replo's analytics dashboard provides detailed insights into page performance, visitor behavior, and conversion metrics, helping merchants continuously improve their digital storefronts.",
      pricingInfo: JSON.stringify({
        monthly: 79,
        yearly: 790,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["1 user", "Up to 3 pages", "Basic templates", "Standard support"]},
          {"name": "Growth", "price": 79, "features": ["Per month", "3 users", "Unlimited pages", "All templates", "Priority support"]},
          {"name": "Pro", "price": 199, "features": ["Per month", "10 users", "Advanced AI features", "A/B testing", "Dedicated success manager"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited users", "Custom integrations", "VIP support", "Enterprise security"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=HYPLGnNGDxs"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.surferseo.com",
    data: {
      name: "Surfer SEO",
      description: "Surfer SEO is an AI-powered content optimization platform that analyzes top-ranking pages to provide data-driven recommendations for creating and optimizing content that ranks higher in search engines.",
      price: 69,
      category: "SEO Optimization",
      imageUrl: "https://surferseo.com/wp-content/uploads/2023/06/color_surfer_logo.svg",
      tags: JSON.stringify(["SEO", "content optimization", "keyword research", "SERP analysis", "content planning"]),
      advantages: JSON.stringify([
        "Data-driven content optimization based on SERP analysis",
        "AI-powered content editor with real-time scoring",
        "Comprehensive keyword research tools",
        "Content planning with NLP-based topic clusters",
        "SERP analyzer for competitor insights",
        "Content audit for existing pages",
        "Integration with major writing platforms",
        "Plagiarism checker",
        "Team collaboration features",
        "White-label reporting"
      ]),
      disadvantages: JSON.stringify([
        "Learning curve for understanding all metrics",
        "Higher price point than basic SEO tools",
        "Some features only available in higher tiers",
        "Occasional fluctuations in recommendations with algorithm updates"
      ]),
      detailInfo: "Surfer SEO provides a comprehensive suite of content optimization tools that use data science and artificial intelligence to help content creators, marketers, and SEO professionals create higher-ranking content. The platform's core functionality revolves around analyzing the top-ranking pages for target keywords and identifying the common elements that contribute to their success. Surfer's Content Editor is the platform's flagship feature, providing real-time optimization guidance as users write, with recommendations for keyword usage, content structure, readability, and other on-page factors that influence search rankings. The editor scores content against competitors and offers actionable suggestions for improvement. For content planning, Surfer's Content Planner uses natural language processing to analyze search intent and generate comprehensive topic clusters, helping users build content strategies that cover all relevant aspects of a subject. The Keyword Research tool identifies valuable keywords with search volume data, keyword difficulty scores, and SERP similarity metrics to find semantically related terms. Surfer's SERP Analyzer provides detailed breakdowns of top-ranking pages, showing commonalities in content length, headings, keyword density, page structure, and other ranking factors. For existing content, the Content Audit tool evaluates pages against competitors and provides recommendations for improvement. Surfer integrates with WordPress, Google Docs, and other writing platforms, making it easy to incorporate into existing workflows. The platform is used by individual content creators, agencies, and in-house marketing teams across various industries to improve organic search visibility.",
      pricingInfo: JSON.stringify({
        monthly: 69,
        yearly: 708,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 69, "features": ["Monthly", "10 articles/month", "5 queries/day", "Content editor", "Keyword research"]},
          {"name": "Advanced", "price": 149, "features": ["Monthly", "30 articles/month", "15 queries/day", "All features", "Priority support"]},
          {"name": "Max", "price": 299, "features": ["Monthly", "70 articles/month", "35 queries/day", "All features", "Dedicated account manager"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom usage limits", "API access", "Custom training", "VIP support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=_JpHDFmZ1FM"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.salesloft.com",
    data: {
      name: "Salesloft",
      description: "Salesloft is an AI-enhanced sales engagement platform that helps teams execute multi-channel outreach, manage pipeline, automate tasks, and optimize sales processes with data-driven insights.",
      price: 125,
      category: "Sales Engagement",
      imageUrl: "https://www.salesloft.com/wp-content/themes/salesloft/assets/images/header-logo.svg",
      tags: JSON.stringify(["sales engagement", "sales automation", "revenue operations", "pipeline management", "sales intelligence"]),
      advantages: JSON.stringify([
        "AI-powered sales insights and recommendations",
        "Multi-channel sales engagement (email, phone, SMS, social)",
        "Automated sales cadences and workflows",
        "Native conversation intelligence",
        "Real-time coaching and call analysis",
        "Pipeline management with forecasting",
        "Seamless CRM integration (Salesforce, etc.)",
        "Advanced analytics and reporting",
        "A/B testing for sales messaging",
        "Team performance management"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point than basic sales tools",
        "Complex implementation for full platform utilization",
        "Steeper learning curve for all features",
        "Some advanced features limited to enterprise tier"
      ]),
      detailInfo: "Salesloft provides a comprehensive sales engagement platform enhanced with artificial intelligence to help B2B sales teams execute more effective outreach, manage deals, and close more business. The platform's core functionality enables sales teams to create multi-step, multi-channel cadences that automate prospect outreach across email, phone, SMS, and social channels while maintaining personalization at scale. Salesloft's AI capabilities analyze historical engagement data to recommend the best times to reach out, optimal channel selection, and messaging approaches most likely to generate responses. The platform's conversation intelligence features automatically record, transcribe, and analyze sales calls, providing insights into buyer sentiment, objection patterns, and coaching opportunities for sales representatives. For sales managers, Salesloft offers detailed pipeline management tools with AI-powered forecasting that analyzes deal characteristics and seller activities to predict outcomes with greater accuracy. The platform integrates deeply with CRM systems, particularly Salesforce, ensuring data synchronization while providing a more purpose-built interface for day-to-day sales activities. Salesloft's analytics capabilities extend beyond basic activity metrics to provide detailed insights into which sales behaviors and messaging approaches drive the best results. For large enterprises, the platform includes robust governance features, including role-based permissions, compliance controls, and enterprise-grade security. Salesloft is used by sales organizations across various industries, from technology and SaaS to financial services and manufacturing, to standardize sales processes, increase productivity, and improve win rates.",
      pricingInfo: JSON.stringify({
        monthly: 125,
        yearly: 1350,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Sell", "price": 125, "features": ["Per user/month", "Sales cadences", "Email and phone", "Basic analytics", "Standard support"]},
          {"name": "Professional", "price": 0, "features": ["Custom pricing", "Full platform", "Conversation intelligence", "Advanced analytics", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "All features", "Advanced security", "Dedicated support", "Custom implementation"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=FGm-m3XBHUo"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.tapclicks.com",
    data: {
      name: "TapClicks",
      description: "TapClicks is an AI-enhanced marketing operations platform that unifies data from multiple marketing channels and tools into automated dashboards, reports, and workflows to optimize marketing performance.",
      price: 499,
      category: "Marketing Analytics",
      imageUrl: "https://www.tapclicks.com/wp-content/uploads/2022/05/new-purple-tapclicks-logo.svg",
      tags: JSON.stringify(["marketing analytics", "data visualization", "marketing reporting", "marketing operations", "performance monitoring"]),
      advantages: JSON.stringify([
        "200+ pre-built marketing platform integrations",
        "AI-powered insights and anomaly detection",
        "Automated report generation and distribution",
        "Customizable dashboards and visualizations",
        "Cross-channel data unification",
        "Workflow automation for marketing operations",
        "White-label reporting capabilities",
        "Data warehousing and management",
        "Marketing order management system",
        "Scalable for agencies and enterprises"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing for comprehensive features",
        "Complex setup for full platform utilization",
        "Learning curve for advanced reporting",
        "Enterprise focus less suited for small businesses"
      ]),
      detailInfo: "TapClicks provides an extensive marketing operations and analytics platform designed to help agencies, media companies, and marketing departments unify disparate data sources, automate reporting workflows, and derive actionable insights from their marketing efforts. The platform's core strength lies in its vast integration library, with over 200 pre-built connectors to popular marketing platforms including Google Ads, Facebook, LinkedIn, HubSpot, Salesforce, and many others. These integrations automatically pull performance data into a centralized repository where it can be normalized, visualized, and analyzed. TapClicks' Smart Connector technology also allows for custom API connections to proprietary or niche platforms. The platform's AI capabilities analyze marketing performance data to identify trends, anomalies, and opportunities that might otherwise go unnoticed, providing actionable insights to optimize campaign performance. For reporting, TapClicks offers highly customizable dashboards with drag-and-drop functionality, allowing users to create visual reports tailored to different stakeholders without requiring technical expertise. The automated report distribution system can generate and deliver customized reports via email, PDF, or client portal access on scheduled intervals. Beyond analytics, TapClicks includes robust workflow automation tools that streamline marketing operations, from campaign setup and tracking to report generation and client communication. For agencies and marketing service providers, the platform offers comprehensive white-labeling options, including custom domains, logos, and branding on all client-facing elements. The Orders module provides a system for tracking marketing service fulfillment from order placement through execution and reporting. TapClicks is used by thousands of agencies and brands to consolidate marketing data, automate time-consuming reporting tasks, and improve performance visibility across complex multi-channel marketing ecosystems.",
      pricingInfo: JSON.stringify({
        monthly: 499,
        yearly: 5388,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Plus", "price": 499, "features": ["Monthly", "Basic dashboards", "Limited connectors", "Standard support", "Email reports"]},
          {"name": "Pro", "price": 999, "features": ["Monthly", "Advanced dashboards", "100+ connectors", "Priority support", "White-labeling"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "All features", "Unlimited connectors", "Dedicated support", "Custom implementation"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=mQJzm9Xvnpk"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI marketing, SEO and content optimization tools in the database (English version - batch 10)...");
  
  for (const product of aiToolsProducts) {
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