import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definice nových produktů s více výhodami než nevýhodami
const newProducts = [
  {
    externalUrl: "https://www.bookipi.com",
    data: {
      name: "Bookipi",
      description: "Bookipi is a free invoicing and accounting software designed for small businesses and entrepreneurs to manage finances, create professional invoices, track expenses, and generate financial reports.",
      price: 19.99,
      category: "Accounting Software",
      imageUrl: "https://www.bookipi.com/wp-content/uploads/2023/01/bookipi-og-image.jpg",
      tags: JSON.stringify(["invoicing", "accounting", "small business", "expense tracking", "financial reports"]),
      advantages: JSON.stringify([
        "Free invoicing software with unlimited invoices",
        "User-friendly mobile and desktop interfaces",
        "Automatic payment reminders",
        "Multi-currency support",
        "Cloud-based with real-time syncing",
        "Professional invoice templates",
        "Expense tracking with receipt scanning",
        "Client database management",
        "Financial reporting capabilities"
      ]),
      disadvantages: JSON.stringify([
        "Limited customer support in free plan",
        "Advanced accounting features only in paid plans",
        "Fewer integrations than established accounting platforms",
        "Limited customization of invoice templates in free version"
      ]),
      detailInfo: "Bookipi provides small businesses with accessible financial management tools through both mobile and desktop applications. It focuses on easy invoice creation, expense tracking, and basic financial reporting with a free entry-level plan and premium options for advanced features like recurring invoices and unlimited clients.",
      pricingInfo: JSON.stringify({
        monthly: 19.99,
        yearly: 199.99,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Unlimited invoices", "5 clients", "Basic reporting", "Mobile app access"]},
          {"name": "Pro", "price": 19.99, "features": ["Unlimited clients", "Recurring invoices", "Priority support", "Advanced reporting"]},
          {"name": "Business", "price": 39.99, "features": ["Multiple users", "Custom branding", "API access", "Automated workflows"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=QzWMRG1S8-U"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.chatgpt-website-builder.com",
    data: {
      name: "ChatGPT Website Builder",
      description: "ChatGPT Website Builder is an AI-powered platform that allows users to create custom websites by conversing with an AI assistant, requiring no coding or design skills.",
      price: 29,
      category: "AI Website Builder",
      imageUrl: "https://www.chatgpt-website-builder.com/images/og-image.jpg",
      tags: JSON.stringify(["AI website builder", "no-code", "conversational UI", "GPT-powered", "custom websites"]),
      advantages: JSON.stringify([
        "Build websites through natural language conversation",
        "No coding or design skills required",
        "AI-generated content suggestions",
        "Fast website creation process",
        "SEO optimization assistance",
        "Real-time preview of changes",
        "Template customization through conversation",
        "Intelligent layout recommendations",
        "Multilingual website support"
      ]),
      disadvantages: JSON.stringify([
        "Limited design customization compared to traditional builders",
        "Newer platform with fewer templates than established competitors",
        "May require edits to AI-generated content",
        "Subscription required for advanced features"
      ]),
      detailInfo: "ChatGPT Website Builder leverages OpenAI's language models to create websites through conversation. Users describe their website needs, and the AI assistant guides them through creation, suggesting content, designs, and features. The platform focuses on making website creation accessible to complete beginners through natural language interaction.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["1 website", "Basic AI assistance", "Platform branding", "Limited templates"]},
          {"name": "Basic", "price": 29, "features": ["3 websites", "Advanced AI assistance", "No platform branding", "All templates"]},
          {"name": "Pro", "price": 59, "features": ["10 websites", "Priority AI assistance", "Custom domain", "E-commerce features"]},
          {"name": "Business", "price": 99, "features": ["Unlimited websites", "Dedicated AI assistant", "White labeling", "API access"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example123"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.microsoft.com/en-us/power-pages",
    data: {
      name: "Microsoft Power Pages",
      description: "Microsoft Power Pages is a low-code website and portal builder that allows organizations to create secure, modern external-facing business websites with customized user experiences.",
      price: 20,
      category: "Low-Code Website Builder",
      imageUrl: "https://learn.microsoft.com/en-us/power-pages/media/overview/power-pages-overview-desktop.png",
      tags: JSON.stringify(["low-code", "business websites", "portals", "enterprise", "Microsoft"]),
      advantages: JSON.stringify([
        "Integration with Microsoft 365 ecosystem",
        "Enterprise-grade security features",
        "Low-code page creation and customization",
        "Built-in templates for common business scenarios",
        "Seamless data connectivity with Dataverse",
        "Advanced user authentication and authorization",
        "Multilingual support out of the box",
        "Compliance with industry standards and regulations",
        "Easy integration with Power Automate for workflows",
        "Scalable enterprise architecture"
      ]),
      disadvantages: JSON.stringify([
        "Higher pricing compared to consumer website builders",
        "Steeper learning curve for non-technical users",
        "Requires Microsoft ecosystem knowledge for full benefit",
        "Limited design flexibility compared to professional development"
      ]),
      detailInfo: "Microsoft Power Pages (formerly Power Apps portals) provides a secure, enterprise-grade platform for creating external-facing websites connected to business data. It features a visual design studio, templates for common scenarios, and professional developer extensibility. The platform is ideal for customer self-service portals, partner portals, and community websites that need integration with Microsoft's business applications.",
      pricingInfo: JSON.stringify({
        monthly: 20,
        yearly: 240,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Per App", "price": 20, "features": ["Per user/month", "5 portals per environment", "1GB Dataverse database", "Basic features"]},
          {"name": "Per User", "price": 40, "features": ["Per user/month", "Unlimited portals", "250MB Dataverse database per user", "All features"]},
          {"name": "Pay-as-you-go", "price": 1000, "features": ["Per tenant/month", "Based on authenticated users", "1GB Dataverse database", "Enterprise features"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=ybMXWZWTziA"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.spectra.one",
    data: {
      name: "Spectra One",
      description: "Spectra One is a design system platform that helps teams create, manage, and scale consistent user interfaces across products and platforms through component libraries, documentation, and collaboration tools.",
      price: 12,
      category: "Design System Platform",
      imageUrl: "https://spectra.one/images/og-image.png",
      tags: JSON.stringify(["design system", "UI components", "developer tools", "collaboration", "documentation"]),
      advantages: JSON.stringify([
        "Centralized component management",
        "Version control for design components",
        "Cross-platform compatibility",
        "Developer and designer collaboration features",
        "Automated documentation generation",
        "Visual regression testing built-in",
        "Component analytics and usage metrics",
        "Design token management",
        "Accessibility compliance tools",
        "Integration with popular design tools"
      ]),
      disadvantages: JSON.stringify([
        "Monthly subscription cost adds up for small teams",
        "Initial setup requires investment of time",
        "Learning curve for team adoption",
        "Limited integrations with some design tools"
      ]),
      detailInfo: "Spectra One provides organizations with tools to maintain consistent design systems at scale. It focuses on bridging the gap between design and development through shared component libraries, automated documentation, and collaboration features. The platform aims to reduce inconsistencies in user interfaces and streamline the handoff between designers and developers.",
      pricingInfo: JSON.stringify({
        monthly: 12,
        yearly: 120,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Up to 3 team members", "Basic component library", "Public documentation", "Limited storage"]},
          {"name": "Pro", "price": 12, "features": ["Per user/month", "Unlimited components", "Private documentation", "Version history"]},
          {"name": "Team", "price": 29, "features": ["Per user/month", "Advanced permissions", "Component analytics", "API access"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Dedicated support", "Custom integrations", "On-premises options"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example456"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.code.design",
    data: {
      name: "Code.Design",
      description: "Code.Design is a collaborative platform that bridges the gap between designers and developers, providing tools for design system management, code generation from designs, and real-time collaboration.",
      price: 24,
      category: "Design-to-Code Platform",
      imageUrl: "https://www.code.design/images/code-design-og.png",
      tags: JSON.stringify(["design-to-code", "collaboration", "design systems", "code generation", "developer tools"]),
      advantages: JSON.stringify([
        "Automatic code generation from design files",
        "Real-time collaboration between designers and developers",
        "Cross-platform component libraries",
        "Design system management tools",
        "Version control for design assets",
        "Instant code preview from designs",
        "Built-in accessibility checks",
        "Pre-built component marketplace",
        "Seamless integration with design tools",
        "Theme customization and management"
      ]),
      disadvantages: JSON.stringify([
        "Subscription pricing may be costly for small teams",
        "Generated code may require refinement by developers",
        "Limited support for some design tools",
        "Learning curve for effective implementation"
      ]),
      detailInfo: "Code.Design focuses on streamlining the workflow between designers and developers by transforming design files into production-ready code. The platform supports design system management, component libraries, and collaboration tools that help teams maintain consistency across products while reducing development time.",
      pricingInfo: JSON.stringify({
        monthly: 24,
        yearly: 240,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["3 projects", "Basic code generation", "Limited team members", "Community support"]},
          {"name": "Pro", "price": 24, "features": ["Per user/month", "Unlimited projects", "Advanced code generation", "Team collaboration"]},
          {"name": "Business", "price": 49, "features": ["Per user/month", "Custom code templates", "API access", "Priority support"]},
          {"name": "Enterprise", "price": 0, "features": ["Custom pricing", "Dedicated support", "On-premises deployment", "Custom integrations"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example789"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Starting product updates or creation (batch 3)...");
  
  for (const product of newProducts) {
    try {
      // Najdi produkt podle externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Updating existing product: ${existingProduct.name}`);
        
        // Aktualizuj produkt s novými daty
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
        
        // Vytvoř nový produkt
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
  
  console.log("All updates/creations completed!");
}

// Spusť aktualizaci
updateOrCreateProducts()
  .catch((e) => {
    console.error("Error during process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 