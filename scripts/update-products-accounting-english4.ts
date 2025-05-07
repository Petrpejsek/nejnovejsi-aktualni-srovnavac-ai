import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accounting and financial AI tools in English - fourth batch
const accountingProducts = [
  {
    externalUrl: "https://www.feedzai.com",
    data: {
      name: "Feedzai",
      description: "Feedzai is an AI-powered financial risk management platform that helps financial institutions detect and prevent fraud in real-time across multiple channels using advanced machine learning.",
      price: 10000,
      category: "Fraud Prevention",
      imageUrl: "https://www.feedzai.com/wp-content/uploads/2021/05/feedzai-og-image.jpg",
      tags: JSON.stringify(["fraud detection", "risk management", "financial security", "machine learning", "transaction monitoring"]),
      advantages: JSON.stringify([
        "Real-time fraud detection across all channels",
        "Advanced machine learning models for risk assessment",
        "Behavioral biometrics for enhanced security",
        "Explainable AI for regulatory compliance",
        "Customizable risk scoring",
        "Omnichannel fraud prevention",
        "Continuous model improvement through federated learning",
        "Reduction in false positives",
        "Intuitive case management interface",
        "Integration with existing banking systems"
      ]),
      disadvantages: JSON.stringify([
        "Significant investment required for implementation",
        "Complex integration with legacy systems",
        "Requires dedicated team for management",
        "Enterprise-level pricing not suitable for small businesses"
      ]),
      detailInfo: "Feedzai provides a comprehensive financial risk management platform that helps banks, payment processors, and merchants combat financial crime. The solution uses advanced machine learning and artificial intelligence to analyze billions of transactions in real-time, identifying suspicious patterns and potential fraud across multiple channels including online, mobile, in-person, and call centers. Feedzai's technology builds risk profiles for customers, merchants, and transactions, updating risk scores in milliseconds as new information becomes available. The platform features explainable AI, allowing institutions to understand why specific transactions were flagged, which is crucial for regulatory compliance and auditing purposes.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 10000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Enterprise", "price": 10000, "features": ["Starting annual price", "Real-time fraud detection", "Custom model development", "Dedicated support"]},
          {"name": "Custom", "price": 0, "features": ["Custom pricing", "Full platform access", "Integration services", "Dedicated implementation team"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=pLrwFn6lD8c"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.personetics.com",
    data: {
      name: "Personetics",
      description: "Personetics is an AI-driven financial data analytics platform that helps banks provide personalized financial guidance and automated money management to their customers.",
      price: 5000,
      category: "Financial Data Analytics",
      imageUrl: "https://www.personetics.com/wp-content/uploads/2021/03/personetics-share-image.jpg",
      tags: JSON.stringify(["personal finance management", "customer engagement", "financial insights", "banking personalization", "money management"]),
      advantages: JSON.stringify([
        "Personalized financial insights and advice",
        "Automated money management capabilities",
        "Self-driving finance features",
        "White-label solution for financial institutions",
        "Enhanced customer engagement",
        "Increased digital adoption",
        "Transaction categorization and analysis",
        "Financial goal setting and tracking",
        "Actionable notifications and alerts",
        "Cross-selling opportunities based on customer data"
      ]),
      disadvantages: JSON.stringify([
        "High implementation costs",
        "Dependent on quality of bank's transaction data",
        "Requires integration with core banking systems",
        "Primarily designed for larger financial institutions"
      ]),
      detailInfo: "Personetics transforms how banks engage with their customers by analyzing financial data to provide personalized, actionable insights in real-time. The platform uses AI and machine learning to analyze customer transaction data, identify patterns, anticipate needs, and offer proactive financial guidance. Beyond simple categorization and insights, Personetics enables 'self-driving finance' capabilities where customers can set financial goals and the system automatically helps achieve them through smart money movement, savings recommendations, and budget management. Financial institutions can deploy Personetics as a white-label solution within their existing digital channels, enhancing customer engagement while maintaining their brand identity and customer relationships.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 5000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 5000, "features": ["Monthly", "Core insights engine", "Basic personalization", "Standard support"]},
          {"name": "Advanced", "price": 10000, "features": ["Monthly", "Self-driving finance", "Advanced personalization", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Full platform customization", "Dedicated team", "White-glove implementation"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=y_3vAzBUs-g"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.numer.ai",
    data: {
      name: "Numerai",
      description: "Numerai is a hedge fund built on a global network of data scientists who compete to create the best predictive models for the stock market using AI and machine learning.",
      price: 0,
      category: "AI Hedge Fund",
      imageUrl: "https://numerai.com/static/assets/images/numerai-opengraph.png",
      tags: JSON.stringify(["crowdsourced hedge fund", "quantitative finance", "machine learning", "prediction markets", "stock market ai"]),
      advantages: JSON.stringify([
        "Access to sophisticated financial modeling platform",
        "Opportunity to earn cryptocurrency rewards",
        "Learn and collaborate with global data scientists",
        "No capital investment required to participate",
        "Anonymized data prevents overfitting",
        "Blockchain-based incentive system",
        "Weekly tournaments for continuous improvement",
        "Access to encrypted financial datasets",
        "Merit-based rewards for accurate predictions",
        "Open to anyone with data science skills"
      ]),
      disadvantages: JSON.stringify([
        "Complex entry barrier for beginners",
        "Rewards subject to model performance",
        "Requires significant data science expertise",
        "Competitive environment with skilled participants"
      ]),
      detailInfo: "Numerai reimagines how hedge funds operate by crowdsourcing financial intelligence from data scientists worldwide. Unlike traditional hedge funds that rely on in-house analysts, Numerai provides anonymized financial data to a global network of data scientists who compete to build the most accurate predictive models. Participants submit predictions weekly and are rewarded with Numeraire (NMR), the platform's cryptocurrency, based on model performance. The hedge fund then combines the highest-performing models to make investment decisions in global equity markets. This approach allows Numerai to harness collective intelligence while preventing overfitting through their unique data structure. The platform uses blockchain technology to ensure transparency and proper incentive alignment among participants.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Access to datasets", "Tournament participation", "Performance-based rewards", "Community support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=dhJnt0N497c"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.upstart.com",
    data: {
      name: "Upstart",
      description: "Upstart is an AI lending platform that uses machine learning to evaluate borrowers beyond traditional credit scores, helping lenders expand access to credit while reducing risk.",
      price: 0,
      category: "AI Lending",
      imageUrl: "https://www.upstart.com/static/images/social-image.jpg",
      tags: JSON.stringify(["lending platform", "alternative credit scoring", "loan origination", "financial inclusion", "credit assessment"]),
      advantages: JSON.stringify([
        "Alternative credit assessment beyond FICO scores",
        "Higher approval rates with lower default risk",
        "Fast loan decisions (often instant)",
        "Expanded access to credit for underserved segments",
        "No application fees or prepayment penalties",
        "Automated verification processes",
        "Continually improving AI models",
        "Fixed rates and terms for borrowers",
        "Digital-first application experience",
        "Partnership model for banks and credit unions"
      ]),
      disadvantages: JSON.stringify([
        "Limited transparency into specific approval factors",
        "Higher interest rates for some borrowers",
        "Not available in all states/regions",
        "Requires sharing more personal data than traditional lenders"
      ]),
      detailInfo: "Upstart transforms lending through an AI-powered platform that evaluates borrowers holistically, not just by credit scores. The company uses machine learning to analyze over 1,600 variables, including education, employment history, and financial behavior patterns to assess creditworthiness. This approach allows Upstart's bank partners to approve significantly more borrowers while maintaining the same risk levels as traditional models. The platform delivers fully automated loan experiences for approximately 70% of approved borrowers, with funds often available within 24 hours. Upstart operates as a technology partner to banks and credit unions, helping them modernize their lending operations while maintaining regulatory compliance and sound risk management. The company's models continuously improve as more loans are processed and outcomes observed.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Partnership", "price": 0, "features": ["Revenue-sharing model with financial institutions", "No direct consumer charges", "Performance-based pricing"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=SsoCEYpLFM4"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.zest.ai",
    data: {
      name: "Zest AI",
      description: "Zest AI provides AI-powered credit underwriting software that helps lenders make more accurate decisions, reduce bias, and approve more loans while maintaining risk levels.",
      price: 7500,
      category: "Credit Underwriting",
      imageUrl: "https://www.zest.ai/hubfs/zest-ai-og-image.jpg",
      tags: JSON.stringify(["credit decisioning", "underwriting automation", "fair lending", "machine learning", "credit risk"]),
      advantages: JSON.stringify([
        "More accurate credit decisioning than traditional methods",
        "Reduced bias in lending decisions",
        "Increased approval rates while maintaining risk levels",
        "Regulatory compliance and model explainability",
        "Faster loan decisions and processing",
        "Ability to use more variables in underwriting",
        "Customizable models for different lending products",
        "Tools for fair lending and adverse action reporting",
        "Reduced manual underwriting costs",
        "Implementation support and model monitoring"
      ]),
      disadvantages: JSON.stringify([
        "Significant upfront investment",
        "Complex implementation and integration",
        "Requires quality historical lending data",
        "May require regulatory approval process"
      ]),
      detailInfo: "Zest AI modernizes credit underwriting through machine learning models that help financial institutions make more accurate, consistent, and fair lending decisions. The platform enables lenders to safely use more data factors than traditional credit scoring, resulting in broader approval rates without increasing risk. Unlike conventional credit models, Zest's technology can evaluate hundreds of variables and their complex interactions, uncovering creditworthy borrowers traditional methods might miss. The company places special emphasis on fairness and compliance, with tools specifically designed to reduce disparate impact and demonstrate model explainability to regulators. Zest AI works with banks, credit unions, and other lenders to implement custom models tailored to specific lending products and customer segments, with a focus on both accuracy and regulatory compliance.",
      pricingInfo: JSON.stringify({
        monthly: 7500,
        yearly: 85000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 7500, "features": ["Monthly", "Core model development", "Basic implementation", "Standard support"]},
          {"name": "Advanced", "price": 15000, "features": ["Monthly", "Multiple custom models", "Full implementation support", "Advanced monitoring"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Complete model suite", "Dedicated support", "Custom integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=Q95UsRFkQPM"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.wealthfront.com",
    data: {
      name: "Wealthfront",
      description: "Wealthfront is an automated investment service that uses AI to provide personalized, low-cost investment management, financial planning, and banking services.",
      price: 0,
      category: "Robo-Advisor",
      imageUrl: "https://www.wealthfront.com/assets/og_image.png",
      tags: JSON.stringify(["robo-advisor", "automated investing", "tax-loss harvesting", "financial planning", "cash management"]),
      advantages: JSON.stringify([
        "Low management fees (0.25% annually)",
        "Automated portfolio rebalancing",
        "Tax-loss harvesting at all account levels",
        "Diversified portfolio construction",
        "Automatic reinvestment of dividends",
        "Financial planning tools",
        "Cash management account with competitive interest",
        "Goal-based investment strategies",
        "Direct indexing for larger accounts",
        "No trading or transfer fees"
      ]),
      disadvantages: JSON.stringify([
        "Limited human advisor interaction",
        "Minimum $500 investment to start",
        "No fractional shares for individual stocks",
        "Less customization than traditional advisors"
      ]),
      detailInfo: "Wealthfront delivers sophisticated, algorithm-driven financial services that were previously available only to wealthy investors. The platform provides automated investment management based on Modern Portfolio Theory, using low-cost ETFs across multiple asset classes tailored to the client's risk profile. Wealthfront's technology continuously monitors and automatically rebalances portfolios, while applying tax-loss harvesting strategies to improve after-tax returns. Beyond investing, the service offers financial planning tools that help clients plan for major life goals like retirement, home purchases, or college savings. Wealthfront also provides cash management accounts with competitive interest rates, instant transfers, and FDIC insurance. The entire experience is delivered through a digital-first interface with minimal human intervention, allowing the company to offer premium financial services at a fraction of traditional management costs.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 0, "features": ["0.25% annual fee", "$500 minimum investment", "Automated investing", "Financial planning", "Tax-loss harvesting", "Portfolio rebalancing"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=G-6rUy9bO-g"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.betterment.com",
    data: {
      name: "Betterment",
      description: "Betterment is a robo-advisor that uses AI algorithms to provide automated, personalized investment management and financial planning services at a fraction of traditional costs.",
      price: 0,
      category: "Robo-Advisor",
      imageUrl: "https://www.betterment.com/hubfs/Graphics/meta-images/betterment_social_card.jpg",
      tags: JSON.stringify(["robo-advisor", "automated investing", "tax-loss harvesting", "retirement planning", "goal-based investing"]),
      advantages: JSON.stringify([
        "Low management fees (0.25% annually for basic plan)",
        "No minimum balance requirement to start",
        "Automated portfolio rebalancing",
        "Tax-loss harvesting and tax coordination",
        "Access to certified financial planners with premium plan",
        "Socially responsible investment options",
        "Goal-based investing approach",
        "High-yield cash management account",
        "Retirement planning tools",
        "Intuitive digital experience"
      ]),
      disadvantages: JSON.stringify([
        "Limited investment options compared to self-directed platforms",
        "Higher fees for access to human advisors",
        "Less customization than traditional financial advisors",
        "No direct indexing for most account sizes"
      ]),
      detailInfo: "Betterment pioneered the robo-advisor category, making sophisticated investment strategies accessible to everyday investors through automation and artificial intelligence. The platform builds personalized portfolios of low-cost ETFs based on the client's financial goals, time horizon, and risk tolerance. Beyond portfolio management, Betterment employs tax-optimization strategies like tax-loss harvesting and tax coordination across different account types to improve after-tax returns. The service takes a goals-based approach, allowing users to create and fund multiple investment goals with tailored strategies for each. Betterment also offers cash management accounts with competitive interest rates and no fees, retirement planning tools, and access to human financial advisors through its premium tier. The company's technology handles the complexities of investment management automatically, including portfolio rebalancing, dividend reinvestment, and tax efficiency.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Digital", "price": 0, "features": ["0.25% annual fee", "No minimum balance", "Automated investing", "Financial planning tools"]},
          {"name": "Premium", "price": 0, "features": ["0.40% annual fee", "$100,000 minimum balance", "Unlimited access to CFPs", "In-depth financial planning"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=byF84WR3Tkw"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.schwab.com/intelligent-portfolios",
    data: {
      name: "Schwab Intelligent Portfolios",
      description: "Schwab Intelligent Portfolios is Charles Schwab's automated investment service that uses AI to build, monitor, and rebalance diversified portfolios based on clients' risk profiles.",
      price: 0,
      category: "Robo-Advisor",
      imageUrl: "https://www.schwab.com/resource-center/insights/sites/g/files/eyrktu156/files/styles/social_media_sharing/public/schwab-intelligent-portfolios.jpg",
      tags: JSON.stringify(["robo-advisor", "automated investing", "tax-loss harvesting", "portfolio rebalancing", "commission-free"]),
      advantages: JSON.stringify([
        "No advisory fees or commissions",
        "Automatic rebalancing",
        "Tax-loss harvesting (for accounts over $50,000)",
        "Diversified portfolios with up to 20 asset classes",
        "24/7 customer support",
        "Backed by established financial institution",
        "Access to human advisors with premium version",
        "Automated portfolio monitoring",
        "Regular progress reports",
        "Integration with other Schwab accounts"
      ]),
      disadvantages: JSON.stringify([
        "Higher cash allocation than competitors",
        "$5,000 minimum investment requirement",
        "Limited customization options",
        "Premium version has one-time planning fee"
      ]),
      detailInfo: "Schwab Intelligent Portfolios leverages the expertise of Charles Schwab's investment team combined with algorithmic portfolio management to deliver a sophisticated automated investing service. The platform builds diversified portfolios from 20+ asset classes using ETFs, matched to the client's risk profile and goals. Unlike most competitors, Schwab doesn't charge management fees or commissions, instead monetizing through the underlying ETFs (many of which are Schwab-branded) and the cash allocation in portfolios. The service provides automatic rebalancing when portfolios drift from targets and offers tax-loss harvesting for larger accounts to enhance after-tax returns. Schwab Intelligent Portfolios Premium adds unlimited access to certified financial planners for personalized planning, with a one-time planning fee and small monthly advisory fee. As part of Charles Schwab, the service integrates with the company's broader financial ecosystem and offers the security of working with an established financial institution.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Intelligent Portfolios", "price": 0, "features": ["No advisory fees", "$5,000 minimum investment", "Automated investing", "Automatic rebalancing"]},
          {"name": "Intelligent Portfolios Premium", "price": 30, "features": ["$30/month after $300 one-time planning fee", "$25,000 minimum investment", "Unlimited 1:1 CFP guidance", "Comprehensive financial plan"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=RoX_atFa6jU"]),
      hasTrial: false
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Storing accounting and financial AI tools in the database (English version - batch 4)...");
  
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