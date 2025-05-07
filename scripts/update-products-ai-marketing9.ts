import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI marketing and automation tools - batch 9
const aiMarketingProducts = [
  {
    externalUrl: "https://www.fullstory.com",
    data: {
      name: "FullStory",
      description: "FullStory is a digital experience analytics platform that combines session replay, heatmaps, and funnel analytics with AI-powered insights to help businesses understand and improve user experiences.",
      price: 833,
      category: "Digital Experience Analytics",
      imageUrl: "https://www.fullstory.com/assets/svgs/fullstory-logo.svg",
      tags: JSON.stringify(["session replay", "user analytics", "conversion optimization", "ux research", "digital experience"]),
      advantages: JSON.stringify([
        "Comprehensive session replay capabilities",
        "AI-powered search across all user sessions",
        "Automatic frustration detection",
        "Heatmaps and click maps without setup",
        "Custom event and funnel analysis",
        "Integration with major analytics platforms",
        "Error tracking and reproduction",
        "Privacy controls and data governance",
        "Cross-device journey tracking",
        "ROI quantification tools"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point for small businesses",
        "Can generate large amounts of data to manage",
        "Advanced features require higher tiers",
        "Learning curve for full platform utilization"
      ]),
      detailInfo: "FullStory provides a comprehensive digital experience platform that combines session replay technology with advanced analytics to help businesses understand user behavior and improve digital experiences. The platform captures detailed user interactions including clicks, scrolls, navigation paths, and even rage clicks (signs of user frustration), allowing teams to see exactly how users engage with websites and apps. FullStory's AI-powered search capabilities enable teams to find specific user behaviors across millions of sessions instantly, helping identify patterns and issues without manually reviewing hundreds of recordings. The platform automatically detects and flags user frustration signals like rage clicks, dead clicks, and form abandonment, prioritizing which issues to address first based on impact. For product and UX teams, FullStory provides heatmaps and click maps that visualize where users focus attention, all generated automatically without requiring specific setup for each page. The funnel analysis tools help identify where users drop off in conversion processes, while error tracking capabilities capture console logs and network requests when errors occur, making debugging more efficient. FullStory integrates with major analytics, marketing, and customer support platforms, allowing teams to connect quantitative data with qualitative insights for a complete understanding of the customer journey.",
      pricingInfo: JSON.stringify({
        monthly: 833,
        yearly: 9996,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Business", "price": 833, "features": ["Starting monthly price", "Session replay", "Basic analytics", "Standard integrations"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Advanced analytics", "Custom integrations", "Dedicated support", "Enhanced security"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=j_xcNzKrpAY"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.sproutsocial.com",
    data: {
      name: "Sprout Social",
      description: "Sprout Social is an AI-enhanced social media management platform that helps businesses schedule content, engage with audiences, analyze performance, and derive actionable insights across multiple social channels.",
      price: 249,
      category: "Social Media Management",
      imageUrl: "https://sproutsocial.com/wp-content/uploads/Sprout-Social-logo.svg",
      tags: JSON.stringify(["social media management", "content scheduling", "social analytics", "community management", "social listening"]),
      advantages: JSON.stringify([
        "Unified inbox for all social interactions",
        "AI-powered content suggestions and optimization",
        "Comprehensive analytics and reporting",
        "Advanced scheduling and publishing tools",
        "Automated response recommendations",
        "Social listening and sentiment analysis",
        "Competitive analysis capabilities",
        "Team collaboration features",
        "CRM integration for customer context",
        "Customizable workflows and approval processes"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point compared to basic schedulers",
        "Advanced features limited to higher tiers",
        "Learning curve for full platform utilization",
        "Some integrations require Enterprise plan"
      ]),
      detailInfo: "Sprout Social is a comprehensive social media management platform enhanced with AI capabilities to help businesses more effectively manage their social presence, engage with audiences, and gain actionable insights from social data. The platform's Smart Inbox centralizes messages, comments, and brand mentions from multiple social networks into a single stream, allowing teams to respond efficiently across channels without switching between tools. For content creation and scheduling, Sprout Social offers AI-powered writing assistance that can generate post ideas, optimize content for different platforms, and suggest optimal posting times based on audience engagement patterns. The platform's advanced publishing tools support visual content planning through a calendar interface, bulk scheduling, and queue management with category-based scheduling. On the analytics side, Sprout provides detailed performance metrics across platforms, with customizable reports that track growth, engagement, and content effectiveness. The social listening capabilities extend beyond direct mentions to analyze broader conversations, sentiment trends, and competitive intelligence, helping businesses understand market positioning and identify emerging opportunities. For customer service teams, Sprout offers automated response suggestions, chatbot integration, and issue routing based on message content. The platform also includes team collaboration features such as message approval workflows, task assignment, and performance metrics for individual team members.",
      pricingInfo: JSON.stringify({
        monthly: 249,
        yearly: 2388,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 249, "features": ["Per user/month", "5 social profiles", "All-in-one social inbox", "Publishing and scheduling", "Basic reporting"]},
          {"name": "Professional", "price": 399, "features": ["Per user/month", "10 social profiles", "Competitive reports", "Advanced analytics", "Optimal send times"]},
          {"name": "Advanced", "price": 499, "features": ["Per user/month", "10 social profiles", "Automated link tracking", "Custom report builder", "Advanced listening"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited social profiles", "All features", "Dedicated support", "Custom integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=lEuZn3mPR_Y"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.reply.io",
    data: {
      name: "Reply.io",
      description: "Reply.io is an AI-powered sales engagement platform that automates multichannel outreach with email, LinkedIn, WhatsApp, and calls while personalizing messages and optimizing sequences based on recipient behavior.",
      price: 70,
      category: "Sales Engagement",
      imageUrl: "https://reply.io/wp-content/themes/reply/images/reply-logo.svg",
      tags: JSON.stringify(["sales automation", "email sequences", "multichannel outreach", "sales engagement", "lead generation"]),
      advantages: JSON.stringify([
        "AI-powered email personalization",
        "Multichannel outreach synchronization",
        "Automated follow-up sequences",
        "Email deliverability optimization",
        "A/B testing for messaging",
        "LinkedIn automation integration",
        "Advanced analytics and reporting",
        "CRM integration for data sync",
        "Team collaboration features",
        "Customizable templates and workflows"
      ]),
      disadvantages: JSON.stringify([
        "Email limits on lower-tier plans",
        "LinkedIn integration requires higher tiers",
        "Learning curve for sequence optimization",
        "Some advanced features need technical setup"
      ]),
      detailInfo: "Reply.io provides a comprehensive sales engagement platform that helps sales teams automate and personalize outreach across multiple channels while optimizing sequences based on recipient behavior and engagement data. The platform's core email automation capabilities enable users to create multi-step sequences with personalized messages and dynamic timing between steps based on prospect engagement. Beyond basic automation, Reply's AI-powered features can analyze prospect data and content to suggest personalization elements, generate message variations, and optimize subject lines for better open rates. The multichannel approach integrates email, LinkedIn, WhatsApp, SMS, and calling into coordinated sequences, ensuring consistent messaging across touchpoints while preventing channel overlap. For email deliverability, Reply includes advanced features like email warm-up, domain rotation, and deliverability monitoring to ensure messages reach prospects' inboxes. The platform's A/B testing capabilities allow teams to compare different message variations, subject lines, and sending times to identify the most effective approaches. Through CRM integrations with Salesforce, HubSpot, and others, Reply syncs prospect data and engagement history bidirectionally, ensuring sales teams have complete context when engaging with leads. For sales managers, the platform provides detailed analytics on team performance, campaign effectiveness, and pipeline impact, with custom reports for different stakeholders.",
      pricingInfo: JSON.stringify({
        monthly: 70,
        yearly: 720,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 70, "features": ["Per user/month", "1,000 emails/month", "Email sequences", "Basic templates", "Standard support"]},
          {"name": "Professional", "price": 120, "features": ["Per user/month", "3,000 emails/month", "LinkedIn integration", "Phone calls", "Priority support"]},
          {"name": "Business", "price": 200, "features": ["Per user/month", "10,000 emails/month", "All channels", "Advanced analytics", "Dedicated success manager"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom email volume", "Advanced security", "Custom integrations", "Premium support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=u4aWZ3TN2fk"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.zapier.com",
    data: {
      name: "Zapier",
      description: "Zapier is an AI-enhanced automation platform that connects apps and services, enabling businesses to create automated workflows (Zaps) between them without coding, with AI assistance for workflow creation and optimization.",
      price: 19.99,
      category: "Workflow Automation",
      imageUrl: "https://cdn.zapier.com/zapier/images/logos/zapier-logo.svg",
      tags: JSON.stringify(["workflow automation", "app integration", "no-code automation", "business process automation", "productivity"]),
      advantages: JSON.stringify([
        "Connects 5,000+ apps and services",
        "No-code automation builder",
        "AI assistant for workflow creation",
        "Multi-step automations",
        "Conditional logic capabilities",
        "Filters and formatters for data transformation",
        "Built-in error handling and monitoring",
        "Team collaboration features",
        "Custom app connections via webhooks",
        "Versioning and revision history"
      ]),
      disadvantages: JSON.stringify([
        "Task limits on lower-tier plans",
        "Complex workflows require higher tiers",
        "Update frequency depends on plan level",
        "Limited advanced data transformation options"
      ]),
      detailInfo: "Zapier is a powerful automation platform that connects thousands of apps and services, allowing businesses to automate workflows between them without requiring programming skills. The platform's core functionality enables users to create 'Zaps' - automated workflows that are triggered by events in one app to perform actions in another app. With over 5,000 app integrations including Gmail, Slack, Salesforce, Google Sheets, and HubSpot, Zapier can automate virtually any business process that involves digital tools. Recently enhanced with AI capabilities, Zapier now offers an AI assistant that can suggest automation ideas, help build workflows based on natural language descriptions, and optimize existing automations for better performance. Beyond simple triggers and actions, Zapier supports multi-step workflows with conditional logic (if/then statements), filters to process only relevant data, and formatters to transform data between systems. For more complex needs, Zapier offers features like paths (branching workflows), delays, and scheduled triggers. The platform's team collaboration features enable organizations to share workflows, manage permissions, and track usage across departments. For technical users, Zapier provides webhooks and custom code steps for handling edge cases or connecting with unsupported applications. As businesses grow, Zapier's scalable architecture can handle increasing automation volume with features like queueing, task history, and error handling to ensure reliability.",
      pricingInfo: JSON.stringify({
        monthly: 19.99,
        yearly: 239.40,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["5 single-step Zaps", "100 tasks/month", "5-minute update time", "Basic support"]},
          {"name": "Starter", "price": 19.99, "features": ["20 multi-step Zaps", "750 tasks/month", "2-minute update time", "Premium support"]},
          {"name": "Professional", "price": 49.99, "features": ["Unlimited Zaps", "2,000 tasks/month", "1-minute update time", "Advanced features"]},
          {"name": "Team", "price": 69.99, "features": ["Unlimited Zaps", "Shared workspace", "50,000 tasks/month", "Collaboration tools"]},
          {"name": "Company", "price": 149.99, "features": ["Unlimited Zaps", "Multiple workspaces", "100,000 tasks/month", "Admin controls"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=oOCTvTgfLbQ"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.chatfuel.com",
    data: {
      name: "Chatfuel",
      description: "Chatfuel is an AI chatbot platform that helps businesses create automated conversational experiences for customer service, marketing, and lead generation on messaging platforms like Facebook Messenger and Instagram.",
      price: 0,
      category: "Conversational AI",
      imageUrl: "https://chatfuel.com/wp-content/themes/chatfuel/static/logo.svg",
      tags: JSON.stringify(["chatbots", "conversational marketing", "messenger automation", "instagram automation", "customer service"]),
      advantages: JSON.stringify([
        "No-code bot builder interface",
        "AI-powered response generation",
        "Instagram and Facebook Messenger integration",
        "Built-in analytics dashboard",
        "Flow visualization tools",
        "Broadcasting and re-engagement features",
        "User attribute tracking",
        "Integration with major CRMs",
        "A/B testing capabilities",
        "Natural language processing options"
      ]),
      disadvantages: JSON.stringify([
        "Limited platform coverage outside Meta",
        "Advanced features require premium plans",
        "Complex flows can become challenging to manage",
        "AI capabilities limited compared to specialized options"
      ]),
      detailInfo: "Chatfuel provides a specialized platform for creating AI-powered chatbots primarily for Facebook Messenger and Instagram, enabling businesses to automate conversations with customers for marketing, customer service, and sales purposes. The platform's intuitive drag-and-drop interface allows non-technical users to create conversation flows using a visual builder, with no coding required. Chatfuel combines rule-based conversation structures with AI capabilities for understanding user intent and generating natural responses to inquiries outside predefined paths. For marketing teams, Chatfuel offers tools to create interactive experiences that engage users through quizzes, product recommendations, and guided shopping experiences, while capturing lead information that can be synced to CRM systems. The platform's broadcasting feature enables businesses to send targeted messages to segments of their audience based on demographics, behavior, or previous interactions, with scheduling options for optimal timing. On the analytics side, Chatfuel provides detailed insights into conversation metrics, user engagement, and conversion rates, helping teams optimize their chatbot's performance over time. The platform includes A/B testing capabilities for comparing different conversation paths or message formats to identify the most effective approaches. For more complex use cases, Chatfuel offers API integrations with external systems, JSON capabilities for dynamic content, and webhooks for connecting with custom backends.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Up to 50 conversations/month", "Basic bot builder", "Standard templates", "Email support"]},
          {"name": "Pro", "price": 0, "features": ["Custom starting price", "Higher conversation limits", "All features", "Priority support", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=jHN8YYLfWGI"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.rtbhouse.com",
    data: {
      name: "RTB House",
      description: "RTB House is an AI-driven marketing technology platform specializing in deep learning-powered retargeting and personalized display advertising to help e-commerce businesses drive conversions and sales.",
      price: 0,
      category: "AI Advertising",
      imageUrl: "https://www.rtbhouse.com/wp-content/themes/rtbhouse/assets/img/logo.svg",
      tags: JSON.stringify(["retargeting", "programmatic advertising", "deep learning", "display ads", "personalization"]),
      advantages: JSON.stringify([
        "Deep learning algorithms for superior targeting",
        "Full-funnel advertising approach",
        "Dynamic creative optimization",
        "Product recommendation engine",
        "Real-time bidding optimization",
        "Cross-device user identification",
        "Transparent performance reporting",
        "Brand safety controls",
        "Global advertising reach",
        "Cookieless targeting solutions"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-focused pricing model",
        "Best results require significant traffic volume",
        "Limited self-service options",
        "Complex implementation for full benefits"
      ]),
      detailInfo: "RTB House leverages proprietary deep learning algorithms to deliver highly effective personalized retargeting and display advertising campaigns for e-commerce and retail businesses. Unlike competitors using traditional machine learning or rule-based systems, RTB House has built its entire technology stack on deep neural networks, enabling more accurate prediction of user interests and purchase intent. The platform analyzes user behavior patterns across websites to identify potential customers at different stages of the purchase funnel, then delivers tailored ad experiences designed to move them toward conversion. RTB House's dynamic creative optimization engine automatically generates thousands of ad variations, selecting the optimal product recommendations, layouts, calls to action, and other elements based on individual user preferences and browsing history. The company's full-funnel approach extends beyond traditional retargeting to include prospecting for new customers with similar profiles to existing buyers, re-engagement of lapsed customers, and loyalty-building campaigns for repeat purchasers. For clients concerned about the phasing out of third-party cookies, RTB House offers advanced cookieless targeting solutions that maintain performance while respecting user privacy. The platform provides transparent reporting through a dedicated dashboard showing campaign performance metrics, ROI analysis, and granular insights into audience segments and creative performance. RTB House typically works with larger e-commerce operations on a managed service model with dedicated account support and custom pricing based on advertising spend.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing based on ad spend", "Full platform access", "Dedicated account management", "Custom implementation", "Advanced reporting"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=sFtXa7-9Z6E"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.auxia.ai",
    data: {
      name: "Auxia",
      description: "Auxia (formerly Forethought) is an AI customer service platform that provides intelligent automation, agent assistance, and self-service solutions to enhance support efficiency and customer experience.",
      price: 0,
      category: "Customer Service AI",
      imageUrl: "https://auxia.ai/wp-content/uploads/2023/09/Auxia-Logo-Black-Transparent-RGB.png",
      tags: JSON.stringify(["customer support automation", "ai agent assistance", "knowledge management", "self-service", "ticket routing"]),
      advantages: JSON.stringify([
        "Automated customer self-service",
        "AI agent assistance for faster resolution",
        "Intelligent ticket classification and routing",
        "Knowledge base automation and enhancement",
        "Multi-channel support capabilities",
        "Integration with major service platforms",
        "Continuous learning from support interactions",
        "Detailed analytics on support efficiency",
        "Easy implementation with existing systems",
        "Language understanding beyond keywords"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise pricing model",
        "Best results require significant training data",
        "Complex implementation for full integration",
        "Advanced features limited to higher tiers"
      ]),
      detailInfo: "Auxia (previously known as Forethought) provides an AI-powered platform designed to transform customer service operations through intelligent automation and agent augmentation. The platform consists of several integrated components addressing different aspects of the support workflow. Auxia Solve delivers automated self-service capabilities that can understand customer queries in natural language and provide relevant answers from knowledge bases, FAQs, and previous support interactions, resolving routine issues without agent involvement. For more complex issues requiring human agents, Auxia Assist works alongside support representatives, analyzing incoming tickets in real-time and suggesting relevant knowledge articles, similar past tickets, and recommended responses to help agents resolve issues faster. The platform's intelligent routing capabilities automatically categorize incoming support requests, determine priority and complexity, and assign them to the most appropriate agents or teams based on expertise and availability. Behind these customer-facing functions, Auxia's knowledge management system continuously analyzes support interactions to identify gaps in documentation, automatically generate new knowledge articles, and ensure information remains accurate and up-to-date. The platform integrates with major customer service tools including Zendesk, Salesforce Service Cloud, and Intercom, fitting into existing support ecosystems without disrupting workflows. Auxia's natural language understanding capabilities go beyond simple keyword matching to comprehend customer intent, context, and sentiment, enabling more accurate automated responses and more helpful agent recommendations.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full platform access", "Dedicated implementation", "Premium support", "Custom integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=6Uz9s3l7wkw"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.deckmatch.com",
    data: {
      name: "DeckMatch",
      description: "DeckMatch is an AI-powered platform that helps startups and businesses connect with investors by analyzing pitch decks, matching them with relevant investors, and providing insights to optimize fundraising strategies.",
      price: 99,
      category: "Fundraising Intelligence",
      imageUrl: "https://www.deckmatch.com/images/Logo.svg",
      tags: JSON.stringify(["investor matching", "pitch deck analysis", "fundraising", "startup funding", "investor intelligence"]),
      advantages: JSON.stringify([
        "AI-powered investor matching algorithms",
        "Personalized investor recommendations",
        "Pitch deck analysis and optimization",
        "Access to investor database",
        "Automated outreach and tracking",
        "Fundraising analytics and insights",
        "Investment round planning tools",
        "Investor engagement tracking",
        "Follow-up automation features",
        "Data-driven fundraising approach"
      ]),
      disadvantages: JSON.stringify([
        "Limited effectiveness for very early startups",
        "Premium features require higher-tier plans",
        "Network strength varies by industry segment",
        "Quality of matches depends on deck quality"
      ]),
      detailInfo: "DeckMatch provides a specialized AI platform designed to transform how startups approach fundraising by using machine learning to match companies with the most relevant potential investors. The platform's core functionality begins with analyzing a startup's pitch deck and business information through natural language processing and computer vision, extracting key details about the business model, market opportunity, traction metrics, team background, and funding requirements. This analysis is then compared against DeckMatch's extensive investor database, which contains detailed profiles of venture capital firms, angel investors, family offices, and other funding sources, including their investment preferences, portfolio companies, typical check sizes, and historical investment patterns. Based on this comparison, DeckMatch generates a ranked list of investor recommendations most likely to be interested in the specific opportunity, dramatically reducing the time founders spend researching potential investors. Beyond matching, the platform provides valuable feedback on pitch decks, identifying areas for improvement to better address investor concerns and expectations for specific funding stages and sectors. The fundraising workflow management features help founders plan and execute their investor outreach strategy, with tools to track communications, schedule follow-ups, and monitor investor engagement. For investors, DeckMatch offers a curated deal flow of pre-screened opportunities aligned with their investment thesis, saving time on initial screening and connecting them with relevant startups they might otherwise miss.",
      pricingInfo: JSON.stringify({
        monthly: 99,
        yearly: 948,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Startup", "price": 99, "features": ["Monthly subscription", "Basic investor matching", "Pitch deck analysis", "Limited investor contacts", "Standard support"]},
          {"name": "Growth", "price": 249, "features": ["Monthly subscription", "Advanced matching algorithm", "Unlimited investor contacts", "Outreach automation", "Priority support"]},
          {"name": "Professional", "price": 499, "features": ["Monthly subscription", "Premium investor network", "Dedicated advisor", "Advanced analytics", "Fundraising strategy support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=LK2QfFgI1CQ"]),
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
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI marketing and automation tools in the database (English version - batch 9)...");
  
  for (const product of aiMarketingProducts) {
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