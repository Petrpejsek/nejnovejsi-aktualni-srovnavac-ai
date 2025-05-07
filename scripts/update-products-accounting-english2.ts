import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accounting and financial AI tools in English - second batch
const accountingProducts = [
  {
    externalUrl: "https://www.fylehq.com",
    data: {
      name: "Fyle",
      description: "Fyle is an intelligent expense management platform that automates expense tracking, reporting, and reimbursement for businesses using artificial intelligence.",
      price: 10,
      category: "Expense Management",
      imageUrl: "https://www.fylehq.com/hubfs/Fyle-Website-Assets/Fyle_Website_Favicon.png",
      tags: JSON.stringify(["expense management", "accounting automation", "corporate cards", "accounting integration", "mobile scanning"]),
      advantages: JSON.stringify([
        "Automatic data extraction from receipts and invoices",
        "Live integration with credit cards",
        "Real-time monitoring of company expenses",
        "Integration with accounting systems",
        "Mobile app for easy expense reporting on the go",
        "Pre-filled forms based on past expenses",
        "Automation of approval processes",
        "Customizable rules for company expenses",
        "Complete audit trail of all transactions",
        "Advanced reporting tools"
      ]),
      disadvantages: JSON.stringify([
        "Some advanced features only in higher-tier plans",
        "Limited support for some local accounting standards",
        "More complex setup for specific company rules",
        "May require training for maximum feature utilization"
      ]),
      detailInfo: "Fyle transforms how companies manage and report employee expenses. The platform uses artificial intelligence to automate the entire process from digitizing receipts and invoices to their approval, reimbursement, and accounting. Unlike traditional solutions, Fyle offers live connection with corporate credit cards, which enables automatic transaction matching and significantly reduces the need for manual data entry. Thanks to integration with accounting systems like QuickBooks, Xero, Sage, and others, it ensures seamless data flow into company accounting.",
      pricingInfo: JSON.stringify({
        monthly: 10,
        yearly: 96,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 10, "features": ["Per user/month", "Basic automation", "Mobile app", "Standard support"]},
          {"name": "Business", "price": 20, "features": ["Per user/month", "Advanced automation", "Integrated credit cards", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom integrations", "Dedicated support", "Custom tailoring"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=R-LfqAHKCS0"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.rossum.ai",
    data: {
      name: "Rossum",
      description: "Rossum is an AI platform for document automation that uses advanced machine learning to extract data from invoices, orders, and other business documents.",
      price: 800,
      category: "Document Processing",
      imageUrl: "https://www.rossum.ai/wp-content/uploads/2023/04/Rossum_logo_home.png",
      tags: JSON.stringify(["invoice processing", "data extraction", "document automation", "AI OCR", "document digitization"]),
      advantages: JSON.stringify([
        "Data extraction accuracy up to 98% without templates",
        "Adaptive AI that learns from each document",
        "Document processing in multiple languages and formats",
        "Automation of the entire process from receipt to processing",
        "Efficient exception handling and data validation",
        "Integration with ERP and accounting systems",
        "Significant acceleration of document processing",
        "Reduction of errors in manual data entry",
        "Advanced approval workflows",
        "Auditable document processing history"
      ]),
      disadvantages: JSON.stringify([
        "Higher initial investment",
        "Requires time to train AI for specific document types",
        "Limited support for very non-standard document formats",
        "More complex implementation for extensive systems"
      ]),
      detailInfo: "Rossum brings revolution to business document processing through cognitive AI that truly reads and interprets documents similar to a human. Unlike traditional OCR solutions based on templates, Rossum can process diverse documents without the need for predefined patterns. The platform automates the entire document process from email receipt with attachments, through data extraction and validation, to export to downstream systems. Each processed document improves system accuracy thanks to advanced machine learning algorithms, making Rossum an adaptive solution that grows with your company's needs.",
      pricingInfo: JSON.stringify({
        monthly: 800,
        yearly: 8640,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Business", "price": 800, "features": ["Monthly", "Up to 1000 documents", "Standard integrations", "Email support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Unlimited documents", "Custom integrations", "Dedicated support", "Advanced workflow"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=KCTi1Hf3Xns"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.plateiq.com",
    data: {
      name: "Plate IQ",
      description: "Plate IQ is an end-to-end platform for invoice processing and payments, specialized in automating accounting processes in hospitality and other industries using advanced AI.",
      price: 500,
      category: "Invoice Automation",
      imageUrl: "https://plateiq.com/wp-content/uploads/2023/03/Plate-IQ_Logo_Digital_Color.png",
      tags: JSON.stringify(["invoice processing", "AP automation", "invoice payments", "expense management", "accounting automation"]),
      advantages: JSON.stringify([
        "Specialization in hospitality and industry-specific needs",
        "Complete solution from digitization to payments",
        "Integrated payment network for simplified settlements",
        "Automatic matching of orders and invoices",
        "Tracking price changes and savings reports",
        "Virtual payment card management",
        "Advanced expense and cost analysis",
        "Automation of approval processes",
        "Integration with major accounting and ERP systems",
        "Mobile app for approvals and overview"
      ]),
      disadvantages: JSON.stringify([
        "Higher price for smaller businesses",
        "Some features optimized primarily for hospitality",
        "More complex implementation for companies with non-standard processes",
        "May require adjustments to existing internal procedures"
      ]),
      detailInfo: "Plate IQ offers a complete solution for automating the process of invoice processing and payments with an emphasis on the specific needs of hospitality and related industries. The platform uses advanced AI for invoice digitization, data extraction, and automation of the entire accounts payable (AP) cycle. A unique feature is the integrated payment network that allows not only processing but also direct payment of invoices within a single system, including virtual card management for better expense control. Compared to competitors, Plate IQ excels in its ability to identify product price changes over time and generate detailed reports of potential savings.",
      pricingInfo: JSON.stringify({
        monthly: 500,
        yearly: 5400,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 500, "features": ["Monthly", "Invoice processing", "Basic reports", "Email support"]},
          {"name": "Professional", "price": 1000, "features": ["Monthly", "Payment network", "Advanced reports", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Complete AP solution", "Custom integrations", "Dedicated support", "SLA guarantees"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=ByDfVngmuIY"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.airbase.com",
    data: {
      name: "Airbase",
      description: "Airbase is a comprehensive spend management platform that unifies corporate cards, invoice payments, and process workflows using AI to automate accounting operations.",
      price: 1000,
      category: "Spend Management",
      imageUrl: "https://airbase.com/wp-content/uploads/2023/01/Airbase_Meta_2-4.png",
      tags: JSON.stringify(["spend management", "corporate cards", "payment automation", "AP automation", "financial management"]),
      advantages: JSON.stringify([
        "Unification of all company expenses on one platform",
        "Intelligent workflow for expense approvals",
        "Automated categorization and accounting of transactions",
        "Virtual and physical corporate cards with real-time controls",
        "Detailed reporting and budget control",
        "Advanced automation of vendor payments",
        "Automatic synchronization with accounting systems",
        "Integrated tool for subscription management",
        "Complete audit trail for all transactions",
        "Advanced controls and verification"
      ]),
      disadvantages: JSON.stringify([
        "Higher price for smaller companies",
        "Complex implementation when connecting to existing systems",
        "Need to change some established processes",
        "Less suitable for companies with minimal financial flows"
      ]),
      detailInfo: "Airbase brings an innovative approach to company expense management by unifying all payment methods into a single platform. It combines subscription management, vendor invoice payments, and corporate card management (both virtual and physical) with advanced control and automation. The platform uses artificial intelligence for automatic invoice processing, expense categorization, and synchronization with accounting systems. Special attention is paid to control mechanisms such as multi-level approvals, pre-expense checks, and detailed reporting, which helps companies better manage cash flow and adhere to financial rules and policies.",
      pricingInfo: JSON.stringify({
        monthly: 1000,
        yearly: 10800,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 1000, "features": ["Monthly", "Basic controls", "Corporate cards", "Standard support"]},
          {"name": "Growth", "price": 2000, "features": ["Monthly", "Advanced controls", "AP automation", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Custom workflow", "Advanced analytics", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=D-k-BoQNOWQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.aider.ai",
    data: {
      name: "Aider",
      description: "Aider is an AI-powered assistant for small businesses that processes financial and accounting data, provides business insights, and helps with strategic decision-making through a natural language interface.",
      price: 60,
      category: "Business AI Assistant",
      imageUrl: "https://aider.ai/wp-content/uploads/2023/05/Aider-social-media.png",
      tags: JSON.stringify(["AI assistant", "financial analysis", "business insights", "data-driven decision making", "small businesses"]),
      advantages: JSON.stringify([
        "Natural language communication with data",
        "Automatic analysis of financial data and trends",
        "Proactive alerts to financial issues",
        "Integration with accounting systems and POS",
        "Personalized business insights",
        "Help with cash flow predictions",
        "Simple implementation without technical knowledge",
        "Conversational interface for easy use",
        "Continuous learning and adaptation to company needs",
        "Affordable for small businesses"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced features compared to specialized financial tools",
        "Dependency on input data quality",
        "Possible limitations with very specific queries",
        "Some integrations only available in higher pricing plans"
      ]),
      detailInfo: "Aider represents a new generation of AI assistants specifically designed for small business needs. Unlike common analytical tools, it uses a conversational interface that allows users to ask questions about their business in natural language and get immediate answers and insights. The system connects with accounting software, POS systems, and other data sources to gain a comprehensive view of the financial situation and business operations. Unique is Aider's ability to not only answer queries but also proactively alert to important trends, potential problems, or opportunities based on real-time data analysis.",
      pricingInfo: JSON.stringify({
        monthly: 60,
        yearly: 576,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 60, "features": ["Monthly", "Basic analytics", "Standard integrations", "Email support"]},
          {"name": "Professional", "price": 120, "features": ["Monthly", "Advanced analytics", "All integrations", "Priority support"]},
          {"name": "Premium", "price": 240, "features": ["Monthly", "Custom solutions", "Dedicated account", "Phone support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=kqBmYaIEfCE"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://booke.ai",
    data: {
      name: "Booke AI",
      description: "Booke AI is an intelligent accounting assistant that automates accounting processes and provides financial insights for small and medium businesses using artificial intelligence.",
      price: 29,
      category: "AI Accounting Assistant",
      imageUrl: "https://booke.ai/wp-content/uploads/2023/03/booke-ai-logo.png",
      tags: JSON.stringify(["accounting assistant", "accounting automation", "financial analysis", "small businesses", "AI accounting"]),
      advantages: JSON.stringify([
        "Automation of routine accounting tasks",
        "Real-time financial insights",
        "Easy integration with common accounting software",
        "Personalized financial recommendations",
        "Reduced need for manual data entry",
        "Proactive alerts to financial issues",
        "Intuitive user interface",
        "Affordable for small businesses",
        "24/7 access to financial data",
        "Saves time and reduces errors in accounting"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced features in basic plan",
        "May require initial integration setup",
        "Less suitable for very specific accounting requirements",
        "Limited support for some local accounting standards"
      ]),
      detailInfo: "Booke AI uses artificial intelligence to transform how small and medium businesses manage their finances. The platform focuses on automating time-consuming accounting tasks such as transaction categorization, payment matching, and financial report generation, allowing entrepreneurs to focus on growing their business. Thanks to its ability to learn from data and adapt to the needs of a specific business, Booke AI provides increasingly accurate financial insights and recommendations that help with strategic decisions.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Limited features", "50 transactions monthly", "Basic reporting", "Email support"]},
          {"name": "Starter", "price": 29, "features": ["Monthly", "500 transactions", "Standard integrations", "Chat support"]},
          {"name": "Growth", "price": 79, "features": ["Monthly", "2000 transactions", "Advanced analytics", "Priority support"]},
          {"name": "Enterprise", "price": 199, "features": ["Monthly", "Unlimited transactions", "Custom integrations", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.ramp.com",
    data: {
      name: "Ramp",
      description: "Ramp is a financial platform with artificial intelligence that helps companies save time and money through expense automation, intelligent corporate card management, and spend analysis.",
      price: 0,
      category: "Financial Management",
      imageUrl: "https://ramp.com/assets/img/ramp-logo-share.png",
      tags: JSON.stringify(["corporate cards", "expense management", "financial automation", "cost savings", "accounting integration"]),
      advantages: JSON.stringify([
        "Free basic service (revenue model on interchange fees)",
        "Automatic identification of potential savings",
        "Intelligent corporate cards with real-time controls",
        "Automated approval processes",
        "Integration with accounting and ERP systems",
        "Expense restrictions by department or category",
        "Automatic matching of transactions and receipts",
        "Simple implementation and friendly user interface",
        "Advanced expense reports and analysis",
        "Paperless expense processing"
      ]),
      disadvantages: JSON.stringify([
        "Available primarily for US companies",
        "Some advanced features require paid extensions",
        "Less suitable for very small businesses with minimal expenses",
        "Limited international support"
      ]),
      detailInfo: "Ramp brings revolution to corporate finance through its comprehensive platform that combines smart corporate cards with powerful tools for control and expense optimization. Unlike traditional corporate card providers, Ramp actively helps companies identify duplicate subscriptions, unused services, and savings opportunities. The platform uses artificial intelligence to automate the entire expense management process - from receipt digitization through automatic accounting to detailed analysis of spending patterns. The basic service is provided for free because Ramp earns on interchange fees, which is a unique business model in this industry.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 0, "features": ["Corporate cards", "Basic controls", "Standard integrations", "Email support"]},
          {"name": "Plus", "price": 0, "features": ["From $75,000 yearly", "Advanced controls", "Custom workflow", "Dedicated support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Comprehensive solution", "API access", "Dedicated team"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=Mw7aV5aJWDU"]),
      hasTrial: false
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing accounting and financial AI tools in the database (English version - batch 2)...");
  
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