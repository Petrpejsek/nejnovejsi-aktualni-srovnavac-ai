import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definice 5 dalších účetních/finančních AI nástrojů - česká verze
const accountingProducts = [
  {
    name: "H&R Block",
    description: "AI asistovaný daňový software pro jednoduché podání daní.",
    price: 850,
    category: "Finance",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/H%26R_Block_logo.svg/2560px-H%26R_Block_logo.svg.png", 
    tags: "Daně,AI,Daňové přiznání",
    advantages: "Kombinuje AI s profesionálními daňovými poradci,Nabízí garantovanou maximální vratku daní,Uživatelsky přívětivé rozhraní s podrobným průvodcem",
    disadvantages: "Prémiové funkce vyžadují dražší verze,Ne všechny složité daňové situace mohou být plně automatizovány,V základní verzi chybí některé pokročilé funkce",
    detailInfo: "H&R Block využívá umělou inteligenci k optimalizaci procesu podání daňového přiznání. Software provádí uživatele celým procesem, analyzuje daňovou situaci a identifikuje všechny možné odpočty a úlevy. Díky AI technologii dokáže rozpoznat potenciální problémy a upozornit na ně, což minimalizuje riziko chyb a auditů.",
    pricingInfo: "Základní online verze od 850 Kč ročně. Deluxe verze s rozšířenými funkcemi od 1 500 Kč ročně. Premium verze s plnou podporou a konzultacemi od 2 500 Kč ročně.",
    externalUrl: "https://www.hrblock.com",
    videoUrls: "https://www.youtube.com/watch?v=example1",
    hasTrial: true
  },
  {
    name: "Koinly",
    description: "Platforma pro výpočet daní z kryptoměn s využitím AI.",
    price: 2200,
    category: "Finance",
    imageUrl: "https://pbs.twimg.com/profile_images/1346119345429024768/8Su2d5fc_400x400.jpg", 
    tags: "Kryptoměny,Daně,AI",
    advantages: "Automatické importy transakcí z více než 350 burz a peněženek,Pokročilá AI detekce chybějících transakcí,Podpora pro daňové systémy více než 20 zemí včetně ČR",
    disadvantages: "Vyšší cena pro aktivní obchodníky s velkým počtem transakcí,Občasné problémy s importem u některých méně známých burz,Omezené funkce ve free verzi",
    detailInfo: "Koinly využívá umělou inteligenci k analýze kryptoměnových transakcí a automatizaci výpočtu daňových povinností. Platforma identifikuje různé typy transakcí (nákupy, prodeje, směny, těžbu, staking) a aplikuje správné daňové postupy. AI algoritmy pomáhají identifikovat chybějící transakce a navrhují opravy, což zajišťuje přesné daňové výkazy.",
    pricingInfo: "Free verze až do 10 transakcí. Hodináři (do 100 transakcí): 2 200 Kč ročně. Investoři (do 1000 transakcí): 4 400 Kč ročně. Obchodníci (do 3000 transakcí): 8 800 Kč ročně. Profesionálové (neomezené transakce): 22 000 Kč ročně.",
    externalUrl: "https://koinly.io",
    videoUrls: "https://www.youtube.com/watch?v=example2",
    hasTrial: true
  },
  {
    name: "Chata",
    description: "AI asistent pro analýzu firemních dat a reportování.",
    price: 750,
    category: "Finance",
    imageUrl: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/vvtayhwqgaebng7wn9iq", 
    tags: "Analýza dat,AI asistent,Finanční reporty",
    advantages: "Konverzační rozhraní pro dotazování firemních dat v přirozeném jazyce,Integrace s populárními účetními a ERP systémy,Automatické generování komplexních finančních reportů a vizualizací",
    disadvantages: "Vyžaduje kvalitní zdrojová data pro přesné analýzy,Pokročilé funkce dostupné pouze v dražších plánech,Pro malé firmy může být nákladné",
    detailInfo: "Chata je AI platforma, která umožňuje zaměstnancům a manažerům komunikovat s firemními daty přirozeným jazykem. Stačí se zeptat na finanční ukazatele, trendy nebo specifické metriky a Chata odpovídá s přesnou analýzou a vizualizacemi. Systém se učí z firemních dat a poskytuje stále relevantnější a přesnější odpovědi a predikce. Pomáhá identifikovat anomálie, trendy a příležitosti, které by mohly zůstat přehlédnuty.",
    pricingInfo: "Starter: 750 Kč měsíčně na uživatele (omezené funkce). Professional: 1 500 Kč měsíčně na uživatele (plný přístup k funkcím). Enterprise: Individuální ceny (neomezené možnosti a podpora).",
    externalUrl: "https://www.chata.ai",
    videoUrls: "https://www.youtube.com/watch?v=example3",
    hasTrial: true
  },
  {
    name: "PayPal Invoicing AI",
    description: "AI vylepšené nástroje pro fakturaci a sledování plateb.",
    price: 29, // Přibližná hodnota za standardní transakce, skutečná cena je procentuální
    category: "Finance",
    imageUrl: "https://play-lh.googleusercontent.com/bDCkDV64ZPT38q44KBEWgicFt2gDHdYPgCHbA3knlieeYpNqwmeOQM0NiQUbDKQn8Q=w240-h480-rw", 
    tags: "Fakturace,AI,Platby",
    advantages: "Automatické rozpoznávání a kategorizace výdajů,AI predikce platebního chování klientů,Intuitivní generování faktur a upomínek",
    disadvantages: "Vyšší transakční poplatky oproti některým konkurentům,Omezené možnosti přizpůsobení pro specifické obory,Některé pokročilé funkce nejsou dostupné ve všech zemích",
    detailInfo: "PayPal Invoicing AI využívá umělou inteligenci k optimalizaci fakturačního procesu. Systém dokáže automaticky vyplnit údaje na fakturách na základě předchozích transakcí, předvídat platební chování klientů a optimálně načasovat upomínky. AI také pomáhá s analýzou cash flow, identifikací problematických klientů a doporučením strategií pro zlepšení platební morálky.",
    pricingInfo: "Standardní sazba: 2,9% + 10 Kč za transakci. Pro velké objemy transakcí: snížené sazby od 1,9% + 10 Kč. PayPal Pro (s pokročilými AI funkcemi): 450 Kč měsíčně + transakční poplatky.",
    externalUrl: "https://www.paypal.com/cz/business/invoicing",
    videoUrls: "https://www.youtube.com/watch?v=example4",
    hasTrial: true
  },
  {
    name: "Scribe",
    description: "AI nástroj pro automatické dokumentování finančních procesů.",
    price: 550,
    category: "Finance",
    imageUrl: "https://techcrunch.com/wp-content/uploads/2022/10/Scribe-Logo-Navy-e1666889158350.png", 
    tags: "Dokumentace,Procesy,Automatizace",
    advantages: "Automaticky vytváří dokumentaci během práce uživatele,Šetří až 80% času při vytváření procesních manuálů,Snadné sdílení a správa dokumentace v týmu",
    disadvantages: "Vyžaduje instalaci rozšíření prohlížeče nebo desktopu,Některé složitější procesy mohou vyžadovat manuální úpravy,Omezení počtu dokumentů v základním plánu",
    detailInfo: "Scribe využívá AI k automatickému zaznamenávání pracovních postupů v účetních a finančních aplikacích. Stačí spustit nahrávání a provést postup - Scribe automaticky vytvoří podrobnou dokumentaci s textem a screenshots. Systém rozpoznává akce uživatele, optimalizuje postup a vytváří přehledné návody. To dramaticky zrychluje vytváření procesních manuálů pro finanční týmy, onboarding nových zaměstnanců a standardizaci účetních postupů.",
    pricingInfo: "Free: omezený počet Scribů (dokumentů). Pro: 550 Kč měsíčně na uživatele (neomezené Scriby, pokročilé funkce). Enterprise: Individuální ceny (pokročilá správa, zabezpečení a integrace).",
    externalUrl: "https://scribehow.com",
    videoUrls: "https://www.youtube.com/watch?v=example5",
    hasTrial: true
  }
];

