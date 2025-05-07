import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definice nových produktů s vylepšenými informacemi
const newProducts = [
  {
    externalUrl: "https://www.dorik.com",
    data: {
      name: "Dorik",
      description: "Dorik is a modern website builder that allows users to create responsive websites with a drag-and-drop interface, AI-powered features, and professional design elements.",
      price: 29,
      category: "Website Builder",
      imageUrl: "https://cdn.dorik.com/5e373b6c43a72a001f56dbf6/61a1f4035bfd7b0011fb92f9/images/8_3vw6iujc.png",
      tags: JSON.stringify(["website builder", "drag-and-drop", "responsive design", "AI-powered", "no-code"]),
      advantages: JSON.stringify([
        "User-friendly drag-and-drop interface",
        "AI-powered website generation",
        "Responsive design for all devices",
        "Extensive element library",
        "Affordable pricing plans"
      ]),
      disadvantages: JSON.stringify([
        "Limited template selection compared to established competitors",
        "Fewer third-party integrations available",
        "E-commerce functionality not as robust as dedicated platforms",
        "No offline editing capabilities",
        "Limited SEO customization options in lower plans",
        "No free domain with plans",
        "Steeper learning curve for complex layouts"
      ]),
      detailInfo: "Dorik offers a modern approach to website building with a focus on responsive design and AI assistance. It provides a clean drag-and-drop interface for creating websites without coding, including sections for blogs, portfolios, and basic e-commerce functionality.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["1 website", "Dorik subdomain", "Limited elements", "500MB bandwidth"]},
          {name: "Basic", price: 29, features: ["3 websites", "Custom domain", "All elements", "10GB bandwidth", "No Dorik branding"]},
          {name: "Pro", price: 49, features: ["10 websites", "Team collaboration", "Priority support", "White labeling", "50GB bandwidth"]},
          {name: "Business", price: 99, features: ["50 websites", "Advanced analytics", "API access", "Unlimited bandwidth", "Custom code insertion"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=GDXHuZF_-tY"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.ucraft.com",
    data: {
      name: "Ucraft",
      description: "Ucraft is a website and online store builder that offers no-code solutions for creating professional websites, landing pages, and e-commerce stores with customizable templates and drag-and-drop functionality.",
      price: 10,
      category: "Website Builder",
      imageUrl: "https://cdn.ucraft.com/fs/user_files/15696/media/images/Ucraft-next-home-page.png",
      tags: JSON.stringify(["website builder", "e-commerce", "landing pages", "no-code", "drag-and-drop"]),
      advantages: JSON.stringify([
        "Free website option with unlimited pages",
        "Modern, professionally designed templates",
        "Built-in logo maker tool",
        "Multilingual website support",
        "Reasonable pricing structure"
      ]),
      disadvantages: JSON.stringify([
        "Ucraft branding on free plan websites",
        "Limited e-commerce features compared to dedicated platforms",
        "Fewer app integrations than major competitors",
        "Steeper learning curve for beginners",
        "Some advanced features only available in higher plans",
        "Limited customization options for checkout process",
        "Occasional performance issues with larger sites",
        "Customer support can be slow to respond"
      ]),
      detailInfo: "Ucraft offers website building tools for various business needs, from simple landing pages to full e-commerce stores. The platform includes a free logo maker, SEO tools, and multilingual capabilities. Its drag-and-drop editor allows users to create websites without coding knowledge while maintaining professional design standards.",
      pricingInfo: JSON.stringify({
        monthly: 10,
        yearly: 96,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["Unlimited pages", "Ucraft subdomain", "Ucraft branding", "Logo maker"]},
          {name: "Pro Website", price: 10, features: ["Custom domain", "No Ucraft branding", "SEO tools", "Google Analytics"]},
          {name: "Pro Shop", price: 21, features: ["E-commerce functionality", "0% transaction fees", "Unlimited products", "Abandoned cart recovery"]},
          {name: "BigCommerce", price: 39, features: ["Advanced e-commerce", "Multi-currency", "Product reviews", "Discount system"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=5h1YMVxdmDQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.webnode.com",
    data: {
      name: "Webnode",
      description: "Webnode is a user-friendly website builder that allows anyone to create responsive websites without coding, offering AI-powered website creation, multilingual support, and a variety of templates for personal and business use.",
      price: 3.90,
      category: "Website Builder",
      imageUrl: "https://d1rv23qj5kas56.cloudfront.net/img/sharing/webnode-sharing-2-en.png",
      tags: JSON.stringify(["website builder", "easy to use", "responsive design", "AI website builder", "multilingual"]),
      advantages: JSON.stringify([
        "Very easy to use for beginners",
        "AI-powered website creation",
        "Multilingual website support",
        "Responsive design for all devices",
        "Affordable starting price point"
      ]),
      disadvantages: JSON.stringify([
        "Limited design customization options",
        "Basic e-commerce functionality compared to dedicated platforms",
        "Free plan displays Webnode branding",
        "Limited storage space on lower plans",
        "Fewer templates than major competitors",
        "No app marketplace for extensions",
        "Limited SEO control options",
        "Basic marketing tools"
      ]),
      detailInfo: "Webnode specializes in making website creation accessible to complete beginners. Its standout feature is multilingual support, allowing users to create websites in multiple languages easily. The platform includes AI-powered website generation, responsive templates, and basic e-commerce functionality.",
      pricingInfo: JSON.stringify({
        monthly: 3.90,
        yearly: 39.60,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["Webnode subdomain", "100MB storage", "Webnode ads", "Limited bandwidth"]},
          {name: "Limited", price: 3.90, features: ["Connect domain", "500MB storage", "Remove Webnode ads", "Limited bandwidth"]},
          {name: "Mini", price: 7.50, features: ["Free domain", "1GB storage", "E-mail account", "Password protection"]},
          {name: "Standard", price: 12.90, features: ["Free domain", "2GB storage", "E-commerce (20 products)", "Backup & restore"]},
          {name: "Profi", price: 22.90, features: ["Free domain", "5GB storage", "E-commerce (unlimited products)", "Membership area"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://d1rv23qj5kas56.cloudfront.net/img/portal-2015/lp/video-hp-3-1-en.mp4"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.appypie.com",
    data: {
      name: "Appy Pie",
      description: "Appy Pie is an all-in-one no-code development platform that allows users to create mobile apps, websites, chatbots, automation workflows, and design assets without coding skills.",
      price: 16,
      category: "No-Code Development Platform",
      imageUrl: "https://images.appypie.com/wp-content/uploads/2023/07/12141920/appy-pie-no-code-ai-platform.png",
      tags: JSON.stringify(["no-code", "app builder", "website builder", "automation", "AI-powered"]),
      advantages: JSON.stringify([
        "All-in-one platform for apps, websites, and automation",
        "No coding skills required",
        "PWA (Progressive Web App) support",
        "AI-powered features",
        "Affordable compared to custom development"
      ]),
      disadvantages: JSON.stringify([
        "Limited customization compared to coded solutions",
        "Appy Pie branding on free and lower-tier plans",
        "Performance can be slower than native apps",
        "Limited design flexibility compared to dedicated platforms",
        "Advanced features locked behind higher plans",
        "Less intuitive than specialized website builders",
        "App publishing can be complicated for beginners",
        "Customer support response times can be slow"
      ]),
      detailInfo: "Appy Pie offers a comprehensive suite of no-code tools including app builder, website builder, workflow automation, chatbot creator, and design tools. The platform uses AI to simplify creation processes and allows users to build and publish cross-platform mobile apps, websites, and automated workflows without technical knowledge.",
      pricingInfo: JSON.stringify({
        monthly: 16,
        yearly: 159,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["Basic features", "Appy Pie branding", "Limited storage", "Community support"]},
          {name: "Basic", price: 16, features: ["Remove Appy Pie branding", "Push notifications", "Analytics", "Email support"]},
          {name: "Professional", price: 36, features: ["App submission", "Priority support", "Code customization", "Edit after publish"]},
          {name: "Platinum", price: 60, features: ["White label", "Dedicated account manager", "Premium features", "Priority publishing"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=NJ3B9P-0U6A"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.getresponse.com",
    data: {
      name: "GetResponse",
      description: "GetResponse is an all-in-one marketing platform that combines email marketing, automation, landing pages, webinars, and e-commerce tools to help businesses grow their online presence and revenue.",
      price: 19,
      category: "Email Marketing Platform",
      imageUrl: "https://us-wn-g.gr-cdn.com/_next/static/media/share.5be0c165.jpg",
      tags: JSON.stringify(["email marketing", "marketing automation", "landing pages", "webinars", "e-commerce"]),
      advantages: JSON.stringify([
        "Comprehensive all-in-one marketing solution",
        "User-friendly interface with drag-and-drop editors",
        "Advanced automation workflows",
        "Integrated webinar functionality",
        "Strong email deliverability rates"
      ]),
      disadvantages: JSON.stringify([
        "Higher price point than some competitors",
        "Limited free plan compared to alternatives",
        "Landing page templates less varied than dedicated builders",
        "E-commerce features not as robust as specialized platforms",
        "Learning curve for advanced automation features",
        "Limited design flexibility in email templates",
        "CRM functionality is basic compared to dedicated CRMs",
        "Some advanced features only available in higher tiers"
      ]),
      detailInfo: "GetResponse provides a complete marketing platform focused on email marketing with expanded functionality for landing pages, webinars, and e-commerce. The platform includes conversion funnels, website builder capabilities, paid ads management, and automated workflows to help businesses acquire and nurture leads through to conversion.",
      pricingInfo: JSON.stringify({
        monthly: 19,
        yearly: 180,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["500 contacts", "Basic email marketing", "1 landing page", "Limited functionality"]},
          {name: "Email Marketing", price: 19, features: ["Up to 1,000 contacts", "Email marketing", "Autoresponders", "Basic landing pages"]},
          {name: "Marketing Automation", price: 59, features: ["Up to 1,000 contacts", "Advanced automation", "Webinars (100 attendees)", "Sales funnels"]},
          {name: "E-commerce Marketing", price: 119, features: ["Up to 1,000 contacts", "E-commerce segmentation", "Webinars (300 attendees)", "Web push notifications"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=xRbUT9D-IKs"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Starting product updates or creation...");
  
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