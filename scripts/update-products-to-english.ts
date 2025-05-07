import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function translateProductsToEnglish() {
  console.log("Converting accounting products from Czech to English...");
  
  // Get all products with Czech content
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: "účet" } },
        { description: { contains: "finan" } },
        { tags: { contains: "účet" } },
        { advantages: { contains: "účet" } },
        { disadvantages: { contains: "funkce" } },
        { detailInfo: { contains: "účet" } },
        { pricingInfo: { contains: "Měsíčně" } }
      ]
    }
  });
  
  console.log(`Found ${products.length} products with Czech content to translate`);
  
  for (const product of products) {
    try {
      console.log(`Translating product: ${product.name}`);
      
      // Translate tags
      let tags = [];
      try {
        tags = JSON.parse(product.tags || '[]');
        tags = translateTags(tags);
      } catch (e) {
        console.error(`Error parsing tags for product ${product.name}:`, e);
      }
      
      // Translate advantages
      let advantages = [];
      try {
        advantages = JSON.parse(product.advantages || '[]');
        advantages = translateAdvantages(advantages);
      } catch (e) {
        console.error(`Error parsing advantages for product ${product.name}:`, e);
      }
      
      // Translate disadvantages
      let disadvantages = [];
      try {
        disadvantages = JSON.parse(product.disadvantages || '[]');
        disadvantages = translateDisadvantages(disadvantages);
      } catch (e) {
        console.error(`Error parsing disadvantages for product ${product.name}:`, e);
      }
      
      // Translate pricing info
      let pricingInfo = {};
      try {
        pricingInfo = JSON.parse(product.pricingInfo || '{}');
        pricingInfo = translatePricingInfo(pricingInfo);
      } catch (e) {
        console.error(`Error parsing pricingInfo for product ${product.name}:`, e);
      }
      
      // Update the product with English content
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: translateDescription(product.description),
          detailInfo: translateDetailInfo(product.detailInfo),
          tags: JSON.stringify(tags),
          advantages: JSON.stringify(advantages),
          disadvantages: JSON.stringify(disadvantages),
          pricingInfo: JSON.stringify(pricingInfo),
          category: translateCategory(product.category)
        }
      });
      
      console.log(`✅ Successfully translated: ${product.name}`);
    } catch (error) {
      console.error(`Error translating product ${product.name}:`, error);
    }
  }
  
  console.log("All products have been translated to English!");
}

// Translation helper functions
function translateDescription(text: string | null): string {
  if (!text) return '';
  
  const translations: Record<string, string> = {
    "účetní": "accounting",
    "účetnictví": "accounting",
    "finanční": "financial",
    "finance": "finances",
    "automati": "automat",
    "řízení": "management",
    "malé a střední podniky": "small and medium businesses",
    "nástroj": "tool",
    "platforma": "platform",
    "správu": "management",
    "účetní procesy": "accounting processes",
    "poskytuje": "provides",
    "sledování": "tracking",
    "digitalizac": "digitizat",
    "moderní": "modern",
    "fakturac": "invoic",
    "inteligentní": "intelligent",
    "pokročilé": "advanced",
    "speciáln": "special",
  };
  
  let translatedText = text;
  Object.keys(translations).forEach(czech => {
    translatedText = translatedText.replace(new RegExp(czech, 'gi'), translations[czech]);
  });
  
  return translatedText;
}

