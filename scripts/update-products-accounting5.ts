import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pátá dávka účetních a finančních AI nástrojů
const accountingProducts = [
  {
    externalUrl: "https://www.fylehq.com",
    data: {
      name: "Fyle",
      description: "Fyle je inteligentní platforma pro správu výdajů, která automatizuje účtování, sledování a proplácení firemních výdajů s využitím umělé inteligence.",
      price: 10,
      category: "Správa výdajů",
      imageUrl: "https://www.fylehq.com/hubfs/Fyle-Website-Assets/Fyle_Website_Favicon.png",
      tags: JSON.stringify(["správa výdajů", "automatizace účtování", "firemní karty", "účetní integrace", "mobilní skenování"]),
      advantages: JSON.stringify([
        "Automatická extrakce dat z účtenek a faktur",
        "Živá integrace s kreditními kartami",
        "Kontrola firemních výdajů v reálném čase",
        "Integrace s účetními systémy",
        "Mobilní aplikace pro snadné účtování na cestách",
        "Předvyplněné formuláře na základě minulých výdajů",
        "Automatizace schvalovacích procesů",
        "Přizpůsobitelná pravidla pro firemní výdaje",
        "Kompletní audit trail všech transakcí",
        "Pokročilé reportovací nástroje"
      ]),
      disadvantages: JSON.stringify([
        "Některé pokročilé funkce jen v dražších plánech",
        "Omezená podpora pro některé lokální účetní standardy",
        "Složitější nastavení pro specifické firemní pravidla",
        "Může vyžadovat školení pro maximální využití funkcí"
      ]),
      detailInfo: "Fyle transformuje způsob, jakým firmy spravují a účtují výdaje svých zaměstnanců. Platforma využívá umělou inteligenci k automatizaci celého procesu od digitalizace účtenek a faktur až po jejich schválení, proplacení a účetní evidenci. Na rozdíl od tradičních řešení nabízí Fyle živé propojení s firemními kreditními kartami, což umožňuje automatické párování transakcí a výrazně snižuje potřebu manuálního zadávání dat. Díky integraci s účetními systémy jako QuickBooks, Xero, Sage a dalšími zajišťuje bezproblémový tok dat do firemního účetnictví.",
      pricingInfo: JSON.stringify({
        monthly: 10,
        yearly: 96,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 10, "features": ["Na uživatele/měsíc", "Základní automatizace", "Mobilní aplikace", "Standardní podpora"]},
          {"name": "Business", "price": 20, "features": ["Na uživatele/měsíc", "Pokročilá automatizace", "Integrované kreditní karty", "Prioritní podpora"]},
          {"name": "Enterprise", "price": 0, "features": ["Individuální cena", "Vlastní integrace", "Vyhrazená podpora", "Přizpůsobení na míru"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=R-LfqAHKCS0"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.rossum.ai",
    data: {
      name: "Rossum",
      description: "Rossum je AI platforma pro automatizaci zpracování dokumentů, která používá pokročilé strojové učení k extrakci dat z faktur, objednávek a dalších obchodních dokumentů.",
      price: 800,
      category: "Zpracování dokumentů",
      imageUrl: "https://www.rossum.ai/wp-content/uploads/2023/04/Rossum_logo_home.png",
      tags: JSON.stringify(["zpracování faktur", "extrakce dat", "automatizace dokumentů", "AI OCR", "digitalizace dokumentů"]),
      advantages: JSON.stringify([
        "Přesnost extrakce dat až 98% bez šablon",
        "Adaptivní AI, která se učí z každého dokumentu",
        "Zpracování dokumentů v mnoha jazycích a formátech",
        "Automatizace celého procesu od příjmu po zpracování",
        "Efektivní řešení výjimek a validace dat",
        "Integrace s ERP a účetními systémy",
        "Výrazné zrychlení zpracování dokumentů",
        "Snížení chybovosti manuálního zadávání",
        "Pokročilé workflow pro schvalování",
        "Auditovatelná historie zpracování dokumentů"
      ]),
      disadvantages: JSON.stringify([
        "Vyšší počáteční investice",
        "Potřeba času na trénink AI pro specifické typy dokumentů",
        "Omezená podpora pro velmi nestandardní formáty dokumentů",
        "Komplexnější implementace pro rozsáhlé systémy"
      ]),
      detailInfo: "Rossum přináší revoluci do zpracování obchodních dokumentů díky kognitivní AI, která skutečně čte a interpretuje dokumenty podobně jako člověk. Na rozdíl od tradičních OCR řešení založených na šablonách dokáže Rossum zpracovávat různorodé dokumenty bez potřeby předem definovaných vzorů. Platforma automatizuje celý dokumentový proces od příjmu emailů s přílohami, přes extrakci dat, validaci až po export do navazujících systémů. Každý zpracovaný dokument zlepšuje přesnost systému díky pokročilým algoritmům strojového učení, což z Rossum činí adaptivní řešení, které roste s potřebami vaší firmy.",
      pricingInfo: JSON.stringify({
        monthly: 800,
        yearly: 8640,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Business", "price": 800, "features": ["Měsíčně", "Až 1000 dokumentů", "Standardní integrace", "Emailová podpora"]},
          {"name": "Enterprise", "price": 0, "features": ["Individuální cena", "Neomezené dokumenty", "Vlastní integrace", "Vyhrazená podpora", "Pokročilé workflow"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=KCTi1Hf3Xns"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.plateiq.com",
    data: {
      name: "Plate IQ",
      description: "Plate IQ je end-to-end platforma pro zpracování a platby faktur, specializovaná na automatizaci účetních procesů v pohostinství a dalších odvětvích pomocí pokročilé AI.",
      price: 500,
      category: "Automatizace faktur",
      imageUrl: "https://plateiq.com/wp-content/uploads/2023/03/Plate-IQ_Logo_Digital_Color.png",
      tags: JSON.stringify(["zpracování faktur", "AP automatizace", "platby faktur", "správa výdajů", "účetní automatizace"]),
      advantages: JSON.stringify([
        "Specializace na pohostinství a specifické potřeby odvětví",
        "Kompletní řešení od digitalizace po platby",
        "Integrovaná platební síť pro zjednodušení úhrad",
        "Automatické párování objednávek a faktur",
        "Sledování změn cen a reporty úspor",
        "Správa virtuálních platebních karet",
        "Pokročilá analýza výdajů a nákladů",
        "Automatizace schvalovacího procesu",
        "Integrace s hlavními účetními a ERP systémy",
        "Mobilní aplikace pro schvalování a přehled"
      ]),
      disadvantages: JSON.stringify([
        "Vyšší cena pro menší podniky",
        "Některé funkce jsou optimalizované primárně pro pohostinství",
        "Složitější implementace pro firmy s nestandardními procesy",
        "Může vyžadovat úpravy stávajících interních postupů"
      ]),
      detailInfo: "Plate IQ nabízí kompletní řešení pro automatizaci procesu zpracování a plateb faktur s důrazem na specifické potřeby pohostinství a příbuzných odvětví. Platforma využívá pokročilou AI k digitalizaci faktur, extrakci dat a automatizaci celého cyklu zpracování závazků (AP). Unikátní funkcí je integrovaná platební síť, která umožňuje nejen zpracovat, ale i přímo uhradit faktury v rámci jednoho systému, včetně správy virtuálních karet pro lepší kontrolu výdajů. Oproti konkurenci vyniká Plate IQ schopností identifikovat změny cen produktů v čase a generovat podrobné reporty potenciálních úspor.",
      pricingInfo: JSON.stringify({
        monthly: 500,
        yearly: 5400,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Standard", "price": 500, "features": ["Měsíčně", "Zpracování faktur", "Základní reporty", "Emailová podpora"]},
          {"name": "Professional", "price": 1000, "features": ["Měsíčně", "Platební síť", "Pokročilé reporty", "Prioritní podpora"]},
          {"name": "Enterprise", "price": 0, "features": ["Individuální cena", "Kompletní AP řešení", "Vlastní integrace", "Vyhrazená podpora", "SLA garance"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=ByDfVngmuIY"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.airbase.com",
    data: {
      name: "Airbase",
      description: "Airbase je komplexní platforma pro správu firemních výdajů, která sjednocuje firemní karty, platby faktur a procesní workflow s využitím AI pro automatizaci účetních operací.",
      price: 1000,
      category: "Správa výdajů",
      imageUrl: "https://airbase.com/wp-content/uploads/2023/01/Airbase_Meta_2-4.png",
      tags: JSON.stringify(["správa výdajů", "firemní karty", "automatizace plateb", "AP automatizace", "finanční řízení"]),
      advantages: JSON.stringify([
        "Sjednocení všech firemních výdajů na jedné platformě",
        "Inteligentní workflow pro schvalování výdajů",
        "Automatizovaná kategorizace a účtování transakcí",
        "Virtuální a fyzické firemní karty s kontrolami v reálném čase",
        "Detailní reporting a kontrola rozpočtu",
        "Pokročilá automatizace plateb dodavatelům",
        "Automatická synchronizace s účetními systémy",
        "Integrovaný nástroj pro kontrolu předplatných služeb",
        "Kompletní audit trail pro všechny transakce",
        "Pokročilé kontroly a ověřování"
      ]),
      disadvantages: JSON.stringify([
        "Vyšší cena pro menší společnosti",
        "Komplexní implementace při napojení na stávající systémy",
        "Potřeba změny některých zavedených procesů",
        "Méně vhodné pro firmy s minimálními finančními toky"
      ]),
      detailInfo: "Airbase přináší inovativní přístup ke správě firemních výdajů díky sjednocení všech způsobů plateb do jedné platformy. Kombinuje správu předplateb, platby faktur dodavatelům a řízení firemních karet (virtuálních i fyzických) s pokročilou kontrolou a automatizací. Platforma využívá umělou inteligenci k automatickému zpracování faktur, kategorizaci výdajů a synchronizaci s účetními systémy. Zvláštní pozornost je věnována kontrolním mechanismům, jako je víceúrovňové schvalování, předběžné kontroly výdajů a detailní reportování, což pomáhá firmám lépe řídit cashflow a dodržovat finanční pravidla a politiky.",
      pricingInfo: JSON.stringify({
        monthly: 1000,
        yearly: 10800,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Essentials", "price": 1000, "features": ["Měsíčně", "Základní kontroly", "Firemní karty", "Standardní podpora"]},
          {"name": "Growth", "price": 2000, "features": ["Měsíčně", "Pokročilé kontroly", "AP automatizace", "Prioritní podpora"]},
          {"name": "Enterprise", "price": 0, "features": ["Individuální cena", "Vlastní workflow", "Pokročilé analýzy", "Vyhrazená podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=D-k-BoQNOWQ"]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.aider.ai",
    data: {
      name: "Aider",
      description: "Aider je AI-powered asistent pro malé podniky, který zpracovává finanční a účetní data, poskytuje obchodní přehledy a pomáhá se strategickým rozhodováním prostřednictvím přirozeného jazykového rozhraní.",
      price: 60,
      category: "AI asistent pro podnikání",
      imageUrl: "https://aider.ai/wp-content/uploads/2023/05/Aider-social-media.png",
      tags: JSON.stringify(["AI asistent", "finanční analýza", "obchodní přehledy", "data-driven rozhodování", "malé podniky"]),
      advantages: JSON.stringify([
        "Komunikace s daty přirozeným jazykem",
        "Automatická analýza finančních dat a trendů",
        "Proaktivní upozornění na finanční problémy",
        "Integrace s účetními systémy a POS",
        "Personalizované obchodní přehledy",
        "Pomoc s cashflow predikcemi",
        "Jednoduchá implementace bez technických znalostí",
        "Konverzační rozhraní pro snadné používání",
        "Kontinuální učení a přizpůsobování potřebám firmy",
        "Cenově dostupné pro malé podniky"
      ]),
      disadvantages: JSON.stringify([
        "Omezené pokročilé funkce ve srovnání se specializovanými finančními nástroji",
        "Závislost na kvalitě vstupních dat",
        "Možná omezení při velmi specifických dotazech",
        "Některé integrace dostupné pouze ve vyšších cenových plánech"
      ]),
      detailInfo: "Aider reprezentuje novou generaci AI asistentů speciálně navržených pro potřeby malých podniků. Na rozdíl od běžných analytických nástrojů využívá konverzační rozhraní, které umožňuje uživatelům klást otázky o svém podnikání v přirozeném jazyce a získávat okamžité odpovědi a přehledy. Systém se propojuje s účetními softwary, POS systémy a dalšími zdroji dat, aby získal komplexní přehled o finanční situaci a obchodních operacích. Unikátní je schopnost Aideru nejen odpovídat na dotazy, ale také proaktivně upozorňovat na důležité trendy, potenciální problémy nebo příležitosti na základě analýzy dat v reálném čase.",
      pricingInfo: JSON.stringify({
        monthly: 60,
        yearly: 576,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {"name": "Starter", "price": 60, "features": ["Měsíčně", "Základní analýzy", "Standardní integrace", "Emailová podpora"]},
          {"name": "Professional", "price": 120, "features": ["Měsíčně", "Pokročilé analýzy", "Všechny integrace", "Prioritní podpora"]},
          {"name": "Premium", "price": 240, "features": ["Měsíčně", "Vlastní řešení", "Vyhrazený účet", "Telefonická podpora"]}
        ]
      }),
      videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=kqBmYaIEfCE"]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (dávka 5)...");
  
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