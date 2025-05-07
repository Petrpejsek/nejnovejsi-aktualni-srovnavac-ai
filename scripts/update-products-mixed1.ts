import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const mixedProducts = [
  {
    externalUrl: 'https://www.suning.com',
    data: {
      name: 'Suning',
      description: 'One of the largest e-commerce platforms in China that uses AI for product recommendations and supply chain optimization.',
      price: 0, // Free to use
      category: 'E-commerce',
      imageUrl: 'https://www.suning.com/favicon.ico',
      tags: 'e-commerce, online shopping, AI recommendations, Chinese market',
      advantages: 'Huge product selection, Competitive prices, Intuitive user interface, AI-based product recommendations',
      disadvantages: 'Primarily focused on the Chinese market, Potential issues with international shipping, Language barrier for non-Chinese users',
      detailInfo: 'Suning is one of the largest retailers of electronics and other goods in China. The platform uses advanced artificial intelligence algorithms for personalized product recommendations, price optimization, and inventory management. Suning also implements AI solutions in logistics for a more efficient supply chain and faster delivery.',
      pricingInfo: 'As an e-commerce platform, Suning is free for shoppers. Merchants pay fees for selling products on the platform.',
      videoUrls: '',
      hasTrial: false
    }
  },
  {
    externalUrl: 'https://www.postnl.nl',
    data: {
      name: 'PostNL',
      description: 'Dutch postal and courier service using AI to optimize parcel delivery and logistics processes.',
      price: 10, // Base service price
      category: 'Logistics',
      imageUrl: 'https://www.postnl.nl/favicon.ico',
      tags: 'logistics, mail, delivery, optimization, netherlands',
      advantages: 'Efficient delivery coverage in the Netherlands and Europe, Advanced shipment tracking technology, AI for delivery route optimization, Integrated digital solutions',
      disadvantages: 'Primarily focused on the Dutch market, Higher prices for international delivery, Varying service quality in different regions',
      detailInfo: 'PostNL is the main postal and logistics operator in the Netherlands, offering a wide range of delivery services for individuals and businesses. The company implements AI solutions for predicting shipment volumes, optimizing delivery routes, and automating sorting. Their technologies include real-time data analysis to increase efficiency and reliability of delivery.',
      pricingInfo: 'Prices vary depending on the type of service, weight of the shipment, destination, and required delivery speed. Business clients can obtain individual price quotes.',
      videoUrls: '',
      hasTrial: false
    }
  },
  {
    externalUrl: 'https://www.ayasdi.com',
    data: {
      name: 'Ayasdi',
      description: 'Machine learning and AI platform for complex data analysis that helps organizations identify hidden patterns and relationships in data.',
      price: 50000, // Annual enterprise solution
      category: 'AI & Data Analysis',
      imageUrl: 'https://www.ayasdi.com/favicon.ico',
      tags: 'AI, machine learning, data analysis, business intelligence, topological data analysis',
      advantages: 'Advanced topological data analysis, Ability to process very complex and voluminous datasets, Visualization of complex data relationships, Industry-specific solutions for finance, healthcare, and more',
      disadvantages: 'High price for small and medium businesses, Steep learning curve for new users, Requires data specialists for maximum utilization',
      detailInfo: 'Ayasdi is a pioneer in topological data analysis (TDA), which combines mathematics, statistics, and machine learning to discover patterns in complex datasets. Their platform helps organizations identify hidden correlations, risks, and opportunities that traditional data analysis methods would likely miss. It is used particularly in financial services, healthcare, and industry for fraud detection, customer segmentation, and improving operational efficiency.',
      pricingInfo: 'Ayasdi offers enterprise licenses typically starting at $50,000 annually, with prices depending on organization size, data volume, and required features. For large enterprises and specific solutions, prices can reach hundreds of thousands of dollars per year.',
      videoUrls: '',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.kensho.com',
    data: {
      name: 'Kensho',
      description: 'AI platform for financial data analysis that provides automated research and analysis for investment decisions.',
      price: 25000, // Estimated enterprise solution
      category: 'Financial Technology',
      imageUrl: 'https://www.kensho.com/favicon.ico',
      tags: 'fintech, data analysis, artificial intelligence, finance, investments',
      advantages: 'Advanced natural language processing for financial data, Automated analysis of markets and companies, Integration of various data sources, Specifically designed for the financial sector',
      disadvantages: 'High costs for smaller firms, Complex implementation, Limited availability outside large financial institutions',
      detailInfo: 'Kensho Technologies, now part of S&P Global, has developed a sophisticated AI platform focused on financial markets. Their technology uses machine learning, natural language processing, and computer vision to analyze complex financial data, market news, and economic events. Kensho offers tools such as NERD (Named Entity Recognition and Disambiguation) for identifying and classifying economic entities in text and Scribe for automatically transcribing and analyzing financial conference calls.',
      pricingInfo: 'Kensho is primarily an enterprise solution with an individual pricing model according to client needs. Exact prices are not publicly available, but it is a solution for large financial institutions with a corresponding price level.',
      videoUrls: '',
      hasTrial: false
    }
  },
  {
    externalUrl: 'https://www.auquan.com',
    data: {
      name: 'Auquan',
      description: 'Platform using AI to identify and analyze risks in financial data and supply chains.',
      price: 15000, // Estimated enterprise solution
      category: 'Financial Technology',
      imageUrl: 'https://www.auquan.com/favicon.ico',
      tags: 'fintech, risk management, AI, alternative data, supply chain',
      advantages: 'Automated identification of potential risks, Analysis of alternative data sources, Personalized solutions for investment managers, Comprehensive coverage of supply chains',
      disadvantages: 'Requires integration with existing systems, High price level for small companies, Specialized focus may limit broader use',
      detailInfo: 'Auquan provides innovative solutions for risk assessment and opportunity identification in the financial sector using artificial intelligence. Their platform processes large amounts of structured and unstructured data from various sources including news, social media, and corporate documents. Auquan specializes in detecting early risk signals in supply chains and company operations, allowing investors and risk managers to make more informed decisions.',
      pricingInfo: 'Auquan offers various pricing models based on client needs, portfolio size, and required scope of services. Specific pricing information is available upon request and typically involves enterprise solutions with annual licenses.',
      videoUrls: '',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.alpaca.markets',
    data: {
      name: 'Alpaca',
      description: 'API platform for trading stocks and cryptocurrencies that allows developers to create automated trading algorithms and applications.',
      price: 49, // Monthly for premium features
      category: 'Financial Technology',
      imageUrl: 'https://www.alpaca.markets/favicon.ico',
      tags: 'fintech, API trading, automated trading, algorithmic trading, investments',
      advantages: 'Free API for trading with no transaction fees, Simple integration for developers, Supports both paper and real trading, Historical data and analytical tools',
      disadvantages: 'Limited availability of some markets, Limits for API calls in the free plan, More complex features require a paid plan',
      detailInfo: 'Alpaca is a broker-dealer and fintech platform that provides API for automated trading of stocks and cryptocurrencies. The platform is designed specifically for developers and artificial intelligence algorithms, enabling the creation of trading bots, backtesting strategies, and implementing quantitative trading models. Alpaca provides access to US stock markets with no transaction fees and offers both paper accounts for testing and real trading accounts.',
      pricingInfo: 'Alpaca offers several pricing plans: The free plan includes unlimited trading with no commissions, basic market data, and a limited number of API calls. Paid plans start at $49 per month and add premium features such as WebSocket, extended market data, higher API limits, and access to corporate actions.',
      videoUrls: '',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.cred.ai',
    data: {
      name: 'Cred.ai',
      description: 'Fintech platform with AI assistant for credit card and finance management, focused on improving credit scores and financial health.',
      price: 0, // Free
      category: 'Financial Technology',
      imageUrl: 'https://www.cred.ai/favicon.ico',
      tags: 'fintech, credit cards, personal finance, credit score, AI assistant',
      advantages: 'No fees or interest, Credit optimization technology, Advanced security features, AI finance assistant',
      disadvantages: 'Available only in the USA, Requires smartphone with modern operating system, Limited ATM network',
      detailInfo: 'Cred.ai is an innovative fintech company that has developed a high-tech approach to credit cards and personal finance. Their flagship product, the Unicorn Card, is linked to an AI assistant that helps users optimize their spending, build credit, and manage financial goals. The platform uses proprietary technology called "Credit Optimizer," which maximizes the positive impact of payment activities on the user\'s credit score, automatically times payments, and optimizes the credit utilization ratio.',
      pricingInfo: 'Cred.ai is free with no monthly fees, hidden fees, or interest. The platform primarily earns from merchant fees for transaction processing (interchange fees), so users don\'t have to pay for basic services.',
      videoUrls: '',
      hasTrial: false
    }
  },
  {
    externalUrl: 'https://www.synthesia.io',
    data: {
      name: 'Synthesia',
      description: 'AI platform for generating realistic videos with virtual presenters, allowing you to create professional videos without a camera, studio, or actors.',
      price: 22, // Monthly
      category: 'AI & Video',
      imageUrl: 'https://www.synthesia.io/favicon.ico',
      tags: 'AI video, virtual presenters, video generation, text-to-video, artificial intelligence',
      advantages: 'Create professional videos without technical knowledge, Wide library of AI avatars and templates, Support for more than 120 languages, Significant reduction in video production costs',
      disadvantages: 'Limited personalization in basic plans, Some avatars may look artificial, Limited control over detailed facial expressions',
      detailInfo: 'Synthesia is a pioneering platform for creating AI videos that allows anyone to create professional-looking videos simply by typing text. The system uses advanced speech synthesis and computer vision technology to create realistic videos with virtual presenters. Users can choose from dozens of AI avatars, customize environments, add their own images and graphics, and create videos suitable for corporate training, marketing content, educational materials, and other purposes.',
      pricingInfo: 'Synthesia offers several pricing plans: Personal at $22 per month (with annual payment) includes 10 credits (videos) per month with a limited selection of avatars and templates. The Business plan at $75 per month offers 40 credits, more avatars, and features. The Enterprise plan with individual pricing provides unlimited credits, custom avatars, and advanced features.',
      videoUrls: 'https://www.youtube.com/watch?v=GhiJkXvVZEw',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.deepbrain.io',
    data: {
      name: 'DeepBrain AI',
      description: 'Platform for creating hyper-realistic AI avatars and virtual humans for video content, interactive kiosks, and assistants.',
      price: 30, // Monthly
      category: 'AI & Video',
      imageUrl: 'https://www.deepbrain.io/favicon.ico',
      tags: 'AI avatars, virtual humans, video generation, digital twins, AI assistants',
      advantages: 'Hyper-realistic AI avatars with natural movements, Ability to create your own digital twin, Various use cases from videos to interactive kiosks, Integration via API into existing systems',
      disadvantages: 'Higher price for advanced features, Creating your own avatar requires additional costs, Some features are only available in enterprise plan',
      detailInfo: 'DeepBrain AI develops advanced solutions for creating virtual humans and AI avatars using generative AI technologies. Their platform enables creating hyper-realistic digital avatars that can speak, gesture, and interact like real people. DeepBrain offers several products including AI Studios for creating AI videos, AI Human for interactive kiosks and assistants, and AI API for integration into your own applications. The technology is used in areas such as education, customer service, marketing, and the entertainment industry.',
      pricingInfo: 'DeepBrain AI offers several plans: The basic plan starts at approximately $30 per month and provides a limited number of minutes of AI video with pre-made avatars. The professional plan (approx. $100-200 per month) offers more video minutes and a larger selection of avatars. The Enterprise plan with individual pricing provides the ability to create custom avatars, unlimited minutes, and premium support.',
      videoUrls: 'https://www.youtube.com/watch?v=NMDx4kQwJrA',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.heygen.com',
    data: {
      name: 'HeyGen',
      description: 'AI platform for creating personalized videos with virtual presenters in various languages without the need for filming.',
      price: 29, // Monthly
      category: 'AI & Video',
      imageUrl: 'https://www.heygen.com/favicon.ico',
      tags: 'AI video, virtual presenters, video localization, text-to-video, multilingual content',
      advantages: 'Quick creation of quality videos without technical knowledge, Translation of videos into many languages with preserved lip synchronization, Library of pre-made avatars and option to create your own, Integration with other tools via API',
      disadvantages: 'Monthly limits on number and length of videos, Premium features are only available in higher price plans, Creating your own avatar requires additional costs',
      detailInfo: 'HeyGen is a powerful AI platform for creating personalized videos with virtual presenters. It allows easy transformation of text into professional-looking videos with realistic AI avatars. The main advantage of HeyGen is the ability to localize content into different languages - users can create a video in one language and then automatically convert it to other languages with perfect lip synchronization. The platform is used by marketers, educational institutions, HR departments, and other professionals for creating training materials, marketing videos, product presentations, and personalized messages.',
      pricingInfo: 'HeyGen offers several pricing plans: Starter at $29 per month includes 10 minutes of video per month, 1 custom avatar, and basic features. Creator at $79 per month provides 30 minutes of video and more features. For individual needs, there is an Enterprise plan with custom pricing, unlimited content, and premium features.',
      videoUrls: 'https://www.youtube.com/watch?v=Gqo4caXFMdM',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.basedlabs.com',
    data: {
      name: 'Based Labs',
      description: 'AI platform for creating authentic marketing videos with generative avatars, focused on naturalness and personalization.',
      price: 49, // Monthly
      category: 'AI & Video',
      imageUrl: 'https://www.basedlabs.com/favicon.ico',
      tags: 'AI video, generative avatars, marketing videos, text-to-video, personalization',
      advantages: 'Creation of naturally-appearing videos with AI avatars, Intuitive editor for inexperienced users, Integration with marketing tools, Possibility of extensive personalization for different target groups',
      disadvantages: 'Relatively new platform with possible limitations, Higher price compared to some competitors, Limited number of output minutes in basic plans',
      detailInfo: 'Based Labs develops an innovative AI platform specialized in creating marketing videos with generative avatars. Unlike some competitors, it focuses on creating authentically-looking videos that don\'t appear robotic or artificial. The platform allows users to create personalized videos at scale suitable for marketing campaigns, sales outreach, customer service, and other uses. Based Labs emphasizes ease of use, so even users without technical knowledge can quickly create professionally-looking video content.',
      pricingInfo: 'Based Labs offers several pricing plans starting at $49 per month for basic features and a limited number of video minutes. More advanced plans range from $99 to $249 per month and offer more video minutes, advanced personalization options, and priority rendering. For large enterprises, an individual Enterprise plan is available.',
      videoUrls: '',
      hasTrial: true
    }
  }
]

async function updateOrCreateProducts() {
  console.log('Starting to save mixed collection of AI tools to database...')

  try {
    for (const product of mixedProducts) {
      // Check if product already exists by URL
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      })

      if (existingProduct) {
        // Product exists - update
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: product.data
        })
        console.log(`✅ Updated product: ${product.data.name}`)
      } else {
        // Product doesn't exist - create new
        await prisma.product.create({
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        })
        console.log(`✅ Created new product: ${product.data.name}`)
      }
    }

    console.log('✨ All products successfully saved!')
  } catch (error) {
    console.error('❌ Error saving products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOrCreateProducts() 