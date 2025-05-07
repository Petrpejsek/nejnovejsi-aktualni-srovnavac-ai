import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const marketingProducts = [
  {
    externalUrl: 'https://www.anyword.com',
    data: {
      name: 'Anyword',
      description: 'AI platforma pro generování a optimalizaci marketingového obsahu s predikcí výkonu.',
      price: 1200,
      category: 'content-creation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_d7bdee35f154e0b2f2d5fea163ca8b68/anyword.png',
      tags: 'AI Copywriting, Content Generation, Marketing Copy, Performance Prediction',
      advantages: 'Prediktivní analýza výkonu obsahu, Personalizace podle cílové skupiny, Integrace s marketingovými nástroji, A/B testování',
      disadvantages: 'Vyšší cena pro větší týmy, Může vyžadovat dodatečnou editaci, Omezení v základním plánu',
      detailInfo: 'Anyword využívá pokročilou AI pro vytváření efektivního marketingového obsahu. Unikátní je jeho schopnost předpovídat výkon obsahu před publikací a přizpůsobovat text různým cílovým skupinám.',
      pricingInfo: 'Základní plán od 1200 Kč měsíčně, cena se odvíjí od objemu generovaného obsahu a počtu uživatelů.',
      videoUrls: 'https://www.youtube.com/watch?v=example1',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.omneky.com',
    data: {
      name: 'Omneky',
      description: 'AI platforma pro personalizovanou tvorbu a optimalizaci vizuálních reklam.',
      price: 2500,
      category: 'advertising',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_0b8f9c8d2e6d4f3a9c1e8d7f6b5a4c3e/omneky.png',
      tags: 'AI Advertising, Visual Content, Personalization, Performance Analytics',
      advantages: 'Automatizovaná tvorba vizuálů, Personalizace podle cílové skupiny, Real-time optimalizace, Pokročilá analytika',
      disadvantages: 'Vyšší vstupní náklady, Komplexní nastavení, Potřeba kvalitních vstupních dat',
      detailInfo: 'Omneky používá umělou inteligenci pro vytváření a optimalizaci vizuálních reklam. Systém se učí z výkonu kampaní a automaticky upravuje design pro lepší výsledky.',
      pricingInfo: 'Cena od 2500 Kč měsíčně, individuální plány podle potřeb a objemu reklam.',
      videoUrls: 'https://www.youtube.com/watch?v=example2',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.albert.ai',
    data: {
      name: 'Albert.ai',
      description: 'AI platforma pro automatizaci a optimalizaci digitálních marketingových kampaní.',
      price: 1800,
      category: 'marketing-automation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_1c2b3a4d5e6f7g8h9i0j/albert-ai.png',
      tags: 'Marketing Automation, Campaign Optimization, AI Marketing, Performance Marketing',
      advantages: 'Autonomní optimalizace kampaní, Cross-channel marketing, Pokročilá analýza dat, Automatické testování',
      disadvantages: 'Vyšší počáteční investice, Složitější implementace, Potřeba většího rozpočtu',
      detailInfo: 'Albert.ai je autonomní marketingový systém, který samostatně optimalizuje digitální kampaně napříč kanály. Využívá strojové učení pro neustálé zlepšování výkonu a efektivity marketingových investic.',
      pricingInfo: 'Začíná na 1800 Kč měsíčně, cena závisí na marketingovém rozpočtu a počtu kanálů.',
      videoUrls: 'https://www.youtube.com/watch?v=example3',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.adobe.com/experience-cloud/genstudio.html',
    data: {
      name: 'Adobe GenStudio',
      description: 'Komplexní AI platforma pro tvorbu, správu a optimalizaci kreativního obsahu.',
      price: 3000,
      category: 'content-creation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_9i8h7g6f5e4d3c2b1a/adobe-genstudio.png',
      tags: 'Content Creation, Creative Automation, Asset Management, AI Generation',
      advantages: 'Integrace s Adobe produkty, Pokročilé AI funkce, Komplexní správa obsahu, Automatizace workflow',
      disadvantages: 'Vysoká cena, Náročnost na zaškolení, Potřeba dalších Adobe produktů',
      detailInfo: 'Adobe GenStudio kombinuje sílu umělé inteligence s osvědčenými Adobe nástroji pro tvorbu obsahu. Nabízí automatizaci rutinních úkolů a pokročilé možnosti správy digitálních aktiv.',
      pricingInfo: 'Od 3000 Kč měsíčně, cena závisí na velikosti týmu a potřebných funkcích.',
      videoUrls: 'https://www.youtube.com/watch?v=example4',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.typeface.ai',
    data: {
      name: 'Typeface.ai',
      description: 'AI platforma pro generování a personalizaci brandového obsahu.',
      price: 1500,
      category: 'content-creation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_2a3b4c5d6e7f8g9h0i/typeface-ai.png',
      tags: 'Brand Content, AI Writing, Content Personalization, Brand Management',
      advantages: 'Zachování tone of voice, Personalizace podle značky, Škálovatelná tvorba obsahu, Konzistence napříč kanály',
      disadvantages: 'Vyžaduje přesné nastavení značky, Omezení v základním plánu, Delší doba učení AI',
      detailInfo: 'Typeface.ai pomáhá značkám vytvářet konzistentní a personalizovaný obsah ve velkém měřítku. Systém se učí specifický styl a tón komunikace značky.',
      pricingInfo: 'Základní plán od 1500 Kč měsíčně, enterprise řešení dle individuální kalkulace.',
      videoUrls: 'https://www.youtube.com/watch?v=example5',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.replo.app',
    data: {
      name: 'Replo',
      description: 'No-code platforma pro tvorbu a optimalizaci e-commerce stránek s AI asistencí.',
      price: 800,
      category: 'e-commerce',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_3b4c5d6e7f8g9h0i1a/replo.png',
      tags: 'E-commerce Builder, No-Code Platform, AI Design, Website Optimization',
      advantages: 'Snadné použití bez kódování, AI asistence při designu, Optimalizace pro konverze, Rychlé nasazení',
      disadvantages: 'Omezené možnosti customizace, Závislost na platformě, Základní analytické nástroje',
      detailInfo: 'Replo umožňuje rychle vytvářet a optimalizovat e-commerce stránky s pomocí AI. Platforma nabízí předpřipravené šablony a automatické návrhy pro zlepšení konverzí.',
      pricingInfo: 'Začíná na 800 Kč měsíčně, k dispozici jsou různé plány podle velikosti e-shopu.',
      videoUrls: 'https://www.youtube.com/watch?v=example6',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.surferseo.com',
    data: {
      name: 'Surfer SEO',
      description: 'AI-powered platforma pro optimalizaci obsahu a analýzu SEO.',
      price: 900,
      category: 'seo',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_4c5d6e7f8g9h0i1a2b/surfer-seo.png',
      tags: 'SEO Optimization, Content Planning, Keyword Research, SERP Analysis',
      advantages: 'Data-driven optimalizace obsahu, Komplexní SEO analýza, Integrace s WordPress, Plánování obsahu',
      disadvantages: 'Měsíční limit analýz, Občas nepřesné metriky, Vyžaduje základní znalost SEO',
      detailInfo: 'Surfer SEO využívá umělou inteligenci pro analýzu a optimalizaci webového obsahu. Poskytuje konkrétní doporučení pro zlepšení pozic ve vyhledávání.',
      pricingInfo: 'Od 900 Kč měsíčně, cena závisí na počtu analyzovaných stránek a funkcích.',
      videoUrls: 'https://www.youtube.com/watch?v=example7',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.salesloft.com',
    data: {
      name: 'SalesLoft',
      description: 'Komplexní platforma pro sales engagement s AI funkcemi.',
      price: 2000,
      category: 'sales',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_5d6e7f8g9h0i1a2b3c/salesloft.png',
      tags: 'Sales Engagement, Sales Automation, CRM Integration, Analytics',
      advantages: 'Automatizace prodejních procesů, Personalizovaná komunikace, Integrace s CRM, Pokročilá analytika',
      disadvantages: 'Vyšší cena, Komplexní nastavení, Potřeba školení týmu',
      detailInfo: 'SalesLoft pomáhá prodejním týmům automatizovat a optimalizovat jejich procesy. Nabízí pokročilé funkce pro sledování a vyhodnocování prodejních aktivit.',
      pricingInfo: 'Základní plán od 2000 Kč měsíčně za uživatele, enterprise ceny dle domluvy.',
      videoUrls: 'https://www.youtube.com/watch?v=example8',
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log('Začínám ukládat marketingové a AI nástroje do databáze...');

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