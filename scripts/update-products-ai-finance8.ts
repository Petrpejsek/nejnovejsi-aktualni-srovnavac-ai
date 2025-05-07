import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI financial and expense management tools - batch 8
const aiFinanceProducts = [
  {
    externalUrl: "https://www.fylehq.com",
    data: {
      name: "Fyle",
      description: "Fyle is an AI-powered expense management platform that automates receipt capture, expense categorization, and compliance checking for businesses of all sizes.",
      price: 8,
      category: "Expense Management",
      imageUrl: "https://www.fylehq.com/hs-fs/hubfs/Fyle_May%202020/Images/fyle-logo-full.png",
      tags: JSON.stringify(["expense management", "receipt scanning", "expense reporting", "corporate cards", "accounting integration"]),
      advantages: JSON.stringify([
        "Real-time expense capture from credit cards and receipts",
        "Automated policy compliance checks",
        "Mobile receipt scanning with data extraction",
        "Integration with major accounting software",
        "Corporate card management and reconciliation",
        "Customizable approval workflows",
        "Automated mileage tracking",
        "Analytics and spending insights",
        "Multi-currency support",
        "Digital audit trail for all expenses"
      ]),
      disadvantages: JSON.stringify([
        "Advanced features require higher-tier plans",
        "Some integrations may need custom setup",
        "Mobile app occasionally has sync issues",
        "Limited customization in basic plans"
      ]),
      detailInfo: "Fyle transforms expense management through its AI-powered platform that eliminates manual data entry and automates the entire expense reporting process. The system can extract data from receipts using computer vision and machine learning, automatically categorizing expenses and checking them against company policies in real-time. Fyle's direct card integrations allow for automatic transaction import and matching with receipts, while its accounting integrations sync expense data with popular platforms like QuickBooks, Xero, and NetSuite. The platform's automation extends to approval workflows, which can be customized based on department, expense amount, or category. For finance teams, Fyle provides analytics tools to track spending trends, identify cost-saving opportunities, and ensure policy compliance. The mobile app allows employees to capture receipts on the go, track mileage automatically using GPS, and submit expenses from anywhere, dramatically reducing the time spent on expense reports.",
      pricingInfo: JSON.stringify({
        monthly: 8,
        yearly: 96,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Growth", "price": 8, "features": ["Per user/month, billed annually", "Unlimited expense reports", "Basic policy controls", "Standard integrations"]},
          {"name": "Business", "price": 15, "features": ["Per user/month, billed annually", "Advanced approval workflows", "Corporate card management", "Analytics dashboard"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Dedicated support", "Custom integrations", "Advanced compliance tools"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=dkzineVjQRw"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.veryfi.com",
    data: {
      name: "Veryfi",
      description: "Veryfi is an AI-powered document intelligence platform that extracts data from receipts, invoices, and financial documents to automate data entry, accounting, and expense management processes.",
      price: 49,
      category: "Document Processing",
      imageUrl: "https://veryfi.com/wp-content/uploads/2022/01/veryfi-logo.svg",
      tags: JSON.stringify(["document processing", "receipt scanning", "OCR", "data extraction", "accounting automation"]),
      advantages: JSON.stringify([
        "High accuracy data extraction from documents",
        "Fast processing (under 2 seconds per document)",
        "Comprehensive field extraction including line items",
        "No templates required for document recognition",
        "HIPAA, GDPR, and SOC2 compliant",
        "Mobile SDK for in-app receipt scanning",
        "API-first architecture for easy integration",
        "Supports 90+ languages and currencies",
        "Robust duplicate detection",
        "Data validation and correction features"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-focused pricing",
        "May require developer resources for integration",
        "Performance varies with document quality",
        "Advanced features only available in higher tiers"
      ]),
      detailInfo: "Veryfi provides intelligent document processing technology that transforms unstructured documents like receipts, invoices, bills, and purchase orders into structured data through its AI-powered OCR (Optical Character Recognition) platform. Unlike traditional OCR solutions, Veryfi uses deep learning and computer vision to understand document context, layout, and relationships between data points, enabling it to extract detailed information with high accuracy regardless of format variations. The platform can identify and extract numerous data fields including vendor information, dates, totals, tax amounts, line items, payment methods, and custom fields specific to different document types. For businesses, Veryfi eliminates manual data entry, reducing processing costs and human error while accelerating accounting workflows. The technology can be deployed through multiple channels including APIs, mobile SDKs, and pre-built applications, allowing flexible integration options for different business needs. Veryfi's focus on security and compliance makes it suitable for industries with strict data handling requirements, while its global language and currency support enables use across international operations. Beyond basic data extraction, the platform includes data enrichment features that categorize expenses, detect duplicates, and validate information against business rules.",
      pricingInfo: JSON.stringify({
        monthly: 49,
        yearly: 588,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 49, "features": ["100 documents/month", "Basic data extraction", "Standard API access", "Email support"]},
          {"name": "Pro", "price": 149, "features": ["500 documents/month", "Advanced field extraction", "Priority support", "Custom fields"]},
          {"name": "Business", "price": 499, "features": ["2,000 documents/month", "Full line item extraction", "Dedicated support", "Advanced integrations"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom volume", "Custom implementation", "SLA guarantees", "Dedicated success manager"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=uYskg8Yv_t4"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.plateiq.com",
    data: {
      name: "Plate IQ",
      description: "Plate IQ is an AI-powered accounts payable automation platform that digitizes invoices, automates approval workflows, and provides spend analytics, primarily for restaurants and hospitality businesses.",
      price: 500,
      category: "Accounts Payable Automation",
      imageUrl: "https://www.plateiq.com/wp-content/themes/plate-iq/assets/images/logo.svg",
      tags: JSON.stringify(["accounts payable", "invoice processing", "vendor management", "payment automation", "hospitality finance"]),
      advantages: JSON.stringify([
        "Specialized for restaurant and hospitality industries",
        "Line-item invoice digitization with 99%+ accuracy",
        "Automated three-way matching",
        "Price tracking and variance alerts",
        "Digital vendor payments platform",
        "Automated approval workflows",
        "GL coding and accounting system integration",
        "Spend analytics and reporting",
        "Cost tracking across multiple locations",
        "Virtual card rebate program"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing than general-purpose AP solutions",
        "Most beneficial for businesses with high invoice volume",
        "Learning curve for complex features",
        "Implementation requires process changes"
      ]),
      detailInfo: "Plate IQ transforms accounts payable processes for restaurants, hotels, and other hospitality businesses through AI-powered invoice digitization and automation. The platform's core technology can digitize complex invoices at the line-item level, extracting detailed information including product names, quantities, units, prices, and vendor details with high accuracy. This granular approach to invoice processing enables much richer data analysis than traditional AP automation solutions. For multi-location businesses, Plate IQ provides centralized invoice management with location-specific approval workflows, allowing corporate visibility while maintaining operational autonomy. The system's price tracking features automatically flag price increases and discrepancies between quoted and invoiced amounts, helping businesses control costs and maintain vendor accountability. Plate IQ's VendorPay network enables digital payments to vendors through various methods including ACH, check, and virtual cards, with a rebate program that generates cash back on eligible spend. Beyond basic AP automation, the platform provides comprehensive spend analytics that help businesses identify cost-saving opportunities, optimize purchasing, and negotiate better vendor terms based on actual spend data. The system integrates with major accounting platforms and inventory management systems, enabling automated GL coding and reconciliation.",
      pricingInfo: JSON.stringify({
        monthly: 500,
        yearly: 6000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Core", "price": 500, "features": ["Starting monthly price", "Invoice digitization", "Basic approvals", "Standard integrations"]},
          {"name": "Professional", "price": 1000, "features": ["Advanced approval workflows", "Vendor management", "Analytics dashboard", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Multi-entity management", "Advanced analytics", "Dedicated support", "Custom integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=dJK9aMzEB0g"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.airbase.com",
    data: {
      name: "Airbase",
      description: "Airbase is a comprehensive spend management platform that unifies accounts payable, corporate cards, and employee expense reimbursements with approval workflows, accounting automation, and real-time reporting.",
      price: 1000,
      category: "Spend Management",
      imageUrl: "https://www.airbase.com/hubfs/Brand%20assets/Airbase%20Logo.svg",
      tags: JSON.stringify(["spend management", "accounts payable", "corporate cards", "expense reimbursements", "approval automation"]),
      advantages: JSON.stringify([
        "All-in-one platform for AP, cards, and reimbursements",
        "Pre-approved virtual cards with spend controls",
        "Automated invoice capture and processing",
        "Customizable multi-level approval workflows",
        "Real-time visibility into all company spend",
        "Automated sync with accounting systems",
        "Corporate card with cash back rewards",
        "Policy controls built into payment methods",
        "Vendor management and payment optimization",
        "Detailed audit trail for compliance"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing suited for mid-market and enterprise",
        "Complex implementation for full feature utilization",
        "Feature richness creates learning curve",
        "Requires process standardization across departments"
      ]),
      detailInfo: "Airbase offers a unified spend management platform that consolidates typically fragmented finance operations into a single system with consistent controls, approval workflows, and reporting. The platform addresses the three main categories of business spending: accounts payable for vendor invoices, corporate cards for employee purchases, and expense reimbursements. For accounts payable, Airbase automates the invoice ingestion process using AI to extract key data, routes invoices through configurable approval workflows, and facilitates payments through various methods including ACH, check, card, and international wire. The corporate card program includes physical and virtual cards with built-in controls, where spend limits, merchant categories, and expiration dates can be pre-defined based on company policies. Virtual cards can be created instantly for specific vendors or purchases, with automatic reconciliation to the appropriate GL accounts. The reimbursement module streamlines the process for employee out-of-pocket expenses with mobile receipt capture, automatic policy checking, and fast reimbursement options. Throughout all spending channels, Airbase maintains consistent approval workflows, accounting automation, and audit trails, eliminating policy gaps and providing finance teams with complete spend visibility. The platform integrates deeply with major accounting systems like NetSuite, Sage Intacct, and QuickBooks, automatically syncing transaction data with the correct coding for streamlined month-end close processes.",
      pricingInfo: JSON.stringify({
        monthly: 1000,
        yearly: 12000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 1000, "features": ["Starting monthly price", "Core spend management", "Basic approval workflows", "Standard integrations"]},
          {"name": "Professional", "price": 2000, "features": ["Advanced approvals", "Custom workflows", "Priority support", "Advanced reporting"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Multi-entity support", "Advanced customization", "Dedicated support", "SSO and advanced security"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=EC0NMeBVpFw"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.ramp.com",
    data: {
      name: "Ramp",
      description: "Ramp is an AI-powered financial automation platform that combines corporate cards, expense management, bill payments, and accounting integrations to help businesses save time and reduce costs.",
      price: 0,
      category: "Financial Automation",
      imageUrl: "https://cdn.ramp.com/ramp/assets/logos/ramp-logo-black-new.svg",
      tags: JSON.stringify(["financial automation", "corporate cards", "expense management", "accounts payable", "spend analysis"]),
      advantages: JSON.stringify([
        "Free platform with no subscription fees",
        "AI-powered expense categorization and policy enforcement",
        "2% cash back on all spend with no category restrictions",
        "Real-time spend control and card management",
        "Automated receipt matching and expense reconciliation",
        "Vendor management and negotiation insights",
        "Bill pay automation with approval workflows",
        "Price intelligence for cost optimization",
        "Direct integrations with accounting systems",
        "Custom reporting and spend analytics"
      ]),
      disadvantages: JSON.stringify([
        "Card program requires business creditworthiness",
        "Some advanced features require higher-tier plans",
        "Limited international payment capabilities",
        "Revenue model based on interchange fees"
      ]),
      detailInfo: "Ramp reimagines financial operations through a comprehensive platform that combines corporate cards, expense management, bill payments, and reporting with AI-powered automation throughout. The foundation of Ramp's offering is its corporate card program, which provides physical and virtual cards with customizable spend controls and automated expense policies enforced at the point of purchase. Unlike traditional corporate cards, Ramp offers 2% unlimited cash back on all purchases with no category restrictions or spending thresholds. Beyond cards, Ramp's expense management features automate the entire expense process, from receipt capture and matching to approval routing and accounting sync. The platform's AI can automatically categorize expenses, detect potential policy violations, and flag duplicate charges or unusual spending patterns. For accounts payable, Ramp streamlines vendor invoice management with automated data extraction, approval workflows, and payment execution through ACH, check, or card. The system's vendor management capabilities provide insights into spending patterns across suppliers, highlighting opportunities for consolidation or negotiation. Ramp's Savings feature analyzes company spending to identify cost-cutting opportunities, from duplicate software subscriptions to overpriced vendor contracts, with benchmarking against similar businesses. All financial data is centralized in a unified reporting dashboard with real-time visibility and custom reporting capabilities, while deep integrations with accounting systems ensure accurate financial records with minimal manual work.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["No subscription fee", "Unlimited users and cards", "Expense management", "Basic bill pay", "2% cash back on all spend"]},
          {"name": "Plus", "price": 0, "features": ["Free for qualifying businesses", "Advanced automations", "Custom integrations", "Dedicated support", "Additional security controls"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing for large organizations", "Multi-entity management", "Advanced customization", "Dedicated success team", "Custom implementation"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=RU0Bhxa8aps"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.ayasdi.com",
    data: {
      name: "Ayasdi AI",
      description: "Ayasdi AI (by SymphonyAI) is an enterprise AI platform that uses topological data analysis and machine learning to discover patterns and insights in complex financial datasets for risk management, fraud detection, and investment strategies.",
      price: 25000,
      category: "Enterprise AI Analytics",
      imageUrl: "https://www.symphonyai.com/wp-content/themes/symphony-ai/assets/img/logo-symphonyai.svg",
      tags: JSON.stringify(["topological data analysis", "machine learning", "financial risk", "fraud detection", "investment analytics"]),
      advantages: JSON.stringify([
        "Advanced pattern discovery in complex datasets",
        "Unsupervised learning for unknown risk detection",
        "Explainable AI for regulatory compliance",
        "Reduced false positives in fraud detection",
        "Automated model creation and validation",
        "Integration with existing data infrastructure",
        "Scalable processing of massive datasets",
        "Interactive visualization of complex relationships",
        "Time series analysis for market predictions",
        "Continuous learning and adaptation"
      ]),
      disadvantages: JSON.stringify([
        "Enterprise-level pricing",
        "Significant implementation complexity",
        "Requires data science expertise to maximize value",
        "Substantial data requirements for optimal results"
      ]),
      detailInfo: "Ayasdi AI, now part of SymphonyAI, applies topological data analysis and machine learning to solve complex problems in financial services and other industries. The platform's unique approach combines advanced mathematics, statistical learning, and visualization techniques to discover patterns and relationships in data that traditional analytics methods often miss. For financial institutions, Ayasdi's applications span several critical areas. In risk management, the platform can identify emerging risks and correlations across multiple variables that might indicate potential systemic issues before they materialize in traditional risk models. For anti-money laundering and fraud detection, Ayasdi's unsupervised learning capabilities can detect anomalous patterns without relying solely on predefined rules, dramatically reducing false positives while improving detection rates for sophisticated fraud schemes. Investment firms use Ayasdi to discover trading signals, optimize portfolio construction, and identify market inefficiencies by analyzing complex relationships between assets, economic indicators, and market behaviors. The platform's emphasis on explainable AI is particularly valuable in the highly regulated financial sector, as it provides transparent reasoning behind its insights and recommendations. Ayasdi's enterprise architecture integrates with existing data infrastructure and can process massive datasets across distributed computing environments, making it suitable for global financial institutions with complex data ecosystems.",
      pricingInfo: JSON.stringify({
        monthly: 25000,
        yearly: 300000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Enterprise", "price": 25000, "features": ["Starting monthly price", "Core AI platform", "Basic applications", "Standard support"]},
          {"name": "Enterprise Plus", "price": 50000, "features": ["All applications", "Advanced customization", "Priority support", "Implementation services"]},
          {"name": "Global", "price": 0, "features": ["Custom pricing", "Unlimited applications", "Dedicated AI team", "Full enterprise integration", "Custom development"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=UGvxu5h9CaA"]),
      hasTrial: false
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI financial and expense management tools in the database (English version - batch 8)...");
  
  for (const product of aiFinanceProducts) {
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