function translateDetailInfo(text: string | null): string {
  if (!text) return '';
  
  const translations: Record<string, string> = {
    "účetní": "accounting",
    "účetnictví": "accounting",
    "finanční": "financial",
    "financí": "finances",
    "firem": "companies",
    "firmám": "companies",
    "firmy": "companies",
    "firma": "company",
    "automati": "automat",
    "řízení": "management",
    "malé a střední podniky": "small and medium businesses",
    "podniky": "businesses",
    "podniků": "businesses",
    "nástroj": "tool",
    "nástrojů": "tools",
    "platforma": "platform",
    "platformy": "platforms",
    "správu": "management",
    "správa": "management",
    "účetní procesy": "accounting processes",
    "poskytuje": "provides",
    "poskytování": "providing",
    "sledování": "tracking",
    "digitalizac": "digitizat",
    "moderní": "modern",
    "fakturac": "invoic",
    "inteligentní": "intelligent",
    "pokročilé": "advanced",
    "pokročilých": "advanced",
    "speciáln": "special",
    "přístup": "approach",
    "proces": "process",
    "procesů": "processes",
    "uživatel": "user",
    "schopnost": "ability",
    "tradičních": "traditional",
    "tradiční": "traditional",
    "rozdíl": "unlike",
    "na rozdíl od": "unlike",
    "který": "which",
    "která": "which",
    "které": "which",
    "pomocí": "using",
    "nabízí": "offers",
    "systém": "system",
    "systému": "system",
    "využívá": "utilizes",
    "posky": "provid",
    "spra": "manag"
  };
  
  let translatedText = text;
  Object.keys(translations).forEach(czech => {
    translatedText = translatedText.replace(new RegExp(czech, 'gi'), translations[czech]);
  });
  
  return translatedText;
}

function translateCategory(category: string | null): string {
  if (!category) return '';
  
  const translations: Record<string, string> = {
    "Účetní software": "Accounting Software",
    "Účetní služby": "Accounting Services",
    "AI účetnictví": "AI Accounting",
    "Finanční reporting": "Financial Reporting",
    "Digitalizace účetnictví": "Accounting Digitization",
    "Zpracování dokumentů": "Document Processing",
    "Automatizace faktur": "Invoice Automation",
    "Správa výdajů": "Expense Management",
    "AI účetní asistent": "AI Accounting Assistant",
    "Finanční management": "Financial Management",
    "SMB finanční software": "SMB Financial Software",
    "Cash Flow Management": "Cash Flow Management",
    "AI Consulting": "AI Consulting",
    "AI asistent pro podnikání": "Business AI Assistant",
    "Cloud Financial Management": "Cloud Financial Management"
  };
  
  return translations[category] || category;
}

function translateTags(tags: string[]): string[] {
  const translations: Record<string, string> = {
    "účetní software": "accounting software",
    "účetní služby": "accounting services",
    "účetnictví": "accounting",
    "finanční reporting": "financial reporting",
    "správa výdajů": "expense management",
    "automatizace účtování": "accounting automation",
    "fakturace": "invoicing",
    "cloudové účetnictví": "cloud accounting",
    "daňové služby": "tax services",
    "AI účetnictví": "AI accounting",
    "zpracování dokladů": "document processing",
    "digitalizace účetnictví": "accounting digitization",
    "finanční analýza": "financial analysis",
    "daňové doklady": "tax documents",
    "sledování výdajů": "expense tracking",
    "účetní automatizace": "accounting automation",
    "účetní integrace": "accounting integration",
    "mobilní skenování": "mobile scanning",
    "malé podniky": "small businesses",
    "finanční plánování": "financial planning",
    "zpracování faktur": "invoice processing",
    "sledování času": "time tracking",
    "firemní karty": "corporate cards",
    "virtuální účetnictví": "virtual accounting",
    "finanční poradenství": "financial advisory",
    "automatizace plateb": "payment automation",
    "finanční řízení": "financial management",
    "e-commerce účetnictví": "e-commerce accounting",
    "daňová příprava": "tax preparation",
    "cash flow predikce": "cash flow prediction",
    "řízení likvidity": "liquidity management",
    "rozpočtování": "budgeting",
    "AI consulting": "AI consulting",
    "strojové učení": "machine learning",
    "prediktivní analýza": "predictive analytics",
    "automatizace účetnictví": "accounting automation",
    "online platby": "online payments",
    "digitální fakturace": "digital invoicing",
    "bankovní integrace": "banking integration",
    "účetnictví pro freelancery": "freelancer accounting",
    "daňová evidence": "tax records"
  };
  
  return tags.map(tag => translations[tag] || tag);
}

