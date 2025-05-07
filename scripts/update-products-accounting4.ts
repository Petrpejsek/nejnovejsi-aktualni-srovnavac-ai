import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Účetní a finanční AI nástroje - dávka 4
const accountingProducts = [
  {
    externalUrl: "https://www.spendesk.com",
    data: {
      name: "Spendesk",
      description: "Komplexní platforma pro správu firemních výdajů, která kombinuje fyzické a virtuální platební karty s analýzou výdajů a automatizací pracovních postupů pomocí AI.",
      price: 100,
      category: "Správa výdajů a účetnictví",
      imageUrl: "https://www.spendesk.com/wp-content/themes/spendesk/dist/images/logo-spendesk.svg",
      tags: JSON.stringify(["správa výdajů", "firemní karty", "automatizace účetnictví", "finanční kontrola", "AI analýza"]),
      advantages: JSON.stringify([
        "Úplná viditelnost firemních výdajů v reálném čase",
        "Automatické párování účtenek s transakcemi",
        "Virtuální i fyzické karty s nastavitelnými limity",
        "Integrovaný schvalovací workflow pro výdaje",
        "AI detekce anomálií a nesrovnalostí",
        "Automatizované účetní procesy",
        "Integrace s populárními účetními softwary"
      ]),
      disadvantages: JSON.stringify([
        "Vyšší cena pro malé podniky",
        "Komplexní systém vyžaduje zaškolení",
        "Některé pokročilé funkce dostupné jen ve vyšších cenových plánech"
      ]),
      detailInfo: "Spendesk je all-in-one platforma pro správu firemních výdajů, která kombinuje platební karty, procesy schvalování a účetní software. Využívá AI k automatickému rozpoznávání a kategorizaci výdajů, detekci podvodů a anomálií ve výdajích, a ke generování komplexních finančních reportů. Systém umožňuje nastavení rozpočtů, limitů a pravidel pro výdaje, což poskytuje firmám lepší kontrolu nad financemi.",
      pricingInfo: JSON.stringify({
        basic: "100",
        pro: "250",
        enterprise: "500"
      }),
      videoUrls: JSON.stringify([
        "https://www.youtube.com/watch?v=exampleSpendesk"
      ]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.numbrs.ai",
    data: {
      name: "Numbrs AI",
      description: "Pokročilý finanční asistent využívající umělou inteligenci k analýze osobních financí, předpovídání cash flow a optimalizaci úspor a investic.",
      price: 10,
      category: "Osobní finance",
      imageUrl: "https://numbrs.com/assets/img/logos/numbrs-logo.svg",
      tags: JSON.stringify(["osobní finance", "finanční plánování", "rozpočtování", "AI analýza", "prediktivní modelování"]),
      advantages: JSON.stringify([
        "Komplexní přehled všech finančních účtů na jednom místě",
        "Prediktivní analýza cash flow a výdajů",
        "Personalizované tipy pro úspory založené na výdajových vzorcích",
        "Automatická kategorizace transakcí s vysokou přesností",
        "Pokročilé zabezpečení s end-to-end šifrováním",
        "Upozornění na neobvyklé výdaje a potenciální poplatky"
      ]),
      disadvantages: JSON.stringify([
        "Omezená dostupnost v některých regionech",
        "Vyžaduje přístup k bankovním účtům pro plnou funkčnost",
        "Některé analytické funkce jsou k dispozici pouze v placené verzi"
      ]),
      detailInfo: "Numbrs AI využívá pokročilé algoritmy umělé inteligence k analýze finančních dat uživatelů a poskytuje personalizované doporučení pro optimalizaci jejich financí. Aplikace se učí z výdajových vzorců uživatele a postupně zpřesňuje své predikce a doporučení. Nabízí také funkce jako je automatické rozpočtování, stanovení a sledování finančních cílů, a detailní analytické přehledy o finančním zdraví uživatele.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "10",
        enterprise: ""
      }),
      videoUrls: JSON.stringify([
        "https://www.youtube.com/watch?v=exampleNumbrs"
      ]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.candis.io",
    data: {
      name: "Candis",
      description: "Automatizovaná účetní platforma, která využívá AI k zpracování faktur, správě výdajů a automatizaci účetních procesů pro malé a střední podniky.",
      price: 39,
      category: "Účetnictví a AP automatizace",
      imageUrl: "https://www.candis.io/wp-content/themes/candis/assets/img/candis-logo.svg",
      tags: JSON.stringify(["automatizace faktur", "účetnictví", "správa výdajů", "OCR technologie", "workflow automatizace"]),
      advantages: JSON.stringify([
        "Automatické rozpoznávání a zpracování faktur pomocí AI",
        "Eliminace manuálního zadávání dat",
        "Inteligentní workflow pro schvalování faktur",
        "Automatické účtování a kategorizace",
        "Integrace s existujícími účetními systémy",
        "Úspora až 80% času při zpracování faktur"
      ]),
      disadvantages: JSON.stringify([
        "Omezená jazyková podpora pro rozpoznávání dokumentů",
        "Některé komplexní účetní operace vyžadují manuální kontrolu",
        "Počáteční nastavení a integrace může být náročnější"
      ]),
      detailInfo: "Candis je komplexní AI platforma pro automatizaci účetních procesů, která se specializuje na digitalizaci a automatizaci zpracování faktur, správu výdajů a účetnictví. Systém používá strojové učení a OCR technologii k extrakci dat z faktur, automatické kategorizaci a účtování transakcí a k vytváření efektivních schvalovacích procesů. Candis se integruje s populárními účetními softwary a bankovními systémy, což umožňuje plnou automatizaci od příjmu faktury až po její zaplacení.",
      pricingInfo: JSON.stringify({
        basic: "39",
        pro: "89",
        enterprise: "249"
      }),
      videoUrls: JSON.stringify([
        "https://www.youtube.com/watch?v=exampleCandis"
      ]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.foreceipt.com",
    data: {
      name: "Foreceipt",
      description: "Mobilní aplikace pro sledování výdajů a správu účtenek, která využívá AI k automatickému skenování, kategorizaci a organizaci finančních dokladů.",
      price: 8,
      category: "Správa výdajů a účtenek",
      imageUrl: "https://www.foreceipt.com/assets/images/logo.png",
      tags: JSON.stringify(["správa účtenek", "sledování výdajů", "daňové evidence", "mobilní aplikace", "OCR technologie"]),
      advantages: JSON.stringify([
        "Okamžité skenování a digitalizace účtenek pomocí mobilu",
        "Automatická extrakce klíčových informací z účtenek",
        "Organizace účtenek podle kategorií pro snadné daňové přiznání",
        "Cloudové úložiště pro všechny naskenované dokumenty",
        "Export dat do účetních programů a tabulek",
        "Vyhledávání mezi účtenkami podle různých kritérií"
      ]),
      disadvantages: JSON.stringify([
        "Omezené funkce v bezplatné verzi",
        "Méně pokročilé analytické nástroje ve srovnání s komplexnějšími řešeními",
        "Občasné nepřesnosti při automatickém rozpoznávání některých účtenek"
      ]),
      detailInfo: "Foreceipt je uživatelsky přívětivá aplikace pro správu účtenek a sledování výdajů, která využívá umělou inteligenci k automatizaci procesu digitalizace a kategorizace finančních dokladů. Aplikace používá OCR (optické rozpoznávání znaků) k extrakci relevantních informací jako jsou částky, data, obchodníci a kategorie výdajů. Uživatelé mohou snadno organizovat své výdaje, vytvářet reporty a exportovat data pro daňové účely. Aplikace je ideální pro freelancery, malé podnikatele a jednotlivce, kteří potřebují efektivně sledovat a spravovat své výdaje.",
      pricingInfo: JSON.stringify({
        basic: "0",
        pro: "8",
        enterprise: ""
      }),
      videoUrls: JSON.stringify([
        "https://www.youtube.com/watch?v=exampleForeceipt"
      ]),
      hasTrial: true
    }
  },
  {
    externalUrl: "https://www.finclock.io",
    data: {
      name: "FinClock",
      description: "AI-powered finanční platforma kombinující sledování času, správu projektů a automatizované fakturace pro freelancery a malé týmy.",
      price: 15,
      category: "Časové sledování a fakturace",
      imageUrl: "https://www.finclock.io/assets/logo-finclock.svg",
      tags: JSON.stringify(["časové sledování", "fakturace", "správa projektů", "automatizace fakturace", "produktivita"]),
      advantages: JSON.stringify([
        "Automatické sledování času a aktivit na projektech",
        "AI-asistované vyplňování pracovních výkazů",
        "Automatická generace faktur na základě odpracovaného času",
        "Sledování ziskovosti projektů v reálném čase",
        "Integrace s účetními a platebními systémy",
        "Uživatelsky přívětivé rozhraní pro mobilní i desktopové použití"
      ]),
      disadvantages: JSON.stringify([
        "Omezená přizpůsobitelnost šablon faktur v základním plánu",
        "Chybí některé pokročilé funkce projektového managementu",
        "Limitovaný počet integrací ve srovnání s konkurenčními řešeními"
      ]),
      detailInfo: "FinClock je moderní finanční nástroj zaměřený na efektivní sledování času, správu projektů a automatizaci fakturace. Platforma využívá umělou inteligenci k analýze pracovních návyků, automatickému doplňování časových záznamů a optimalizaci pracovních postupů. Hlavní výhodou je bezproblémový přechod od sledování času k fakturaci, kdy systém automaticky generuje faktury na základě odpracovaných hodin a sazeb. FinClock také poskytuje cenné přehledy o produktivitě, ziskovosti projektů a pomáhá identifikovat potenciální oblasti pro zlepšení efektivity.",
      pricingInfo: JSON.stringify({
        basic: "9",
        pro: "15",
        enterprise: "29"
      }),
      videoUrls: JSON.stringify([
        "https://www.youtube.com/watch?v=exampleFinClock"
      ]),
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (česká verze - dávka 4)...");
  
  for (const product of accountingProducts) {
    try {
      // Najít produkt podle externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Aktualizuji existující produkt: ${existingProduct.name}`);
        
        // Aktualizace produktu s novými daty
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Aktualizováno: ${product.data.name}`);
      } else {
        console.log(`Vytvářím nový produkt: ${product.data.name}`);
        
        // Vytvoření nového produktu
        const newProduct = await prisma.product.create({
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        
        console.log(`✅ Vytvořeno: ${product.data.name} s ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`Chyba při zpracování produktu ${product.externalUrl}:`, error);
    }
  }
  
  console.log("Všechny produkty byly úspěšně uloženy!");
}

// Spustit funkci a po dokončení odpojit Prisma klienta
updateOrCreateProducts()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 