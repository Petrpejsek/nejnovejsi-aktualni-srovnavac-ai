import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Druhá dávka účetních a finančních AI nástrojů
const accountingProducts = [
  {
    externalUrl: "https://www.e-cons.cz/ai-accounting",
    data: {
      name: "e-cons AI Accounting",
      description: "e-cons AI Accounting is a Czech accounting automation solution that uses artificial intelligence to streamline document processing, data extraction, and financial reporting for businesses and accounting firms.",
      price: 30,
      category: "AI Accounting",
      imageUrl: "https://www.e-cons.cz/wp-content/uploads/2023/07/e-cons-ai-accounting.jpg",
      tags: JSON.stringify(["czech accounting", "AI automation", "document processing", "financial reporting", "tax compliance"]),
      advantages: JSON.stringify([
        "Czech tax and accounting compliance",
        "Automated document classification",
        "Intelligent data extraction",
        "Seamless integration with local ERP systems",
        "Multi-level validation processes",
        "Time-saving automation workflows",
        "Reduced manual data entry errors",
        "Czech language support",
        "Continuous regulatory updates"
      ]),
      disadvantages: JSON.stringify([
        "Primarily focused on Czech market",
        "Advanced features require higher-tier plans",
        "Initial setup and training needed",
        "May require occasional manual verification"
      ]),
      detailInfo: "e-cons AI Accounting leverages artificial intelligence to transform traditional accounting workflows for Czech businesses. The platform automates document processing, data extraction, and reconciliation while ensuring compliance with local tax and accounting regulations. By reducing manual data entry and streamlining accounting processes, it allows finance teams to focus on strategic tasks rather than routine bookkeeping.",
      pricingInfo: JSON.stringify({
        monthly: 30,
        yearly: 300,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Basic", "price": 30, "features": ["Document processing", "Data extraction", "Basic integrations", "Email support"]},
          {"name": "Business", "price": 75, "features": ["Advanced automation", "Custom workflows", "API access", "Priority support"]},
          {"name": "Enterprise", "price": 150, "features": ["Custom solutions", "Dedicated account manager", "Advanced analytics", "Tailored integrations"]}
        ]
      }),
      videoUrls: JSON.stringify([]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.wflow.com",
    data: {
      name: "Wflow",
      description: "Wflow is an AI-powered workflow automation platform that streamlines accounting and finance processes by automating document handling, approval workflows, and data integration between systems.",
      price: 25,
      category: "Workflow Automation",
      imageUrl: "https://www.wflow.com/wp-content/uploads/2023/05/wflow-automation-platform.png",
      tags: JSON.stringify(["workflow automation", "document processing", "approval workflows", "system integration", "finance automation"]),
      advantages: JSON.stringify([
        "Visual workflow designer (no-code)",
        "Intelligent document processing",
        "Approval workflow automation",
        "Seamless system integrations",
        "Customizable templates for finance processes",
        "Real-time process monitoring",
        "Team collaboration features",
        "Compliance tracking and audit trails",
        "Mobile access and approvals"
      ]),
      disadvantages: JSON.stringify([
        "Complex workflows require detailed setup",
        "Limited advanced customization without API",
        "Learning curve for full platform utilization",
        "Some integrations require professional services"
      ]),
      detailInfo: "Wflow transforms finance and accounting operations through intelligent workflow automation. The platform features a no-code visual workflow designer that allows teams to automate document routing, approvals, and data synchronization between systems. With AI-powered document processing and smart approval routing, Wflow significantly reduces manual handling while improving visibility and control over financial processes.",
      pricingInfo: JSON.stringify({
        monthly: 25,
        yearly: 250,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["5 workflow templates", "Basic automation", "2 users", "Standard support"]},
          {"name": "Team", "price": 25, "features": ["Per user/month", "Unlimited workflows", "Advanced automation", "Priority support"]},
          {"name": "Business", "price": 50, "features": ["Per user/month", "Enterprise integrations", "Advanced analytics", "Dedicated support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom development", "Dedicated instances", "On-premises options"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleId"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://money.cz/novinky-a-tipy/ucetnictvi-2/digitalizace-ucetnictvi-a-umela-inteligence/",
    data: {
      name: "Money AI",
      description: "Money AI is an intelligent accounting enhancement for the popular Czech accounting software Money, leveraging artificial intelligence to automate data entry, document processing, and financial reporting tasks.",
      price: 15,
      category: "AI Accounting Enhancement",
      imageUrl: "https://money.cz/wp-content/uploads/2023/01/money-ai-accounting.jpg",
      tags: JSON.stringify(["czech accounting", "Money software", "AI automation", "document processing", "financial reporting"]),
      advantages: JSON.stringify([
        "Seamless integration with Money accounting software",
        "Automated invoice and receipt processing",
        "Czech tax compliance automation",
        "Bank statement reconciliation",
        "Regular regulatory updates",
        "Time-saving data entry automation",
        "Reduced processing errors",
        "Streamlined financial reporting",
        "Czech language document recognition"
      ]),
      disadvantages: JSON.stringify([
        "Requires Money software subscription",
        "Limited functionality outside Money ecosystem",
        "Basic AI features in entry-level plans",
        "Primarily focused on Czech market"
      ]),
      detailInfo: "Money AI enhances the capabilities of the established Czech accounting software Money by adding artificial intelligence features for document processing, data extraction, and automation. The solution is specifically designed for Czech tax and accounting regulations, automating routine tasks while maintaining compliance. With its deep integration into the Money software ecosystem, it provides a seamless experience for existing users looking to leverage AI in their accounting workflows.",
      pricingInfo: JSON.stringify({
        monthly: 15,
        yearly: 150,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Basic", "price": 15, "features": ["Document processing", "Basic data extraction", "Standard integration", "Email support"]},
          {"name": "Professional", "price": 30, "features": ["Advanced automation", "Full integration", "Priority support", "Custom templates"]},
          {"name": "Enterprise", "price": 60, "features": ["Custom workflows", "API access", "Dedicated support", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify([]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://crowdy.ai/cs/ai-chatbot-for-accounting-services/",
    data: {
      name: "Crowdy AI Accounting",
      description: "Crowdy AI Accounting is an AI-powered chatbot and automation platform specifically designed for accounting services, helping accounting firms automate client communication, data collection, and routine accounting tasks.",
      price: 29,
      category: "AI Accounting Assistant",
      imageUrl: "https://crowdy.ai/wp-content/uploads/2023/06/accounting-chatbot.png",
      tags: JSON.stringify(["accounting chatbot", "client communication", "data collection", "accounting automation", "document processing"]),
      advantages: JSON.stringify([
        "24/7 automated client communication",
        "Intelligent document collection and verification",
        "Automated expense categorization",
        "Natural language financial inquiries",
        "Scheduled reporting and reminders",
        "Multi-language support",
        "Conversational tax guidance",
        "Seamless accounting software integration",
        "Custom workflow automation"
      ]),
      disadvantages: JSON.stringify([
        "Complex inquiries require human intervention",
        "Initial training period for optimal performance",
        "Advanced features in higher pricing tiers",
        "Some customization requires technical setup"
      ]),
      detailInfo: "Crowdy AI Accounting transforms how accounting firms interact with their clients through an AI-powered chatbot and automation platform. The solution handles routine client communications, automates document collection and verification, and answers common financial questions without human intervention. By streamlining these processes, accounting professionals can focus on higher-value advisory services while maintaining consistent client communication and data collection.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Starter", "price": 29, "features": ["Basic chatbot", "Document collection", "Standard templates", "Email support"]},
          {"name": "Professional", "price": 69, "features": ["Advanced automation", "Custom workflows", "Integration with accounting software", "Priority support"]},
          {"name": "Business", "price": 129, "features": ["Full customization", "White labeling", "Advanced analytics", "Dedicated account manager"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=sampleVideo"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.docyt.com",
    data: {
      name: "Docyt",
      description: "Docyt is an AI-powered financial management platform that automates accounting workflows, reconciliation, and reporting to provide real-time financial insights for businesses and accounting firms.",
      price: 299,
      category: "Financial Management",
      imageUrl: "https://www.docyt.com/wp-content/uploads/2022/10/docyt-og-image.jpg",
      tags: JSON.stringify(["financial management", "accounting automation", "real-time reporting", "reconciliation", "financial insights"]),
      advantages: JSON.stringify([
        "Continuous accounting automation",
        "Real-time financial reporting",
        "Intelligent transaction coding",
        "Automated reconciliation",
        "Multi-entity management",
        "Custom reporting dashboards",
        "Data-driven financial insights",
        "Seamless accounting software integration",
        "Role-based access controls",
        "Advanced variance analysis"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing compared to basic solutions",
        "Significant setup required for complex businesses",
        "Advanced features have learning curve",
        "Implementation time for full benefits"
      ]),
      detailInfo: "Docyt transforms financial management by providing a comprehensive platform that automates accounting processes and delivers real-time financial insights. The system continuously processes transactions, applies intelligent coding based on historical patterns, and automatically reconciles accounts across multiple entities. With customizable dashboards and reports, Docyt provides finance teams with the timely information they need to make strategic decisions while reducing the manual effort of traditional accounting.",
      pricingInfo: JSON.stringify({
        monthly: 299,
        yearly: 3450,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 299, "features": ["Monthly close automation", "Basic reporting", "Standard integrations", "Email support"]},
          {"name": "Growth", "price": 499, "features": ["Advanced automation", "Custom reporting", "API access", "Priority support"]},
          {"name": "Professional", "price": 999, "features": ["Multi-entity management", "Advanced analytics", "Custom integrations", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleVideo"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (dávka 2)...");
  
  for (const product of accountingProducts) {
    try {
      // Najdi produkt podle externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Aktualizuji existující produkt: ${existingProduct.name}`);
        
        // Aktualizuj produkt s novými daty
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Aktualizován: ${product.data.name}`);
      } else {
        console.log(`Vytvářím nový produkt: ${product.data.name}`);
        
        // Vytvoř nový produkt
        const newProduct = await prisma.product.create({
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Vytvořen: ${product.data.name} s ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`Chyba při zpracování produktu ${product.externalUrl}:`, error);
    }
  }
  
  console.log("Všechny produkty byly úspěšně uloženy!");
}

// Spusť aktualizaci
updateOrCreateProducts()
  .catch((e) => {
    console.error("Chyba při procesu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 