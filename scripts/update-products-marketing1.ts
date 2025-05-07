import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const marketingProducts = [
  {
    externalUrl: 'https://www.tapclicks.com',
    data: {
      name: 'TapClicks',
      description: 'Komplexní marketingová platforma pro analýzu dat, reporting a automatizaci marketingových aktivit.',
      price: 2000,
      category: 'marketing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_251905d781e6e80fe146b1c5d59b98c7/tapclicks.png',
      tags: 'Marketing Analytics, Reporting, Data Visualization, Marketing Automation',
      advantages: 'Sjednocuje data z různých marketingových kanálů, Pokročilé reportovací nástroje, Automatizace marketingových procesů, Přehledné dashboardy',
      disadvantages: 'Vyšší cenová kategorie, Složitější počáteční nastavení, Může být příliš komplexní pro menší firmy',
      detailInfo: 'TapClicks je všestranná marketingová platforma, která pomáhá firmám lépe porozumět jejich marketingovým datům a optimalizovat kampaně. Nabízí pokročilé analytické nástroje, automatizované reporty a intuitivní dashboardy.',
      pricingInfo: 'Cena začíná od 2000 Kč měsíčně, k dispozici jsou různé cenové plány podle potřeb firmy.',
      videoUrls: 'https://www.youtube.com/watch?v=example1',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.fullstory.com',
    data: {
      name: 'FullStory',
      description: 'Digitální analytický nástroj pro sledování chování uživatelů a optimalizaci digitálních zkušeností.',
      price: 1500,
      category: 'analytics',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_77a95f5c961f2578d1e11f9e6755e0e6/fullstory.png',
      tags: 'Digital Analytics, User Experience, Session Recording, Heatmaps',
      advantages: 'Detailní sledování chování uživatelů, Pokročilé analytické funkce, Snadná integrace, Kvalitní vizualizace dat',
      disadvantages: 'Může ovlivnit rychlost webu, Omezení v základním plánu, Vyšší cena pro větší provoz',
      detailInfo: 'FullStory poskytuje komplexní přehled o chování uživatelů na vašem webu nebo v aplikaci. Nabízí nahrávání sessions, heatmapy a pokročilé analytické nástroje pro optimalizaci uživatelské zkušenosti.',
      pricingInfo: 'Základní plán začíná na 1500 Kč měsíčně, cena se odvíjí od počtu sledovaných sessions.',
      videoUrls: 'https://www.youtube.com/watch?v=example2',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.sproutsocial.com',
    data: {
      name: 'Sprout Social',
      description: 'Platforma pro správu sociálních sítí a analýzu sociálních médií.',
      price: 1000,
      category: 'social-media',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_d4e7f5e80f26ef628f7c1142d053794d/sprout-social.png',
      tags: 'Social Media Management, Analytics, Engagement, Scheduling',
      advantages: 'Intuitivní rozhraní, Pokročilé plánovací nástroje, Komplexní analytika, Týmová spolupráce',
      disadvantages: 'Vyšší cena pro více uživatelů, Některé pokročilé funkce jen v dražších plánech, Omezený počet profilů v základním plánu',
      detailInfo: 'Sprout Social je komplexní nástroj pro správu sociálních sítí, který kombinuje publikování příspěvků, analýzu dat a engagement s komunitou v jedné platformě.',
      pricingInfo: 'Ceny začínají na 1000 Kč měsíčně za uživatele, k dispozici jsou různé plány podle potřeb.',
      videoUrls: 'https://www.youtube.com/watch?v=example3',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.reply.io',
    data: {
      name: 'Reply.io',
      description: 'Automatizační platforma pro sales outreach a email marketing.',
      price: 800,
      category: 'sales',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_6c34bc9e8d37f4444b1c60a68f59e098/reply-io.png',
      tags: 'Sales Automation, Email Marketing, Lead Generation, CRM',
      advantages: 'Pokročilá automatizace, Personalizace na vysoké úrovni, Integrace s CRM systémy, A/B testování',
      disadvantages: 'Omezení denních limitů, Může vyžadovat technické znalosti, Složitější nastavení kampaní',
      detailInfo: 'Reply.io automatizuje prodejní procesy a email marketing. Umožňuje vytvářet personalizované sekvence emailů, sledovat výsledky a optimalizovat kampaně.',
      pricingInfo: 'Základní plán začíná na 800 Kč měsíčně za uživatele, cena se odvíjí od funkcí a počtu kontaktů.',
      videoUrls: 'https://www.youtube.com/watch?v=example4',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.zapier.com',
    data: {
      name: 'Zapier',
      description: 'Automatizační platforma pro propojení různých aplikací a služeb.',
      price: 500,
      category: 'automation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_d6748b99d5ce82c5805c22f86c29baee/zapier.png',
      tags: 'Workflow Automation, Integration, Productivity, No-Code',
      advantages: 'Propojení tisíců aplikací, Bez nutnosti programování, Flexibilní automatizace, Časová úspora',
      disadvantages: 'Omezení v počtu úkolů v základním plánu, Může být drahé při velkém využití, Některé integrace mohou být pomalé',
      detailInfo: 'Zapier umožňuje automatizovat rutinní úkoly propojením různých aplikací a služeb. Vytváří automatické workflow bez nutnosti programování.',
      pricingInfo: 'Začíná na 500 Kč měsíčně, cena se odvíjí od počtu automatizovaných úkolů a funkcí.',
      videoUrls: 'https://www.youtube.com/watch?v=example5',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.chatfuel.com',
    data: {
      name: 'Chatfuel',
      description: 'Platforma pro tvorbu chatbotů pro sociální sítě a messaging platformy.',
      price: 600,
      category: 'chatbots',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_8f34c5e8f7c8e7b716c256178ed0d0f4/chatfuel.png',
      tags: 'Chatbots, Messaging, Customer Service, AI',
      advantages: 'Snadná tvorba chatbotů, Integrace se sociálními sítěmi, Analytické nástroje, Personalizace odpovědí',
      disadvantages: 'Omezené AI schopnosti, Závislost na platformách, Omezení v základním plánu',
      detailInfo: 'Chatfuel je nástroj pro vytváření chatbotů bez nutnosti programování. Pomáhá automatizovat komunikaci se zákazníky a sbírat data o interakcích.',
      pricingInfo: 'Základní plán od 600 Kč měsíčně, cena závisí na počtu uživatelů a funkcích.',
      videoUrls: 'https://www.youtube.com/watch?v=example6',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.rtbhouse.com',
    data: {
      name: 'RTB House',
      description: 'Platforma pro personalizovanou retargetingovou reklamu využívající deep learning.',
      price: 0,
      category: 'advertising',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7d12a11b89d64e3b8c99d1e9e0f7c8a2/rtb-house.png',
      tags: 'Retargeting, Programmatic Advertising, Deep Learning, Display Ads',
      advantages: 'Pokročilé AI algoritmy, Personalizované reklamy, Vysoká míra konverze, Globální dosah',
      disadvantages: 'Vyšší minimální rozpočet, Komplexní nastavení, Méně vhodné pro malé firmy',
      detailInfo: 'RTB House využívá deep learning pro vytváření vysoce efektivních retargetingových kampaní. Platforma automaticky optimalizuje reklamy pro maximální návratnost investic.',
      pricingInfo: 'Ceny jsou stanoveny individuálně podle rozpočtu a rozsahu kampaní.',
      videoUrls: 'https://www.youtube.com/watch?v=example7',
      hasTrial: false
    }
  }
];

async function updateOrCreateProducts() {
  console.log('Začínám ukládat marketingové a analytické nástroje do databáze...');

  try {
    for (const product of marketingProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });

      if (existingProduct) {
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: product.data
        });
        console.log(`✅ Aktualizován produkt: ${product.data.name}`);
      } else {
        await prisma.product.create({
          data: {
            ...product.data,
            externalUrl: product.externalUrl
          }
        });
        console.log(`✅ Vytvořen nový produkt: ${product.data.name}`);
      }
    }

    console.log('✨ Všechny produkty byly úspěšně uloženy!');
  } catch (error) {
    console.error('❌ Chyba při ukládání produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrCreateProducts(); 