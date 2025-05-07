import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accounting and financial AI tools in English
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
  },
  {
    externalUrl: "https://www.dext.com",
    data: {
      name: "Dext",
      description: "Dext provides intelligent tools for digital accounting, automating document processing and financial reporting for accountants and small businesses.",
      price: 20,
      category: "Accounting Digitization",
      imageUrl: "https://dext.com/wp-content/uploads/2021/01/dext-og.jpg",
      tags: JSON.stringify(["document processing", "accounting digitization", "financial reporting", "cloud accounting", "tax documents"]),
      advantages: JSON.stringify([
        "Automatic processing and data extraction from documents",
        "Fast digital capture of receipts and invoices",
        "Integration with popular accounting software",
        "Mobile app for scanning documents on the go",
        "Reduced errors in data transcription",
        "Automatic expense categorization",
        "Easy search and archiving of documents",
        "Time savings for accountants and clients",
        "Efficient invoice processing",
        "Modern cloud solution"
      ]),
      disadvantages: JSON.stringify([
        "Higher price for very small companies",
        "Some advanced features only in more expensive plans",
        "May require fine-tuning for recognizing specific documents",
        "Limited functionality in offline mode"
      ]),
      detailInfo: "Dext (formerly known as Receipt Bank) is a comprehensive platform for digitizing and automating accounting document processing. It uses artificial intelligence to extract and categorize data from receipts, invoices, and other documents, significantly simplifying accounting processes. With integration to popular accounting software like Xero, QuickBooks, and others, it provides seamless data flow and allows accountants to focus on advisory services rather than manual data entry.",
      pricingInfo: JSON.stringify({
        monthly: 20,
        yearly: 199,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Business", "price": 20, "features": ["Per user/month", "Unlimited documents", "Mobile app", "Email support"]},
          {"name": "Premium", "price": 35, "features": ["Per user/month", "Advanced processing", "Priority support", "Accounting integrations"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom integrations", "Dedicated support", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=a_Dk5Qae9i4"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.vic.ai",
    data: {
      name: "Vic.ai",
      description: "Vic.ai is an autonomous accounting platform powered by artificial intelligence that automates invoice processing and accounting processes for accounting firms and finance departments.",
      price: 1000,
      category: "AI Accounting",
      imageUrl: "https://www.vic.ai/hubfs/Vic%20AI_logo_social_media.png",
      tags: JSON.stringify(["autonomous accounting", "invoice processing", "AI automation", "accounting automation", "machine learning"]),
      advantages: JSON.stringify([
        "Fully autonomous invoice processing",
        "Up to 99% accuracy thanks to advanced AI",
        "Continuous learning and system improvement",
        "Significant time savings in document processing",
        "Automatic detection of duplicates and fraud",
        "Advanced data analysis and predictive functions",
        "Integration with ERP and accounting systems",
        "Scalable solution from small to large companies",
        "Automatic matching of orders and invoices",
        "Ongoing cost control"
      ]),
      disadvantages: JSON.stringify([
        "Higher initial costs",
        "More complex implementation in larger organizations",
        "Requires time to train AI on company-specific documents",
        "Limited support in some geographic regions"
      ]),
      detailInfo: "Vic.ai revolutionizes invoice processing using neural networks and machine learning. Unlike traditional OCR solutions, Vic.ai truly learns from data and can interpret documents contextually, similar to a human accountant. The system automatically processes invoices, recognizes vendors, accounts, amounts, and other critical information, increasing its accuracy and efficiency with each processed document. An advanced anomaly detection system helps identify potential fraud or accounting errors.",
      pricingInfo: JSON.stringify({
        monthly: 1000,
        yearly: 10000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 1000, "features": ["Monthly per organization", "Basic automation", "Invoice processing", "Standard support"]},
          {"name": "Professional", "price": 2500, "features": ["Monthly per organization", "Advanced automation", "Anomaly detection", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Comprehensive automation", "Custom integrations", "Dedicated support", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=W5ErLSF0OUQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.docyt.com",
    data: {
      name: "Docyt",
      description: "Docyt is an AI platform for financial reporting and accounting that automates data collection and categorization and provides real-time financial insights and analysis.",
      price: 299,
      category: "Financial Reporting",
      imageUrl: "https://www.docyt.com/wp-content/uploads/2021/02/docyt-og-image.png",
      tags: JSON.stringify(["financial reporting", "accounting automation", "real-time insights", "AI accounting", "financial planning"]),
      advantages: JSON.stringify([
        "Automatic processing and categorization of transactions",
        "Real-time financial insights",
        "Detailed reporting at the level of locations, departments, and projects",
        "Automated reconciliation of bank transactions",
        "Tracking key financial metrics",
        "Adaptive AI that adapts to company needs",
        "Integration with banks and accounting systems",
        "Simplified planning and budgeting",
        "Customized reports for different stakeholders",
        "Secure cloud solution"
      ]),
      disadvantages: JSON.stringify([
        "Higher price for small businesses",
        "Limited support for some international accounting standards",
        "More complex setup for specific needs of some industries",
        "Limited functionality in the basic plan"
      ]),
      detailInfo: "Docyt transforms how companies process and utilize their financial data. The platform combines artificial intelligence and machine learning to automate the entire accounting process - from data collection through categorization to financial report generation. Unlike traditional solutions, Docyt provides real-time financial information and enables companies to make informed decisions based on current data. The system is designed for multi-location businesses and allows a detailed view of finances across different dimensions - by location, department, project, or expense category.",
      pricingInfo: JSON.stringify({
        monthly: 299,
        yearly: 2990,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 299, "features": ["Monthly", "One entity", "Basic reports", "Standard support"]},
          {"name": "Business", "price": 599, "features": ["Monthly", "Up to 3 entities", "Advanced reporting", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited entities", "Custom integrations", "Dedicated support", "Advanced analytics"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=TsaxDyTB3lI"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.ledgergurus.com",
    data: {
      name: "LedgerGurus",
      description: "LedgerGurus provides outsourced accounting services enhanced by technology and artificial intelligence, offering complete accounting solutions for e-commerce and SaaS companies.",
      price: 750,
      category: "Accounting Services",
      imageUrl: "https://www.ledgergurus.com/wp-content/uploads/2020/01/LedgerGurus-OG.png",
      tags: JSON.stringify(["outsourced accounting", "e-commerce accounting", "SaaS accounting", "cloud accounting", "financial advisory"]),
      advantages: JSON.stringify([
        "Combination of expert accounting team and modern technologies",
        "Specialization in e-commerce and SaaS companies",
        "Scalable solution growing with the company",
        "Expertise in complex accounting issues",
        "Implementation and management of accounting technologies",
        "Regular financial reports and analyses",
        "Effective tax planning",
        "Integration with a large number of e-commerce platforms",
        "Automation of routine accounting processes",
        "Strategic financial advisory"
      ]),
      disadvantages: JSON.stringify([
        "Higher costs compared to internal solutions for larger companies",
        "Need to share sensitive financial data with an external partner",
        "Less control over daily accounting processes",
        "May be less flexible for very specific requirements"
      ]),
      detailInfo: "LedgerGurus is not just a traditional outsourcing accounting firm - it's a hybrid solution combining human expertise with advanced technologies. They specialize in providing comprehensive accounting services for e-commerce and SaaS companies that face specific challenges such as multi-channel sales, subscriptions, or international tax obligations. Their approach includes implementation and optimization of accounting technologies, process automation, and providing strategic financial advice. LedgerGurus enables companies to focus on their core business while they handle the complex accounting agenda using the latest tools and practices.",
      pricingInfo: JSON.stringify({
        monthly: 750,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Bookkeeping", "price": 750, "features": ["Monthly", "Basic accounting", "Monthly closings", "Basic reports"]},
          {"name": "Controller", "price": 1500, "features": ["Monthly", "Advanced accounting", "Detailed reports", "Tax planning"]},
          {"name": "CFO", "price": 3000, "features": ["Monthly", "Strategic advisory", "Financial planning", "Investment analyses"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=jEehmJBCpDs"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.pilot.com",
    data: {
      name: "Pilot",
      description: "Pilot combines expert accountants with intelligent technology to provide accounting, tax services, and financial reporting for startups and growing companies.",
      price: 599,
      category: "Startup Accounting",
      imageUrl: "https://pilot.com/images/meta/homepage.png",
      tags: JSON.stringify(["startup accounting", "financial reporting", "tax services", "accounting outsourcing", "VC-backed accounting"]),
      advantages: JSON.stringify([
        "Specialization in the needs of startups and fast-growing companies",
        "Team of experienced accountants supported by technology",
        "Deep knowledge of accounting for VC-funded companies",
        "Integration with popular financial tools",
        "Monthly financial reports and analytics",
        "Support during investment rounds and due diligence",
        "Scalable solution growing with the company",
        "R&D tax credits for technology companies",
        "Predictable pricing structure",
        "High accuracy and reliability of services"
      ]),
      disadvantages: JSON.stringify([
        "Higher price compared to basic accounting services",
        "Primarily focused on the US market and accounting standards",
        "Less suitable for very small or traditional companies",
        "Limited support for some international operations"
      ]),
      detailInfo: "Pilot was founded by former technology startup founders who experienced firsthand the frustration with traditional accounting services. Their solution is specifically designed for the needs of modern, fast-growing companies and startups. The combination of expert accountants and proprietary technology allows Pilot to provide high-quality financial services with an emphasis on accuracy and timeliness. In addition to standard accounting, Pilot offers specialized services such as R&D tax credit, financial modeling, funding support, and other services that startups need for scaling. Their technology automates routine accounting tasks, while human experts focus on complex financial problems and strategic advice.",
      pricingInfo: JSON.stringify({
        monthly: 599,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Core", "price": 599, "features": ["Monthly", "Basic accounting", "Monthly closings", "Standard support"]},
          {"name": "Select", "price": 849, "features": ["Monthly", "Advanced accounting", "Financial reports", "Priority support"]},
          {"name": "Plus", "price": 1249, "features": ["Monthly", "Comprehensive accounting", "Accrual accounting", "CFO consulting"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom solution", "Dedicated team", "Comprehensive services"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=yzJY50klzH4"]),
      hasTrial: false
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing accounting and financial AI tools in the database (English version)...");
  
  for (const product of accountingProducts) {
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