function translateAdvantages(advantages: string[]): string[] {
  // Direct one-to-one translations
  const translations: Record<string, string> = {
    "Automatické zpracování a extrakce dat z dokladů": "Automatic processing and data extraction from documents",
    "Rychlé digitální zachycení účtenek a faktur": "Fast digital capture of receipts and invoices",
    "Integrace s populárními účetními softwary": "Integration with popular accounting software",
    "Mobilní aplikace pro skenování dokladů na cestách": "Mobile app for scanning documents on the go",
    "Redukce chyb při přepisování dat": "Reduced errors in data transcription",
    "Automatická kategorizace výdajů": "Automatic expense categorization",
    "Snadné vyhledávání a archivace dokladů": "Easy search and archiving of documents",
    "Úspora času pro účetní i klienty": "Time savings for accountants and clients",
    "Efektivní zpracování faktur": "Efficient invoice processing",
    "Moderní cloudové řešení": "Modern cloud solution",
    "Plně autonomní zpracování faktur": "Fully autonomous invoice processing",
    "Až 99% přesnost díky pokročilé AI": "Up to 99% accuracy thanks to advanced AI",
    "Kontinuální učení a zdokonalování systému": "Continuous learning and system improvement",
    "Významná úspora času při zpracování dokladů": "Significant time savings in document processing",
    "Automatická detekce duplicit a podvodů": "Automatic detection of duplicates and fraud",
    "Pokročilá analýza dat a prediktivní funkce": "Advanced data analysis and predictive functions",
    "Integrace s ERP a účetními systémy": "Integration with ERP and accounting systems",
    "Škálovatelné řešení od malých po velké firmy": "Scalable solution from small to large companies",
    "Automatické párování objednávek a faktur": "Automatic matching of orders and invoices",
    "Průběžná kontrola nákladů": "Ongoing cost control",
    "Automatické zpracování a kategorizace transakcí": "Automatic processing and categorization of transactions",
    "Finanční přehledy v reálném čase": "Real-time financial insights",
    "Detailní reporting na úrovni lokací, oddělení a projektů": "Detailed reporting at the level of locations, departments, and projects",
    "Automatizované odsouhlasení bankovních transakcí": "Automated reconciliation of bank transactions",
    "Sledování klíčových finančních metrik": "Tracking key financial metrics",
    "Adaptivní AI, která se přizpůsobuje potřebám firmy": "Adaptive AI that adapts to company needs",
    "Integrace s bankami a účetními systémy": "Integration with banks and accounting systems",
    "Zjednodušené plánování a rozpočtování": "Simplified planning and budgeting",
    "Přizpůsobené reporty pro různé stakeholdery": "Customized reports for different stakeholders",
    "Bezpečné cloudové řešení": "Secure cloud solution",
    "Kombinace expertního účetního týmu a moderních technologií": "Combination of expert accounting team and modern technologies",
    "Specializace na e-commerce a SaaS společnosti": "Specialization in e-commerce and SaaS companies",
    "Škálovatelné řešení rostoucí s firmou": "Scalable solution growing with the company",
    "Expertíza v komplexních účetních otázkách": "Expertise in complex accounting issues",
    "Implementace a správa účetních technologií": "Implementation and management of accounting technologies",
    "Pravidelné finanční reporty a analýzy": "Regular financial reports and analyses",
    "Efektivní daňové plánování": "Effective tax planning",
    "Integrace s velkým množstvím e-commerce platforem": "Integration with a large number of e-commerce platforms",
    "Automatizace rutinních účetních procesů": "Automation of routine accounting processes",
    "Strategické finanční poradenství": "Strategic financial advisory",
    "Specializace na potřeby startupů a rychle rostoucích firem": "Specialization in the needs of startups and fast-growing companies",
    "Tým zkušených účetních podpořený technologií": "Team of experienced accountants supported by technology",
    "Hluboká znalost účetnictví pro VC-financované společnosti": "Deep knowledge of accounting for VC-funded companies",
    "Integrace s populárními finančními nástroji": "Integration with popular financial tools",
    "Měsíční finanční přehledy a analytika": "Monthly financial reports and analytics",
    "Podpora při investičních kolech a due diligence": "Support during investment rounds and due diligence",
    "R&D daňové kredity pro technologické firmy": "R&D tax credits for technology companies",
    "Předvídatelná cenová struktura": "Predictable pricing structure",
    "Vysoká přesnost a spolehlivost služeb": "High accuracy and reliability of services",
    "Automatická extrakce dat z účtenek a faktur": "Automatic data extraction from receipts and invoices",
    "Živá integrace s kreditními kartami": "Live integration with credit cards",
    "Kontrola firemních výdajů v reálném čase": "Real-time control of company expenses",
    "Mobilní aplikace pro snadné účtování na cestách": "Mobile app for easy accounting on the go",
    "Předvyplněné formuláře na základě minulých výdajů": "Pre-filled forms based on past expenses",
    "Automatizace schvalovacích procesů": "Automation of approval processes",
    "Přizpůsobitelná pravidla pro firemní výdaje": "Customizable rules for company expenses",
    "Kompletní audit trail všech transakcí": "Complete audit trail of all transactions",
    "Pokročilé reportovací nástroje": "Advanced reporting tools"
  };
  
  // Generic translation dictionary for parts not in the direct translations
  const genericTranslations: Record<string, string> = {
    "automatizace": "automation",
    "zpracování": "processing",
    "faktury": "invoices",
    "faktur": "invoices",
    "řízení": "management",
    "účetnictví": "accounting",
    "účetní": "accounting",
    "finanční": "financial",
    "sledování": "tracking",
    "analýza": "analysis",
    "náklady": "costs",
    "integrace": "integration",
    "aplikace": "application",
    "mobilní": "mobile",
    "cloudové": "cloud",
    "přesnost": "accuracy",
    "efektivní": "efficient",
    "pokročilé": "advanced",
    "systém": "system",
    "reportování": "reporting",
    "přizpůsobitelné": "customizable",
    "jednoduchý": "simple",
    "podpora": "support",
    "snadné": "easy",
    "bezpečné": "secure",
    "uživatelské": "user"
  };
  
  return advantages.map(adv => {
    if (translations[adv]) {
      return translations[adv];
    } else {
      // Try applying generic translations
      let translated = adv;
      Object.keys(genericTranslations).forEach(czech => {
        translated = translated.replace(new RegExp(czech, 'gi'), genericTranslations[czech]);
      });
      return translated;
    }
  });
}

