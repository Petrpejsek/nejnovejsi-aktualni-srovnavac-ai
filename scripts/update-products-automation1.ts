import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will add automation and robotics AI tools to the database
async function updateOrCreateProducts() {
  console.log('Saving automation and robotics AI tools to database...')

  // Array of automation and robotics products to add or update
  const automationProducts = [
    {
      externalUrl: "https://www.blueyonder.com",
      data: {
        name: "Blue Yonder",
        description: "AI-powered supply chain management platform that optimizes inventory, logistics, and fulfillment operations.",
        price: 50000,
        category: "automation",
        imageUrl: "https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_89bd05df62c172cf05a1e1e88ebdd1e1/blue-yonder-supply-chain-management.png",
        tags: "supply chain management, inventory optimization, logistics, warehouse management, demand forecasting",
        advantages: "End-to-end supply chain visibility, Real-time inventory management, AI-driven demand forecasting, Automated resource allocation, Integration with existing ERP systems",
        disadvantages: "High implementation costs, Complex setup requiring specialized expertise, Enterprise-focused pricing model, Significant time investment for full deployment, Steep learning curve for new users",
        detailInfo: "Blue Yonder is a comprehensive supply chain management platform that leverages artificial intelligence and machine learning to optimize operations across the entire supply chain. The platform offers solutions for demand planning, inventory management, warehouse management, transportation management, and workforce management. Blue Yonder's AI algorithms analyze historical data, current market conditions, and external factors to predict demand patterns, optimize inventory levels, and suggest efficient logistics routes. The system can automatically adjust to disruptions and unexpected events, recalculating optimal paths and resource allocation in real-time. With its cognitive capabilities, Blue Yonder helps businesses reduce waste, minimize stockouts, decrease transportation costs, and improve overall operational efficiency. The platform serves various industries including retail, manufacturing, logistics, and distribution.",
        pricingInfo: "Blue Yonder operates on an enterprise pricing model with custom quotes based on the organization's size, needs, and selected modules. Implementation typically starts at $50,000+ for basic setups, with annual subscription costs ranging from $50,000 to several hundred thousand dollars depending on the scale of operations and required features. The company offers various modules that can be purchased separately or as a complete end-to-end solution.",
        videoUrls: "https://www.youtube.com/watch?v=QeEN0aEd6YA",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.covariant.ai",
      data: {
        name: "Covariant AI",
        description: "Robotic AI system that enables industrial robots to see, reason, and handle a wide variety of items in warehouse environments.",
        price: 12000,
        category: "automation",
        imageUrl: "https://www.covariant.ai/wp-content/uploads/2023/03/DSC01023-1-1200x608.jpg",
        tags: "robotics, computer vision, warehouse automation, pick and place, machine learning",
        advantages: "Adaptable to new objects without reprogramming, High accuracy in item handling, Works with existing warehouse robots, Continuous learning from new experiences, 24/7 operation capability",
        disadvantages: "High initial investment, Integration complexity with existing systems, Requires technical expertise for maintenance, Limited to specific warehouse operations, Performance depends on environmental conditions",
        detailInfo: "Covariant AI has developed a universal AI system for robots that enables them to see, reason, and handle a wide variety of objects in unstructured environments. Founded by AI researchers from UC Berkeley, the company's Brain is a neural network-based system that allows robots to learn and adapt to new items and circumstances without extensive reprogramming. The system excels particularly in pick-and-place operations in warehouses and distribution centers, where it can recognize and properly handle items regardless of their position, orientation, or appearance. Covariant's technology combines computer vision, reinforcement learning, and imitation learning to achieve human-like adaptability in robotic systems. The AI continuously improves its performance through experience and can quickly adapt to new items or changes in the environment. This technology is particularly valuable for e-commerce fulfillment, where the diversity of products and changing inventory present significant challenges for traditional automation.",
        pricingInfo: "Covariant AI offers custom pricing based on implementation scope, integration requirements, and operational scale. The company typically works on a Robot-as-a-Service (RaaS) model with monthly subscription fees based on usage or throughput, starting from approximately $8,000-$15,000 per month per robot station. Some implementations may involve initial setup fees and ongoing service contracts. Pricing details are provided through custom quotes after assessment of specific business needs.",
        videoUrls: "https://www.youtube.com/watch?v=Kdd-sz-1LZc",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.berkshiregrey.com",
      data: {
        name: "Berkshire Grey",
        description: "AI-powered robotic automation solutions for retail, e-commerce, and logistics operations focusing on order fulfillment and processing.",
        price: 500000,
        category: "automation",
        imageUrl: "https://berkshiregrey.com/wp-content/uploads/2023/04/BG-Robotic-Product-Sortation-with-Identification-RPSi-_-9536-min-scaled.jpg",
        tags: "warehouse automation, fulfillment robotics, order picking, inventory management, sorting systems",
        advantages: "Fully integrated end-to-end automation solutions, Scalable to grow with business needs, Reduces labor costs and dependency, Increases order processing speed and accuracy, Adapts to changing product mixes",
        disadvantages: "Significant upfront capital investment, Extended implementation timeframe, Requires facility modifications, May need operational process changes, Specialized maintenance requirements",
        detailInfo: "Berkshire Grey provides intelligent enterprise robotics solutions that combine AI and robotics to automate fulfillment, supply chain, and logistics operations. Their systems are designed to handle the complex challenges of e-commerce and retail fulfillment, including picking, sorting, and handling diverse items at high speeds with great precision. The company's platform includes robotic picking systems, robotic sortation systems, robotic integration systems, and mobile robotics that work together to streamline operations throughout the supply chain. Berkshire Grey's technology can identify, pick, and sort items of various sizes, shapes, and materials without prior programming for each specific item. The systems are designed to be flexible and adaptable, allowing businesses to respond quickly to changing customer demands and seasonal peaks. Berkshire Grey solutions have been implemented by major retailers, grocery chains, and logistics providers to increase throughput, reduce labor costs, and improve order accuracy.",
        pricingInfo: "Berkshire Grey solutions represent a significant capital investment with implementation costs typically starting at $500,000 for basic systems and reaching several million dollars for comprehensive warehouse automation solutions. The company offers various purchasing models including direct purchase, Robot-as-a-Service (RaaS) subscriptions with monthly fees based on throughput metrics, and performance-based contracts where payment is tied to productivity improvements. Specific pricing is determined through detailed analysis of customer requirements, facility layout, throughput targets, and integration needs.",
        videoUrls: "https://www.youtube.com/watch?v=mK6lKQRiRQE",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.symbotic.com",
      data: {
        name: "Symbotic",
        description: "AI-powered robotic warehouse automation system for high-density storage, retrieval, and case picking in distribution centers.",
        price: 350000,
        category: "automation",
        imageUrl: "https://assets.entrepreneur.com/images/1280x1120/1/GettyImages-1436116389.jpg",
        tags: "warehouse automation, autonomous robots, distribution centers, case picking, inventory management",
        advantages: "Maximizes storage density and warehouse utilization, Increases throughput by up to 4x, Reduces labor costs by up to 80%, Improves inventory accuracy, Scalable modular design",
        disadvantages: "High initial implementation cost, Requires significant facility modifications, Extended implementation timeline, Limited flexibility for rapid facility changes, Best suited for high-volume operations",
        detailInfo: "Symbotic has developed a comprehensive warehouse automation system that transforms distribution operations through AI-powered robotics. The company's solution combines autonomous robots, AI-controlled movement systems, and sophisticated inventory management software to create a highly efficient, high-density storage and retrieval system. At the core of Symbotic's technology are autonomous robots called SymBots that can navigate three-dimensionally through warehouse structures, retrieving and storing cases with precision and speed. The system's unique architecture enables warehouses to store products up to 4 times more densely than traditional methods while allowing for case-level selectivity during retrieval. Symbotic's AI orchestration layer continuously optimizes inventory placement based on demand patterns, seasonality, and product relationships. The technology handles receiving, storage, retrieval, depalletizing, and palletizing operations with minimal human intervention. Symbotic systems are particularly valuable for large-scale distribution operations in retail, grocery, and consumer goods, where they significantly reduce labor requirements while increasing throughput and accuracy.",
        pricingInfo: "Symbotic systems represent a significant capital investment, with implementation costs typically starting at $50-100 million for a full facility transformation. The company offers various modules that can be implemented incrementally, with individual modules ranging from $200,000 to $500,000+. Pricing is highly customized based on facility size, throughput requirements, and implementation scope. Symbotic also offers financing options and performance-based contracts for qualified customers. Implementation timelines typically range from 12-24 months for complete systems.",
        videoUrls: "https://www.youtube.com/watch?v=_QndP_PCRSw",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.gxo.com",
      data: {
        name: "GXO Logistics",
        description: "Contract logistics provider offering AI-powered warehouse management and automation solutions for supply chain optimization.",
        price: 50000,
        category: "automation",
        imageUrl: "https://www.gxo.com/content/gxo/global/en/media/media-library/shared-files/Images/Thumbnails/2023/XPO-Tiers4-thumb-featured-image-robotic-arms.jpg",
        tags: "contract logistics, warehouse automation, supply chain management, fulfillment services, logistics AI",
        advantages: "End-to-end logistics solutions without capital investment, Access to cutting-edge automation technologies, Scalable capacity based on business needs, Global logistics network, Industry-specific expertise",
        disadvantages: "Long-term contractual commitments, Less direct control over operations, Potential integration challenges with existing systems, Variable costs during peak seasons, Service quality dependent on provider performance",
        detailInfo: "GXO Logistics is a global contract logistics provider that leverages advanced technology, including AI and automation, to optimize warehouse operations and supply chain management. The company operates as a third-party logistics (3PL) provider, offering businesses access to state-of-the-art fulfillment centers equipped with various automation technologies such as autonomous mobile robots (AMRs), goods-to-person systems, robotic picking arms, and advanced sortation systems. GXO's technology stack includes proprietary warehouse management systems enhanced with AI for predictive analytics, labor management, inventory optimization, and demand forecasting. The company specializes in providing tailored logistics solutions for specific industries, including e-commerce, retail, consumer technology, food and beverage, and industrial manufacturing. GXO's AI-driven systems help optimize warehouse layouts, picking paths, inventory placement, and staffing levels to maximize efficiency and throughput while reducing operational costs. As a contract logistics provider, GXO enables businesses to access advanced automation without significant capital investments, instead operating on a service model based on throughput and performance metrics.",
        pricingInfo: "GXO Logistics operates on a contract logistics model with highly customized pricing based on service scope, volume, complexity, and term length. Typical contracts run 3-5 years with pricing structures that may include base fees plus variable components tied to volume, labor hours, or throughput metrics. For warehouse management services, costs typically range from $5-15 per order processed, while comprehensive fulfillment services (including receiving, storage, picking, packing, and shipping) range from $15-30 per order depending on complexity. Implementation fees for new accounts typically range from $50,000-$500,000 depending on integration requirements and customization needs. GXO offers various commercial models including cost-plus, fixed-fee, and gain-sharing arrangements where savings from efficiency improvements are shared with clients.",
        videoUrls: "https://www.youtube.com/watch?v=bMNnLK_mMUE",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.chefrobotics.ai",
      data: {
        name: "Chef Robotics",
        description: "Automated food preparation robotics system using AI for consistent, efficient, and scalable food assembly operations.",
        price: 250000,
        category: "automation",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/62ecbb11a9da9a45f4c00a1f/04e599f3-2a4e-4c0c-b7e5-5ca9bfdb8d31/chef-robots-hero-2-alt.jpg",
        tags: "food automation, robotic food preparation, commercial kitchen robots, food assembly, food service automation",
        advantages: "Consistent food quality and portion control, Reduces labor costs and dependency, Increases production throughput, Minimizes food waste, Adaptable to multiple recipes",
        disadvantages: "High initial investment, Space requirements for installation, Limited menu flexibility compared to human chefs, Regular maintenance requirements, Best suited for standardized menu items",
        detailInfo: "Chef Robotics has developed an advanced robotic system designed specifically for food preparation and assembly in commercial kitchens, ghost kitchens, and food production facilities. The company's flagship system combines computer vision, AI, and precise robotic manipulation to automate the assembly of various food items including bowls, salads, sandwiches, and other composed dishes. Chef Robotics' technology can identify, pick up, and precisely place different ingredients while adapting to natural variations in food items—a historically challenging task for robotics. The system uses 3D cameras and machine learning algorithms to recognize ingredients and determine optimal grasping and placement techniques. The robots can be programmed to prepare different recipes and can switch between them quickly, allowing for menu flexibility while maintaining consistency across all prepared items. Chef Robotics systems are designed to integrate with existing kitchen workflows and equipment, minimizing disruption while maximizing output. The technology is particularly valuable for food service operations facing labor shortages and consistency challenges, providing a reliable solution that maintains quality standards while increasing production capacity.",
        pricingInfo: "Chef Robotics offers flexible pricing models to accommodate different operational needs. The company provides both outright purchase options starting at approximately $250,000-$350,000 per system, and Robot-as-a-Service (RaaS) subscription plans starting from approximately $5,000-$8,000 monthly with minimum term commitments (typically 24-36 months). Implementation costs, which include integration, training, and initial programming, typically range from $25,000-$50,000 depending on complexity. Ongoing support and maintenance plans are available at additional cost, ranging from $15,000-$30,000 annually. Custom programming for specific menu items is typically included for an initial set but may incur additional fees for extensive menu development.",
        videoUrls: "https://www.youtube.com/watch?v=zXr8RFo5bS4",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.academyofrobotics.co.uk",
      data: {
        name: "Academy of Robotics (Kar-go)",
        description: "Autonomous delivery vehicle system using AI for last-mile logistics and contactless delivery operations.",
        price: 125000,
        category: "automation",
        imageUrl: "https://www.academyofrobotics.co.uk/s/AoR-LogoType-v2.png",
        tags: "autonomous vehicles, last mile delivery, contactless delivery, logistics automation, self-driving technology",
        advantages: "Reduces last-mile delivery costs, Autonomous 24/7 operation capability, Zero-emission electric vehicle, Contactless delivery system, Secure compartmentalized storage",
        disadvantages: "Regulatory restrictions in some regions, Limited to specific geographic areas, Weather-dependent performance, Payload and range limitations, Emerging technology with ongoing refinement",
        detailInfo: "Academy of Robotics has developed Kar-go, an autonomous electric delivery vehicle designed to revolutionize last-mile logistics. The Kar-go vehicle combines advanced AI, computer vision, and machine learning to navigate roads and complete deliveries without human intervention. The distinctive green vehicle is purpose-built for urban and suburban environments, capable of carrying multiple packages in secure, compartmentalized storage units. Recipients can access their specific compartment through a contactless system using a mobile app or verification code. Kar-go's AI navigation system utilizes a combination of sensors, cameras, and proprietary algorithms to identify optimal routes, recognize obstacles, and adapt to traffic conditions in real-time. The technology focuses particularly on addressing the costly last-mile delivery challenge, which typically accounts for over 50% of total delivery costs. Academy of Robotics has been working with logistics providers and retailers in the UK to implement autonomous delivery services, particularly in defined geographic areas like university campuses, business parks, and residential communities. The system is designed to complement existing logistics networks rather than replace them entirely, focusing on routine, predictable delivery routes where autonomous vehicles can operate most efficiently.",
        pricingInfo: "Academy of Robotics offers several commercial models for their Kar-go autonomous delivery system. The base vehicle purchase price starts at approximately £100,000-£150,000, with fleet discounts available. The company also offers leasing options starting from approximately £5,000-£8,000 per month on 24-36 month contracts. Implementation includes mapping of operational areas, integration with existing logistics systems, and training, typically costing an additional £20,000-£40,000 depending on complexity. Academy of Robotics also offers a Delivery-as-a-Service model in select regions, charging per delivery or per route without requiring vehicle purchase. Ongoing software updates, maintenance, and support are typically provided through annual service contracts ranging from £10,000-£25,000 per vehicle.",
        videoUrls: "https://www.youtube.com/watch?v=SoHGJ4yWK7E",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.samsung.com/global/business/sds/solution/ai",
      data: {
        name: "Samsung SDS Logistics AI",
        description: "Enterprise AI platform for logistics optimization, warehouse management, and supply chain intelligence with predictive analytics.",
        price: 750000,
        category: "automation",
        imageUrl: "https://www.samsung.com/global/business/sds/img/gnb/logo_samsung.svg",
        tags: "enterprise logistics, AI optimization, supply chain analytics, predictive logistics, warehouse automation",
        advantages: "End-to-end supply chain visibility, Predictive demand forecasting, Automated logistics planning, Integration with enterprise systems, Global logistics network support",
        disadvantages: "Enterprise-focused with high minimum requirements, Complex implementation process, Significant customization required, Extended deployment timeline, Best suited for large operations",
        detailInfo: "Samsung SDS offers a comprehensive suite of AI-powered logistics and supply chain solutions designed for enterprise-scale operations. The company's Cello platform combines artificial intelligence, big data analytics, and logistics expertise to optimize the entire supply chain from procurement to final delivery. Samsung SDS's AI capabilities include predictive demand forecasting, which analyzes historical data, market trends, and external factors to predict future demand patterns with high accuracy. The platform's intelligent transportation management system optimizes routing, carrier selection, and load consolidation to reduce transportation costs and improve efficiency. For warehouse operations, Samsung SDS offers AI-driven warehouse management solutions that optimize inventory placement, picking paths, and workforce allocation. The system can also integrate with various automation technologies including autonomous mobile robots (AMRs), automated storage and retrieval systems (AS/RS), and robotic picking systems. A key strength of Samsung SDS's offering is its end-to-end approach that provides visibility and optimization across the entire supply chain, enabling coordinated planning and execution rather than optimizing individual components in isolation. The company's solutions are particularly valuable for global enterprises with complex, multi-tier supply chains spanning multiple regions.",
        pricingInfo: "Samsung SDS operates on an enterprise pricing model with highly customized solutions based on the scope of implementation, scale of operations, and specific requirements. Initial implementation costs typically range from $500,000 to several million dollars depending on complexity and scale. The company offers various commercial models including traditional licensing with annual maintenance fees, subscription-based pricing with monthly or annual payments, and outcome-based models where fees are partially tied to realized cost savings or performance improvements. Specific pricing is established through detailed discovery and scoping processes tailored to each client's unique requirements. Implementation timelines typically range from 6-18 months depending on scope.",
        videoUrls: "https://www.youtube.com/watch?v=fwMTbWBLM-Q",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.cainiao.com",
      data: {
        name: "Cainiao Smart Logistics",
        description: "AI-powered logistics network offering intelligent supply chain solutions, automated warehousing, and delivery optimization at massive scale.",
        price: 200000,
        category: "automation",
        imageUrl: "https://vieclamlogistics.com/data/images/comp/2022/08/09/cainiao-logistics-network-175110.png",
        tags: "global logistics, smart warehousing, delivery optimization, e-commerce fulfillment, logistics platform",
        advantages: "Massive logistics network with global reach, Advanced automation technologies, Real-time tracking and visibility, AI-optimized delivery routing, Integrated with major e-commerce platforms",
        disadvantages: "Primary focus on Asian markets, Complex integration requirements, Best suited for high-volume operations, Limited customization for smaller merchants, Enterprise-oriented pricing",
        detailInfo: "Cainiao Smart Logistics Network, the logistics arm of Alibaba Group, has developed one of the world's most advanced AI-driven logistics ecosystems. The company's platform integrates cutting-edge technologies including artificial intelligence, IoT, robotics, and big data analytics to create a comprehensive logistics network that spans warehousing, transportation, delivery, and global supply chain management. Cainiao's automated warehouses feature extensive robotics implementations, including autonomous mobile robots, automated sorting systems, and robotic picking arms that significantly increase throughput while reducing labor requirements. The company's AI algorithms optimize every aspect of logistics operations, from predicting order volumes and allocating inventory across warehouses to determining optimal delivery routes and scheduling. Cainiao's IoT network includes millions of connected devices that provide real-time data on package locations, warehouse conditions, and vehicle status. The platform's predictive capabilities are particularly noteworthy, with AI models that can forecast shipping volumes with high accuracy, allowing for proactive resource allocation. Cainiao's global smart logistics network connects China with over 200 countries and regions, offering merchants of all sizes access to international logistics capabilities that were previously available only to the largest enterprises.",
        pricingInfo: "Cainiao offers tiered service models with pricing based on volume, service level, and logistics requirements. For merchants on Alibaba platforms, basic logistics services follow a simplified pricing structure with costs typically ranging from $1-5 per package for domestic deliveries and $5-20 for international shipments, depending on weight, dimensions, and destination. For enterprise clients requiring comprehensive logistics solutions, Cainiao provides custom pricing based on detailed analysis of specific requirements. These enterprise solutions typically involve implementation fees ranging from $50,000-$500,000 plus ongoing service fees structured as per-package costs, percentage of goods value, or fixed monthly/annual subscriptions. The company also offers value-added services including customs clearance assistance, supply chain financing, and logistics consulting at additional costs.",
        videoUrls: "https://www.youtube.com/watch?v=S4Kz5itJpfE",
        hasTrial: false
      }
    }
  ]

  try {
    for (const product of automationProducts) {
      // Check if product already exists based on externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: { externalUrl: product.externalUrl }
      })

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: product.data
        })
        console.log(`✅ Updated product: ${product.data.name}`)
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            externalUrl: product.externalUrl,
            ...product.data
          }
        })
        console.log(`✅ Created new product: ${product.data.name}`)
      }
    }
    console.log('✨ All automation products have been stored in the database!')
  } catch (error) {
    console.error('❌ Error storing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOrCreateProducts() 