/**
 * Funkce pro aktualizaci nebo vytvoření produktů v databázi
 */
async function updateOrCreateProducts() {
  console.log("Ukládám účetní a finanční AI nástroje do databáze (Česká verze - dávka 5)...");

  for (const product of accountingProducts) {
    try {
      // Zkontroluj, zda produkt s daným externalUrl již existuje
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });

      if (existingProduct) {
        // Aktualizuj existující produkt
        const updatedProduct = await prisma.product.update({
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
            pricingInfo: product.pricingInfo,
            videoUrls: product.videoUrls,
            hasTrial: product.hasTrial
          }
        });
        console.log(`✅ Aktualizováno: ${updatedProduct.name} s ID ${updatedProduct.id}`);
      } else {
        // Vytvoř nový produkt
        console.log(`Vytvářím nový produkt: ${product.name}`);
        const newProduct = await prisma.product.create({
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
            pricingInfo: product.pricingInfo,
            externalUrl: product.externalUrl,
            videoUrls: product.videoUrls,
            hasTrial: product.hasTrial
          }
        });
        console.log(`✅ Vytvořeno: ${newProduct.name} s ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`❌ Chyba při zpracování produktu ${product.name}:`, error);
    }
  }

  console.log("Všechny produkty byly úspěšně uloženy!");
}

// Spuštění funkce pro aktualizaci produktů
try {
  updateOrCreateProducts()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
} catch (error) {
  console.error("Došlo k chybě:", error);
} 