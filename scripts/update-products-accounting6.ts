import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Šestá dávka účetních a finančních AI nástrojů
const accountingProducts = [
  {
    externalUrl: "https://booke.ai",
    data: {
      name: "Booke AI",
      description: "Booke AI je inteligentní účetní asistent, který automatizuje účetní procesy a poskytuje finanční přehledy pro malé a střední podniky pomocí umělé inteligence.",
      price: 29,
      category: "AI účetní asistent",
      imageUrl: "https://booke.ai/wp-content/uploads/2023/03/booke-ai-logo.png",
      tags: JSON.stringify(["účetní asistent", "automatizace účetnictví", "finanční analýza", "malé podniky", "AI účetnictví"]),
      advantages: JSON.stringify([
        "Automatizace rutinních účetních úkolů",
        "Finanční přehledy v reálném čase",
        "Snadná integrace s běžnými účetními softwary",
        "Personalizované finanční doporučení",
        "Snížení potřeby manuálního zadávání dat",
        "Proaktivní upozornění na finanční problémy",
        "Intuitivní uživatelské rozhraní",
        "Cenově dostupné pro malé podniky",
        "Nepřetržitý přístup k finančním datům",
        "Šetří čas a snižuje chybovost v účetnictví"
      ]),
      disadvantages: JSON.stringify([
        "Omezené pokročilé funkce v základním plánu",
        "Může vyžadovat počáteční nastavení integrace",
        "Méně vhodné pro velmi specifické účetní požadavky",
        "Omezená podpora některých lokálních účetních standardů"
      ]),
      detailInfo: "Booke AI využívá umělou inteligenci k transformaci způsobu, jakým malé a střední podniky spravují své finance. Platforma se zaměřuje na automatizaci časově náročných účetních úkolů jako je kategorizace transakcí, párování plateb a generování finančních reportů, což umožňuje podnikatelům soustředit se na růst jejich podnikání. Díky schopnosti učit se z dat a přizpůsobovat se potřebám konkrétního podniku poskytuje Booke AI stále přesnější finanční přehledy a doporučení, která pomáhají při strategických rozhodnutích.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["Omezené funkce", "50 transakcí měsíčně", "Základní reporting", "Emailová podpora"]},
          {"name": "Starter", "price": 29, "features": ["Měsíčně", "500 transakcí", "Standardní integrace", "Chat podpora"]},
          {"name": "Growth", "price": 79, "features": ["Měsíčně", "2000 transakcí", "Pokročilé analýzy", "Prioritní podpora"]},
          {"name": "Enterprise", "price": 199, "features": ["Měsíčně", "Neomezené transakce", "Vlastní integrace", "Vyhrazená podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.ramp.com",
    data: {
      name: "Ramp",
      description: "Ramp je finanční platforma s umělou inteligencí, která pomáhá firmám šetřit čas a peníze prostřednictvím automatizace výdajů, inteligentního řízení firemních karet a analýzy výdajů.",
      price: 0,
      category: "Finanční management",
      imageUrl: "https://ramp.com/assets/img/ramp-logo-share.png",
      tags: JSON.stringify(["firemní karty", "správa výdajů", "finanční automatizace", "úspora nákladů", "účetní integrace"]),
      advantages: JSON.stringify([
        "Bezplatná základní služba (výdělečný model na mezibankovních poplatcích)",
        "Automatická identifikace potenciálních úspor",
        "Inteligentní firemní karty s kontrolami v reálném čase",
        "Automatizované schvalovací procesy",
        "Integrace s účetními a ERP systémy",
        "Omezení výdajů dle oddělení nebo kategorie",
        "Automatické párování transakcí a účtenek",
        "Jednoduchá implementace a přívětivé uživatelské rozhraní",
        "Pokročilé reporty a analýzy výdajů",
        "Bezpapírový proces zpracování výdajů"
      ]),
      disadvantages: JSON.stringify([
        "Dostupné především pro americké firmy",
        "Některé pokročilé funkce vyžadují placené rozšíření",
        "Méně vhodné pro velmi malé podniky s minimálními výdaji",
        "Omezená mezinárodní podpora"
      ]),
      detailInfo: "Ramp přináší revoluci do firemních financí díky své komplexní platformě, která kombinuje chytré firemní karty s mocnými nástroji pro kontrolu a optimalizaci výdajů. Na rozdíl od tradičních poskytovatelů firemních karet Ramp aktivně pomáhá firmám identifikovat duplicitní předplatná, nevyužívané služby a příležitosti k úsporám. Platforma využívá umělou inteligenci k automatizaci celého procesu správy výdajů - od digitalizace účtenek přes automatické účtování až po detailní analýzu výdajových vzorců. Základní služba je poskytována zdarma, protože Ramp vydělává na mezibankovních poplatcích, což je unikátní obchodní model v tomto odvětví.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 0, "features": ["Firemní karty", "Základní kontroly", "Standardní integrace", "Emailová podpora"]},
          {"name": "Plus", "price": 0, "features": ["Od 75000 USD ročně", "Pokročilé kontroly", "Vlastní workflow", "Vyhrazená podpora"]},
          {"name": "Enterprise", "price": 0, "features": ["Individuální cena", "Komplexní řešení", "API přístup", "Dedikovaný tým"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=Mw7aV5aJWDU"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.aprio.com",
    data: {
      name: "Aprio",
      description: "Aprio je účetní a poradenská firma, která využívá AI a automatizaci k poskytování služeb účetnictví, daňového poradenství a obchodních konzultací pro různé typy společností.",
      price: 1000,
      category: "Účetní služby",
      imageUrl: "https://www.aprio.com/wp-content/uploads/2019/11/aprio-social-1.jpg",
      tags: JSON.stringify(["účetní služby", "daňové poradenství", "obchodní konzultace", "digitální účetnictví", "cloudové účetnictví"]),
      advantages: JSON.stringify([
        "Kombinace lidské expertízy a AI technologií",
        "Komplexní účetní a daňové služby",
        "Specializace v různých odvětvích",
        "Pokročilé finanční analýzy a reporting",
        "Poradenství v oblasti daňové optimalizace",
        "Podpora při transakcích a fúzích",
        "Digitální transformace účetních procesů",
        "Specializované týmy pro specifické potřeby",
        "Proaktivní přístup k finančnímu plánování",
        "Škálovatelné řešení podle velikosti firmy"
      ]),
      disadvantages: JSON.stringify([
        "Vyšší cena ve srovnání s čistě digitálními řešeními",
        "Zaměření především na středně velké a větší firmy",
        "Osobní přístup může být omezen pro klienty s nižším rozpočtem",
        "Komplexnější implementace než u samoobslužných řešení"
      ]),
      detailInfo: "Aprio je moderní účetní a poradenská firma, která kombinuje tradiční účetní expertízu s nejnovějšími technologiemi. Firma poskytuje širokou škálu služeb od základního účetnictví přes daňové poradenství až po strategické obchodní konzultace. Aprio investuje do AI a automatizačních nástrojů, které zefektivňují tradiční účetní procesy a umožňují jejich týmu soustředit se na poskytování strategického poradenství. Firma má specializované týmy pro různá odvětví jako jsou technologie, výroba, zdravotnictví, nemovitosti a další, což umožňuje poskytovat řešení na míru specifickým potřebám každého klienta.",
      pricingInfo: JSON.stringify({
        monthly: 1000,
        yearly: 12000,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 1000, "features": ["Měsíčně", "Základní účetnictví", "Daňová přiznání", "Standardní podpora"]},
          {"name": "Professional", "price": 2500, "features": ["Měsíčně", "Pokročilé účetnictví", "Daňové plánování", "Prioritní podpora"]},
          {"name": "Enterprise", "price": 5000, "features": ["Měsíčně", "Komplexní služby", "Strategické poradenství", "Dedikovaný tým"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleVideo"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.autobooks.co",
    data: {
      name: "Autobooks",
      description: "Autobooks je integrované finanční a účetní řešení, které umožňuje malým podnikům přijímat online platby, sledovat finance a automatizovat účetnictví přímo prostřednictvím jejich bankovního účtu.",
      price: 10,
      category: "SMB finanční software",
      imageUrl: "https://www.autobooks.co/hubfs/autobooks-1.png",
      tags: JSON.stringify(["online platby", "malé podniky", "digitální fakturace", "účetnictví", "bankovní integrace"]),
      advantages: JSON.stringify([
        "Přímá integrace s bankovním účtem",
        "Přijímání online plateb bez dodatečného software",
        "Automatické párování plateb s fakturami",
        "Digitální fakturace a správa výdajů",
        "Finanční přehledy v reálném čase",
        "Snadné použití i pro neúčetní",
        "Minimální implementační nároky",
        "Konkurenceschopné poplatky za zpracování plateb",
        "Bezpečnost na bankovní úrovni",
        "Eliminace potřeby více systémů pro finance"
      ]),
      disadvantages: JSON.stringify([
        "Omezené pokročilé účetní funkce",
        "Závislost na podpoře konkrétní banky",
        "Méně integrací s externími systémy",
        "Může být méně vhodné pro větší organizace"
      ]),
      detailInfo: "Autobooks přináší jedinečný přístup k finančnímu managementu malých podniků tím, že integruje nástroje pro platby a základní účetnictví přímo do bankovního prostředí. Tento přístup eliminuje potřebu přepínat mezi různými systémy a zjednodušuje celý proces od vystavení faktury po sledování plateb a účtování. Na rozdíl od tradičních účetních softwarů Autobooks spolupracuje přímo s finančními institucemi, což umožňuje malým podnikům využívat pokročilé finanční nástroje bez nutnosti investovat do složitých externích systémů. Platforma je navržena s důrazem na jednoduchost a použitelnost pro majitele malých firem, kteří nejsou účetní experti.",
      pricingInfo: JSON.stringify({
        monthly: 10,
        yearly: 99,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 10, "features": ["Měsíčně", "Elektronické platby", "Digitální fakturace", "Základní reporting"]},
          {"name": "Plus", "price": 30, "features": ["Měsíčně", "Pokročilé nástroje", "Účetní integrace", "Prioritní podpora"]},
          {"name": "Pro", "price": 50, "features": ["Měsíčně", "Kompletní sada", "API přístup", "Vyhrazená podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.billyapp.com",
    data: {
      name: "Billy",
      description: "Billy je intuitivní účetní software určený pro freelancery a malé podniky, který automatizuje fakturaci, výdaje a základní účetnictví pomocí AI asistenta.",
      price: 15,
      category: "Účetní software",
      imageUrl: "https://www.billyapp.com/wp-content/uploads/2022/05/billy-logo-share.png",
      tags: JSON.stringify(["fakturace", "účetnictví pro freelancery", "sledování výdajů", "účetní automatizace", "daňová evidence"]),
      advantages: JSON.stringify([
        "Extrémně jednoduché a intuitivní rozhraní",
        "Specializace na potřeby freelancerů a malých firem",
        "Automatizace opakovaných faktur a upomínek",
        "Snadné sledování a kategorizace výdajů",
        "Chytrá daňová evidence a příprava podkladů",
        "Integrovaný systém pro správu klientů",
        "Mobilní aplikace pro účtování na cestách",
        "Víceměnová podpora pro mezinárodní klienty",
        "Přístupné cenové plány",
        "Minimální účetní znalosti pro používání"
      ]),
      disadvantages: JSON.stringify([
        "Omezené funkce pro komplexnější účetnictví",
        "Méně pokročilých reportů ve srovnání s konkurencí",
        "Omezený počet integrací s třetími stranami",
        "Může být nedostatečné pro rychle rostoucí firmy"
      ]),
      detailInfo: "Billy je navržen s jasným cílem: zjednodušit účetnictví pro freelancery a drobné podnikatele, kteří nemají čas, chuť ani zkušenosti s komplexními účetními systémy. Software se zaměřuje na nejdůležitější potřeby této skupiny - snadnou fakturaci, jednoduché sledování výdajů a základní finanční přehledy. Billy využívá automatizaci a umělou inteligenci k usnadnění rutinních úkonů jako je kategorizace výdajů nebo připomínky nezaplacených faktur. Zvláštní pozornost je věnována uživatelskému rozhraní, které je navrženo tak, aby bylo použitelné i pro začátečníky bez účetních znalostí, přičemž stále poskytuje všechny potřebné funkce pro správu financí malého podnikání.",
      pricingInfo: JSON.stringify({
        monthly: 15,
        yearly: 144,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Free", "price": 0, "features": ["5 klientů", "Omezená fakturace", "Základní evidence", "Emailová podpora"]},
          {"name": "Starter", "price": 15, "features": ["Měsíčně", "Neomezení klienti", "Automatické upomínky", "Standardní podpora"]},
          {"name": "Pro", "price": 30, "features": ["Měsíčně", "Pokročilé funkce", "Pravidelné faktury", "Prioritní podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (dávka 6)...");
  
  for (const product of accountingProducts) {
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