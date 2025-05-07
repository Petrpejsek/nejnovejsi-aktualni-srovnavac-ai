import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI e-commerce and customer service tools - batch 13
const aiEcommerceProducts = [
  {
    externalUrl: "https://www.theyes.com",
    name: "The Yes",
    description: "AI-asistovaná nákupní platforma, která se přizpůsobuje vašim preferencím a pomáhá vám objevovat módní produkty",
    price: 0,
    category: "E-commerce",
    imageUrl: "https://theyes.com/logos/logo.png",
    tags: JSON.stringify(["e-commerce", "móda", "AI nákupní asistent", "personalizace"]),
    advantages: JSON.stringify([
      "Personalizuje nákupní zážitek na základě vašich preferencí",
      "Učí se z vašich nákupních zvyků a zlepšuje doporučení",
      "Jednoduchý a intuitivní interface pro objevování produktů",
      "Propojení s mnoha módními značkami"
    ]),
    disadvantages: JSON.stringify([
      "Zaměřeno primárně na módní produkty",
      "Dostupnost může být omezena podle geografické lokace",
      "Některé pokročilé funkce mohou vyžadovat vytvoření účtu"
    ]),
    detailInfo: "The Yes využívá pokročilé algoritmy strojového učení k vytvoření personalizovaných nákupních zážitků. Platforma se učí z vašich preferencí a nákupního chování, aby vám doporučila produkty, které odpovídají vašemu stylu a potřebám. Umožňuje nakupovat napříč mnoha značkami s jednotným uživatelským rozhraním.",
    pricingInfo: {
      tiers: [
        {
          name: "Základní",
          price: "Zdarma",
          features: [
            "Personalizovaná doporučení produktů",
            "Objevování nových značek a stylů",
            "Základní filtrování podle preferencí"
          ]
        }
      ],
      isFree: true
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example1"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.flipkart.com",
    name: "Flipkart",
    description: "Indická e-commerce platforma s integrovanou AI pro personalizaci nákupního zážitku, doporučení produktů a optimalizaci vyhledávání",
    price: 0,
    category: "E-commerce",
    imageUrl: "https://www.flipkart.com/logo.png",
    tags: JSON.stringify(["e-commerce", "maloobchod", "AI doporučení", "online nakupování"]),
    advantages: JSON.stringify([
      "Široký sortiment produktů od elektroniky po módu",
      "AI-poháněná doporučení a personalizace",
      "Rychlé dodání a snadné vrácení zboží",
      "Integrovaný platební systém"
    ]),
    disadvantages: JSON.stringify([
      "Primárně zaměřeno na indický trh",
      "Může obsahovat více reklam než jiné platformy",
      "Uživatelské rozhraní může být někdy nepřehledné kvůli množství produktů"
    ]),
    detailInfo: "Flipkart je jednou z největších e-commerce platforem v Indii využívající umělou inteligenci k optimalizaci nákupního procesu. Jejich AI systémy analyzují chování uživatelů, historii nákupů a trendy na trhu k poskytování relevantních doporučení produktů. Platforma také využívá strojové učení k optimalizaci vyhledávání, cenových strategií a inventárního managementu.",
    pricingInfo: {
      tiers: [
        {
          name: "Standardní účet",
          price: "Zdarma",
          features: [
            "Přístup ke všem produktům a službám",
            "Personalizovaná doporučení",
            "Sledování objednávek a historie nákupů",
            "Možnost recenzí produktů"
          ]
        },
        {
          name: "Flipkart Plus",
          price: "Věrnostní program (bez poplatku)",
          features: [
            "Všechny standardní funkce",
            "Přednostní zákaznický servis",
            "Exkluzivní nabídky a slevy",
            "Rychlejší doručení"
          ]
        }
      ],
      isFree: true
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example2"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.synerise.com",
    name: "Synerise",
    description: "Komplexní AI platforma pro e-commerce a retail poskytující personalizaci, automatizaci a analýzu dat v reálném čase",
    price: 500,
    category: "E-commerce",
    imageUrl: "https://www.synerise.com/logo.png",
    tags: JSON.stringify(["e-commerce", "personalizace", "CRM", "analýza dat", "marketing"]),
    advantages: JSON.stringify([
      "All-in-one platforma pro správu zákaznické zkušenosti",
      "Pokročilá personalizace využívající AI a strojové učení",
      "Real-time analýza dat a prediktivní modely",
      "Automatizace marketingových kampaní",
      "Integrace s mnoha existujícími platformami"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší náklady pro malé podniky",
      "Komplexní systém s delší křivkou učení",
      "Vyžaduje určitou úroveň technického porozumění"
    ]),
    detailInfo: "Synerise je komplexní AI platforma navržená pro optimalizaci e-commerce a retailových operací. Využívá pokročilou umělou inteligenci k analýze zákaznického chování, předvídání trendů a personalizaci zákaznické zkušenosti v reálném čase. Systém pomáhá firmám zvyšovat konverze, loajalitu zákazníků a optimalizovat marketingové výdaje prostřednictvím datově řízených rozhodnutí.",
    pricingInfo: {
      tiers: [
        {
          name: "Business",
          price: "Od 500 € měsíčně",
          features: [
            "AI-řízená personalizace",
            "Automatizace marketingu",
            "Analýza zákaznického chování",
            "Základní prediktivní modely",
            "Standardní integrace s e-commerce platformami"
          ]
        },
        {
          name: "Enterprise",
          price: "Individuální nacenění",
          features: [
            "Všechny funkce z Business plánu",
            "Pokročilé prediktivní modely",
            "Dedikovaná podpora",
            "Vlastní integrace",
            "Neomezené datové úložiště",
            "SLA garance"
          ]
        }
      ],
      isFree: false
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example3"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.optimonk.com",
    name: "OptiMonk",
    description: "AI-poháněná platforma pro personalizaci webů a konverzní optimalizaci zaměřená na zvýšení prodejů v e-commerce",
    price: 29,
    category: "E-commerce",
    imageUrl: "https://www.optimonk.com/logo.png",
    tags: JSON.stringify(["e-commerce", "konverzní optimalizace", "personalizace", "pop-up marketing"]),
    advantages: JSON.stringify([
      "Snadná implementace bez potřeby programování",
      "AI-řízená personalizace pro různé segmenty návštěvníků",
      "Pokročilé cílení a spouštěcí podmínky",
      "A/B testování pro optimalizaci kampaní",
      "Detailní analýza a reporty výkonnosti"
    ]),
    disadvantages: JSON.stringify([
      "Přílišné využívání pop-up oken může odradit některé návštěvníky",
      "Základní plány mají omezený počet zobrazení",
      "Některé pokročilé funkce jsou dostupné pouze ve vyšších cenových plánech"
    ]),
    detailInfo: "OptiMonk je nástroj pro personalizaci webů a konverzní optimalizaci, který pomáhá e-commerce firmám zvyšovat prodeje a snižovat míru opuštění košíku. Využívá umělou inteligenci k analýze chování návštěvníků a zobrazuje personalizované pop-up kampaně ve správný čas, pro správného návštěvníka a se správným obsahem. Platforma nabízí šablony pro různé typy kampaní včetně získávání e-mailů, prevence opuštění košíku, cross-sellingu a up-sellingu.",
    pricingInfo: {
      tiers: [
        {
          name: "Essential",
          price: "29 $ měsíčně",
          features: [
            "15,000 zobrazení měsíčně",
            "Neomezené kampaně",
            "Základní segmentace",
            "E-mail integrace",
            "A/B testování"
          ]
        },
        {
          name: "Growth",
          price: "79 $ měsíčně",
          features: [
            "50,000 zobrazení měsíčně",
            "Všechny funkce z Essential",
            "Pokročilá segmentace",
            "Dynamický obsah",
            "API integrace"
          ]
        },
        {
          name: "Premium",
          price: "199 $ měsíčně",
          features: [
            "150,000 zobrazení měsíčně",
            "Všechny funkce z Growth",
            "Pokročilé API možnosti",
            "Vlastní Javascript",
            "Prioritní podpora"
          ]
        }
      ],
      isFree: false
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example4"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.tidio.com",
    name: "Tidio",
    description: "AI chatbot a live chat řešení pro e-commerce a zákaznický servis s automatizovanou komunikací a personalizací",
    price: 19,
    category: "Zákaznický servis",
    imageUrl: "https://www.tidio.com/logo.png",
    tags: JSON.stringify(["chatbot", "zákaznický servis", "live chat", "e-commerce", "automatizace"]),
    advantages: JSON.stringify([
      "Kombinace lidského live chatu a AI chatbotů",
      "Snadná implementace a integrace s populárními e-commerce platformami",
      "Předpřipravené šablony chatbotů s možností vlastní konfigurace",
      "Automatizace rutinních zákaznických dotazů",
      "Vícejazyčná podpora"
    ]),
    disadvantages: JSON.stringify([
      "Pokročilé funkce AI jsou dostupné pouze v dražších plánech",
      "Omezení počtu operátorů v základních plánech",
      "Může vyžadovat čas na natrénování chatbota pro specifické potřeby"
    ]),
    detailInfo: "Tidio je komplexní platforma pro zákaznickou komunikaci, která kombinuje živý chat s AI chatboty pro e-commerce a webové stránky. Umožňuje automatizovat běžné zákaznické dotazy, poskytovat okamžitou podporu 24/7 a personalizovat komunikaci na základě chování návštěvníků. Systém se integruje s populárními platformami jako Shopify, WordPress, Magento a dalšími, což umožňuje snadnou implementaci bez pokročilých technických znalostí.",
    pricingInfo: {
      tiers: [
        {
          name: "Free",
          price: "Zdarma",
          features: [
            "50 chatbot konverzací měsíčně",
            "Neomezený live chat",
            "3 operátoři",
            "Základní widgety",
            "Mobilní aplikace"
          ]
        },
        {
          name: "Starter",
          price: "19 $ měsíčně",
          features: [
            "100 chatbot konverzací měsíčně",
            "Neomezený live chat",
            "4 operátoři",
            "Odstranění Tidio brandu",
            "Historie chatů až 6 měsíců"
          ]
        },
        {
          name: "Communicator",
          price: "39 $ měsíčně",
          features: [
            "Pouze live chat (bez chatbotů)",
            "Neomezený počet operátorů",
            "Vlastní widgety",
            "Odstranění Tidio brandu",
            "Neomezená historie chatů"
          ]
        },
        {
          name: "Chatbots",
          price: "49 $ měsíčně",
          features: [
            "Neomezené chatbot konverzace",
            "Pokročilá automatizace",
            "Vizuální editor chatbotů",
            "Podmíněná logika",
            "AI asistent"
          ]
        }
      ],
      isFree: true
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example5"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.anyword.com",
    name: "Anyword",
    description: "AI copywriting platforma specializovaná na vytváření prodejních textů a marketingového obsahu pro e-commerce",
    price: 39,
    category: "Marketing obsahu",
    imageUrl: "https://www.anyword.com/logo.png",
    tags: JSON.stringify(["AI copywriting", "marketing", "e-commerce", "prodejní texty", "generování obsahu"]),
    advantages: JSON.stringify([
      "Prediktivní skóre výkonnosti pro vytvořený obsah",
      "Specializace na konverzní a prodejní texty",
      "Šablony pro různé marketingové potřeby včetně produktových popisů",
      "Integrace s populárními marketingovými nástroji",
      "Analýza cílové skupiny a přizpůsobení tónu komunikace"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cena v porovnání s některými konkurenčními nástroji",
      "Může vyžadovat dodatečné úpravy pro ideální výsledky",
      "Omezený počet slov v nižších cenových plánech"
    ]),
    detailInfo: "Anyword je pokročilá AI platforma pro copywriting, která pomáhá e-commerce firmám, marketérům a obsahovým tvůrcům vytvářet efektivní marketingové texty. Nástroj využívá strojové učení a hlubokou analýzu dat k predikci úspěšnosti vytvořeného obsahu ještě před jeho publikací. Specializuje se na prodejní texty pro produktové stránky, reklamní kampaně, e-maily a sociální média s důrazem na konverzní metriky.",
    pricingInfo: {
      tiers: [
        {
          name: "Starter",
          price: "39 $ měsíčně",
          features: [
            "20,000 slov měsíčně",
            "Prediktivní skóre výkonnosti",
            "Více než 25 šablon",
            "Generátor produktových popisů",
            "Integrace s WordPress"
          ]
        },
        {
          name: "Data-Driven",
          price: "99 $ měsíčně",
          features: [
            "50,000 slov měsíčně",
            "Všechny funkce ze Starter",
            "Copywriting pro Facebook a Google Ads",
            "Rozšířené prediktivní skóre",
            "Analýza cílové skupiny"
          ]
        },
        {
          name: "Business",
          price: "249 $ měsíčně",
          features: [
            "200,000 slov měsíčně",
            "Všechny funkce z Data-Driven",
            "API přístup",
            "Multi-uživatelské účty",
            "Brand voice personalizace",
            "Prioritní podpora"
          ]
        }
      ],
      isFree: false
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example6"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.jasper.ai",
    name: "Jasper",
    description: "AI generátor obsahu zaměřený na marketingové a prodejní texty pro e-commerce s pokročilými funkcemi pro personalizaci obsahu",
    price: 49,
    category: "Marketing obsahu",
    imageUrl: "https://www.jasper.ai/logo.png",
    tags: JSON.stringify(["AI copywriting", "generování obsahu", "marketing", "e-commerce", "SEO"]),
    advantages: JSON.stringify([
      "Široký rozsah šablon pro různé typy obsahu",
      "Vysoce kvalitní výstupy v mnoha jazycích",
      "Možnost nastavení tónu a stylu podle brand voice",
      "Spolupráce v týmu a sdílení projektů",
      "Integrace s dalšími marketingovými nástroji"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cenová politika",
      "Může vyžadovat čas na osvojení všech funkcí",
      "Pro maximální hodnotu potřebuje lidskou kontrolu a úpravy"
    ]),
    detailInfo: "Jasper (dříve Jarvis) je pokročilý AI nástroj pro generování marketingového obsahu. Je ideální pro e-commerce firmy, které potřebují efektivně vytvářet produktové popisy, reklamní texty, e-maily, příspěvky na sociální sítě a další marketingový obsah. Využívá jazykový model GPT pro vytváření lidsky znějících textů, které lze přizpůsobit podle stylu značky a potřeb cílového publika.",
    pricingInfo: {
      tiers: [
        {
          name: "Creator",
          price: "49 $ měsíčně",
          features: [
            "50,000 slov měsíčně",
            "50+ šablon",
            "Generátor dlouhých textů",
            "Základní SEO optimalizace",
            "Gramatická kontrola"
          ]
        },
        {
          name: "Teams",
          price: "125 $ měsíčně",
          features: [
            "100,000 slov měsíčně",
            "Všechny funkce z Creator",
            "Spolupráce v týmu",
            "Sdílení projektů",
            "Brand voice nastavení",
            "Integrace s dalšími nástroji"
          ]
        },
        {
          name: "Business",
          price: "Individuální nacenění",
          features: [
            "Neomezený počet slov",
            "Všechny funkce z Teams",
            "API přístup",
            "Dedikovaný manažer účtu",
            "Vlastní workflow",
            "Prioritní podpora"
          ]
        }
      ],
      isFree: false
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example7"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.omneky.com",
    name: "Omneky",
    description: "AI platforma pro generování a optimalizaci reklamního obsahu across multiple channels, zaměřená na e-commerce výkonnostní marketing",
    price: 1000,
    category: "Marketing",
    imageUrl: "https://www.omneky.com/logo.png",
    tags: JSON.stringify(["AI marketing", "generování reklam", "performance marketing", "e-commerce", "optimalizace"]),
    advantages: JSON.stringify([
      "Automatizované generování a testování reklamního obsahu",
      "Personalizace na základě dat o cílové skupině",
      "Optimalizace konverzí pomocí strojového učení",
      "Multiplatformní reklamní kampaně z jednoho místa",
      "Detailní analýza výkonu a segmentace publika"
    ]),
    disadvantages: JSON.stringify([
      "Vysoká cena nevhodná pro malé podniky",
      "Komplexní systém vyžadující počáteční nastavení",
      "Vyžaduje integraci s reklamními účty a analytickými nástroji"
    ]),
    detailInfo: "Omneky je enterprise AI platforma pro optimalizaci digitálních reklam. Využívá pokročilé algoritmy strojového učení k analýze výkonu reklam, identifikaci úspěšných prvků a automatickému generování nových verzí reklamního obsahu. Systém dokáže personalizovat reklamní sdělení pro různé segmenty publika, což vede ke zvýšení konverzního poměru a snížení nákladů na akvizici zákazníka. Platforma je vhodná zejména pro střední a velké e-commerce podniky s významnými reklamními rozpočty.",
    pricingInfo: {
      tiers: [
        {
          name: "Professional",
          price: "Od 1,000 $ měsíčně",
          features: [
            "Generování a testování reklamního obsahu",
            "Základní personalizace",
            "Integrace s hlavními reklamními platformami",
            "Optimalizace výkonu",
            "Základní reporting"
          ]
        },
        {
          name: "Enterprise",
          price: "Individuální nacenění",
          features: [
            "Všechny funkce z Professional",
            "Pokročilá personalizace a segmentace",
            "Vlastní integrace s CRM a dalšími systémy",
            "Dedikovaný account manager",
            "Pokročilá AI optimalizace",
            "Prediktivní analýza a doporučení"
          ]
        }
      ],
      isFree: false
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example8"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.lyro.ai",
    name: "Lyro",
    description: "AI asistent pro automatizaci zákaznické komunikace, který zpracovává e-maily a zprávy s lidskou přesností a personalizací",
    price: 399,
    category: "Zákaznický servis",
    imageUrl: "https://www.lyro.ai/logo.png",
    tags: JSON.stringify(["automatizace e-mailů", "zákaznický servis", "AI asistent", "komunikace", "e-commerce"]),
    advantages: JSON.stringify([
      "Automatické zpracování a odpovídání na zákaznické e-maily",
      "Vysoká přesnost a schopnost porozumění kontextu",
      "Personalizace odpovědí na základě historie komunikace a tónu značky",
      "Prioritizace důležitých zpráv pro lidský tým",
      "Integrace s existujícími CRM a ticketovacími systémy"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cenová hladina pro menší podniky",
      "Potřeba úvodního nastavení a tréninku",
      "Komplexní případy stále vyžadují lidský zásah"
    ]),
    detailInfo: "Lyro je AI asistent pro automatizaci zákaznické komunikace, který dokáže zpracovávat a odpovídat na e-maily, zprávy a další textovou komunikaci s přesností blížící se lidskému operátorovi. Využívá pokročilé algoritmy zpracování přirozeného jazyka k porozumění kontextu zpráv, identifikaci záměru zákazníka a generování relevantních odpovědí. Systém se průběžně učí z nových interakcí, rozhodnutí lidských operátorů a zpětné vazby, což vede k neustálému zlepšování přesnosti a efektivity.",
    pricingInfo: {
      tiers: [
        {
          name: "Starter",
          price: "399 $ měsíčně",
          features: [
            "Až 1,000 zpracovaných e-mailů měsíčně",
            "Základní integrace (Gmail, Outlook)",
            "Automatizace běžných odpovědí",
            "Základní analýza trendů",
            "E-mailová podpora"
          ]
        },
        {
          name: "Business",
          price: "999 $ měsíčně",
          features: [
            "Až 5,000 zpracovaných e-mailů měsíčně",
            "Pokročilé integrace (Zendesk, Salesforce, Intercom)",
            "Vlastní trénovací dataset",
            "Prioritizace a eskalace",
            "Pokročilá analýza a reporting",
            "Prioritní podpora"
          ]
        },
        {
          name: "Enterprise",
          price: "Individuální nacenění",
          features: [
            "Neomezený počet zpracovaných e-mailů",
            "Všechny funkce z Business",
            "Vlastní workflow a integrace",
            "Dedikovaný success manager",
            "SLA garance",
            "24/7 podpora"
          ]
        }
      ],
      isFree: false
    },
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example9"]),
    hasTrial: true
  }
];

async function updateOrCreateProducts() {
  console.log("Storing AI e-commerce and customer service tools in the database (English version - batch 13)...");
  
  for (const product of aiEcommerceProducts) {
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
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            tags: product.tags,
            advantages: product.advantages,
            disadvantages: product.disadvantages,
            detailInfo: product.detailInfo,
            pricingInfo: JSON.stringify(product.pricingInfo),
            videoUrls: product.videoUrls,
            hasTrial: product.hasTrial
          }
        });
        
        console.log(`✅ Updated: ${product.name}`);
      } else {
        console.log(`Creating new product: ${product.name}`);
        
        // Create new product
        const productToCreate = {
          ...product,
          pricingInfo: JSON.stringify(product.pricingInfo)
        };
        
        const newProduct = await prisma.product.create({
          data: productToCreate
        });
        
        console.log(`✅ Created: ${product.name} with ID ${newProduct.id}`);
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