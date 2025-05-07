import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// První dávka účetních a finančních AI nástrojů
const accountingProducts = [
  {
    externalUrl: "https://www.digitoo.ai",
    data: {
      name: "Digitoo",
      description: "Digitoo is an AI-powered invoice and receipt processing platform that automates accounting tasks by digitizing documents, extracting data, and integrating with accounting systems.",
      price: 29,
      category: "Accounting Automation",
      imageUrl: "https://www.digitoo.ai/wp-content/uploads/2023/04/digitoo-metaimage.png",
      tags: JSON.stringify(["AI accounting", "document processing", "invoice automation", "receipt scanning", "OCR"]),
      advantages: JSON.stringify([
        "Automated invoice and receipt processing",
        "Seamless integration with accounting software",
        "Time-saving document digitization",
        "High accuracy data extraction",
        "Streamlined approval workflows",
        "Reduced manual entry errors",
        "Cost-effective accounting automation",
        "User-friendly interface",
        "Secure document storage"
      ]),
      disadvantages: JSON.stringify([
        "May require initial setup time",
        "Limited customization for specific industries",
        "Depends on document quality for accuracy",
        "Subscription pricing model"
      ]),
      detailInfo: "Digitoo uses artificial intelligence to transform accounting processes by automating document handling. The platform captures invoices and receipts from various sources, extracts relevant data using OCR and AI, and sends the structured information to accounting systems. This reduces manual data entry, minimizes errors, and allows accounting teams to focus on higher-value tasks.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Basic", "price": 29, "features": ["Up to 100 documents/month", "Email/scan capture", "Data extraction", "Basic accounting integrations"]},
          {"name": "Professional", "price": 79, "features": ["Up to 500 documents/month", "Advanced workflow rules", "API access", "Priority support"]},
          {"name": "Enterprise", "price": 199, "features": ["Unlimited documents", "Custom integrations", "Dedicated account manager", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify([]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://booke.ai",
    data: {
      name: "Booke AI",
      description: "Booke AI is an intelligent bookkeeping solution that automates financial data processing, reconciliation, and reporting for small businesses and accounting professionals.",
      price: 19,
      category: "AI Bookkeeping",
      imageUrl: "https://booke.ai/wp-content/uploads/2023/07/booke-ai-logo.png",
      tags: JSON.stringify(["bookkeeping", "accounting automation", "financial reporting", "reconciliation", "small business"]),
      advantages: JSON.stringify([
        "Automated transaction categorization",
        "Intelligent reconciliation suggestions",
        "Real-time financial insights",
        "Time-saving month-end closing",
        "Seamless integration with banking systems",
        "Simplified tax preparation",
        "Learning algorithm adapts to business patterns",
        "Mobile receipt capture",
        "Easy collaboration with accountants"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced accounting features",
        "Learning curve for full automation benefits",
        "May require occasional manual verification",
        "Not suited for complex enterprise accounting"
      ]),
      detailInfo: "Booke AI simplifies bookkeeping by applying artificial intelligence to financial data processing. The platform automates transaction classification, bank reconciliation, and financial reporting while learning from corrections to improve accuracy over time. Designed for small businesses and accounting professionals, it reduces the time spent on routine bookkeeping tasks and improves financial visibility.",
      pricingInfo: JSON.stringify({
        monthly: 19,
        yearly: 190,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Up to 50 transactions/month", "Basic reporting", "Manual reconciliation", "Email support"]},
          {"name": "Starter", "price": 19, "features": ["Up to 250 transactions/month", "Automated categorization", "Bank connections", "Basic reporting"]},
          {"name": "Growth", "price": 49, "features": ["Up to 1,000 transactions/month", "Advanced reporting", "Customizable rules", "Priority support"]},
          {"name": "Professional", "price": 99, "features": ["Unlimited transactions", "Custom integrations", "Multi-entity support", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=sample123"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://alice.redque.cz",
    data: {
      name: "Alice by RedqueIT",
      description: "Alice is a Czech AI-powered accounting assistant that automates document processing, data entry, and accounting tasks for businesses and accounting firms.",
      price: 25,
      category: "AI Accounting Assistant",
      imageUrl: "https://alice.redque.cz/images/alice-icon.png",
      tags: JSON.stringify(["accounting automation", "czech accounting", "document processing", "data extraction", "AI assistant"]),
      advantages: JSON.stringify([
        "Specialized for Czech accounting regulations",
        "Automated invoice processing",
        "Integrated with common Czech ERP systems",
        "Continuous learning from corrections",
        "Significant time savings on routine tasks",
        "Local language support",
        "Reduces accounting errors",
        "Quick implementation process",
        "Regular updates for regulatory compliance"
      ]),
      disadvantages: JSON.stringify([
        "Primarily focused on Czech market",
        "Limited international accounting standards",
        "Requires proper document quality",
        "May need occasional human oversight"
      ]),
      detailInfo: "Alice by RedqueIT is an AI accounting assistant specifically designed for the Czech accounting environment. It automates document capturing, data extraction, and processing according to Czech accounting standards. The system integrates with popular local ERP systems and continuously improves its accuracy by learning from user corrections, making it an efficient solution for accounting firms and businesses in the Czech Republic.",
      pricingInfo: JSON.stringify({
        monthly: 25,
        yearly: 250,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Basic", "price": 25, "features": ["Up to 200 documents/month", "Email/scan capture", "Basic data extraction", "Standard integrations"]},
          {"name": "Business", "price": 60, "features": ["Up to 500 documents/month", "Advanced extraction", "Custom rules", "Priority support"]},
          {"name": "Enterprise", "price": 150, "features": ["Unlimited documents", "Custom workflows", "API access", "Dedicated account manager"]}
        ]
      }),
      videoUrls: JSON.stringify([]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.dext.com",
    data: {
      name: "Dext",
      description: "Dext (formerly Receipt Bank) is a comprehensive accounting automation platform that captures, processes, and shares financial data through AI-powered document extraction and workflow automation.",
      price: 20,
      category: "Financial Data Automation",
      imageUrl: "https://www.dext.com/wp-content/uploads/2021/02/open-graph-prepare.jpg",
      tags: JSON.stringify(["receipt capture", "invoice processing", "expense management", "data extraction", "accounting integration"]),
      advantages: JSON.stringify([
        "Multi-channel document capture (email, app, web)",
        "Automated data extraction with high accuracy",
        "Seamless integration with major accounting platforms",
        "Real-time financial visibility",
        "Simplified expense management",
        "Audit-ready document storage",
        "Time-saving approval workflows",
        "Supplier spending insights",
        "Multi-currency support"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing compared to basic solutions",
        "Some advanced features limited to top tiers",
        "Initial setup requires time investment",
        "Learning curve for full feature utilization"
      ]),
      detailInfo: "Dext transforms accounting processes by automating the capture and processing of financial documents. The platform uses AI to extract key data from receipts, invoices, and bills, then organizes and exports this information to accounting software. With additional tools for tracking supplier spending and managing practice workflows, Dext offers a comprehensive solution for accountants and businesses looking to streamline financial data management.",
      pricingInfo: JSON.stringify({
        monthly: 20,
        yearly: 216,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Business", "price": 20, "features": ["Per user/month", "Receipt and invoice capture", "Accounting software integration", "Mobile app"]},
          {"name": "Premium", "price": 35, "features": ["Per user/month", "Advanced data extraction", "Purchase order matching", "Analytics"]},
          {"name": "Ultimate", "price": 60, "features": ["Per user/month", "All features", "Custom workflows", "Priority support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=ry_KKC4ELlM"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.vic.ai",
    data: {
      name: "Vic.ai",
      description: "Vic.ai is an AI-powered autonomous accounting platform that automates accounts payable and financial workflows using neural networks to process invoices and expenses with minimal human intervention.",
      price: 0,
      category: "Autonomous Accounting",
      imageUrl: "https://vic.ai/wp-content/uploads/2023/02/vic-social-share-1200x630-1.jpg",
      tags: JSON.stringify(["autonomous accounting", "accounts payable", "invoice processing", "AI accounting", "neural networks"]),
      advantages: JSON.stringify([
        "Autonomous invoice processing",
        "Learns from accounting team behavior",
        "High accuracy data extraction",
        "Coding suggestions based on historical patterns",
        "Reduces processing costs significantly",
        "Audit trail and compliance features",
        "Approval workflow automation",
        "Advanced analytics and insights",
        "Scalable for high volume processing",
        "Seamless ERP integration"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-focused pricing",
        "Requires substantial invoice volume for optimal ROI",
        "Complex implementation for legacy systems",
        "Advanced features require training period"
      ]),
      detailInfo: "Vic.ai represents the next generation of accounting automation, using artificial intelligence and neural networks to create a truly autonomous accounting system. The platform handles accounts payable processes from invoice capture through coding, approval, and payment processing. Unlike rules-based automation, Vic.ai learns continuously from accounting team behaviors to improve coding accuracy and remove the need for manual review, resulting in significant cost and time savings for mid-market and enterprise businesses.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Custom", "price": 0, "features": ["Custom pricing based on volume", "Autonomous invoice processing", "AP automation", "ML-based coding"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Autonomous accounting", "Advanced workflows", "Custom integrations", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=EBC9oBiS3h8"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (dávka 1)...");
  
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