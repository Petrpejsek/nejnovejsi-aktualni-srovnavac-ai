import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accounting and financial AI tools in English - fifth batch
const accountingProducts = [
  {
    externalUrl: "https://www.personalcapital.com",
    data: {
      name: "Personal Capital",
      description: "Personal Capital is a wealth management platform that combines AI-powered financial tools with human financial advisors to help users track, manage, and optimize their investments and financial planning.",
      price: 0,
      category: "Wealth Management",
      imageUrl: "https://www.personalcapital.com/assets/images/logos/pc-logo-dark.svg",
      tags: JSON.stringify(["wealth management", "financial planning", "investment tracking", "retirement planning", "budgeting"]),
      advantages: JSON.stringify([
        "Free comprehensive financial dashboard",
        "Advanced investment analytics and fee analyzer",
        "Retirement planning calculator and tools",
        "Cash flow and budgeting features",
        "Human financial advisors for premium clients",
        "Holistic view of all financial accounts",
        "Automatic categorization of transactions",
        "Portfolio allocation analysis",
        "Net worth tracking over time",
        "Regular financial health checkups"
      ]),
      disadvantages: JSON.stringify([
        "Wealth management services require $100,000 minimum investment",
        "Higher fees than some robo-advisors for managed accounts",
        "Limited budgeting features compared to dedicated tools",
        "Some users report aggressive sales calls for premium services"
      ]),
      detailInfo: "Personal Capital offers a hybrid model of financial management that combines AI-powered financial tools with human advisors. The platform provides a comprehensive financial dashboard where users can sync and track all their accounts, from banking and credit cards to investments and retirement accounts. The free tools include a net worth tracker, investment checkup, retirement planner, fee analyzer, and budgeting features. For users with over $100,000 in investable assets, Personal Capital offers wealth management services with dedicated financial advisors who create personalized investment strategies. The platform's algorithms continuously analyze users' financial situations to provide insights and recommendations, while their advisors provide the human touch for more complex planning and emotional aspects of financial decisions.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free Tools", "price": 0, "features": ["Financial dashboard", "Investment analysis", "Retirement planner", "Fee analyzer", "Budgeting tools"]},
          {"name": "Wealth Management", "price": 0, "features": ["0.89% annual fee for first $1M", "$100,000 minimum investment", "Dedicated financial advisors", "Personalized portfolio", "Tax optimization"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=0xiLffME7lY"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.rocketmortgage.com",
    data: {
      name: "Rocket Mortgage",
      description: "Rocket Mortgage is an AI-powered digital mortgage platform that streamlines the home loan application and approval process, offering personalized recommendations and rapid decisions.",
      price: 0,
      category: "Mortgage Lending",
      imageUrl: "https://www.rocketmortgage.com/resources-cmsassets/RocketMortgage.com/Article_Images/Shared/rm-logo-red-white.svg",
      tags: JSON.stringify(["mortgage lending", "home loans", "digital mortgage", "loan approval", "refinancing"]),
      advantages: JSON.stringify([
        "Fast, streamlined digital application process",
        "Automated document verification",
        "Personalized rate recommendations",
        "Quick pre-approval process",
        "Real-time loan status tracking",
        "Integration with financial accounts for verification",
        "Mobile app for managing application and payments",
        "Award-winning customer service",
        "Wide range of loan options",
        "Educational resources for homebuyers"
      ]),
      disadvantages: JSON.stringify([
        "Limited physical locations for in-person service",
        "May have higher rates than some local lenders",
        "Not ideal for borrowers with complex financial situations",
        "Additional fees may apply for certain services"
      ]),
      detailInfo: "Rocket Mortgage revolutionized the mortgage industry by creating a fully digital loan application and approval process powered by AI algorithms. The platform automates document collection and verification, credit analysis, and underwriting to deliver rapid decisions and a smoother experience for homebuyers. Users can import their financial information directly from banks and employers, answer questions about their homebuying goals, and receive personalized loan recommendations in minutes. The system can generate pre-approval letters instantly, giving homebuyers a competitive edge in the market. Behind the technology, Rocket Mortgage employs machine learning to continuously improve its decision-making process, analyze risk factors, and identify the most suitable loan products for each applicant's financial situation. The company offers conventional, FHA, VA, and jumbo loans for both home purchases and refinancing.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Loan Services", "price": 0, "features": ["No subscription cost", "Standard origination fees apply", "Closing costs vary by loan", "Rate depends on credit profile and market"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=OGWJdz8KIL8"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.capitalone.com",
    data: {
      name: "Capital One CreditWise",
      description: "Capital One CreditWise is an AI-powered credit monitoring and financial health tool that helps users track their credit score, detect fraud, and receive personalized recommendations to improve their credit.",
      price: 0,
      category: "Credit Monitoring",
      imageUrl: "https://www.capitalone.com/assets/assets/web/logo/creditwise-logo.png",
      tags: JSON.stringify(["credit monitoring", "fraud detection", "credit improvement", "financial health", "score simulator"]),
      advantages: JSON.stringify([
        "Free credit monitoring for everyone, not just Capital One customers",
        "Weekly VantageScore updates from TransUnion",
        "Credit score simulator to test financial decisions",
        "Dark web scanning for compromised information",
        "Real-time alerts for credit changes",
        "Personalized recommendations for credit improvement",
        "Credit factor analysis with educational insights",
        "SSN tracking and alerts",
        "Secure mobile app access",
        "No impact on credit score"
      ]),
      disadvantages: JSON.stringify([
        "Only provides VantageScore, not FICO score used by many lenders",
        "Monitors only TransUnion, not all three credit bureaus",
        "Some features promote Capital One products",
        "Limited credit report information compared to paid services"
      ]),
      detailInfo: "Capital One CreditWise uses artificial intelligence to help users understand, monitor, and improve their credit health. The platform provides weekly updated VantageScores from TransUnion, along with analysis of the factors affecting a user's score. The credit score simulator allows users to model the potential impact of financial decisions like paying off debt, opening new accounts, or increasing credit limits. The AI-powered alert system monitors for changes to a user's TransUnion credit report and notifies them of potential fraud or important changes. CreditWise also includes dark web surveillance, scanning thousands of sites where personal information is bought and sold, and alerts users if their Social Security number, email, or other personal information appears at risk. The service is available for free to everyone, not just Capital One customers, and doesn't affect credit scores when used.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Credit score monitoring", "Credit report access", "Credit score simulator", "Dark web scanning", "Real-time alerts", "Personalized recommendations", "SSN tracking"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=TzT9XPhBHoQ"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.blackrock.com/aladdin",
    data: {
      name: "BlackRock Aladdin",
      description: "Aladdin is BlackRock's comprehensive investment management and risk analytics platform that uses AI to help institutional investors manage portfolios, assess risk, and make data-driven investment decisions.",
      price: 250000,
      category: "Investment Management",
      imageUrl: "https://www.blackrock.com/blk-inst-assets/cache-1635526326000/images/products/aladdin/aladdin-logo.svg",
      tags: JSON.stringify(["portfolio management", "risk analysis", "investment operations", "enterprise platform", "financial modeling"]),
      advantages: JSON.stringify([
        "Comprehensive portfolio management across all asset classes",
        "Advanced risk analytics and scenario modeling",
        "Unified view of positions, exposures, and risk",
        "Integration of sustainability metrics and ESG data",
        "Sophisticated trading and execution capabilities",
        "Enterprise-wide data consolidation",
        "Investment decision support with AI-driven insights",
        "Real-time position and exposure tracking",
        "Regulatory compliance and reporting tools",
        "Robust performance attribution analysis"
      ]),
      disadvantages: JSON.stringify([
        "Extremely high cost, typically for large institutions only",
        "Complex implementation requiring significant resources",
        "Steep learning curve for users",
        "Potential dependency on a single vendor solution"
      ]),
      detailInfo: "BlackRock's Aladdin (Asset, Liability, Debt, and Derivative Investment Network) is the industry-leading investment and risk management platform used by institutional investors worldwide, including asset managers, pension funds, insurers, and corporate treasuries. The system combines sophisticated risk analytics, portfolio management tools, trading capabilities, and operational functions on a single unified platform. Aladdin uses artificial intelligence and machine learning to analyze vast amounts of financial data, identify patterns, assess risk factors, and generate investment insights. The platform processes over 6 million trades daily and monitors over 40,000 investment portfolios, tracking approximately $20 trillion in assets. Aladdin's risk management capabilities allow institutions to conduct stress tests, simulate market scenarios, and understand how various factors might impact their portfolios. The system recently incorporated climate analytics and ESG (Environmental, Social, and Governance) factors to help investors understand sustainability-related risks and opportunities.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 250000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Enterprise", "price": 250000, "features": ["Starting annual price", "Custom implementation", "Tailored features", "Dedicated support", "Price scales based on AUM and organization size"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=jpmMYdXM1DE"]),
      hasTrial: false
    }
  },
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
  }
];

async function updateOrCreateProducts() {
  console.log("Storing accounting and financial AI tools in the database (English version - batch 5)...");
  
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