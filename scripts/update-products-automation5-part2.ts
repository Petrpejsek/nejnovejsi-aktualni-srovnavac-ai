import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will add more automation and workflow AI tools to the database (part 2)
async function updateOrCreateProducts() {
  console.log('Saving automation and workflow AI tools (batch 5 - part 2) to database...')

  // Array of automation and workflow products to add or update
  const automationProducts = [
    {
      externalUrl: "https://www.nintex.com",
      data: {
        name: "Nintex",
        description: "Comprehensive process automation platform with AI capabilities that combines workflow, document automation, and process intelligence for enterprise transformation.",
        price: 40000,
        category: "automation",
        imageUrl: "https://www.nintex.com/wp-content/themes/portent_nintex_2021/img/nintex-logo.svg",
        tags: "process automation, document generation, workflow management, process mapping, enterprise automation",
        advantages: "End-to-end process platform, Advanced document automation, Process mapping and discovery, No-code/low-code interface, Robust Microsoft ecosystem integration",
        disadvantages: "Enterprise pricing structure, Complex implementation for full platform, Steeper learning curve for advanced capabilities, Best ROI for larger organizations, Integration depth varies by connector",
        detailInfo: "Nintex is a comprehensive process automation platform that combines workflow automation, document generation, process mapping, and analytics into an integrated solution for digital transformation. The platform enables organizations to discover, manage, automate, and optimize their business processes without extensive technical expertise, accelerating time-to-value for automation initiatives. At the core of Nintex is its workflow automation engine, which provides a visual, drag-and-drop interface for designing and implementing automated processes across departments, functions, and systems. The platform's workflow capabilities span from simple approval processes to complex, multi-stage workflows with conditional logic, parallel processing, and exception handling. Nintex offers robust document automation through its DocGen technology, which enables the creation, automated population, and routing of documents including contracts, forms, and correspondence, significantly reducing manual document handling. A key differentiator is Nintex Promapp, the platform's process mapping and management module, which allows organizations to document, standardize, and communicate business processes in an intuitive, visual format accessible to all employees. The platform includes Nintex Workflow Cloud, a cloud-native workflow automation solution that connects to a wide range of applications and services, as well as versions optimized for Microsoft environments (SharePoint, Office 365) and Salesforce. Nintex RPA (Robotic Process Automation) extends automation capabilities to legacy systems and applications without APIs, capturing repetitive tasks performed by users and converting them into automated workflows. The platform's process intelligence capabilities provide analytics and insights into process performance, bottlenecks, and improvement opportunities through process mining, task mining, and dashboard visualizations. Nintex serves organizations across industries including financial services, healthcare, government, manufacturing, and legal services, with particular strength in regulated environments with complex document requirements and approval processes.",
        pricingInfo: "Nintex offers modular pricing based on the specific capabilities required, deployment model, and organizational scale. Cloud subscriptions for core workflow automation typically start at $25,000-$50,000 annually for departmental implementations and scale to $100,000-$250,000+ for enterprise-wide deployments with comprehensive capabilities. On-premises and hybrid deployment options are available at similar or higher price points depending on server requirements and user count. The platform's pricing structure is component-based, allowing organizations to select and pay for specific modules including Nintex Workflow, Nintex Forms, Nintex DocGen, Nintex Promapp, Nintex RPA, and Nintex Analytics, with discounts available for bundled solutions. User-based licensing models are available with prices ranging from approximately $10-$50 per user per month depending on the modules selected and volume of users, with named user and concurrent user options. Implementation services, which include solution design, configuration, training, and change management, typically range from $20,000-$150,000+ depending on project scope and complexity. Nintex offers industry-specific solution packages for financial services, healthcare, government, and legal services that include tailored workflows, process templates, and specialized consulting, with pricing based on industry and organizational requirements. The company provides proof-of-concept engagements for qualified prospects, allowing organizations to validate the platform's capabilities with their specific process requirements before full implementation. Volume discounts and multi-year agreements are available for larger deployments, and educational institutions and non-profit organizations may qualify for special pricing programs.",
        videoUrls: "https://www.youtube.com/watch?v=6I4kgwnEjsE",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.zapier.com",
      data: {
        name: "Zapier",
        description: "Cloud-based automation platform with AI capabilities that connects apps and automates workflows without coding, enabling seamless data transfer between services.",
        price: 599,
        category: "automation",
        imageUrl: "https://cdn.zapier.com/zapier/images/logos/zapier-logo.svg",
        tags: "app integration, workflow automation, API connection, no-code automation, task automation",
        advantages: "Massive app integration library (5,000+), No-code easy setup, Flexible multi-step Zaps, Filters and conditional logic, Reliable execution and monitoring",
        disadvantages: "Limited complex workflow capabilities, Usage limits on lower plans, Slight execution delays in basic plans, Custom coding limited to paid plans, Complex data transformations challenging",
        detailInfo: "Zapier is a web-based automation platform that enables users to connect different applications and automate workflows without requiring programming knowledge. The service acts as a bridge between thousands of apps and services, allowing information to flow automatically between them based on triggers and actions defined by users. At the core of Zapier are 'Zaps'—automated workflows that consist of a trigger (an event in one app) and one or more actions (tasks performed in other apps). When the specified trigger event occurs, Zapier automatically executes the defined actions, creating end-to-end automation across previously disconnected systems. The platform offers integration with over 5,000 applications spanning categories including CRM, marketing, e-commerce, project management, communication, finance, and productivity tools, making it one of the most comprehensive integration platforms available. Zapier's user interface is designed for accessibility, with a step-by-step Zap editor that guides users through the process of selecting applications, defining triggers and actions, and configuring data mappings between systems. The platform includes powerful features for advanced users, including multi-step Zaps that perform sequences of actions across multiple apps, filters that add conditional logic to workflows, formatters that transform data between steps, and paths that create branching workflows based on conditions. Zapier offers robust testing tools that allow users to validate their automations before activation, ensuring that data flows correctly between systems and reducing the risk of errors in production workflows. The service includes comprehensive monitoring capabilities that track the execution history of Zaps, alert users to errors or issues, and provide usage statistics across an organization's automation portfolio. Zapier serves users ranging from individuals automating personal productivity workflows to enterprises implementing department-wide or organization-wide automation initiatives, with particular appeal to small and mid-sized businesses without dedicated development resources for custom integrations.",
        pricingInfo: "Zapier offers tiered pricing based on automation complexity, frequency, and advanced features. The Free plan supports up to 5 single-step Zaps with a 15-minute update frequency and 100 tasks per month, making it suitable for basic personal automation needs. The Starter plan at $19.99 per month (billed annually at $239.88) provides 20 multi-step Zaps, 750 tasks per month, premium apps, filters, and formatter tools with a 5-minute update frequency. The Professional plan costs $49 per month (billed annually at $588) and includes unlimited Zaps, 2,000 tasks per month, advanced features like Paths for conditional workflows, 2-minute update frequency, and Zapier's AI assistant for building Zaps. The Team plan at $69 per month (billed annually at $828) supports 3+ users with shared folders, collaboration features, and 3,000 tasks per month. The Company plan at $149 per month (billed annually at $1,788) adds advanced admin controls, SAML SSO, user provisioning, and 9,000 tasks per month. Additional tasks can be purchased for all paid plans, with pricing ranging from approximately $10-$15 per 1,000 tasks depending on volume. Monthly billing options are available at approximately 20% higher rates than annual commitments. For organizations with specific requirements, Zapier offers custom enterprise plans with dedicated support, premium features, and volume discounts. Non-profit organizations may qualify for discounts through application to Zapier's non-profit program.",
        videoUrls: "https://www.youtube.com/watch?v=op5JLTE5kYU",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.make.com",
      data: {
        name: "Make",
        description: "Visual automation platform with AI capabilities that connects apps and automates workflows with powerful data transformation and complex scenario creation.",
        price: 540,
        category: "automation",
        imageUrl: "https://www.make.com/en/images/make-social.jpg",
        tags: "visual automation, app integration, workflow design, data processing, API connection",
        advantages: "Powerful visual scenario builder, Real-time execution and instant operation, Advanced data mapping and transformation, Flexible error handling, Affordable pricing structure",
        disadvantages: "Steeper learning curve than simpler tools, Complex scenarios require technical understanding, Limited integrations compared to largest competitors, Usage based on operations not tasks, Documentation depth varies by module",
        detailInfo: "Make (formerly Integromat) is a powerful visual automation platform that enables users to design, build, and automate workflows between apps and services with a unique approach that emphasizes real-time execution and advanced data manipulation capabilities. The platform combines accessibility for beginners with sophisticated features for technical users, providing depth and flexibility for complex integration scenarios. At the core of Make is its distinctive visual scenario builder, which uses a circular, flowchart-like interface where users connect modules representing different applications and operations. This visual approach not only makes workflows more intuitive but also supports complex branching, iteration, and parallel processing that's difficult to achieve in more linear automation tools. The platform offers integrations with over 1,000 applications and services spanning categories including marketing, sales, development, finance, e-commerce, and productivity, with new connectors regularly added based on user demand and market trends. A key differentiator is Make's data transformation capabilities, which include advanced mapping tools, array operations, string manipulations, mathematical functions, and conversion utilities that enable sophisticated data processing between different systems. The platform supports real-time execution for workflows, with the ability to process data instantly rather than on fixed schedules, making it suitable for time-sensitive automation requirements where immediate response is critical. Make includes robust error handling features that allow users to define what happens when problems occur, with options for retries, alternate paths, error notifications, and custom error processing routines that improve workflow reliability. The service offers comprehensive monitoring and logging tools that provide detailed execution history, data throughput visualization, and performance metrics for troubleshooting and optimization. Make serves users ranging from individual professionals and small businesses to large enterprises, with particular appeal to users who need more power and flexibility than entry-level automation tools but don't want the complexity and cost of enterprise iPaaS solutions.",
        pricingInfo: "Make offers tiered pricing based on operation volume, active scenarios, and advanced features. Operations in Make represent individual actions performed within scenarios, such as retrieving records, sending data, or transforming information. The Free plan includes 1,000 operations per month, 2 active scenarios, and core features with execution limited to 15-minute intervals, suitable for basic automation needs or platform evaluation. The Core plan costs $9 per month (billed annually at $108) and provides 10,000 operations, 3 active scenarios, all standard apps, and 5-minute minimum interval execution. The Pro plan at $16 per month (billed annually at $192) increases capacity to 10,000 operations, 5 active scenarios, and adds features like scenario templates and on-demand execution. The Teams plan costs $29 per month (billed annually at $348) and supports 30,000 operations, 15 active scenarios, team collaboration features, and advanced security controls. The Enterprise plan at $45 per month (billed annually at $540) includes 60,000 operations, 30 active scenarios, and enterprise features including SAML SSO, audit logging, and dedicated support. All plans allow purchasing additional operations at rates ranging from $5-$10 per 10,000 operations depending on volume. Custom plans are available for organizations requiring high operation volumes, enterprise-grade security, or specialized support. Monthly billing options are available at approximately 20% higher rates than annual commitments. For specific industries, Make offers specialized pricing and features for educational institutions and non-profit organizations through its Impact program.",
        videoUrls: "https://www.youtube.com/watch?v=h-SbmdQjPnA",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.workato.com",
      data: {
        name: "Workato",
        description: "Enterprise-grade intelligent automation platform with AI capabilities that integrates applications, processes, and experiences across organizations.",
        price: 65000,
        category: "automation",
        imageUrl: "https://theme.zdassets.com/theme_assets/2233872/c28b0929e3a5e36ba93bae70cb006278d8e50be5.svg",
        tags: "enterprise integration, workflow automation, iPaaS, API management, business process automation",
        advantages: "Enterprise-grade security and compliance, AI-powered recipe building, Pre-built connectors and templates, Low-code recipe creation, Comprehensive monitoring and governance",
        disadvantages: "Enterprise pricing model, Implementation complexity for large deployments, Technical expertise beneficial for advanced scenarios, UI learning curve for new users, Limited self-service for smaller businesses",
        detailInfo: "Workato is an enterprise-grade intelligent automation platform that combines integration, process automation, and API management capabilities to connect applications and automate business processes across the organization. The platform is designed to support enterprise-scale automation requirements while remaining accessible to business users through its recipe-based automation approach. At the core of Workato is its recipe concept—reusable workflow configurations that define how data and processes flow between different systems. These recipes can be created using the platform's low-code builder, which provides a visual interface for connecting applications, defining triggers and actions, and implementing business logic. A key differentiator is Workato's AI-powered Autopilot feature, which uses machine learning to analyze thousands of successful automation patterns and recommend optimized workflow designs, accelerating development and incorporating best practices. The platform includes over 1,000 pre-built connectors to SaaS applications, databases, legacy systems, and technologies like blockchain and IoT, enabling comprehensive connectivity across modern and traditional IT landscapes. Workato offers enterprise-grade security and governance features, including role-based access controls, audit trails, encryption, compliance certifications (SOC 2, GDPR, HIPAA, etc.), and data loss prevention capabilities that satisfy stringent security requirements. The platform's Community Commons provides a library of thousands of pre-built recipes and connectors created by Workato and its user community, accelerating automation projects through reusable components for common integration patterns. Workato includes robust API management capabilities that allow organizations to create, publish, secure, and monitor APIs without coding, enabling API-led connectivity strategies alongside traditional integration approaches. The platform provides comprehensive monitoring, alerting, and logging features that give operations teams visibility into automation performance, error conditions, and throughput metrics across the enterprise automation portfolio. Workato serves mid-sized to large organizations across industries including technology, financial services, healthcare, manufacturing, and retail, with particular strength in enterprises pursuing broad digital transformation initiatives requiring integration across multiple systems and departments.",
        pricingInfo: "Workato offers enterprise pricing based on automation volume, connector complexity, and organizational scale. Annual subscriptions typically start at $65,000 for departmental implementations and range to $250,000+ for enterprise-wide deployments with comprehensive capabilities and high transaction volumes. The platform's pricing structure considers factors including the number and complexity of recipes (automated workflows), the types of connectors required (standard vs. premium), data volume, and execution frequency. Workato's Consumption-Based Flex model allows organizations to purchase blocks of recipe execution capacity and distribute them across different automations based on priority and value, providing flexibility compared to fixed per-recipe pricing. Implementation services, which include solution design, development assistance, training, and managed services, typically range from $35,000-$200,000+ depending on project scope and complexity. The company offers industry-specific solution packages for financial services, healthcare, manufacturing, retail, and technology sectors that include pre-built recipes, industry-specific connectors, and specialized consulting, with pricing based on industry and organizational requirements. For organizations requiring unique capabilities, Workato provides custom pricing packages that include dedicated support, custom development, premium services, and tailored commercial terms. Volume discounts and multi-year agreements are available for larger implementations, with some contracts structured to include success-based pricing tied to business outcomes or automation metrics. For qualified startups, Workato offers the Workato for Startups program with special pricing and benefits to make enterprise-grade automation accessible to growing companies.",
        videoUrls: "https://www.youtube.com/watch?v=PAC5yrQXEZ4",
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
    console.log('✅ Second part of automation and workflow products (batch 5) have been stored in the database!')
  } catch (error) {
    console.error('❌ Error storing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOrCreateProducts() 