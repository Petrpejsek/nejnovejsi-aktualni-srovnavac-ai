import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI e-commerce and customer service tools - batch 14
const aiEcommerceProducts = [
  {
    externalUrl: "https://www.shopify.com",
    name: "Shopify",
    description: "Komplexní e-commerce platforma s integrovanými AI funkcemi pro personalizaci, automatizaci a optimalizaci online obchodů",
    price: 29,
    category: "E-commerce",
    imageUrl: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304e.svg",
    tags: JSON.stringify(["e-commerce", "online obchod", "AI marketing", "personalizace", "platební brána"]),
    advantages: JSON.stringify([
      "Intuitivní uživatelské rozhraní nevyžadující technické znalosti",
      "Integrované AI nástroje pro personalizaci a doporučení produktů",
      "Široké možnosti integrace s aplikacemi třetích stran",
      "Vestavěné analytické a marketingové nástroje",
      "Responzivní design a mobilní optimalizace"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší provize při využití Shopify Payments",
      "Některé pokročilé funkce jsou dostupné pouze ve vyšších tarifech",
      "Omezené možnosti úprav bez znalosti kódu ve standardních šablonách"
    ]),
    detailInfo: "Shopify je jedna z nejpopulárnějších e-commerce platforem, která využívá umělou inteligenci k optimalizaci mnoha aspektů online prodeje. Nabízí AI-poháněné vyhledávání produktů, personalizovaná doporučení, prediktivní analýzu prodejů a automatizaci marketingu. Platforma umožňuje majitelům obchodů snadno vytvořit profesionální e-shop bez technických znalostí a využívat pokročilé nástroje pro růst prodejů.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Basic",
          price: "29 $ měsíčně",
          features: [
            "Online obchod včetně webových stránek a blogu",
            "Neomezený počet produktů",
            "24/7 podpora",
            "Prodejní kanály na sociálních sítích",
            "Základní reporty"
          ]
        },
        {
          name: "Shopify",
          price: "79 $ měsíčně",
          features: [
            "Všechny funkce z Basic",
            "Profesionální reporty",
            "Nižší transakční poplatky",
            "Až 5 uživatelských účtů",
            "Dárkové karty"
          ]
        },
        {
          name: "Advanced",
          price: "299 $ měsíčně",
          features: [
            "Všechny funkce z Shopify",
            "Pokročilé reporty",
            "Nejnižší transakční poplatky",
            "Až 15 uživatelských účtů",
            "Kalkulace individuálních cen doručení"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example1"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.amazon.com",
    name: "Amazon Personalize",
    description: "AI služba od Amazonu, která umožňuje vývojářům vytvářet personalizované doporučení produktů pro zákazníky",
    price: 0,
    category: "E-commerce",
    imageUrl: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
    tags: JSON.stringify(["personalizace", "doporučovací systém", "Amazon Web Services", "e-commerce", "strojové učení"]),
    advantages: JSON.stringify([
      "Využívá stejnou technologii doporučování jako Amazon.com",
      "Nevyžaduje zkušenosti se strojovým učením",
      "Rychlá implementace personalizovaných doporučení",
      "Škálovatelnost pro miliony produktů a uživatelů",
      "Integrace s existujícími AWS službami"
    ]),
    disadvantages: JSON.stringify([
      "Platba za využití může být nákladná při velkém objemu dat",
      "Vyžaduje určité technické znalosti pro implementaci",
      "Potřeba dostatečného množství dat pro efektivní fungování"
    ]),
    detailInfo: "Amazon Personalize je plně spravovaná služba strojového učení, která umožňuje vývojářům snadno vytvářet personalizované doporučení produktů, obsahu a služeb. Využívá stejné technologie, které pohánějí doporučovací systém na Amazon.com. Služba analyzuje interakce uživatelů, produktová data a demografické informace k vytvoření personalizovaných doporučení v reálném čase. Je vhodná pro e-commerce společnosti všech velikostí, streamovací služby nebo aplikace s obsahem.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Pay-as-you-go",
          price: "Platba podle využití",
          features: [
            "Vytváření a údržba modelů strojového učení",
            "Generování doporučení v reálném čase",
            "Zpracování uživatelských událostí",
            "Správa datových sad",
            "Aktualizace modelů"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example2"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.gorgias.com",
    name: "Gorgias",
    description: "AI-poháněná helpdesková platforma specializovaná na zákaznický servis pro e-commerce obchody",
    price: 50,
    category: "Zákaznický servis",
    imageUrl: "https://www.gorgias.com/static/images/logo-dark.svg",
    tags: JSON.stringify(["zákaznický servis", "helpdesk", "e-commerce", "chatbot", "automatizace"]),
    advantages: JSON.stringify([
      "Integrace s populárními e-commerce platformami (Shopify, Magento, WooCommerce)",
      "AI automatizace pro rutinní dotazy zákazníků",
      "Centralizace komunikace z více kanálů (email, chat, sociální sítě)",
      "Přístup k datům o objednávkách přímo v helpdesku",
      "Šablony odpovědí a makra pro rychlejší reakce"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cena pro menší e-shopy s nižším objemem ticketů",
      "Některé pokročilé funkce jsou dostupné pouze ve vyšších tarifech",
      "AI asistent může vyžadovat počáteční nastavení a trénink"
    ]),
    detailInfo: "Gorgias je helpdesková platforma navržená speciálně pro e-commerce podniky. Využívá umělou inteligenci k automatizaci rutinních dotazů zákazníků, kategorizaci ticketů a prioritizaci důležitých problémů. Platforma se integruje s předními e-commerce systémy, což umožňuje zákaznickému servisu přístup k datům o objednávkách, zákaznících a produktech přímo v helpdesku. To významně zrychluje řešení problémů a zvyšuje efektivitu podpory.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Basic",
          price: "50 $ měsíčně",
          features: [
            "Až 350 ticketů měsíčně",
            "2 agenti",
            "Integrace se Shopify, Magento nebo WooCommerce",
            "Základní statistiky",
            "E-mail a živý chat"
          ]
        },
        {
          name: "Pro",
          price: "300 $ měsíčně",
          features: [
            "Až 2000 ticketů měsíčně",
            "5 agentů",
            "Pokročilé statistiky",
            "Instagram a Facebook integrace",
            "Automatická pravidla"
          ]
        },
        {
          name: "Advanced",
          price: "750 $ měsíčně",
          features: [
            "Až 5000 ticketů měsíčně",
            "12 agentů",
            "Pokročilé automatizace a AI asistent",
            "Vlastní integrace",
            "Prioritní podpora",
            "SLA management"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example3"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.bloomreach.com",
    name: "Bloomreach",
    description: "AI platforma pro personalizaci a optimalizaci digitálních zážitků v e-commerce, která pomáhá zlepšovat konverze a zákaznickou loajalitu",
    price: 3000,
    category: "E-commerce",
    imageUrl: "https://www.bloomreach.com/img/bloomreach-logo.svg",
    tags: JSON.stringify(["personalizace", "vyhledávání", "e-commerce", "obsahový management", "AI marketing"]),
    advantages: JSON.stringify([
      "Personalizace digitální zkušenosti v reálném čase",
      "AI-poháněné vyhledávání a merchandising",
      "Segmentace zákazníků na základě chování a preferencí",
      "A/B testování a experimentování",
      "Jednotná zákaznická data napříč všemi kanály"
    ]),
    disadvantages: JSON.stringify([
      "Vysoká cena vhodná především pro střední a velké e-commerce",
      "Komplexní platforma vyžadující počáteční nastavení",
      "Vyžaduje integraci s existujícími systémy"
    ]),
    detailInfo: "Bloomreach je AI-poháněná platforma pro optimalizaci digitálních zážitků, která pomáhá e-commerce společnostem personalizovat každou interakci se zákazníky. Kombinuje tři klíčové produkty: Discovery (AI vyhledávání a merchandising), Content (CMS a obsahový management) a Engagement (personalizovaný marketing). Platforma využívá umělou inteligenci k analýze dat o zákaznících, identifikaci trendů a automatizaci personalizace obsahu, produktových doporučení a marketingových kampaní.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Enterprise",
          price: "Od 3,000 $ měsíčně",
          features: [
            "Personalizované vyhledávání a doporučování produktů",
            "Obsahový management systém",
            "Segmentace zákazníků",
            "A/B testování",
            "Analytika a reporty",
            "API přístup"
          ]
        },
        {
          name: "Custom",
          price: "Individuální nacenění",
          features: [
            "Všechny Enterprise funkce",
            "Vlastní integrace",
            "Dedikovaný account manager",
            "Pokročilá AI optimalizace",
            "SLA garance",
            "24/7 podpora"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example4"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.algolia.com",
    name: "Algolia",
    description: "AI-poháněný vyhledávací a doporučovací engine pro e-commerce weby, který zlepšuje zákaznickou zkušenost a konverze",
    price: 29,
    category: "E-commerce",
    imageUrl: "https://www.algolia.com/static-assets/images/og/algolia.jpg",
    tags: JSON.stringify(["vyhledávání", "AI doporučení", "e-commerce", "personalizace", "filtrování"]),
    advantages: JSON.stringify([
      "Extrémně rychlé vyhledávání s okamžitými výsledky",
      "Tolerantnost k překlepům a chybám",
      "Personalizované výsledky na základě chování uživatele",
      "Snadná implementace a integrace",
      "Detailní analýza vyhledávacích dotazů"
    ]),
    disadvantages: JSON.stringify([
      "Cena může rychle růst s větším objemem dat a vyšším počtem požadavků",
      "Některé pokročilé funkce vyžadují vlastní implementaci",
      "Komplexní nastavení může být náročnější pro začátečníky"
    ]),
    detailInfo: "Algolia je výkonná AI vyhledávací platforma, která umožňuje e-commerce webům nabízet rychlé, relevantní a personalizované výsledky vyhledávání. Využívá strojové učení k pochopení záměru uživatele a poskytuje výsledky s ohledem na předchozí interakce, preference a kontext. Platforma také nabízí pokročilé filtrování, řazení a facetovou navigaci, což zákazníkům usnadňuje nalezení přesně toho, co hledají. Díky AI technologiím Algolia neustále optimalizuje relevanci výsledků na základě uživatelského chování.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard",
          price: "Od 29 $ měsíčně",
          features: [
            "20,000 vyhledávacích požadavků měsíčně",
            "10,000 záznamů",
            "Základní analytika",
            "Personalizované výsledky",
            "API přístup"
          ]
        },
        {
          name: "Pro",
          price: "Od 99 $ měsíčně",
          features: [
            "100,000 vyhledávacích požadavků měsíčně",
            "100,000 záznamů",
            "Pokročilá analytika",
            "A/B testování",
            "Personalizace podle segmentů",
            "Technická podpora"
          ]
        },
        {
          name: "Premium",
          price: "Individuální nacenění",
          features: [
            "Neomezené vyhledávací požadavky",
            "Miliony záznamů",
            "Service Level Agreement (SLA)",
            "Dedikovaná infrastruktura",
            "Pokročilé AI funkce",
            "Osobní konzultant"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example5"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.klaviyo.com",
    name: "Klaviyo",
    description: "AI-poháněná e-mail marketingová platforma specializovaná na personalizaci a automatizaci pro e-commerce",
    price: 20,
    category: "E-commerce Marketing",
    imageUrl: "https://www.klaviyo.com/static/logo-dark-20ea520c92cafc53b6dbbb55fc4242d3.svg",
    tags: JSON.stringify(["e-mail marketing", "automatizace", "personalizace", "e-commerce", "segmentace"]),
    advantages: JSON.stringify([
      "Pokročilá segmentace zákazníků pomocí AI",
      "Personalizace obsahu na základě chování a preferencí",
      "Automatické spouštění kampaní podle akcí zákazníků",
      "Integrace s hlavními e-commerce platformami",
      "Prediktivní analýza a doporučení"
    ]),
    disadvantages: JSON.stringify([
      "Cena rychle roste s velikostí e-mailové databáze",
      "Pokročilé funkce mohou být složitější pro začátečníky",
      "Plný potenciál vyžaduje kvalitní data o zákaznících"
    ]),
    detailInfo: "Klaviyo je marketingová platforma zaměřená na e-commerce, která využívá umělou inteligenci k analyzování zákaznických dat a vytváření vysoce personalizovaných e-mailových a SMS kampaní. Systém automaticky segmentuje zákazníky podle jejich nákupního chování, preferencí a interakcí s obchodem. AI funkce umožňují predikovat hodnotu zákazníka, pravděpodobnost dalšího nákupu a optimální časy pro zasílání zpráv. Díky integraci s populárními e-commerce platformami jako Shopify, Magento a WooCommerce má Klaviyo přístup k datům o produktech, objednávkách a nákupní historii, což umožňuje vytváření dynamických, personalizovaných sdělení.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Email",
          price: "Od 20 $ měsíčně (při 500 kontaktech)",
          features: [
            "Neomezené e-maily",
            "AI segmentace",
            "Automatizované workflow",
            "Personalizované doporučení produktů",
            "A/B testování"
          ]
        },
        {
          name: "Email & SMS",
          price: "Od 35 $ měsíčně (při 500 kontaktech)",
          features: [
            "Všechny funkce Email plánu",
            "SMS marketing",
            "Multichannel automatizace",
            "Pokročilé reporty",
            "Prediktivní analýza"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example6"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.teikametrics.com",
    name: "Teikametrics",
    description: "AI platforma pro optimalizaci reklamy na Amazonu a dalších marketplace platformách pomocí strojového učení",
    price: 99,
    category: "E-commerce Marketing",
    imageUrl: "https://teikametrics.com/wp-content/themes/teikametrics/img/logo.svg",
    tags: JSON.stringify(["Amazon reklama", "marketplace optimalizace", "PPC", "e-commerce", "cenová strategie"]),
    advantages: JSON.stringify([
      "AI optimalizace nabídek a klíčových slov pro Amazon PPC",
      "Automatické přerozdělení rozpočtu pro maximální ROI",
      "Prediktivní analýza výkonnosti produktů",
      "Doporučení pro optimalizaci produktových listingů",
      "Centralizovaná správa reklamních kampaní"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cena pro menší prodejce",
      "Primárně zaměřeno na Amazon a Walmart marketplace",
      "Vyžaduje určitý objem dat pro efektivní optimalizaci"
    ]),
    detailInfo: "Teikametrics je AI-poháněná platforma navržená pro optimalizaci prodeje a reklamy na Amazonu a dalších marketplace platformách. Využívá pokročilé algoritmy strojového učení k analýze historických dat, tržních trendů a chování nakupujících k automatizaci a optimalizaci PPC kampaní. Systém průběžně monitoruje výkonnost kampaní a dynamicky upravuje nabídky, klíčová slova a rozpočty pro dosažení maximálního výnosu z investice. Vedle správy reklamy poskytuje i doporučení pro optimalizaci produktových listingů a cenových strategií.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Flywheel Standard",
          price: "Od 99 $ měsíčně",
          features: [
            "AI optimalizace PPC kampaní",
            "Automatizované nabídky pro klíčová slova",
            "Základní reporting",
            "Doporučení pro klíčová slova",
            "Mobilní aplikace"
          ]
        },
        {
          name: "Flywheel Premium",
          price: "Od 299 $ měsíčně",
          features: [
            "Všechny funkce ze Standard",
            "Pokročilá optimalizace kampaní",
            "Detailní analýza konkurence",
            "Prioritní podpora",
            "Dedikovaný strategický poradce"
          ]
        },
        {
          name: "Enterprise",
          price: "Individuální nacenění",
          features: [
            "Všechny funkce z Premium",
            "Vlastní reporty a dashboardy",
            "API přístup",
            "Strategické plánování",
            "Vlastní intergrace"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example7"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.reflektion.com",
    name: "Reflektion",
    description: "AI platforma pro personalizaci e-commerce zážitků s individuálními doporučeními produktů na základě chování zákazníků",
    price: 2000,
    category: "E-commerce",
    imageUrl: "https://www.reflektion.com/wp-content/themes/reflektion/images/logo-dark.png",
    tags: JSON.stringify(["personalizace", "doporučovací systém", "e-commerce", "prediktivní technologie", "vyhledávání"]),
    advantages: JSON.stringify([
      "Individuální personalizace pro každého zákazníka v reálném čase",
      "Prediktivní vyhledávání anticipující záměr uživatele",
      "Dynamické přizpůsobení obsahu podle chování návštěvníka",
      "Cross-sell a up-sell doporučení založená na AI",
      "Omnichannel personalizace (web, email, mobilní aplikace)"
    ]),
    disadvantages: JSON.stringify([
      "Vysoká cenová hladina pro malé e-shopy",
      "Vyžaduje integraci s existujícími systémy",
      "Efektivita závisí na kvalitě a množství zákaznických dat"
    ]),
    detailInfo: "Reflektion je pokročilá AI platforma pro personalizaci vytvořená speciálně pro e-commerce. Využívá techniky hlubokého učení k analýze chování zákazníků, kontextu nákupů a produktových atributů k vytvoření individualizovaných nákupních zážitků. Platforma zahrnuje několik klíčových modulů: prediktivní vyhledávání, personalizované doporučování produktů, dynamickou kategorizaci a e-mail personalizaci. Umělá inteligence se neustále učí z nových interakcí, což vede k stále přesnějším doporučením a vyšším konverzím.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Enterprise",
          price: "Od 2,000 $ měsíčně",
          features: [
            "AI personalizace produktových doporučení",
            "Prediktivní vyhledávání",
            "Dynamické kategorie a landing pages",
            "A/B testování",
            "Analýza zákaznického chování",
            "Základní integrace"
          ]
        },
        {
          name: "Premium",
          price: "Individuální nacenění",
          features: [
            "Všechny funkce z Enterprise",
            "Pokročilá omnichannel personalizace",
            "Vlastní algoritmy a modely",
            "Dedikovaná technická podpora",
            "Vlastní integrace a API",
            "SLA garance"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example8"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.assiduus.com",
    name: "Assiduus AI",
    description: "AI platforma pro automatizaci účetnictví a finančního řízení pro e-commerce podniky a online prodejce",
    price: 149,
    category: "Finance",
    imageUrl: "https://www.assiduus.com/assets/images/logo.svg",
    tags: JSON.stringify(["účetnictví", "AI finance", "e-commerce", "automatizace", "finanční řízení"]),
    advantages: JSON.stringify([
      "Automatická synchronizace dat z e-commerce platforem a tržišť",
      "AI kategorizace a zpracování transakcí",
      "Automatizace rutinních účetních procesů",
      "Realtimové finanční přehledy a analýzy",
      "Optimalizace cash-flow pro e-commerce specifické potřeby"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší cena může být překážkou pro začínající podnikatele",
      "Primárně zaměřeno na e-commerce, méně vhodné pro jiné typy podnikání",
      "Může vyžadovat počáteční nastavení a synchronizaci dat"
    ]),
    detailInfo: "Assiduus AI je specializovaná platforma pro automatizaci financí a účetnictví vytvořená speciálně pro e-commerce podniky. Využívá umělou inteligenci k automatizaci účetních procesů, kategorizaci transakcí a generování finančních reportů. Systém se integruje s populárními e-commerce platformami (Shopify, Amazon, eBay) a automaticky synchronizuje prodejní data, výdaje a příjmy. Umělá inteligence analyzuje finanční vzorce, identifikuje potenciální úspory a poskytuje doporučení pro optimalizaci cash-flow a daňové plánování.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Starter",
          price: "149 $ měsíčně",
          features: [
            "Automatická synchronizace dat z 1 e-commerce platformy",
            "Základní účetní automatizace",
            "Měsíční finanční reporty",
            "Kategorizace transakcí",
            "E-mailová podpora"
          ]
        },
        {
          name: "Growth",
          price: "299 $ měsíčně",
          features: [
            "Integrace až s 3 e-commerce platformami",
            "Pokročilá účetní automatizace",
            "Týdenní finanční reporty",
            "Prediktivní analýza cash-flow",
            "Daňová optimalizace",
            "Prioritní podpora"
          ]
        },
        {
          name: "Enterprise",
          price: "599 $ měsíčně",
          features: [
            "Neomezené integrace platforem",
            "Kompletní automatizace účetnictví",
            "Realtimové finanční přehledy",
            "Vlastní reporty a dashboardy",
            "Dedikovaný účetní poradce",
            "API přístup"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example9"]),
    hasTrial: true
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám AI e-commerce a zákaznické nástroje do databáze (dávka 14)...");
  
  for (const product of aiEcommerceProducts) {
    try {
      // Find product by externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Aktualizuji existující produkt: ${existingProduct.name}`);
        
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
        
        console.log(`✅ Aktualizován: ${product.name}`);
      } else {
        console.log(`Vytvářím nový produkt: ${product.name}`);
        
        // Create new product
        const productToCreate = {
          ...product,
          pricingInfo: JSON.stringify(product.pricingInfo)
        };
        
        const newProduct = await prisma.product.create({
          data: productToCreate
        });
        
        console.log(`✅ Vytvořen: ${product.name} s ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`Chyba při zpracování produktu ${product.externalUrl}:`, error);
    }
  }
  
  console.log("Všechny produkty byly úspěšně uloženy!");
}

// Run the update
updateOrCreateProducts()
  .catch((e) => {
    console.error("Chyba během procesu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 