import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will add more automation and logistics AI tools to the database
async function updateOrCreateProducts() {
  console.log('Saving automation and logistics AI tools (batch 2) to database...')

  // Array of automation and logistics products to add or update
  const automationProducts = [
    {
      externalUrl: "https://www.raft.ai",
      data: {
        name: "Raft AI",
        description: "AI-driven inventory and supply chain optimization platform that reduces stockouts and excess inventory.",
        price: 15000,
        category: "automation",
        imageUrl: "https://assets-global.website-files.com/64003365510e05e0963c3c94/64003365510e05e0963c3ce5_raft-logo.svg",
        tags: "inventory optimization, demand forecasting, supply chain, replenishment planning, retail",
        advantages: "Reduces stockouts by up to 80%, Decreases excess inventory by up to 30%, Quick implementation without IT resources, Machine learning that improves over time, Real-time inventory visibility",
        disadvantages: "Requires quality historical data, Initial model training period, Monthly subscription costs, Primarily focused on retail and e-commerce, Limited customization for unique business models",
        detailInfo: "Raft AI offers an intelligent inventory optimization platform designed to solve the persistent challenges of retail inventory management: stockouts and excess inventory. Using advanced machine learning algorithms, Raft analyzes historical sales data, current inventory levels, supplier lead times, and external factors like seasonality or promotional events to generate accurate demand forecasts. The platform then translates these forecasts into actionable inventory recommendations, suggesting optimal reorder points, order quantities, and timing for each SKU across all locations. Raft's system operates in real-time, continuously learning and improving its accuracy based on actual outcomes. The platform includes features for exception management, allowing inventory managers to review and adjust recommendations before execution. It also provides comprehensive analytics dashboards with inventory health metrics, stockout risk assessments, and potential cost savings opportunities. A key differentiator of Raft is its ability to balance the trade-off between inventory investment and service levels, helping businesses optimize working capital while maintaining customer satisfaction. The solution integrates seamlessly with existing ERP, POS, and inventory management systems, requiring minimal IT resources for implementation and maintenance.",
        pricingInfo: "Raft AI offers a SaaS pricing model based on the number of SKUs and locations managed. Monthly subscriptions typically start at $5,000 for small to mid-sized retailers (up to 10,000 SKUs) and scale up to $25,000+ for enterprise customers with extensive product catalogs and multiple locations. Implementation fees range from $10,000 to $50,000 depending on the complexity of integration and data requirements. The company offers a performance-based pricing option where fees are partially tied to realized savings in inventory costs and improvement in service levels. Raft provides a 3-month pilot program for new customers to demonstrate value before committing to longer-term contracts, which typically run for 12-36 months.",
        videoUrls: "https://www.youtube.com/watch?v=KQyBhbqfQHs",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.transmetrics.ai",
      data: {
        name: "Transmetrics",
        description: "Predictive analytics and AI optimization platform for cargo transport planning and logistics network optimization.",
        price: 75000,
        category: "automation",
        imageUrl: "https://transmetrics.eu/wp-content/uploads/2019/12/Transmetrics-logo-rgb.png",
        tags: "logistics optimization, predictive analytics, transport planning, capacity optimization, freight forecasting",
        advantages: "Reduces empty vehicle capacity by 25%, Improves asset utilization by up to 14%, AI-powered demand forecasting with 95%+ accuracy, Data cleansing and enrichment capabilities, Scenario modeling for strategic planning",
        disadvantages: "Enterprise-level pricing, Requires significant historical data, Complex implementation process, Best suited for medium to large operators, Industry-specific focus on logistics",
        detailInfo: "Transmetrics provides a suite of AI-powered optimization solutions specifically designed for logistics companies, including cargo carriers, freight forwarders, and parcel delivery networks. The company's platform combines predictive analytics and operations research to tackle the industry's key challenges: empty capacity, inefficient planning, and suboptimal resource allocation. Transmetrics' technology begins with advanced data cleansing and enrichment, transforming unstructured logistics data into a standardized format suitable for AI analysis. The core of the platform uses machine learning to forecast transport volumes with exceptional accuracy, accounting for seasonal patterns, economic indicators, and company-specific factors. Based on these forecasts, Transmetrics' optimization algorithms generate actionable recommendations for fleet sizing, network design, load planning, and pricing strategies. The software enables logistics planners to simulate various scenarios and assess their potential impact before implementation. Transmetrics offers several specialized modules, including NetMetrics for network optimization, SalesPricing for dynamic pricing, AssetMetrics for fleet management, and PlanMetrics for daily operational planning. The technology has been particularly successful in linehaul optimization for less-than-truckload (LTL) and parcel networks, where small efficiency improvements can yield significant cost savings.",
        pricingInfo: "Transmetrics offers its solutions under an enterprise SaaS model with annual subscription fees based on the modules selected and the scale of operations. Base pricing typically starts at approximately €60,000-€80,000 per year for single-module implementations, with comprehensive platform deployments ranging from €150,000-€300,000 annually for larger logistics networks. Implementation fees, which include data integration, model training, and user training, typically range from €40,000-€100,000 depending on complexity. The company emphasizes ROI-based pricing, with implementations typically delivering 5-10x return on investment through reduced transportation costs, improved asset utilization, and enhanced planning efficiency. Contracts are typically structured with multi-year terms, with discounts available for longer commitments.",
        videoUrls: "https://www.youtube.com/watch?v=uApB5x-cBGE",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.uberfreight.com",
      data: {
        name: "Uber Freight",
        description: "AI-powered digital freight marketplace that connects shippers and carriers while automating pricing, matching, and booking.",
        price: 0,
        category: "automation",
        imageUrl: "https://freight.uber.com/wp-content/uploads/2022/03/uber-freight-1.png",
        tags: "digital freight, logistics marketplace, real-time pricing, automated booking, supply chain visibility",
        advantages: "Instant access to thousands of verified carriers, Real-time dynamic pricing, Automated load matching and booking, End-to-end shipment visibility, Integration with existing TMS systems",
        disadvantages: "Commission-based pricing impacts margins, Limited support for specialized freight, Service quality dependent on carrier network, Less direct carrier relationships, Premium features require subscription",
        detailInfo: "Uber Freight is a digital freight platform that brings Uber's technology-first approach to the logistics industry, connecting shippers with carriers through an automated marketplace. The platform uses machine learning algorithms to match freight loads with available carriers based on factors including location, equipment type, price, and driver preferences. At the core of Uber Freight is its dynamic pricing engine, which analyzes thousands of data points—including historical pricing, current market conditions, seasonal factors, fuel costs, and regional demand patterns—to generate instant, market-relevant rate quotes. Shippers can book loads with transparent pricing in seconds rather than the hours typically required for traditional freight brokerage. For carriers and drivers, the platform offers a mobile app that streamlines the process of finding and booking loads, managing documentation, and receiving payment, with most carriers paid within 7 days compared to the industry standard of 30+ days. Uber Freight's technology includes predictive capabilities that anticipate market shifts and capacity constraints, helping shippers plan more effectively. The platform also provides comprehensive tracking and analytics, giving shippers visibility throughout the transportation lifecycle and insights to optimize their supply chains. Enterprise shippers can access additional capabilities through Uber Freight Enterprise, including dedicated capacity solutions, API integrations with transportation management systems, and strategic network optimization.",
        pricingInfo: "Uber Freight operates primarily on a commission-based model, functioning as a broker between shippers and carriers. For basic services, there are no subscription fees or minimum volumes required for shippers to access the platform. Uber Freight typically charges a commission of 15-20% on the gross cost of each shipment, which is built into the displayed rates. Enterprise customers with significant volume can negotiate custom pricing arrangements with potentially lower commission rates. Uber Freight Enterprise, the company's premium offering for larger shippers, includes additional features and services with pricing typically based on a combination of transaction fees and monthly/annual subscription fees starting at approximately $10,000 per year, depending on shipment volume and required features. The platform offers various premium services, including API integrations, dedicated account management, and advanced analytics, which may incur additional fees based on specific requirements.",
        videoUrls: "https://www.youtube.com/watch?v=lM3EgaGLOqM",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.nuvocargo.com",
      data: {
        name: "Nuvocargo",
        description: "Digital platform with AI tools for cross-border shipping between US and Mexico, offering freight, customs, and trade compliance automation.",
        price: 5000,
        category: "automation",
        imageUrl: "https://nuvocargo.com/wp-content/uploads/2021/11/logo-nuvo-1-1.png",
        tags: "cross-border logistics, Mexico trade, customs brokerage, supply chain visibility, international shipping",
        advantages: "All-in-one platform for cross-border logistics, Bilingual support team (English/Spanish), Real-time shipment tracking and documentation, Automated customs processing, Supply chain financing options",
        disadvantages: "Geographic focus limited to US-Mexico trade, Premium pricing compared to traditional brokers, Digital-first approach may not suit all shippers, Limited service for specialized cargo, Newer player in established industry",
        detailInfo: "Nuvocargo is a digital logistics platform specializing in US-Mexico cross-border trade, combining technology with human expertise to simplify what has traditionally been a complex, fragmented process. The company's platform integrates multiple services—including freight transportation, customs brokerage, cargo insurance, and trade financing—into a single interface, eliminating the need for shippers to coordinate with multiple vendors. Nuvocargo's technology uses machine learning to optimize routing, predict border crossing times, and automate documentation preparation, significantly reducing delays and compliance issues that typically plague cross-border shipping. The platform provides real-time visibility into shipment status and location, with automated alerts for potential delays or issues. A key differentiator is Nuvocargo's deep understanding of both US and Mexican logistics systems and regulations, with a bilingual team providing support throughout the shipping process. The company also offers supply chain financing solutions, allowing qualified customers to extend payment terms while ensuring carriers and vendors are paid promptly. Nuvocargo's customer base ranges from small businesses making occasional cross-border shipments to enterprise customers with regular Mexico trade, with the platform scaling to accommodate varying volumes and requirements. The company continues to develop its technology, with recent additions including predictive ETA tools, automated document classification, and enhanced analytics for supply chain optimization.",
        pricingInfo: "Nuvocargo operates with a hybrid pricing model that combines traditional freight brokerage with SaaS components for its technology platform. The company charges on a per-shipment basis for its core transportation and customs services, with rates typically 10-20% higher than traditional brokers due to the added technology value and comprehensive service offering. For customers with regular shipping needs, Nuvocargo offers volume-based discounts and potential subscription models starting at approximately $5,000 per month, which include access to premium platform features, dedicated account management, and priority service. Additional services like cargo insurance and trade financing are priced separately, with insurance typically costing 0.3-0.5% of cargo value and financing solutions offering terms of 30-60 days at competitive rates. Nuvocargo provides custom quotes based on specific lanes, volumes, and service requirements, with pricing factoring in variables such as distance, cargo type, equipment needs, and current market conditions.",
        videoUrls: "https://www.youtube.com/watch?v=5xR-27yyt3I",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.vorto.ai",
      data: {
        name: "Vorto AI",
        description: "AI-powered supply chain optimization platform for industrial materials and equipment, automating procurement, logistics, and inventory management.",
        price: 30000,
        category: "automation",
        imageUrl: "https://vorto.ai/wp-content/uploads/2023/05/vorto-logo.svg",
        tags: "supply chain optimization, industrial procurement, logistics automation, inventory management, machine learning",
        advantages: "Reduces procurement costs by 12-15%, Decreases stockouts by up to 90%, Automates 80% of procurement tasks, Real-time market intelligence, Integration with existing ERP systems",
        disadvantages: "Primarily focused on industrial materials, Significant implementation timeline, Complex integration with legacy systems, Enterprise-level pricing, Requires data standardization",
        detailInfo: "Vorto AI has developed an intelligent supply chain platform specifically designed for industrial materials, equipment, and parts procurement. The platform uses artificial intelligence to transform the traditionally manual, fragmented industrial procurement process into a streamlined, data-driven operation. At the core of Vorto's technology is its ability to ingest and standardize disparate data from multiple sources—including ERP systems, historical purchases, inventory systems, and supplier catalogs—creating a unified digital representation of the supply chain. Vorto's AI analyzes this data along with external market information to optimize procurement decisions, suggesting the optimal timing, quantity, supplier, and logistics route for each purchase. The platform's machine learning capabilities enable it to continuously improve its recommendations based on outcomes and changing conditions. Vorto automates routine procurement tasks like RFQ generation, supplier communication, order placement, and documentation, allowing procurement teams to focus on strategic activities. The system provides comprehensive visibility across the supply chain, with real-time tracking of orders, inventory levels, and supplier performance. Vorto's technology is particularly valuable for organizations with complex supply chains spanning multiple locations, suppliers, and materials. The platform includes dedicated modules for demand forecasting, inventory optimization, supplier management, and logistics coordination, all accessible through a centralized dashboard that provides actionable insights for supply chain leaders.",
        pricingInfo: "Vorto AI offers its platform under an enterprise SaaS model with annual subscription fees based on procurement volume and complexity. Base pricing typically starts at $30,000 annually for small to mid-sized industrial organizations and scales up to $250,000+ for large enterprises with extensive procurement operations. Implementation fees, which include data integration, model training, and user onboarding, typically range from $20,000-$100,000 depending on complexity and scope. Vorto also offers outcome-based pricing options where fees are partially tied to documented cost savings, with typical arrangements guaranteeing minimum savings of 5-10x the platform cost. The company structures its contracts with initial terms of 12-36 months, with volume discounts and reduced rates available for longer commitments. Additional professional services for supply chain consulting, custom integration development, and specialized analytics are available at hourly or project-based rates.",
        videoUrls: "https://www.youtube.com/watch?v=cXVYgU-NbCU",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.sifted.com",
      data: {
        name: "Sifted",
        description: "AI-powered shipping intelligence platform that analyzes parcel data to optimize carrier selection, service levels, and shipping costs.",
        price: 20000,
        category: "automation",
        imageUrl: "https://sifted.com/wp-content/uploads/2022/06/cropped-sifted-logo-01-1.png",
        tags: "shipping optimization, parcel analytics, logistics intelligence, carrier management, transportation spend",
        advantages: "Reduces shipping costs by 15-25%, Automated carrier invoice auditing, Data-driven contract negotiation insights, Predictive shipping analytics, No IT integration required",
        disadvantages: "Focused primarily on parcel shipping, Value depends on shipping volume, Limited control over carrier relationships, Requires consistent data sharing, Best for medium to large shippers",
        detailInfo: "Sifted is a logistics intelligence platform that uses artificial intelligence to help businesses optimize their parcel shipping operations and reduce transportation costs. The platform ingests and analyzes shipping data from multiple carriers and systems, creating a comprehensive view of shipping patterns, performance, and expenses. Sifted's proprietary algorithms identify cost-saving opportunities by examining dimensions like service level selection, zone distribution, dimensional weight factors, accessorial charges, and delivery performance. The technology simulates various shipping scenarios to determine the optimal carrier mix, service levels, and packaging strategies based on specific business requirements and constraints. A key feature of Sifted is its automated invoice auditing capability, which identifies billing errors, service failures, and invalid surcharges, recovering overpayments that typically amount to 1-3% of total shipping spend. The platform provides detailed analytics on shipping performance, with interactive dashboards that enable logistics managers to drill down into specific issues, trends, and opportunities. Sifted's contract optimization module uses AI to analyze shipping patterns against current carrier agreements, identifying leverage points for negotiations and suggesting contract terms that could yield significant savings. The platform is designed to complement rather than replace existing shipping systems, requiring minimal IT resources for implementation while providing actionable intelligence to drive continuous improvement in shipping operations.",
        pricingInfo: "Sifted offers tiered subscription plans based on shipping volume and required functionality. Basic plans for small to medium-sized businesses (shipping 5,000-20,000 parcels monthly) typically start at $1,500-$3,000 per month, providing core analytics, basic audit capabilities, and standard reporting. Advanced plans for larger shippers (20,000-100,000+ parcels monthly) range from $3,000-$7,000 per month, adding features like contract optimization, advanced simulation tools, and API integrations. Enterprise plans for high-volume shippers start at $7,000+ per month and include dedicated account management, custom analytics, and advanced optimization capabilities. Sifted also offers performance-based pricing models where fees are partially tied to realized savings, typically charging 20-30% of verified cost reductions for a fixed term. Implementation fees are minimal or waived entirely for customers committing to annual contracts. The company offers a free shipping profile analysis as part of its sales process to demonstrate potential value before commitment.",
        videoUrls: "https://www.youtube.com/watch?v=TfdOXJnWTeI",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.loginextsolutions.com",
      data: {
        name: "LogiNext",
        description: "Cloud-based transportation automation platform with AI for route optimization, dispatch automation, and last-mile delivery management.",
        price: 35000,
        category: "automation",
        imageUrl: "https://loginextsolutions.com/wp-content/uploads/2021/12/loginext-logo.svg",
        tags: "route optimization, last-mile delivery, fleet management, dispatch automation, delivery experience",
        advantages: "Reduces fuel costs by up to 20%, Increases delivery capacity by 15-20%, Automates dispatching and routing decisions, Real-time tracking and notifications, Configurable customer delivery experience",
        disadvantages: "Complex implementation for large fleets, Requires driver adoption of mobile app, Premium pricing compared to basic solutions, Feature-rich interface has learning curve, ROI dependent on operation scale",
        detailInfo: "LogiNext is a comprehensive logistics automation platform that helps businesses optimize and automate their transportation operations across first, middle, and last-mile delivery networks. The platform combines advanced algorithms, machine learning, and real-time data processing to transform manually intensive logistics processes into automated, efficient workflows. At the heart of LogiNext is its route optimization engine, which considers multiple constraints—including traffic conditions, delivery time windows, vehicle capacity, driver skills, and service times—to generate optimal delivery routes and schedules. The platform's auto-allocation system automatically assigns orders to the most suitable drivers based on proximity, capacity, and other defined parameters, eliminating the need for manual dispatching. LogiNext provides real-time visibility into vehicle location and delivery status through its web dashboard and mobile applications, with automated notifications keeping customers informed throughout the delivery journey. The technology includes a driver mobile app that guides drivers through optimized routes, manages electronic proof of delivery, and tracks performance metrics. For customers, LogiNext offers branded tracking pages, delivery scheduling, and feedback collection tools that enhance the delivery experience. The platform is highly configurable to accommodate various logistics models, from dedicated fleets to crowdsourced delivery networks, and integrates with existing order management, warehouse, and ERP systems. LogiNext serves multiple industries including e-commerce, retail, food delivery, transportation, field service, and healthcare, with specialized features for each vertical's unique requirements.",
        pricingInfo: "LogiNext offers its platform under a SaaS subscription model with pricing based on the number of resources tracked (vehicles/drivers), transaction volume, and selected modules. Basic packages for small operations (10-50 resources) typically start at $15,000-$25,000 annually, while mid-sized implementations (50-200 resources) range from $25,000-$75,000 per year. Enterprise deployments for larger operations can range from $75,000 to $250,000+ annually, depending on scale and complexity. The company offers several product tiers: LogiNext Mile (last-mile delivery management), LogiNext Haul (long-haul transportation), LogiNext On-Demand (for immediate deliveries), and LogiNext 360 (end-to-end supply chain visibility). Implementation fees typically range from $5,000-$50,000 based on integration complexity, customization requirements, and training needs. LogiNext structures its contracts with initial terms of 12-36 months, with volume discounts available for longer commitments. Professional services for custom development, advanced integrations, and specialized consulting are available at additional cost.",
        videoUrls: "https://www.youtube.com/watch?v=QN4JTscIvQ8",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://throughput.world",
      data: {
        name: "Throughput",
        description: "AI supply chain optimization platform that identifies and resolves bottlenecks in manufacturing and distribution operations.",
        price: 60000,
        category: "automation",
        imageUrl: "https://throughput.world/wp-content/uploads/2023/03/Throughput-Logo.svg",
        tags: "supply chain optimization, bottleneck analysis, inventory intelligence, manufacturing efficiency, demand planning",
        advantages: "Increases throughput by 15-30%, Reduces inventory carrying costs by 20-35%, AI-powered bottleneck detection, Rapid implementation (4-6 weeks), No equipment or sensor installation required",
        disadvantages: "Requires quality data inputs, Complex modeling for highly variable processes, Enterprise pricing model, Best suited for mid to large operations, Limited industry-specific customization",
        detailInfo: "Throughput has developed an artificial intelligence platform specifically designed to identify, prioritize, and resolve bottlenecks in complex manufacturing and distribution operations. The company's technology uses proprietary algorithms to analyze operational data from existing systems—including ERP, MES, WMS, and other sources—to build a digital twin of the entire supply chain. This virtual model allows Throughput to simulate different scenarios and identify hidden constraints that limit overall system performance. The platform's AI continuously monitors operations, detecting emerging bottlenecks before they impact productivity and recommending specific actions to resolve constraints. Throughput's Inventory Intelligence module optimizes inventory levels throughout the supply chain, identifying opportunities to reduce working capital without compromising service levels. The Demand Intelligence capability uses machine learning to generate accurate forecasts that account for seasonality, market trends, and internal operational constraints. A key differentiator of Throughput is its focus on the Theory of Constraints methodology, which prioritizes improvements based on their impact on overall system performance rather than optimizing individual processes in isolation. The platform provides clear, actionable recommendations through intuitive dashboards, making complex supply chain optimization accessible to operational teams without requiring advanced analytical skills. Throughput serves customers across manufacturing, distribution, and retail industries, with particular strength in automotive, industrial equipment, consumer goods, and food & beverage sectors.",
        pricingInfo: "Throughput offers its platform under a subscription model with pricing based on the scope of implementation and complexity of operations. Annual subscriptions typically start at $60,000 for focused applications in specific operational areas and range up to $250,000+ for enterprise-wide implementations spanning multiple facilities and supply chain functions. Implementation fees, which include data integration, model configuration, and initial training, typically range from $25,000-$100,000 depending on complexity. The company offers ROI-based pricing options where a portion of fees is tied to documented throughput increases or inventory reductions, ensuring alignment with customer success. Throughput structures its contracts with initial terms of 12-24 months, with most customers opting for multi-year agreements as the AI models become more valuable over time with accumulated data and learning. The company offers professional services for advanced analytics, custom development, and supply chain consulting at additional cost, typically billed at hourly or project-based rates.",
        videoUrls: "https://www.youtube.com/watch?v=cEV4L2sP8MA",
        hasTrial: false
      }
    },
    {
      externalUrl: "https://www.swap.io",
      data: {
        name: "Swap",
        description: "AI-powered product returns management platform that automates processing, reduces costs, and enables circular commerce.",
        price: 10000,
        category: "automation",
        imageUrl: "https://www.swap.io/wp-content/uploads/2019/03/Swap-logo.png",
        tags: "returns management, reverse logistics, circular commerce, retail automation, recommerce platform",
        advantages: "Reduces returns processing costs by 30-50%, Increases recovery value by 25%, Automated disposition decision-making, Seamless customer returns experience, Enables resale of returned items",
        disadvantages: "Integration complexity with existing systems, Primarily focused on fashion/apparel, Premium pricing compared to basic returns, Best ROI for high-return-rate businesses, Limited customization for smaller merchants",
        detailInfo: "Swap has developed an intelligent returns management platform that transforms product returns from a cost center into a profit opportunity through automation and circular commerce capabilities. The platform uses artificial intelligence to streamline every aspect of the returns process, from the customer-facing return experience to back-end processing and disposition decisions. Swap's technology begins with a branded returns portal that integrates with merchants' e-commerce systems, providing customers with a seamless self-service experience for initiating returns and exchanges. The system's rule engine applies configurable business logic to each return, automatically approving eligible returns, offering optimal exchange options, and determining the most economical shipping method. Once items are received at the warehouse, Swap's AI-powered processing system guides operators through inspection and grading, using computer vision to identify issues and determine the optimal disposition path for each item—whether restocking, refurbishment, liquidation, or recycling. A key differentiator is Swap's recommerce capability, which enables merchants to automatically list returned items that can't be restocked on secondary marketplaces, recapturing value that would otherwise be lost. The platform provides comprehensive analytics on returns patterns, causes, and financial impact, helping merchants identify product quality issues and optimize future inventory decisions. Swap serves customers across e-commerce, retail, and direct-to-consumer brands, with particular strength in fashion, apparel, footwear, and home goods categories where return rates and recovery potential are highest.",
        pricingInfo: "Swap offers tiered pricing based on return volume and selected platform capabilities. For small to mid-sized merchants (processing 1,000-5,000 returns monthly), base platform fees typically start at $2,000-$5,000 per month, covering core returns processing, customer portal, and basic analytics. For larger retailers (5,000-25,000+ monthly returns), pricing ranges from $5,000-$15,000+ per month, adding advanced features like multi-warehouse support, AI-powered disposition, and recommerce capabilities. In addition to platform fees, Swap charges per-return processing fees ranging from $1.50-$4.00 depending on handling complexity, with volume discounts available. For merchants utilizing Swap's recommerce services, the company typically charges a 15-30% commission on successfully resold items. Implementation fees range from $5,000-$25,000 based on integration complexity and customization requirements. Swap offers month-to-month contracts for smaller merchants, with enterprise customers typically committing to 12-24 month terms in exchange for more favorable pricing.",
        videoUrls: "https://www.youtube.com/watch?v=8XMzf_0LjnE",
        hasTrial: true
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
    console.log('✨ All automation and logistics products (batch 2) have been stored in the database!')
  } catch (error) {
    console.error('❌ Error storing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOrCreateProducts() 