import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Třetí dávka účetních a finančních AI nástrojů
const accountingProducts = [
  {
    externalUrl: "https://www.botkeeper.com",
    data: {
      name: "Botkeeper",
      description: "Botkeeper provides automated bookkeeping using human-assisted AI technology to deliver accurate accounting services for businesses and accounting firms at scale.",
      price: 55,
      category: "Automated Bookkeeping",
      imageUrl: "https://www.botkeeper.com/hubfs/botkeeper-social-image.png",
      tags: JSON.stringify(["automated bookkeeping", "accounting automation", "AI accounting", "financial reporting", "accounting outsourcing"]),
      advantages: JSON.stringify([
        "24/7 automated bookkeeping",
        "Human-assisted AI for accuracy",
        "Scalable solution for accounting firms",
        "White-label capabilities",
        "Machine learning continuous improvement",
        "Seamless accounting software integration",
        "Detailed audit trails",
        "Customizable reporting dashboards",
        "Task management and workflows",
        "Client collaboration portal"
      ]),
      disadvantages: JSON.stringify([
        "Higher entry price point",
        "Implementation requires data migration",
        "Advanced features limited to higher tiers",
        "Full benefits realized over time"
      ]),
      detailInfo: "Botkeeper combines artificial intelligence and skilled accountants to deliver automated bookkeeping services at scale. The platform handles data entry, categorization, reconciliation, and reporting while providing accounting firms with a white-labeled solution to serve their clients more efficiently. Using machine learning, Botkeeper continuously improves its accuracy while allowing human accountants to focus on higher-value advisory services rather than routine bookkeeping tasks.",
      pricingInfo: JSON.stringify({
        monthly: 55,
        yearly: 550,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Entry", "price": 55, "features": ["Per client/month", "Basic bookkeeping", "Standard reports", "Email support"]},
          {"name": "Growth", "price": 99, "features": ["Per client/month", "Advanced bookkeeping", "Custom reports", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full-service accounting", "Custom integrations", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=sNXU8aSP7SQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.zenledger.io",
    data: {
      name: "ZenLedger",
      description: "ZenLedger is a tax software built for cryptocurrency investors and accountants that uses AI to automate crypto transaction tracking, tax reporting, and portfolio monitoring.",
      price: 149,
      category: "Crypto Tax Software",
      imageUrl: "https://www.zenledger.io/wp-content/uploads/2022/12/zenledger-og-image.jpg",
      tags: JSON.stringify(["cryptocurrency tax", "crypto accounting", "tax automation", "portfolio tracking", "blockchain analytics"]),
      advantages: JSON.stringify([
        "Automatic import from 400+ exchanges",
        "Cryptocurrency tax form generation",
        "DeFi and NFT transaction support",
        "Tax-loss harvesting identification",
        "Historical price data tracking",
        "Accounting software integration",
        "Audit trail documentation",
        "Year-round portfolio monitoring",
        "Multiple accounting methods support",
        "International tax compliance"
      ]),
      disadvantages: JSON.stringify([
        "Complex crypto transactions require verification",
        "Premium features in higher pricing tiers",
        "Learning curve for advanced features",
        "Limited customer support in basic plan"
      ]),
      detailInfo: "ZenLedger specializes in solving the complex challenge of cryptocurrency tax reporting and accounting. The platform automatically imports transactions from hundreds of exchanges, wallets, and blockchains, then applies tax rules to generate compliant tax forms and reports. With features for tax-loss harvesting, portfolio analysis, and integration with traditional accounting software, ZenLedger helps both individuals and professional accountants manage crypto assets efficiently.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 149,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["25 transactions", "Tax forms", "Portfolio tracking", "Email support"]},
          {"name": "Starter", "price": 149, "features": ["100 transactions", "All tax forms", "Priority support", "Cost basis methods"]},
          {"name": "Premium", "price": 399, "features": ["1,000 transactions", "Tax-loss harvesting", "Margin trading", "Live chat support"]},
          {"name": "Executive", "price": 999, "features": ["Unlimited transactions", "Dedicated accounting rep", "All features", "Priority support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleVideo"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.zohobooks.com",
    data: {
      name: "Zoho Books",
      description: "Zoho Books is an intelligent accounting software that uses AI to automate routine accounting tasks, streamline workflows, and provide insights for better financial decision-making.",
      price: 10,
      category: "AI Accounting Software",
      imageUrl: "https://www.zoho.com/books/images/zoho-books-social.png",
      tags: JSON.stringify(["accounting software", "expense management", "invoicing", "financial reporting", "AI automation"]),
      advantages: JSON.stringify([
        "Automated bank reconciliation",
        "AI-powered expense categorization",
        "Intelligent invoice processing",
        "Smart payment reminders",
        "Automated recurring transactions",
        "Real-time financial reporting",
        "Multi-currency support",
        "Tax compliance automation",
        "Client portal for collaboration",
        "Extensive third-party integrations"
      ]),
      disadvantages: JSON.stringify([
        "Advanced features require higher plans",
        "Initial setup takes time for customization",
        "Limited features in mobile app",
        "Learning curve for full functionality"
      ]),
      detailInfo: "Zoho Books combines comprehensive accounting features with AI-powered automation to simplify financial management for small and medium businesses. The software handles invoicing, expense tracking, bank reconciliation, and reporting while using artificial intelligence to automate transaction categorization, data entry, and workflow processes. As part of the broader Zoho ecosystem, it integrates seamlessly with other business applications to provide an end-to-end solution for financial management.",
      pricingInfo: JSON.stringify({
        monthly: 10,
        yearly: 100,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Up to 1,000 invoices", "2 users", "Basic features", "Email support"]},
          {"name": "Standard", "price": 10, "features": ["Up to 5,000 invoices", "3 users", "Automated workflows", "Bank reconciliation"]},
          {"name": "Professional", "price": 20, "features": ["Up to 10,000 invoices", "5 users", "Custom reports", "Inventory tracking"]},
          {"name": "Premium", "price": 30, "features": ["Unlimited invoices", "10 users", "Advanced analytics", "Custom fields"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=k3moCPldus4"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.veryfi.com",
    data: {
      name: "Veryfi",
      description: "Veryfi is an AI-powered document processing platform that extracts data from receipts, invoices, and financial documents in seconds to automate accounting, expense management, and data entry.",
      price: 49,
      category: "Document Intelligence",
      imageUrl: "https://www.veryfi.com/wp-content/uploads/2022/10/veryfi-share-image.png",
      tags: JSON.stringify(["receipt capture", "OCR", "document processing", "data extraction", "expense management"]),
      advantages: JSON.stringify([
        "Near-instant document processing",
        "High accuracy data extraction",
        "No templates or rules required",
        "Field-level data recognition",
        "Mobile and web capture options",
        "Line item extraction",
        "Data privacy and security focus",
        "Developer-friendly APIs",
        "Cross-platform compatibility",
        "White-label capabilities"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-focused pricing",
        "API implementation requires technical resources",
        "Some customization needed for specific industries",
        "Advanced features in higher plans only"
      ]),
      detailInfo: "Veryfi specializes in extracting structured data from unstructured documents using AI and machine learning. The platform captures financial documents through various channels, then extracts, categorizes, and delivers the data to accounting and business systems. Unlike traditional OCR, Veryfi's deep learning algorithms understand context and improve over time, enabling accurate extraction of complex data like line items and tables without human intervention.",
      pricingInfo: JSON.stringify({
        monthly: 49,
        yearly: 490,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Developer", "price": 49, "features": ["100 documents/month", "Core APIs", "Standard support", "Basic dashboard"]},
          {"name": "Business", "price": 249, "features": ["1,000 documents/month", "All APIs", "Priority support", "Advanced analytics"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom volume", "Custom integrations", "Dedicated support", "SLA guarantees"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=kA7HG-JCT44"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.sage.com/en-us/products/sage-intacct/",
    data: {
      name: "Sage Intacct",
      description: "Sage Intacct is an advanced cloud financial management platform with AI capabilities that automates complex accounting processes, provides real-time insights, and supports multi-entity operations.",
      price: 20000,
      category: "Cloud Financial Management",
      imageUrl: "https://www.sage.com/en-us/-/media/images/sage/products/intacct/og-image-sage-intacct.png",
      tags: JSON.stringify(["cloud accounting", "financial management", "AI automation", "multi-entity", "financial reporting"]),
      advantages: JSON.stringify([
        "Intelligent GL automation",
        "AI-powered transaction matching",
        "Automated multi-entity consolidation",
        "Predictive analytics",
        "Continuous close capabilities",
        "Dimensional reporting",
        "Revenue recognition automation",
        "Customizable workflows",
        "Industry-specific solutions",
        "Extensive integration ecosystem"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point for small businesses",
        "Complex implementation process",
        "Requires accounting expertise",
        "Substantial training for full utilization"
      ]),
      detailInfo: "Sage Intacct delivers sophisticated financial management with built-in AI capabilities for mid-sized organizations and growing businesses. The system automates complex accounting processes like multi-entity consolidation, revenue recognition, and project accounting while providing real-time financial insights through customizable dashboards and reports. With its dimensional general ledger and intelligent automation, Sage Intacct enables finance teams to spend less time on transactions and more time on strategic analysis and decision support.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 20000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 20000, "features": ["Starting annual price", "Core financials", "Basic reporting", "Standard support"]},
          {"name": "Business", "price": 35000, "features": ["Starting annual price", "Advanced modules", "Custom reporting", "Priority support"]},
          {"name": "Enterprise", "price": 50000, "features": ["Starting annual price", "All modules", "Custom development", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=MtNgJZj3kMM"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (dávka 3)...");
  
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