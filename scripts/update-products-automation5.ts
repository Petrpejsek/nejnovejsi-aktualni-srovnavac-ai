import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will add more automation and workflow AI tools to the database
async function updateOrCreateProducts() {
  console.log('Saving automation and workflow AI tools (batch 5) to database...')

  // Array of automation and workflow products to add or update
  const automationProducts = [
    {
      externalUrl: "https://www.wrike.com",
      data: {
        name: "Wrike",
        description: "AI-enhanced collaborative work management platform that automates workflows, project tracking, and team coordination across organizations.",
        price: 588,
        category: "automation",
        imageUrl: "https://www.wrike.com/content/uploads/2022/05/wrike-logo.svg",
        tags: "project management, workflow automation, team collaboration, resource management, work management",
        advantages: "Comprehensive work management solution, Flexible workflow customization, Rich work visualization options, Enterprise-grade security, Deep integration ecosystem",
        disadvantages: "Steeper learning curve for advanced features, Higher price point than basic alternatives, Complex setup for large organizations, Enterprise features in higher tiers only, Mobile app less robust than web version",
        detailInfo: "Wrike is a versatile work management platform designed to help teams and organizations plan, manage, and execute work across all levels and departments. The platform provides a unified workspace where cross-functional teams can collaborate on projects, track progress, manage resources, and automate workflows, regardless of geographical distribution or organizational structure. At the core of Wrike is its hierarchical work breakdown structure, which allows organizations to organize work at multiple levels—from high-level initiatives and projects down to individual tasks and subtasks—creating clear visibility across different work scopes. The platform offers multiple work visualization options including interactive Gantt charts for timeline planning, Kanban boards for workflow management, table views for data-focused work tracking, and calendars for scheduling, accommodating different work styles and information needs. Wrike's workflow engine enables teams to create customized statuses, approval processes, and automated actions that standardize work execution, ensuring consistency while reducing manual administrative tasks. A key differentiator is Wrike's comprehensive resource management functionality, which provides capacity planning, workload balancing, and resource allocation tools that help managers optimize team utilization and prevent burnout. The platform includes robust reporting and analytics capabilities that deliver insights into project health, team performance, and work trends through customizable dashboards, automated reports, and real-time work graphs. Wrike offers extensive integration options with over 400 applications across project management, document management, communication, CRM, and development tools, creating a connected work ecosystem. Advanced features include custom request forms, blueprints for standardized project templates, proofing and approval workflows for creative assets, and time tracking for billing and productivity analysis. Wrike serves organizations across industries with particular strength in marketing, creative, professional services, project management, product development, and IT teams that manage complex, collaborative work requiring cross-functional coordination.",
        pricingInfo: "Wrike offers tiered pricing structured to accommodate different organizational needs and team sizes. The Team plan costs $9.80 per user per month (billed annually at $117.60 per user) and includes core features like task management, board view, file sharing, and basic integrations for small teams getting started with structured work management. The Business plan at $24.80 per user per month (billed annually at $297.60 per user) adds custom workflows, Gantt charts, advanced reporting, shared dashboards, and resource management capabilities, suitable for growing teams or departments. The Enterprise plan with custom pricing includes advanced security controls, user governance, advanced reporting, custom fields, and administrative features for large organizations with complex requirements. For organizations needing specialized functionality, Wrike offers targeted solutions including Wrike for Marketing and Creative Teams, Wrike for Professional Services, and Wrike for Project Management, each with industry-specific templates and workflows at premium pricing. Wrike provides a free tier supporting up to 5 users with limited functionality for small teams or evaluation purposes. Implementation services, which include configuration, training, and change management assistance, range from approximately $1,500 to $15,000+ depending on scope and complexity. Volume discounts are available for larger deployments, and educational institutions and non-profit organizations may qualify for special pricing.",
        videoUrls: "https://www.youtube.com/watch?v=4LdXZdkNA6g",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.trello.com",
      data: {
        name: "Trello",
        description: "Visual work management tool with AI capabilities that automates workflows using cards, lists, and boards to organize projects and collaboration.",
        price: 120,
        category: "automation",
        imageUrl: "https://d2k1ftgv7pobq7.cloudfront.net/meta/p/res/images/trello-header-logos/167dc7b9900a4b118c3a029f0a818b9c/trello-logo-blue.svg",
        tags: "kanban boards, task management, team collaboration, workflow automation, visual project management",
        advantages: "Intuitive, user-friendly interface, Quick setup and minimal learning curve, Powerful automation through Butler, Extensive integration ecosystem, Flexible for various use cases",
        disadvantages: "Limited reporting capabilities, Basic Gantt/timeline views, Scaling challenges for large projects, Limited resource management, Advanced features require premium plans",
        detailInfo: "Trello is a visual project management and collaboration tool built around the concept of Kanban boards, providing an intuitive interface for organizing work and tracking progress. The platform's straightforward approach makes it accessible to users regardless of technical background while offering powerful features for workflow optimization and team coordination. At the heart of Trello is its board-list-card hierarchy, where boards represent projects or workspaces, lists represent stages or categories, and cards represent individual tasks or items. This visual structure creates a clear picture of work status and progression, making it easy to track what's being done and what's coming next. Each Trello card can contain rich details including descriptions, checklists, due dates, attachments, custom fields, and comments, providing comprehensive task information within the card interface. A key feature is Butler, Trello's built-in automation engine that allows users to create rules, buttons, and scheduled commands that automate repetitive actions and workflows without coding knowledge. The platform offers extensive customization through labels, custom fields, and card covers, allowing teams to adapt Trello to their specific needs and visual preferences. Trello includes collaboration features such as card assignments, @mentions, commenting, and activity tracking that facilitate team communication and accountability directly within the context of work items. The platform integrates with over 200 applications through Power-Ups (Trello's integration system), connecting with tools across categories including development, communication, file storage, reporting, and time tracking. Advanced features in premium tiers include dashboard views for metrics visualization, timeline views for project scheduling, calendar views for time-based planning, and map views for location-based work. Trello serves users across industries and team types, from individual freelancers managing personal tasks to enterprise teams coordinating complex projects, with particular appeal to teams seeking visual clarity and process simplicity without sacrificing flexibility.",
        pricingInfo: "Trello offers several pricing tiers designed to accommodate different team sizes and functionality requirements. The Free plan supports unlimited personal boards, up to 10 boards per Workspace, basic automation (250 Butler commands per month), and unlimited storage with a 10MB per file attachment limit, making it suitable for individuals or small teams. The Standard plan costs $5 per user per month (billed annually at $60 per user) and adds unlimited boards, advanced checklists, custom fields, unlimited storage with 250MB per file limit, and more Butler automation capacity (1,000 commands per month). The Premium plan at $10 per user per month (billed annually at $120 per user) includes all Standard features plus additional views (Timeline, Dashboard, Calendar, Map), unlimited Butler commands, admin and security features, and priority support. The Enterprise plan starts at $17.50 per user per month (billed annually, minimum 50 users) and adds organization-wide permissions, enterprise-grade security, unlimited Workspaces, and dedicated support. Trello offers discounts for educational institutions and non-profit organizations, typically around 30-50% off standard pricing. Monthly billing options are available at approximately 20% higher rates than annual commitments. For organizations requiring assistance with implementation, Atlassian (Trello's parent company) offers professional services through certified solution partners, with pricing based on scope and complexity.",
        videoUrls: "https://www.youtube.com/watch?v=AyfupeWS0yY",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.kissflow.com",
      data: {
        name: "Kissflow",
        description: "No-code workflow and process automation platform with AI capabilities that streamlines operations, approvals, and data management for businesses.",
        price: 1200,
        category: "automation",
        imageUrl: "https://kissflow.com/wp-content/themes/kissflow-child/assets/images/logo.svg",
        tags: "no-code platform, business process management, workflow automation, digital forms, process optimization",
        advantages: "User-friendly no-code interface, Unified platform for processes and projects, Pre-built app templates, Case management capabilities, End-to-end workflow visibility",
        disadvantages: "Limited customization for complex scenarios, Basic reporting in lower tiers, Integration capabilities less robust than specialists, Mobile experience limitations, Learning curve for advanced configurations",
        detailInfo: "Kissflow is a comprehensive digital workplace platform that combines process automation, project management, and case management capabilities in a unified, no-code environment. The platform enables organizations to digitize and automate structured, semi-structured, and unstructured work without requiring technical expertise, democratizing automation across departments and functions. At the core of Kissflow is its Process module, which allows users to design, automate, and optimize business processes using a visual, drag-and-drop interface. Users can create digital forms with various field types, define sequential or parallel approval flows, implement conditional logic, and establish automated actions that execute at different process stages. The platform's Project management module provides tools for planning, executing, and tracking project-based work through Kanban boards, task lists, and team collaboration features, complementing the process-focused capabilities with support for more dynamic, collaborative work. Kissflow's Case management functionality enables teams to handle exception-driven scenarios that don't follow predefined paths, combining elements of process automation with the flexibility to adapt workflows based on the unique requirements of each case. A key differentiator is Kissflow's unified approach, which provides a single platform where organizations can manage different work styles—process-centric, project-based, and case-driven—creating a coherent digital workplace experience rather than disconnected tool silos. The platform includes a comprehensive analytics module that provides insights into process performance, bottlenecks, cycle times, and workload distribution through customizable dashboards and reports. Kissflow offers extensive customization options including custom forms, fields, workflows, permissions, and branding, allowing organizations to tailor the platform to their specific requirements without coding. The system provides robust collaboration features including commenting, @mentions, document sharing, and team discussions that facilitate communication within the context of processes and projects. Kissflow serves organizations across industries including healthcare, education, financial services, manufacturing, and professional services, with particular appeal to mid-sized businesses seeking comprehensive workflow capabilities without the complexity and cost of enterprise BPM solutions.",
        pricingInfo: "Kissflow offers tiered pricing based on functionality, user count, and implementation scope. The Basic plan costs $1,200 per month for up to 30 users (effectively $40 per user) and includes core process automation features, basic project management, standard reporting, and community support. The Corporate plan at $1,900 per month for up to 50 users adds advanced workflow capabilities, enhanced security controls, priority support, and additional integrations. The Enterprise plan with custom pricing provides unlimited processes, advanced analytics, dedicated support, and premium features including case management, advanced customization, and enterprise-grade security and compliance. All plans require annual commitments, with discounts available for multi-year contracts. Implementation services, which include configuration, training, and process design assistance, typically range from $5,000-$25,000 depending on scope and complexity. Kissflow offers specialized pricing for specific industries including education and non-profit organizations, with discounts typically ranging from 20-40% off standard rates. For organizations requiring a more tailored deployment, Kissflow offers custom packages based on specific needs, use cases, and scale, with pricing determined through consultation with the Kissflow sales team. Most customers engage with the platform through the cloud-based SaaS offering, but private cloud and on-premises deployment options are available for organizations with specific security or compliance requirements at premium pricing.",
        videoUrls: "https://www.youtube.com/watch?v=TJZYhjRUL3A",
        hasTrial: true
      }
    },
    {
      externalUrl: "https://www.processmaker.com",
      data: {
        name: "ProcessMaker",
        description: "Enterprise business process management platform with AI capabilities that automates complex workflows, approvals, and operations across organizations.",
        price: 25000,
        category: "automation",
        imageUrl: "https://www.processmaker.com/wp-content/uploads/2019/02/new-PM-logo-1.svg",
        tags: "business process management, enterprise workflow, low-code automation, digital transformation, process optimization",
        advantages: "Enterprise-grade process capabilities, Low-code visual process designer, Robust integration framework, Comprehensive security and governance, Industry-specific solutions",
        disadvantages: "Enterprise pricing model, Implementation complexity for large deployments, Technical expertise recommended, UI less intuitive than newer tools, Requires substantial configuration",
        detailInfo: "ProcessMaker is an enterprise-grade intelligent business process management platform designed to help organizations automate complex workflows and digitally transform their operations. The platform combines powerful process capabilities with a low-code development approach, allowing both business analysts and IT professionals to collaborate on process improvement and automation initiatives. At the core of ProcessMaker is its intuitive process modeler, which provides a visual design environment based on BPMN 2.0 (Business Process Model and Notation) standards, enabling users to create sophisticated process flows through drag-and-drop functionality without extensive coding. The platform includes a comprehensive forms builder that allows the creation of dynamic, responsive interfaces for data collection and user interaction, with support for complex validation rules, conditional fields, and rich media elements. ProcessMaker's robust rules engine enables the definition of complex business logic, calculations, and decision criteria that govern process behavior, supporting both simple conditional statements and sophisticated algorithmic decision-making. A key differentiator is ProcessMaker's integration capabilities, which include pre-built connectors, a REST API framework, database integrations, and custom scripting options that allow processes to exchange data with existing enterprise systems and external services. The platform includes advanced features for process participants, including personalized task lists, mobile accessibility, notification systems, and collaboration tools that streamline workflow execution and enhance user adoption. ProcessMaker offers comprehensive monitoring and analytics through real-time dashboards, customizable reports, and process mining capabilities that provide insights into operational performance, bottlenecks, and improvement opportunities. The system provides enterprise-grade security and governance features including role-based access controls, detailed audit trails, electronic signatures, and compliance management tools that support regulatory requirements across industries. ProcessMaker serves mid-sized to large organizations across sectors including financial services, healthcare, higher education, telecommunications, and manufacturing, with particular strength in highly regulated industries with complex operational requirements and compliance needs.",
        pricingInfo: "ProcessMaker offers enterprise pricing based on deployment model, organization size, and implementation scope. Annual cloud subscriptions typically start at $25,000 for departmental implementations and range up to $250,000+ for enterprise-wide deployments with comprehensive features and high process volumes. On-premises licenses generally involve higher initial investment starting at $50,000+ with annual maintenance fees of approximately 20% of the license cost. The platform is available in several editions including Standard, Enterprise, and Corporate, each offering progressively more advanced features in areas like process complexity, integration capabilities, security controls, and analytical tools. Implementation services, which include process design, development, integration, training, and deployment support, typically range from $25,000-$150,000+ depending on project scope and complexity. ProcessMaker offers industry-specific solution packages for financial services, higher education, telecommunications, and manufacturing that include pre-built process templates, custom development, and specialized training, with pricing based on industry and organizational requirements. The company provides proof-of-concept engagements for qualified prospects, allowing organizations to validate the platform's capabilities with their specific use cases before full implementation. Volume discounts and multi-year agreements are available for larger deployments, with some contracts structured to include success-based pricing components tied to specific business outcomes or process improvements. For organizations with unique requirements, ProcessMaker offers fully custom licensing and implementation packages designed around specific use cases and desired outcomes.",
        videoUrls: "https://www.youtube.com/watch?v=aDK8HV_dI9I",
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
    console.log('✅ First part of automation and workflow products (batch 5) have been stored in the database!')
  } catch (error) {
    console.error('❌ Error storing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOrCreateProducts() 