function translateDisadvantages(disadvantages: string[]): string[] {
  // Direct one-to-one translations
  const translations: Record<string, string> = {
    "Vyšší cena pro velmi malé firmy": "Higher price for very small companies",
    "Některé pokročilé funkce pouze v dražších tarifech": "Some advanced features only in more expensive plans",
    "Může vyžadovat doladění rozpoznávání specifických dokladů": "May require fine-tuning for recognizing specific documents",
    "Omezená funkčnost v offline režimu": "Limited functionality in offline mode",
    "Vyšší vstupní náklady": "Higher initial costs",
    "Složitější implementace ve větších organizacích": "More complex implementation in larger organizations",
    "Potřeba času na zaučení AI na specifické dokumenty firmy": "Requires time to train AI on company-specific documents",
    "Omezená podpora v některých geografických regionech": "Limited support in some geographic regions",
    "Vyšší cena pro malé podniky": "Higher price for small businesses",
    "Omezená podpora některých mezinárodních účetních standardů": "Limited support for some international accounting standards",
    "Složitější nastavení pro specifické potřeby některých odvětví": "More complex setup for specific needs of some industries",
    "Omezená funkcionalita v základním tarifu": "Limited functionality in the basic plan",
    "Vyšší náklady oproti internímu řešení pro větší firmy": "Higher costs compared to internal solutions for larger companies",
    "Nutnost sdílení citlivých finančních dat s externím partnerem": "Need to share sensitive financial data with an external partner",
    "Méně kontroly nad denními účetními procesy": "Less control over daily accounting processes",
    "Může být méně flexibilní pro velmi specifické požadavky": "May be less flexible for very specific requirements",
    "Vyšší cena oproti základním účetním službám": "Higher price compared to basic accounting services",
    "Primárně zaměřeno na americký trh a účetní standardy": "Primarily focused on the US market and accounting standards",
    "Méně vhodné pro velmi malé nebo tradiční firmy": "Less suitable for very small or traditional companies",
    "Omezená podpora některých mezinárodních operací": "Limited support for some international operations"
  };
  
  // Generic translation dictionary for parts not in the direct translations
  const genericTranslations: Record<string, string> = {
    "vyšší cena": "higher price",
    "omezené": "limited",
    "omezená": "limited",
    "pokročilé funkce": "advanced features",
    "dražších": "more expensive",
    "tarifech": "plans",
    "vyžaduje": "requires",
    "implementace": "implementation",
    "podpora": "support",
    "menší": "smaller",
    "větší": "larger",
    "firmy": "companies",
    "firmách": "companies",
    "specifické": "specific",
    "zaměření": "focus",
    "komplexní": "complex",
    "méně": "less",
    "vhodné": "suitable",
    "náklady": "costs",
    "funkce": "features",
    "může být": "may be",
    "nedostatečné": "insufficient",
    "základní": "basic",
    "standardy": "standards",
    "plán": "plan"
  };
  
  return disadvantages.map(disadv => {
    if (translations[disadv]) {
      return translations[disadv];
    } else {
      // Try applying generic translations
      let translated = disadv;
      Object.keys(genericTranslations).forEach(czech => {
        translated = translated.replace(new RegExp(czech, 'gi'), genericTranslations[czech]);
      });
      return translated;
    }
  });
}

