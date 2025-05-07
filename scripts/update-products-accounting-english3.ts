import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accounting and financial AI tools in English - third batch
const accountingProducts = [
  {
    externalUrl: "https://www.aprio.com",
    data: {
      name: "Aprio",
      description: "Aprio is an accounting and advisory firm that utilizes AI and automation to provide accounting, tax advisory, and business consulting services for various types of companies.",
      price: 1000,
      category: "Accounting Services",
      imageUrl: "https://www.aprio.com/wp-content/uploads/2019/11/aprio-social-1.jpg",
      tags: JSON.stringify(["accounting services", "tax advisory", "business consulting", "digital accounting", "cloud accounting"]),
      advantages: JSON.stringify([
        "Combination of human expertise and AI technologies",
        "Comprehensive accounting and tax services",
        "Specialization in various industries",
        "Advanced financial analysis and reporting",
        "Tax optimization advisory",
        "Support during transactions and mergers",
        "Digital transformation of accounting processes",
        "Specialized teams for specific needs",
        "Proactive approach to financial planning",
        "Scalable solution based on company size"
      ]),
      disadvantages: JSON.stringify([
        "Higher price compared to purely digital solutions",
        "Focus primarily on medium-sized and larger companies",
        "Personal approach may be limited for clients with lower budgets",
        "More complex implementation than self-service solutions"
      ]),
      detailInfo: "Aprio is a modern accounting and advisory firm that combines traditional accounting expertise with the latest technologies. The firm provides a wide range of services from basic accounting through tax advisory to strategic business consulting. Aprio invests in AI and automation tools that streamline traditional accounting processes and allow their team to focus on providing strategic advisory. The firm has specialized teams for various industries such as technology, manufacturing, healthcare, real estate, and others, which enables them to provide tailored solutions to the specific needs of each client.",
      pricingInfo: JSON.stringify({
        monthly: 1000,
        yearly: 12000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 1000, "features": ["Monthly", "Basic accounting", "Tax returns", "Standard support"]},
          {"name": "Professional", "price": 2500, "features": ["Monthly", "Advanced accounting", "Tax planning", "Priority support"]},
          {"name": "Enterprise", "price": 5000, "features": ["Monthly", "Comprehensive services", "Strategic advisory", "Dedicated team"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleVideo"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.autobooks.co",
    data: {
      name: "Autobooks",
      description: "Autobooks is an integrated financial and accounting solution that enables small businesses to accept online payments, track finances, and automate accounting directly through their bank account.",
      price: 10,
      category: "SMB Financial Software",
      imageUrl: "https://www.autobooks.co/hubfs/autobooks-1.png",
      tags: JSON.stringify(["online payments", "small businesses", "digital invoicing", "accounting", "banking integration"]),
      advantages: JSON.stringify([
        "Direct integration with bank account",
        "Accepting online payments without additional software",
        "Automatic matching of payments with invoices",
        "Digital invoicing and expense management",
        "Real-time financial insights",
        "Easy to use for non-accountants",
        "Minimal implementation requirements",
        "Competitive payment processing fees",
        "Bank-level security",
        "Elimination of need for multiple financial systems"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced accounting features",
        "Dependency on specific bank support",
        "Fewer integrations with external systems",
        "May be less suitable for larger organizations"
      ]),
      detailInfo: "Autobooks brings a unique approach to financial management for small businesses by integrating payment tools and basic accounting directly into the banking environment. This approach eliminates the need to switch between different systems and simplifies the entire process from invoice issuance to payment tracking and accounting. Unlike traditional accounting software, Autobooks works directly with financial institutions, allowing small businesses to use advanced financial tools without having to invest in complex external systems. The platform is designed with an emphasis on simplicity and usability for small business owners who aren't accounting experts.",
      pricingInfo: JSON.stringify({
        monthly: 10,
        yearly: 99,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 10, "features": ["Monthly", "Electronic payments", "Digital invoicing", "Basic reporting"]},
          {"name": "Plus", "price": 30, "features": ["Monthly", "Advanced tools", "Accounting integration", "Priority support"]},
          {"name": "Pro", "price": 50, "features": ["Monthly", "Complete suite", "API access", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.billyapp.com",
    data: {
      name: "Billy",
      description: "Billy is an intuitive accounting software designed for freelancers and small businesses that automates invoicing, expenses, and basic accounting with an AI assistant.",
      price: 15,
      category: "Accounting Software",
      imageUrl: "https://www.billyapp.com/wp-content/uploads/2022/05/billy-logo-share.png",
      tags: JSON.stringify(["invoicing", "freelancer accounting", "expense tracking", "accounting automation", "tax records"]),
      advantages: JSON.stringify([
        "Extremely simple and intuitive interface",
        "Specialization in freelancer and small business needs",
        "Automation of recurring invoices and reminders",
        "Easy expense tracking and categorization",
        "Smart tax record-keeping and preparation",
        "Integrated client management system",
        "Mobile app for accounting on the go",
        "Multi-currency support for international clients",
        "Accessible pricing plans",
        "Minimal accounting knowledge required for use"
      ]),
      disadvantages: JSON.stringify([
        "Limited features for more complex accounting",
        "Fewer advanced reports compared to competitors",
        "Limited number of third-party integrations",
        "May be insufficient for rapidly growing companies"
      ]),
      detailInfo: "Billy is designed with a clear goal: to simplify accounting for freelancers and small business owners who don't have the time, desire, or experience with complex accounting systems. The software focuses on the most important needs of this group - easy invoicing, simple expense tracking, and basic financial overviews. Billy uses automation and artificial intelligence to facilitate routine tasks such as expense categorization or reminders for unpaid invoices. Special attention is paid to the user interface, which is designed to be usable even for beginners without accounting knowledge, while still providing all the necessary features for small business financial management.",
      pricingInfo: JSON.stringify({
        monthly: 15,
        yearly: 144,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["5 clients", "Limited invoicing", "Basic records", "Email support"]},
          {"name": "Starter", "price": 15, "features": ["Monthly", "Unlimited clients", "Automatic reminders", "Standard support"]},
          {"name": "Pro", "price": 30, "features": ["Monthly", "Advanced features", "Recurring invoices", "Priority support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.accountingprose.com",
    data: {
      name: "Accounting Prose",
      description: "Accounting Prose is a modern accounting firm that combines professional accounting services with technological innovation and automation for small and medium-sized businesses.",
      price: 349,
      category: "Accounting Services",
      imageUrl: "https://www.accountingprose.com/wp-content/uploads/2021/04/accounting-prose-logo.png",
      tags: JSON.stringify(["accounting services", "virtual accounting", "financial advisory", "tax services", "cloud accounting"]),
      advantages: JSON.stringify([
        "Experienced team of accountants with advanced certifications",
        "Use of modern technologies and automation",
        "Virtual services available from anywhere",
        "Specialization in small and medium businesses",
        "Emphasis on partnership relationship with clients",
        "Proactive financial advisory",
        "Personalized approach based on client needs",
        "Transparent pricing policy",
        "Secure cloud solution for document sharing",
        "Ongoing communication and regular consultations"
      ]),
      disadvantages: JSON.stringify([
        "Higher price compared to cheaper automated solutions",
        "Limited physical availability (primarily virtual services)",
        "Less suitable for very large corporations",
        "Need to adapt to their technological processes"
      ]),
      detailInfo: "Accounting Prose represents a modern approach to accounting services through a combination of human expertise and the latest technological solutions. The firm focuses on providing comprehensive accounting services for small and medium businesses with an emphasis on building long-term partnerships with clients. Unlike traditional accounting firms, Accounting Prose fully utilizes cloud technologies and automation to optimize processes, allowing their team to focus on strategic advisory and individual client needs. Services include bookkeeping, payroll management, tax planning and preparation, financial reporting and analysis, all provided remotely using secure digital tools.",
      pricingInfo: JSON.stringify({
        monthly: 349,
        yearly: 3990,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 349, "features": ["Monthly", "Basic accounting", "Monthly closings", "Standard support"]},
          {"name": "Growth", "price": 649, "features": ["Monthly", "Advanced accounting", "Payroll", "Tax returns"]},
          {"name": "Enterprise", "price": 999, "features": ["Monthly", "Comprehensive services", "CFO advisory", "Priority support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.zipbooks.com",
    data: {
      name: "ZipBooks",
      description: "ZipBooks is an intuitive accounting software with integrated artificial intelligence that automates invoicing, accounting, and financial reporting for small businesses and freelancers.",
      price: 15,
      category: "Accounting Software",
      imageUrl: "https://www.zipbooks.com/wp-content/uploads/2019/10/zipbooks-social-card.jpg",
      tags: JSON.stringify(["accounting software", "invoicing", "time tracking", "financial reporting", "cloud accounting"]),
      advantages: JSON.stringify([
        "Attractive and user-friendly interface",
        "Free basic plan for business startup",
        "Intelligent automatic accounting and categorization",
        "Professional-looking invoices and quotes",
        "Integration with time and project tracking",
        "Automatic reminders for unpaid invoices",
        "Supports multiple currencies and tax rates",
        "Advanced financial reports and overviews",
        "Integrated customer rating system",
        "Competitive pricing compared to similar solutions"
      ]),
      disadvantages: JSON.stringify([
        "Limited features in free plan",
        "Fewer advanced features compared to large accounting systems",
        "Limited number of third-party integrations",
        "Some advanced features only available in higher plans"
      ]),
      detailInfo: "ZipBooks is a modern cloud accounting software focused on simplifying financial management for small businesses and freelancers. The system features an exceptionally intuitive and visually attractive user interface that makes daily financial tasks easy even for users without accounting knowledge. ZipBooks uses artificial intelligence to automate routine processes like expense categorization, payment matching, and financial overview generation. Special attention is paid to professional invoicing with elegant templates and features such as automatic reminders, online payments, and client ratings, which help companies improve cash flow and client communication.",
      pricingInfo: JSON.stringify({
        monthly: 15,
        yearly: 150,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 0, "features": ["Unlimited invoices", "Vendor management", "Basic accounting", "One bank"]},
          {"name": "Smarter", "price": 15, "features": ["Monthly", "Automatic reminders", "Multiple users", "Multiple banks"]},
          {"name": "Sophisticated", "price": 35, "features": ["Monthly", "Advanced accounting", "Custom categories", "Custom roles"]},
          {"name": "Advanced", "price": 0, "features": ["Custom pricing", "Dedicated support", "Custom integrations", "Complete services"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleZipBooks"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.cashflowfrog.com",
    data: {
      name: "CashFlow Frog",
      description: "CashFlow Frog is a specialized financial tool with AI functions for cash flow prediction and management that helps small and medium businesses improve financial planning and liquidity.",
      price: 29,
      category: "Cash Flow Management",
      imageUrl: "https://www.cashflowfrog.com/wp-content/uploads/2021/03/cashflow-frog-logo.png",
      tags: JSON.stringify(["cash flow prediction", "financial planning", "liquidity management", "budgeting", "financial analysis"]),
      advantages: JSON.stringify([
        "Exclusive specialization in cash flow management",
        "Accurate future cash flow predictions based on historical data",
        "Automatic synchronization with accounting systems",
        "Visual overviews and graphs for easy understanding",
        "\"What-if\" scenario planning for different business situations",
        "Alerts to potential liquidity issues",
        "Cash flow tracking by projects and departments",
        "Simple operation without financial experts",
        "Helps identify areas for cash flow improvement",
        "Regular reports sent by email"
      ]),
      disadvantages: JSON.stringify([
        "Narrower focus only on cash flow (not comprehensive accounting)",
        "Prediction accuracy depends on input data quality",
        "Limited features for very large organizations",
        "Requires regular data updates for best results"
      ]),
      detailInfo: "CashFlow Frog focuses exclusively on one critical aspect of business finance - cash flow management and prediction. The tool uses advanced algorithms and machine learning to analyze historical financial data, identify patterns, and create accurate predictions of future cash flows. Unlike complex accounting systems, CashFlow Frog is designed with an emphasis on simplicity and understandability, enabling even small businesses without finance departments to effectively plan and manage liquidity. A unique feature is the ability to model different business scenarios and track their potential impact on cash flow, which helps with strategic decision-making and crisis planning.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Basic", "price": 29, "features": ["Monthly", "90-day prediction", "Basic reports", "Email support"]},
          {"name": "Pro", "price": 59, "features": ["Monthly", "180-day prediction", "Advanced scenarios", "Priority support"]},
          {"name": "Business", "price": 99, "features": ["Monthly", "365-day prediction", "Unlimited scenarios", "Dedicated support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.mindtitan.com",
    data: {
      name: "MindTitan",
      description: "MindTitan is a company specializing in custom AI solution development for financial and accounting processes, helping businesses implement artificial intelligence for automation and optimization of financial operations.",
      price: 10000,
      category: "AI Consulting",
      imageUrl: "https://www.mindtitan.com/wp-content/uploads/2023/04/mindtitan-logo.png",
      tags: JSON.stringify(["AI consulting", "financial automation", "machine learning", "predictive analytics", "accounting automation"]),
      advantages: JSON.stringify([
        "Custom solution development based on client needs",
        "Expertise in AI application in finance",
        "Combination of technological and financial knowledge",
        "Implementation of advanced predictive models",
        "Automation of complex financial processes",
        "Cost optimization using ML algorithms",
        "Identification of hidden financial patterns and anomalies",
        "Emphasis on quick return on investment (ROI)",
        "Support with integration into existing systems",
        "Continuous improvement of implemented solutions"
      ]),
      disadvantages: JSON.stringify([
        "High initial investment",
        "Longer implementation time for complex solutions",
        "Requires certain technological maturity of the organization",
        "Need for quality data for effective AI model functioning"
      ]),
      detailInfo: "MindTitan is a specialized consulting and development company that helps businesses implement artificial intelligence and machine learning solutions into financial and accounting processes. Unlike standardized software products, MindTitan creates customized solutions that address specific challenges and needs of each client. Their services include development of predictive models for financial planning, implementation of algorithms for automatic transaction categorization, creation of fraud detection systems, cost optimization using machine learning, and other advanced AI applications in the financial sector. MindTitan emphasizes practical AI use with measurable business impact and return on investment.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 10000,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Assessment", "price": 10000, "features": ["One-time", "Needs analysis", "Solution design", "Proof of concept"]},
          {"name": "Implementation", "price": 50000, "features": ["One-time", "Development and deployment", "System integration", "Testing"]},
          {"name": "Maintenance", "price": 2000, "features": ["Monthly", "Ongoing improvement", "Performance monitoring", "Technical support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.outright.com",
    data: {
      name: "Outright (GoDaddy Bookkeeping)",
      description: "Outright, now known as GoDaddy Bookkeeping, is a simple accounting solution with AI elements that automates financial management, tax preparation, and reporting for small businesses and e-commerce sellers.",
      price: 7.99,
      category: "Accounting Software",
      imageUrl: "https://img1.wsimg.com/cdn/Image/All/FOS-Intl/1/en-US/5f21deb1-c3a2-4f21-b03d-ef4bb97ddd2d/logo-outright.png",
      tags: JSON.stringify(["accounting software", "tax preparation", "e-commerce accounting", "expense tracking", "financial reporting"]),
      advantages: JSON.stringify([
        "Specially designed for e-commerce seller needs",
        "Automatic integration with online marketplaces and payment gateways",
        "Simple and intuitive interface for non-accountants",
        "Automatic categorization of income and expenses",
        "Ongoing preparation of materials for tax returns",
        "Affordable price suitable for beginning entrepreneurs",
        "Mobile app for finance management on the go",
        "Automatic import of bank transactions",
        "Clear graphs and reports for performance tracking",
        "Seamless integration with other GoDaddy services"
      ]),
      disadvantages: JSON.stringify([
        "Limited advanced accounting features",
        "Less suitable for larger companies with complex needs",
        "Limited customization options compared to competitors",
        "Less extensive ecosystem of third-party integrations"
      ]),
      detailInfo: "Outright, which was acquired by GoDaddy and renamed to GoDaddy Bookkeeping, is accounting software specifically designed for the needs of small businesses, freelancers, and especially online sellers. The platform excels in its ability to automatically integrate data from popular e-commerce platforms like Amazon, Etsy, eBay, and others, providing a comprehensive overview of financial activities across different sales channels. The software uses automation and artificial intelligence elements to facilitate common accounting tasks such as transaction categorization, expense tracking, invoicing, and tax preparation. GoDaddy Bookkeeping is appreciated mainly for its simplicity, which allows even users without accounting knowledge to effectively manage their finances.",
      pricingInfo: JSON.stringify({
        monthly: 7.99,
        yearly: 84,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Get Paid", "price": 4.99, "features": ["Monthly", "Invoices and estimates", "Online payments", "Mobile app"]},
          {"name": "Essentials", "price": 7.99, "features": ["Monthly", "Tax reports", "Bank imports", "Recurring invoices"]},
          {"name": "Premium", "price": 14.99, "features": ["Monthly", "Recurring invoices", "Multiple users", "Priority support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing accounting and financial AI tools in the database (English version - batch 3)...");
  
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