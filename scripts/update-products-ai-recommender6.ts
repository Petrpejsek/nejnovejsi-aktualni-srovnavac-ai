import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI recommender and conversational AI tools - batch 6
const aiRecommenderProducts = [
  {
    externalUrl: "https://www.recombee.com",
    data: {
      name: "Recombee",
      description: "Recombee is an AI-powered recommendation engine that helps businesses deliver personalized product, content, and service recommendations to their customers across all digital channels.",
      price: 499,
      category: "Recommendation Systems",
      imageUrl: "https://www.recombee.com/static/img/recombee-logo.svg",
      tags: JSON.stringify(["recommendation engine", "personalization", "product recommendations", "content recommendations", "e-commerce"]),
      advantages: JSON.stringify([
        "Ready-to-use AI recommendation engine",
        "Real-time personalization capabilities",
        "Quick implementation with SDKs for major platforms",
        "Automatic algorithm selection and optimization",
        "Handles cold-start problem effectively",
        "Self-learning system that improves over time",
        "Content-based and collaborative filtering",
        "A/B testing functionality built-in",
        "Detailed analytics and performance metrics",
        "GDPR compliant data processing"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing tier for enterprise-level features",
        "May require technical expertise for advanced customization",
        "Limited control over recommendation algorithms",
        "Performance dependent on quality of user interaction data"
      ]),
      detailInfo: "Recombee provides a cloud-based recommendation engine that leverages artificial intelligence to deliver personalized recommendations across various digital platforms. The system uses a combination of machine learning algorithms, including collaborative filtering, content-based filtering, and contextual analysis to understand user preferences and behavior patterns. Recombee automatically selects and optimizes the best algorithms for each specific use case, adapting in real-time to changes in user behavior and content availability. The platform excels at solving the 'cold-start' problem by quickly generating relevant recommendations even for new users or newly added items. Implementation is streamlined through APIs and SDKs available for all major programming languages and platforms. The system provides built-in A/B testing capabilities to measure and optimize recommendation performance, along with detailed analytics on user engagement and conversion metrics. Recombee is used across various industries, including e-commerce, media, travel, and financial services, to increase engagement, conversion rates, and average order values.",
      pricingInfo: JSON.stringify({
        monthly: 499,
        yearly: 5988,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Up to 50,000 recommendations/month", "Basic algorithms", "Email support", "1-day data retention"]},
          {"name": "Startup", "price": 499, "features": ["Up to 1M recommendations/month", "Advanced algorithms", "Priority support", "7-day data retention"]},
          {"name": "Business", "price": 999, "features": ["Up to 3M recommendations/month", "All algorithms", "Dedicated support", "30-day data retention"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom recommendation volume", "Custom features", "Dedicated success manager", "Custom data retention"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=SHrCZG4XVzQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.clerk.io",
    data: {
      name: "Clerk.io",
      description: "Clerk.io is an AI-powered e-commerce personalization platform that provides product recommendations, email marketing, and search functionality to increase conversion rates and average order value.",
      price: 249,
      category: "E-commerce Personalization",
      imageUrl: "https://www.clerk.io/wp-content/uploads/2022/09/Clerk-logo.svg",
      tags: JSON.stringify(["e-commerce personalization", "product recommendations", "email marketing", "intelligent search", "conversion optimization"]),
      advantages: JSON.stringify([
        "E-commerce-specific recommendation engine",
        "Seamless integration with major e-commerce platforms",
        "Personalized email marketing automation",
        "AI-powered search functionality",
        "Easy-to-use interface requiring minimal technical skills",
        "Visual merchandising capabilities",
        "Detailed ROI and performance tracking",
        "Multi-language support",
        "Audience segmentation tools",
        "Mobile optimization features"
      ]),
      disadvantages: JSON.stringify([
        "Primary focus on e-commerce limits use in other industries",
        "Advanced features require higher subscription tiers",
        "Custom integration may require developer resources",
        "Some features have learning curve for new users"
      ]),
      detailInfo: "Clerk.io provides a comprehensive personalization platform specifically designed for e-commerce businesses. The platform uses artificial intelligence and machine learning to analyze customer behavior, purchase history, and browsing patterns to deliver highly relevant product recommendations across the customer journey. The system automatically identifies and suggests products that customers are most likely to purchase based on their individual preferences and shopping habits. Clerk.io's personalization engine extends beyond the website to include email marketing, with AI-powered product recommendations in abandoned cart emails, newsletters, and post-purchase communications. The platform also includes an intelligent search function that understands natural language queries and ranks results based on relevance, popularity, and individual user preferences. Clerk.io integrates seamlessly with major e-commerce platforms including Shopify, Magento, WooCommerce, and others, allowing for quick implementation with minimal technical requirements. The visual merchandising tools give retailers control over how products are displayed while still leveraging AI for personalization, and comprehensive analytics provide clear visibility into the revenue impact of personalization efforts.",
      pricingInfo: JSON.stringify({
        monthly: 249,
        yearly: 2388,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 249, "features": ["Up to 100,000 monthly pageviews", "Product recommendations", "Basic email campaigns", "Standard support"]},
          {"name": "Growth", "price": 499, "features": ["Up to 300,000 monthly pageviews", "Advanced recommendations", "Unlimited email campaigns", "Enhanced search functionality"]},
          {"name": "Pro", "price": 999, "features": ["Up to 1M monthly pageviews", "All features", "Priority support", "Custom audience segments"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pageview volume", "Dedicated account manager", "Custom implementation", "Advanced API access"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=hYhCIbKUQ6A"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.syte.ai",
    data: {
      name: "Syte",
      description: "Syte is a visual AI platform that enables retailers to deliver personalized shopping experiences through visual search, product discovery, and recommendation technologies.",
      price: 999,
      category: "Visual AI Search",
      imageUrl: "https://www.syte.ai/wp-content/uploads/2021/08/syte-logo.svg",
      tags: JSON.stringify(["visual search", "product discovery", "image recognition", "fashion AI", "e-commerce search"]),
      advantages: JSON.stringify([
        "Advanced visual search technology",
        "Camera search integration for mobile apps",
        "Similar item recommendation engine",
        "Hyper-personalization based on visual preferences",
        "Shop-the-look functionality",
        "Social media visual content monetization",
        "Deep product tagging with visual attributes",
        "Cross-selling recommendations",
        "Integration with major e-commerce platforms",
        "Detailed analytics on visual search performance"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point for smaller retailers",
        "Best results require high-quality product images",
        "Complex implementation for full feature utilization",
        "More focused on fashion and home decor than other categories"
      ]),
      detailInfo: "Syte has pioneered visual AI technology for retail, transforming how consumers discover and purchase products online. The platform's core technology uses computer vision and deep learning to analyze images and recognize products, enabling shoppers to search using images rather than keywords. When a user uploads a photo or clicks on an image, Syte's visual AI identifies the objects within it and matches them to visually similar products in the retailer's inventory. This capability is implemented through multiple discovery solutions including camera search, similar item recommendations, and 'shop the look' functionality. Syte's technology is particularly valuable in visually-driven categories like fashion, jewelry, and home decor, where product attributes can be difficult to describe in words but are instantly recognizable visually. The platform also includes an automated product tagging system that uses AI to identify and label detailed visual attributes, improving searchability and data organization. For retailers, Syte provides insights into visual search behavior and preferences, helping them understand what visual elements drive purchasing decisions. The technology integrates with major e-commerce platforms and can be implemented through APIs, JavaScript widgets, and mobile SDKs.",
      pricingInfo: JSON.stringify({
        monthly: 999,
        yearly: 11988,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Growth", "price": 999, "features": ["Visual search functionality", "Basic product discovery", "Standard integration", "Email support"]},
          {"name": "Professional", "price": 2499, "features": ["Advanced visual search", "Shop-the-look functionality", "Deep product tagging", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full suite of visual AI tools", "Dedicated account manager", "Custom implementation"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=2FQ9CSteJxE"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.visenze.com",
    data: {
      name: "ViSenze",
      description: "ViSenze is an AI company that develops visual search and image recognition solutions to simplify product discovery and improve shopping experiences across e-commerce platforms.",
      price: 1200,
      category: "Visual Search",
      imageUrl: "https://www.visenze.com/wp-content/themes/visenze/images/common/visenze-logo.svg",
      tags: JSON.stringify(["visual search", "image recognition", "product discovery", "visual commerce", "shoppable content"]),
      advantages: JSON.stringify([
        "Advanced visual recognition technology",
        "Comprehensive visual commerce solutions",
        "Multi-platform deployment capabilities",
        "Automated visual attribute tagging",
        "Shoppable content generation tools",
        "Visual recommendations engine",
        "Camera search functionality",
        "Integration with major e-commerce platforms",
        "Visual merchandising capabilities",
        "Analytics and insights on visual search behavior"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-focused pricing model",
        "Complex implementation for full feature set",
        "Requires technical resources for optimization",
        "Performance dependent on image quality and catalog organization"
      ]),
      detailInfo: "ViSenze provides artificial intelligence solutions that understand and analyze visual content, helping online retailers and marketplaces enhance product discovery and shopping experiences. The company's core technology uses computer vision and deep learning to recognize and analyze images, allowing shoppers to search using pictures instead of keywords. ViSenze's platform includes multiple visual commerce solutions: Visual Search enables customers to find products by uploading images or using camera search; Discovery Suite provides visually similar recommendations and shop-the-look functionality; and Smart Curation automates the creation of shoppable content from social media and other visual sources. The technology can automatically identify and tag detailed product attributes from images, improving search accuracy and catalog organization. ViSenze's solutions can be deployed across websites, mobile apps, and other digital touchpoints, with APIs and SDKs for different platforms. The company's visual AI technology is used by major retailers and marketplaces worldwide, including Urban Outfitters, Rakuten, and Zalora. ViSenze provides analytics tools that offer insights into visual search performance and user behavior, helping retailers understand which visual elements drive engagement and conversions.",
      pricingInfo: JSON.stringify({
        monthly: 1200,
        yearly: 13200,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 1200, "features": ["Basic visual search", "Limited API calls", "Standard support", "Basic analytics"]},
          {"name": "Growth", "price": 3000, "features": ["Full visual search suite", "Increased API capacity", "Priority support", "Advanced analytics"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited API capacity", "Dedicated support", "Custom implementation", "Advanced features"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=sF6VUi3JmQw"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.wegrow.ai",
    data: {
      name: "WeGrow.ai",
      description: "WeGrow.ai is an AI-powered growth marketing platform that helps businesses acquire and retain customers through personalized recommendations, predictive analytics, and automated marketing campaigns.",
      price: 599,
      category: "Growth Marketing",
      imageUrl: "https://www.wegrow.ai/assets/img/logo.svg",
      tags: JSON.stringify(["growth marketing", "customer acquisition", "predictive analytics", "marketing automation", "personalization"]),
      advantages: JSON.stringify([
        "AI-driven customer acquisition strategies",
        "Personalized marketing campaign recommendations",
        "Predictive audience segmentation",
        "Automated A/B testing",
        "Multi-channel campaign orchestration",
        "Customer lifetime value predictions",
        "Churn risk identification and prevention",
        "Integration with major marketing platforms",
        "Real-time performance analytics",
        "Marketing budget optimization tools"
      ]),
      disadvantages: JSON.stringify([
        "Requires integration with existing marketing systems",
        "Complex initial setup for data synchronization",
        "Full value realization takes time as AI learns",
        "Advanced features limited to higher pricing tiers"
      ]),
      detailInfo: "WeGrow.ai uses artificial intelligence to help businesses optimize their growth marketing efforts across the entire customer lifecycle. The platform analyzes customer data, behavior patterns, and campaign performance to provide data-driven recommendations and automate marketing decisions. At the acquisition stage, WeGrow.ai identifies the most promising customer segments and channels, optimizing ad spend and campaign targeting. The platform's predictive analytics capabilities forecast customer lifetime value, allowing businesses to focus resources on acquiring high-value customers. For retention, the AI identifies early warning signs of churn and recommends personalized engagement strategies. WeGrow.ai's automation capabilities extend to campaign creation, A/B testing, and optimization, continuously improving performance based on real-time results. The platform integrates with major marketing tools and channels, including social media platforms, email marketing services, CRM systems, and analytics tools. For marketers, WeGrow.ai provides a unified dashboard with actionable insights and recommendations, simplifying complex data analysis and helping teams make more effective marketing decisions.",
      pricingInfo: JSON.stringify({
        monthly: 599,
        yearly: 6589,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 599, "features": ["Basic growth recommendations", "Essential analytics", "Limited automation", "Email support"]},
          {"name": "Professional", "price": 1499, "features": ["Advanced growth strategies", "Full predictive analytics", "Comprehensive automation", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full platform access", "Dedicated strategist", "Custom implementation", "Advanced integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=tKvgHXuk5kc"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.conversica.com",
    data: {
      name: "Conversica",
      description: "Conversica is an AI-powered conversational platform that uses intelligent virtual assistants to engage prospects and customers in human-like conversations, helping businesses automate sales and marketing engagement at scale.",
      price: 3000,
      category: "Conversational AI",
      imageUrl: "https://www.conversica.com/wp-content/themes/conversica/assets/images/conversica-logo.svg",
      tags: JSON.stringify(["conversational AI", "sales automation", "marketing automation", "virtual assistants", "lead engagement"]),
      advantages: JSON.stringify([
        "Human-like AI assistants for two-way conversations",
        "Persistent follow-up without human intervention",
        "Seamless hand-off to human teams when appropriate",
        "Integration with CRM and marketing automation systems",
        "Multi-channel communication (email, SMS, website)",
        "Personalized engagement at scale",
        "Lead qualification and prioritization",
        "Performance analytics and conversation insights",
        "Multiple language support",
        "Continuous learning from interactions"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point compared to basic chatbots",
        "Complex initial setup and training period",
        "Best results require CRM integration and data quality",
        "Some industries may require significant customization"
      ]),
      detailInfo: "Conversica provides AI-powered virtual assistants that engage prospects and customers in natural, two-way conversations across multiple channels, including email, SMS, and web chat. Unlike basic chatbots, Conversica's Intelligent Virtual Assistants can understand context, ask questions, interpret responses, and take appropriate actions based on the conversation flow. The platform uses advanced natural language processing and machine learning to create authentic conversations that feel personal and human-like. Conversica's assistants are particularly valuable for addressing critical conversion points in the customer journey, such as lead follow-up, meeting scheduling, customer onboarding, and renewal conversations. The AI assistants excel at persistent, polite follow-up, sending multiple messages over time until receiving a response, which significantly improves engagement rates compared to human teams. When prospects express interest or ask questions that require human expertise, the system automatically alerts the appropriate team member and provides conversation context for a smooth transition. Conversica integrates with leading CRM systems like Salesforce, Microsoft Dynamics, and HubSpot, along with marketing automation platforms, to leverage existing data and update records based on conversation outcomes.",
      pricingInfo: JSON.stringify({
        monthly: 3000,
        yearly: 36000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 3000, "features": ["Single AI Assistant", "Basic conversation capabilities", "Standard integrations", "Email support"]},
          {"name": "Professional", "price": 5000, "features": ["Multiple AI Assistants", "Advanced conversations", "Priority support", "Performance analytics"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited AI Assistants", "Custom conversations", "Dedicated success manager", "Advanced integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=yPFWW0vJFA4"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.boomtrain.com",
    data: {
      name: "Boomtrain (by Zeta Global)",
      description: "Boomtrain is an AI-powered personalization platform, now part of Zeta Global, that helps marketers deliver individualized content and product recommendations across email, web, and mobile experiences.",
      price: 2500,
      category: "Marketing Personalization",
      imageUrl: "https://www.zetaglobal.com/wp-content/themes/zeta/images/zeta-logo.svg",
      tags: JSON.stringify(["personalization", "predictive recommendations", "marketing automation", "customer engagement", "omnichannel marketing"]),
      advantages: JSON.stringify([
        "Real-time personalization across channels",
        "Predictive content and product recommendations",
        "Individual user preference modeling",
        "Dynamic email content personalization",
        "Web and mobile personalization capabilities",
        "Integration with major CMS and e-commerce platforms",
        "Customer journey optimization",
        "A/B testing for personalization strategies",
        "Behavioral targeting capabilities",
        "Detailed personalization analytics"
      ]),
      disadvantages: JSON.stringify([
        "Higher cost entry point for small businesses",
        "Complex implementation requiring technical resources",
        "Best results require sufficient user behavioral data",
        "Learning curve for marketers to leverage full capabilities"
      ]),
      detailInfo: "Boomtrain, acquired by Zeta Global, is an AI-powered personalization platform that helps marketers create individualized experiences across digital channels. The technology builds individual user profiles based on behavior, preferences, and engagement patterns, then uses machine learning to predict what content or products each user is most likely to engage with next. This predictive intelligence drives real-time personalization across email, websites, mobile apps, and other digital touchpoints. For email marketing, the platform can dynamically personalize content for each recipient at the moment of open, ensuring the most relevant messaging even if user preferences have changed since sending. On websites and mobile apps, Boomtrain can personalize homepage content, product recommendations, navigation elements, and calls to action based on individual user interests and intent signals. The platform's AI continuously learns from user interactions, improving personalization accuracy over time and identifying emerging patterns in customer behavior. Boomtrain integrates with major content management systems, e-commerce platforms, and marketing technology stacks, allowing for consistent personalization across the customer journey.",
      pricingInfo: JSON.stringify({
        monthly: 2500,
        yearly: 27000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Growth", "price": 2500, "features": ["Basic personalization features", "Limited monthly active users", "Standard support", "Email personalization"]},
          {"name": "Professional", "price": 5000, "features": ["Advanced personalization", "Increased user capacity", "Priority support", "Multi-channel personalization"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited user capacity", "Dedicated support", "Custom implementation", "Advanced features"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=GBD5rsCS7rE"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI recommender and conversational AI tools in the database (English version - batch 6)...");
  
  for (const product of aiRecommenderProducts) {
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