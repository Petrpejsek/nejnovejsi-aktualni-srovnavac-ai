import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definice finálních produktů 
const finalProducts = [
  {
    externalUrl: "https://mobirise.com",
    data: {
      name: "Mobirise",
      description: "Mobirise is a free offline website builder software for Windows and Mac that allows users to create small/medium websites, landing pages, and online stores without coding.",
      price: 149,
      category: "Offline Website Builder",
      imageUrl: "https://mobirise.com/assets24/images/logo.png",
      tags: JSON.stringify(["offline website builder", "free software", "drag and drop", "no coding", "bootstrap"]),
      advantages: JSON.stringify([
        "Completely free core software",
        "Works offline without internet connection",
        "No monthly subscription fees",
        "Drag-and-drop interface",
        "Bootstrap 5 based responsive sites",
        "One-time payment for extensions",
        "No technical skills required",
        "Fast loading websites",
        "Modern design templates"
      ]),
      disadvantages: JSON.stringify([
        "Premium extensions cost extra",
        "Limited built-in templates in free version",
        "Requires separate web hosting solution",
        "Less suitable for large websites"
      ]),
      detailInfo: "Mobirise differs from most website builders by being an offline desktop application rather than a web service. It uses Bootstrap framework to create responsive mobile-friendly websites and doesn't require monthly payments. Users download the software, build their site offline, then publish to their own hosting.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free Software", "price": 0, "features": ["Core software", "Basic blocks", "Limited templates", "No subscription"]},
          {"name": "Extensions", "price": 49, "features": ["Individual extensions", "One-time purchase", "Additional functionality"]},
          {"name": "Premium Templates", "price": 49, "features": ["Premium design templates", "One-time purchase"]},
          {"name": "All-in-One Kit", "price": 149, "features": ["All extensions", "All templates", "Code editor", "Lifetime access"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=K34uTppFUhI"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.divi.ai",
    data: {
      name: "Divi AI",
      description: "Divi AI is an artificial intelligence assistant built into the Divi WordPress theme and page builder that helps users design websites faster with AI-powered content generation and layout suggestions.",
      price: 89,
      category: "WordPress AI Builder",
      imageUrl: "https://www.elegantthemes.com/images/divi/divi-ai-feature.jpg",
      tags: JSON.stringify(["WordPress", "Divi Theme", "AI builder", "page builder", "content generation"]),
      advantages: JSON.stringify([
        "Built directly into Divi Theme",
        "AI-powered content generation",
        "Smart layout suggestions",
        "Time-saving design features",
        "No additional subscription needed",
        "Works with existing Divi sites",
        "Voice commands for editing",
        "Contextual design recommendations",
        "Seamless WordPress integration"
      ]),
      disadvantages: JSON.stringify([
        "Requires Divi Theme purchase",
        "Limited to WordPress platform",
        "May require refinement of AI suggestions",
        "Internet connection required for AI features"
      ]),
      detailInfo: "Divi AI enhances the popular Divi WordPress theme with artificial intelligence capabilities. It allows users to generate content, create layouts, and design websites using natural language commands and AI assistance, significantly speeding up the web development workflow for WordPress sites.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 89,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Yearly Access", "price": 89, "features": ["Divi Theme", "Divi AI", "Unlimited websites", "1 year of updates and support"]},
          {"name": "Lifetime Access", "price": 249, "features": ["Divi Theme", "Divi AI", "Unlimited websites", "Lifetime updates and support"]},
          {"name": "Lifetime Access (Agency)", "price": 349, "features": ["All Elegant Themes products", "Divi AI", "Unlimited websites", "Lifetime updates and support"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=T-Pum2TraiQ"]),
      hasTrial: false
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám finální produkty do databáze...");
  
  for (const product of finalProducts) {
    try {
      // Najdi produkt podle externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Aktualizuji existující produkt: ${existingProduct.name}`);
        
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
        
        console.log(`✅ Aktualizován: ${product.data.name}`);
      } else {
        console.log(`Vytvářím nový produkt: ${product.data.name}`);
        
        // Vytvoř nový produkt
        const newProduct = await prisma.product.create({
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Vytvořen: ${product.data.name} s ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`Chyba při zpracování produktu ${product.externalUrl}:`, error);
    }
  }
  
  console.log("Všechny produkty byly úspěšně uloženy!");
}

// Spusť aktualizaci
updateOrCreateProducts()
  .catch((e) => {
    console.error("Chyba při procesu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 