import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sedmá dávka účetních a finančních AI nástrojů
const accountingProducts = [
  {
    externalUrl: "https://www.accountingprose.com",
    data: {
      name: "Accounting Prose",
      description: "Accounting Prose je moderní účetní firma, která kombinuje profesionální účetní služby s technologickými inovacemi a automatizací pro malé a střední podniky.",
      price: 349,
      category: "Účetní služby",
      imageUrl: "https://www.accountingprose.com/wp-content/uploads/2021/04/accounting-prose-logo.png",
      tags: JSON.stringify(["účetní služby", "virtuální účetnictví", "finanční poradenství", "daňové služby", "cloudové účetnictví"]),
      advantages: JSON.stringify([
        "Zkušený tým účetních s pokročilými certifikacemi",
        "Využití moderních technologií a automatizace",
        "Virtuální služby dostupné odkudkoli",
        "Specializace na malé a střední podniky",
        "Důraz na partnerský vztah s klienty",
        "Proaktivní finanční poradenství",
        "Personalizovaný přístup dle potřeb klienta",
        "Transparentní cenová politika",
        "Bezpečné cloudové řešení pro sdílení dokumentů",
        "Průběžná komunikace a pravidelné konzultace"
      ]),
      disadvantages: JSON.stringify([
        "Vyšší cena ve srovnání s levnějšími automatizovanými řešeními",
        "Omezená fyzická dostupnost (primárně virtuální služby)",
        "Méně vhodné pro velmi velké korporace",
        "Nutnost přizpůsobit se jejich technologickým procesům"
      ]),
      detailInfo: "Accounting Prose představuje moderní přístup k účetním službám díky kombinaci lidské expertízy a nejnovějších technologických řešení. Firma se zaměřuje na poskytování komplexních účetních služeb pro malé a střední podniky s důrazem na vytváření dlouhodobých partnerských vztahů s klienty. Na rozdíl od tradičních účetních firem Accounting Prose plně využívá cloudové technologie a automatizaci k optimalizaci procesů, což umožňuje jejich týmu soustředit se na strategické poradenství a individuální potřeby klientů. Služby zahrnují vedení účetnictví, správu mezd, daňové plánování a přípravu daňových přiznání, finanční reporting a analýzy, vše poskytované vzdáleně s využitím zabezpečených digitálních nástrojů.",
      pricingInfo: JSON.stringify({
        monthly: 349,
        yearly: 3990,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essential", "price": 349, "features": ["Měsíčně", "Základní účetnictví", "Měsíční uzávěrky", "Standardní podpora"]},
          {"name": "Growth", "price": 649, "features": ["Měsíčně", "Pokročilé účetnictví", "Mzdová agenda", "Daňová přiznání"]},
          {"name": "Enterprise", "price": 999, "features": ["Měsíčně", "Komplexní služby", "CFO poradenství", "Prioritní podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.zipbooks.com",
    data: {
      name: "ZipBooks",
      description: "ZipBooks je intuitivní účetní software s integrovanou umělou inteligencí, který automatizuje fakturaci, účetnictví a finanční reporting pro malé podniky a freelancery.",
      price: 15,
      category: "Účetní software",
      imageUrl: "https://www.zipbooks.com/wp-content/uploads/2019/10/zipbooks-social-card.jpg",
      tags: JSON.stringify(["účetní software", "fakturace", "sledování času", "finanční reporting", "cloudové účetnictví"]),
      advantages: JSON.stringify([
        "Atraktivní a uživatelsky přívětivé rozhraní",
        "Bezplatný základní plán pro start podnikání",
        "Inteligentní automatické účtování a kategorizace",
        "Profesionálně vypadající faktury a nabídky",
        "Integrace se sledováním času a projektů",
        "Automatické upomínky pro nezaplacené faktury",
        "Podporuje více měn a daňových sazeb",
        "Pokročilé finanční reporty a přehledy",
        "Integrovaný systém hodnocení zákazníků",
        "Konkurenceschopné ceny oproti podobným řešením"
      ]),
      disadvantages: JSON.stringify([
        "Omezené funkce v bezplatném plánu",
        "Méně pokročilých funkcí ve srovnání s velkými účetními systémy",
        "Omezený počet integrací s třetími stranami",
        "Některé pokročilé funkce dostupné jen ve vyšších plánech"
      ]),
      detailInfo: "ZipBooks je moderní cloudový účetní software zaměřený na zjednodušení finančního řízení pro malé podniky a freelancery. Systém se vyznačuje výjimečně intuitivním a vizuálně atraktivním uživatelským rozhraním, které usnadňuje každodenní finanční úkoly i uživatelům bez účetních znalostí. ZipBooks využívá umělou inteligenci k automatizaci rutinních procesů jako je kategorizace výdajů, párování plateb a generování finančních přehledů. Zvláštní pozornost je věnována profesionální fakturaci s elegantními šablonami a funkcemi jako jsou automatické upomínky, online platby a hodnocení klientů, což pomáhá firmám zlepšit cash flow a klientskou komunikaci.",
      pricingInfo: JSON.stringify({
        monthly: 15,
        yearly: 150,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 0, "features": ["Neomezené faktury", "Správa dodavatelů", "Základní účtování", "Jedna banka"]},
          {"name": "Smarter", "price": 15, "features": ["Měsíčně", "Automatické upomínky", "Více uživatelů", "Více bank"]},
          {"name": "Sophisticated", "price": 35, "features": ["Měsíčně", "Pokročilé účtování", "Vlastní kategorie", "Vlastní role"]},
          {"name": "Advanced", "price": 0, "features": ["Individuální cena", "Vyhrazená podpora", "Vlastní integrace", "Kompletní služby"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=exampleZipBooks"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.cashflowfrog.com",
    data: {
      name: "CashFlow Frog",
      description: "CashFlow Frog je specializovaný finanční nástroj s AI funkcemi pro predikci a řízení cash flow, který pomáhá malým a středním podnikům zlepšit finanční plánování a likviditu.",
      price: 29,
      category: "Cash Flow Management",
      imageUrl: "https://www.cashflowfrog.com/wp-content/uploads/2021/03/cashflow-frog-logo.png",
      tags: JSON.stringify(["cash flow predikce", "finanční plánování", "řízení likvidity", "rozpočtování", "finanční analýza"]),
      advantages: JSON.stringify([
        "Specializace výhradně na cash flow management",
        "Přesné predikce budoucího cash flow na základě historických dat",
        "Automatická synchronizace s účetními systémy",
        "Vizuální přehledy a grafy pro snadné porozumění",
        "Scenáriové plánování \"co když\" pro různé obchodní situace",
        "Upozornění na potenciální problémy s likviditou",
        "Sledování cash flow podle projektů a oddělení",
        "Jednoduché ovládání bez potřeby finančních expertů",
        "Pomáhá identifikovat oblasti pro zlepšení cash flow",
        "Pravidelné reporty zasílané emailem"
      ]),
      disadvantages: JSON.stringify([
        "Užší zaměření pouze na cash flow (ne komplexní účetnictví)",
        "Přesnost predikcí závisí na kvalitě vstupních dat",
        "Omezené funkce pro velmi velké organizace",
        "Vyžaduje pravidelnou aktualizaci dat pro nejlepší výsledky"
      ]),
      detailInfo: "CashFlow Frog se zaměřuje výhradně na jeden kritický aspekt podnikových financí - řízení a predikci cash flow. Nástroj využívá pokročilé algoritmy a strojové učení k analýze historických finančních dat, identifikaci vzorců a vytváření přesných predikcí budoucích peněžních toků. Na rozdíl od komplexních účetních systémů je CashFlow Frog navržen s důrazem na jednoduchost a srozumitelnost, což umožňuje i malým podnikům bez finančních oddělení efektivně plánovat a řídit likviditu. Unikátní funkcí je možnost modelovat různé obchodní scénáře a sledovat jejich potenciální dopad na cash flow, což pomáhá při strategickém rozhodování a krizovém plánování.",
      pricingInfo: JSON.stringify({
        monthly: 29,
        yearly: 290,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Basic", "price": 29, "features": ["Měsíčně", "90denní predikce", "Základní reporty", "Emailová podpora"]},
          {"name": "Pro", "price": 59, "features": ["Měsíčně", "180denní predikce", "Pokročilé scénáře", "Prioritní podpora"]},
          {"name": "Business", "price": 99, "features": ["Měsíčně", "365denní predikce", "Neomezené scénáře", "Vyhrazená podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.mindtitan.com",
    data: {
      name: "MindTitan",
      description: "MindTitan je společnost specializující se na vývoj AI řešení na míru pro finanční a účetní procesy, pomáhající firmám implementovat umělou inteligenci pro automatizaci a optimalizaci finančních operací.",
      price: 10000,
      category: "AI Consulting",
      imageUrl: "https://www.mindtitan.com/wp-content/uploads/2023/04/mindtitan-logo.png",
      tags: JSON.stringify(["AI consulting", "finanční automatizace", "strojové učení", "prediktivní analýza", "automatizace účetnictví"]),
      advantages: JSON.stringify([
        "Vývoj řešení na míru podle potřeb klienta",
        "Expertíza v oblasti aplikace AI ve financích",
        "Kombinace technologických a finančních znalostí",
        "Implementace pokročilých prediktivních modelů",
        "Automatizace komplexních finančních procesů",
        "Optimalizace nákladů pomocí ML algoritmů",
        "Identifikace skrytých finančních vzorců a anomálií",
        "Důraz na rychlou návratnost investice (ROI)",
        "Podpora při integraci s existujícími systémy",
        "Kontinuální vylepšování implementovaných řešení"
      ]),
      disadvantages: JSON.stringify([
        "Vysoká počáteční investice",
        "Delší implementační doba pro komplexní řešení",
        "Vyžaduje určitou technologickou vyspělost organizace",
        "Potřeba kvalitních dat pro efektivní fungování AI modelů"
      ]),
      detailInfo: "MindTitan je specializovaná konzultační a vývojová společnost, která pomáhá firmám implementovat řešení založená na umělé inteligenci a strojovém učení do finančních a účetních procesů. Na rozdíl od standardizovaných softwarových produktů MindTitan vytváří na míru přizpůsobená řešení, která adresují specifické výzvy a potřeby každého klienta. Jejich služby zahrnují vývoj prediktivních modelů pro finanční plánování, implementaci algoritmů pro automatickou kategorizaci transakcí, vytváření systémů pro detekci podvodů, optimalizaci nákladů pomocí strojového učení a další pokročilé aplikace AI ve finančním sektoru. MindTitan klade důraz na praktické využití umělé inteligence s měřitelným obchodním dopadem a návratností investice.",
      pricingInfo: JSON.stringify({
        monthly: 0,
        yearly: 10000,
        hasFreeTier: false,
        currency: "EUR",
        tiers: [
          {"name": "Assessment", "price": 10000, "features": ["Jednorázově", "Analýza potřeb", "Návrh řešení", "Proof of concept"]},
          {"name": "Implementation", "price": 50000, "features": ["Jednorázově", "Vývoj a nasazení", "Integrace systémů", "Testování"]},
          {"name": "Maintenance", "price": 2000, "features": ["Měsíčně", "Průběžné vylepšování", "Monitoring výkonu", "Technická podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: false
    }
  },
  {
    externalUrl: "https://www.outright.com",
    data: {
      name: "Outright (GoDaddy Bookkeeping)",
      description: "Outright, nyní známý jako GoDaddy Bookkeeping, je jednoduché účetní řešení s AI prvky, které automatizuje správu financí, daňovou přípravu a reporting pro malé podniky a e-commerce prodejce.",
      price: 7.99,
      category: "Účetní software",
      imageUrl: "https://img1.wsimg.com/cdn/Image/All/FOS-Intl/1/en-US/5f21deb1-c3a2-4f21-b03d-ef4bb97ddd2d/logo-outright.png",
      tags: JSON.stringify(["účetní software", "daňová příprava", "e-commerce účetnictví", "sledování výdajů", "finanční reporting"]),
      advantages: JSON.stringify([
        "Speciálně navrženo pro potřeby e-commerce prodejců",
        "Automatická integrace s online tržišti a platebními bránami",
        "Jednoduché a intuitivní rozhraní pro neúčetní",
        "Automatická kategorizace příjmů a výdajů",
        "Průběžná příprava podkladů pro daňová přiznání",
        "Dostupná cena vhodná pro začínající podnikatele",
        "Mobilní aplikace pro správu financí na cestách",
        "Automatické importy bankovních transakcí",
        "Přehledné grafy a reporty pro sledování výkonnosti",
        "Bezproblémová integrace s ostatními GoDaddy službami"
      ]),
      disadvantages: JSON.stringify([
        "Omezené pokročilé účetní funkce",
        "Méně vhodné pro větší firmy s komplexními potřebami",
        "Omezené možnosti přizpůsobení ve srovnání s konkurencí",
        "Méně rozsáhlý ekosystém integrací s třetími stranami"
      ]),
      detailInfo: "Outright, který byl převzat společností GoDaddy a přejmenován na GoDaddy Bookkeeping, je účetní software speciálně navržený pro potřeby malých podniků, freelancerů a zejména online prodejců. Platforma vyniká svou schopností automaticky integrovat data z populárních e-commerce platforem jako Amazon, Etsy, eBay a dalších, což poskytuje ucelený přehled o finančních aktivitách napříč různými prodejními kanály. Software používá automatizaci a prvky umělé inteligence k usnadnění běžných účetních úkolů jako je kategorizace transakcí, sledování výdajů, fakturace a příprava daňových podkladů. GoDaddy Bookkeeping je oceňován především pro svou jednoduchost, která umožňuje i uživatelům bez účetních znalostí efektivně spravovat své finance.",
      pricingInfo: JSON.stringify({
        monthly: 7.99,
        yearly: 84,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Get Paid", "price": 4.99, "features": ["Měsíčně", "Faktury a odhady", "Online platby", "Mobilní aplikace"]},
          {"name": "Essentials", "price": 7.99, "features": ["Měsíčně", "Daňové reporty", "Importy z bank", "Opakované faktury"]},
          {"name": "Premium", "price": 14.99, "features": ["Měsíčně", "Opakované faktury", "Více uživatelů", "Prioritní podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (dávka 7)...");
  
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