function translatePricingInfo(pricingInfo: any): any {
  // Clone the pricing info to avoid mutating the original
  const translated = JSON.parse(JSON.stringify(pricingInfo));
  
  // Translate tier names if needed
  if (translated.tiers && Array.isArray(translated.tiers)) {
    translated.tiers = translated.tiers.map((tier: any) => {
      // Translate feature descriptions
      if (tier.features && Array.isArray(tier.features)) {
        tier.features = tier.features.map((feature: string) => {
          if (feature.includes("Měsíčně")) return "Monthly";
          if (feature.includes("Ročně")) return "Yearly";
          if (feature.includes("Na uživatele/měsíc")) return "Per user/month";
          if (feature.includes("Jednorázově")) return "One-time";
          if (feature.includes("Neomezené")) return "Unlimited";
          if (feature.includes("Standardní podpora")) return "Standard support";
          if (feature.includes("Prioritní podpora")) return "Priority support";
          if (feature.includes("Vyhrazená podpora")) return "Dedicated support";
          if (feature.includes("Emailová podpora")) return "Email support";
          if (feature.includes("Základní")) return feature.replace("Základní", "Basic");
          if (feature.includes("Pokročilé")) return feature.replace("Pokročilé", "Advanced");
          if (feature.includes("Vlastní")) return feature.replace("Vlastní", "Custom");
          if (feature.includes("Individuální cena")) return "Custom pricing";
          
          // Additional translations
          const featureTranslations: Record<string, string> = {
            "Měsíční uzávěrky": "Monthly closings",
            "Mzdová agenda": "Payroll",
            "Daňová přiznání": "Tax returns",
            "Komplexní služby": "Comprehensive services",
            "CFO poradenství": "CFO advisory",
            "Automatické upomínky": "Automatic reminders",
            "Více uživatelů": "Multiple users",
            "Více bank": "Multiple banks",
            "Vlastní kategorie": "Custom categories",
            "Vlastní role": "Custom roles",
            "Vyhrazená podpora": "Dedicated support",
            "Vlastní integrace": "Custom integrations",
            "Kompletní služby": "Complete services"
          };
          
          let translatedFeature = feature;
          Object.keys(featureTranslations).forEach(czech => {
            translatedFeature = translatedFeature.replace(czech, featureTranslations[czech]);
          });
          
          return translatedFeature;
        });
      }
      
      return tier;
    });
  }
  
  return translated;
}

// Run the translation function
translateProductsToEnglish()
  .catch((e) => {
    console.error("Error during translation process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 