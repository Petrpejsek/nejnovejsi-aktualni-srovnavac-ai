import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mediaProducts = [
  {
    externalUrl: 'https://www.d-id.com',
    data: {
      name: 'D-ID',
      description: 'AI platforma pro vytváření a animaci digitálních avatarů a syntetických médií.',
      price: 2500,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_d7bdee35f154e0b2f2d5fea163ca8b68/d-id.png',
      tags: 'Digital Avatars, Video Generation, AI Animation, Synthetic Media',
      advantages: 'Realistické digitální avatáry, Snadná tvorba video obsahu, Personalizace na míru, Vysoká kvalita výstupu',
      disadvantages: 'Vyšší cena pro komerční použití, Omezení v základním plánu, Náročnější na výpočetní výkon',
      detailInfo: 'D-ID využívá pokročilou AI pro vytváření realistických digitálních avatarů a videí. Umožňuje vytvářet personalizovaný video obsah s minimálním úsilím.',
      pricingInfo: 'Základní plán od 2500 Kč měsíčně, enterprise řešení dle individuální kalkulace.',
      videoUrls: 'https://www.youtube.com/watch?v=example1',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.runwayml.com',
    data: {
      name: 'Runway ML',
      description: 'Kreativní sada AI nástrojů pro editaci videa a tvorbu vizuálních efektů.',
      price: 1800,
      category: 'video-editing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_0b8f9c8d2e6d4f3a9c1e8d7f6b5a4c3e/runway-ml.png',
      tags: 'Video Editing, AI Effects, Content Creation, Visual Effects',
      advantages: 'Pokročilé AI efekty, Intuitivní rozhraní, Rychlé zpracování, Profesionální výsledky',
      disadvantages: 'Vyšší nároky na hardware, Omezení délky videa v základu, Občasné problémy se stabilitou',
      detailInfo: 'Runway ML poskytuje sadu AI nástrojů pro profesionální úpravu videa a tvorbu vizuálních efektů. Nabízí pokročilé funkce jako rotoscoping, inpainting a generování textur.',
      pricingInfo: 'Od 1800 Kč měsíčně, cena závisí na době renderování a funkcích.',
      videoUrls: 'https://www.youtube.com/watch?v=example2',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.artbreeder.com',
    data: {
      name: 'Artbreeder',
      description: 'AI platforma pro kreativní míchání a generování uměleckých obrazů.',
      price: 500,
      category: 'image-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_1c2b3a4d5e6f7g8h9i0j/artbreeder.png',
      tags: 'AI Art, Image Generation, Creative Tools, Digital Art',
      advantages: 'Unikátní míchání stylů, Neomezená kreativita, Jednoduché ovládání, Rozsáhlá komunita',
      disadvantages: 'Omezená kontrola nad detaily, Závislost na existujících obrazech, Základní export v nižší kvalitě',
      detailInfo: 'Artbreeder umožňuje umělcům kombinovat a upravovat obrázky pomocí AI. Platforma je známá svou schopností vytvářet unikátní umělecká díla mícháním různých vstupních obrazů.',
      pricingInfo: 'Základní verze zdarma, premium od 500 Kč měsíčně s pokročilými funkcemi.',
      videoUrls: 'https://www.youtube.com/watch?v=example3',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.thispersondoesnotexist.com',
    data: {
      name: 'This Person Does Not Exist',
      description: 'AI generátor realistických portrétů neexistujících osob.',
      price: 0,
      category: 'image-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_9i8h7g6f5e4d3c2b1a/this-person-does-not-exist.png',
      tags: 'AI Portraits, Face Generation, Synthetic Media, GAN',
      advantages: 'Zdarma k použití, Vysoká kvalita výstupů, Okamžité generování, Realistické výsledky',
      disadvantages: 'Bez možnosti customizace, Omezené použití pro komerční účely, Pouze portrétní fotografie',
      detailInfo: 'Využívá GAN (Generative Adversarial Network) pro vytváření fotorealistických portrétů neexistujících lidí. Každý refresh stránky vygeneruje nový unikátní portrét.',
      pricingInfo: 'Služba je zdarma k použití.',
      videoUrls: 'https://www.youtube.com/watch?v=example4',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.voicemod.net',
    data: {
      name: 'Voicemod',
      description: 'AI software pro úpravu hlasu v reálném čase.',
      price: 700,
      category: 'audio',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_2a3b4c5d6e7f8g9h0i/voicemod.png',
      tags: 'Voice Changer, Audio Effects, Real-time Processing, Streaming',
      advantages: 'Úprava hlasu v reálném čase, Široká nabídka efektů, Integrace s populárními aplikacemi, Snadné použití',
      disadvantages: 'Pouze pro Windows, Některé efekty jsou placené, Občasné problémy s latencí',
      detailInfo: 'Voicemod je populární software pro úpravu hlasu, který využívá AI pro vytváření realistických hlasových efektů. Ideální pro streamery, hráče a tvůrce obsahu.',
      pricingInfo: 'Základní verze zdarma, PRO verze od 700 Kč měsíčně.',
      videoUrls: 'https://www.youtube.com/watch?v=example5',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.lalal.ai',
    data: {
      name: 'LALAL.AI',
      description: 'AI nástroj pro separaci hudby na jednotlivé stopy.',
      price: 1000,
      category: 'audio',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_3b4c5d6e7f8g9h0i1a/lalal-ai.png',
      tags: 'Audio Separation, Stem Extraction, Music Processing, Sound Isolation',
      advantages: 'Vysoká kvalita separace, Rychlé zpracování, Podpora mnoha formátů, Zachování kvality zvuku',
      disadvantages: 'Platba za minuty zpracování, Občasné artefakty ve výstupu, Omezení velikosti souboru',
      detailInfo: 'LALAL.AI používá pokročilou AI technologii pro rozdělení hudby na vokály a instrumentální stopy. Nabízí jednu z nejkvalitnějších separací na trhu.',
      pricingInfo: 'Od 1000 Kč za 90 minut zpracování, různé balíčky dle potřeb.',
      videoUrls: 'https://www.youtube.com/watch?v=example6',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.mubert.com',
    data: {
      name: 'Mubert',
      description: 'AI platforma pro generování adaptivní hudby a zvukových krajin.',
      price: 800,
      category: 'music',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_4c5d6e7f8g9h0i1a2b/mubert.png',
      tags: 'AI Music Generation, Adaptive Audio, Soundscapes, Background Music',
      advantages: 'Nekonečný proud hudby, Přizpůsobení podle nálady, Licence pro komerční použití, API dostupnost',
      disadvantages: 'Omezená kontrola nad strukturou, Opakující se vzorce, Nemožnost exportu jednotlivých stop',
      detailInfo: 'Mubert generuje nekonečný proud hudby pomocí AI. Ideální pro vytváření pozadí pro videa, hry nebo aplikace.',
      pricingInfo: 'Základní plán od 800 Kč měsíčně, API přístup dle individuální kalkulace.',
      videoUrls: 'https://www.youtube.com/watch?v=example7',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.ampermusic.com',
    data: {
      name: 'Amper Music',
      description: 'AI kompoziční platforma pro tvorbu profesionální hudby.',
      price: 1500,
      category: 'music',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_5d6e7f8g9h0i1a2b3c/amper-music.png',
      tags: 'AI Composition, Music Creation, Soundtrack Generation, Professional Audio',
      advantages: 'Profesionální kvalita výstupu, Rozsáhlá knihovna stylů, Export do DAW, Vlastní práva k hudbě',
      disadvantages: 'Vyšší cena, Složitější ovládání, Omezení délky skladby',
      detailInfo: 'Amper Music je profesionální nástroj pro vytváření originální hudby pomocí AI. Vhodný pro filmaře, producenty a tvůrce obsahu.',
      pricingInfo: 'Od 1500 Kč měsíčně, enterprise řešení na vyžádání.',
      videoUrls: 'https://www.youtube.com/watch?v=example8',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.soundraw.io',
    data: {
      name: 'Soundraw',
      description: 'AI platforma pro generování unikátní royalty-free hudby.',
      price: 900,
      category: 'music',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_6e7f8g9h0i1a2b3c4d/soundraw.png',
      tags: 'AI Music Generation, Royalty Free, Custom Tracks, Music Production',
      advantages: 'Neomezené generování skladeb, Přizpůsobení podle žánru, Rychlé výsledky, Komerční licence',
      disadvantages: 'Omezená délka skladeb, Základní editační možnosti, Občas předvídatelné vzorce',
      detailInfo: 'Soundraw umožňuje vytvářet originální hudbu pomocí AI podle specifických parametrů. Vhodné pro tvůrce videí, podcastů a marketingový obsah.',
      pricingInfo: 'Základní plán od 900 Kč měsíčně s neomezeným generováním.',
      videoUrls: 'https://www.youtube.com/watch?v=example9',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.aiva.ai',
    data: {
      name: 'Aiva',
      description: 'AI kompoziční engine pro tvorbu emocionální hudby.',
      price: 1200,
      category: 'music',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7f8g9h0i1a2b3c4d5e/aiva.png',
      tags: 'AI Composition, Emotional Music, Soundtrack Creation, Classical Music',
      advantages: 'Vysoká kvalita kompozic, Emocionální hloubka, MIDI export, Vlastní úpravy',
      disadvantages: 'Vyšší cena pro profesionální použití, Delší doba generování, Omezené žánry',
      detailInfo: 'Aiva je specializovaná na vytváření emocionální hudby pomocí AI, především v klasickém a filmovém stylu. Vhodná pro filmy, hry a umělecké projekty.',
      pricingInfo: 'Pro verze od 1200 Kč měsíčně, business licence dle dohody.',
      videoUrls: 'https://www.youtube.com/watch?v=example10',
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log('Začínám ukládat AI nástroje pro práci s médii do databáze...');

  try {
    for (const product of mediaProducts) {
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