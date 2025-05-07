import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mediaProducts = [
  {
    externalUrl: 'https://www.vidnoz.com',
    data: {
      name: 'Vidnoz',
      description: 'AI platforma pro automatické vytváření profesionálních videí s avatary.',
      price: 900,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_8g9h0i1a2b3c4d5e6f/vidnoz.png',
      tags: 'AI Video Creation, Avatar Videos, Text to Video, Video Marketing',
      advantages: 'Rychlá tvorba videí, Přirozený hlas avatarů, Mnoho šablon, Snadné použití',
      disadvantages: 'Omezený výběr avatarů v základu, Některé pokročilé funkce jen v PRO verzi',
      detailInfo: 'Vidnoz umožňuje vytvářet profesionální videa s AI avatary pomocí jednoduchého převodu textu na video. Nabízí různé styly avatarů a hlasů.',
      pricingInfo: 'Základní verze zdarma, PRO verze od 900 Kč měsíčně.',
      videoUrls: 'https://www.youtube.com/watch?v=example1',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.pipio.io',
    data: {
      name: 'Pipio',
      description: 'AI nástroj pro automatické vytváření krátkých videí pro sociální sítě.',
      price: 750,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_9h0i1a2b3c4d5e6f7g/pipio.png',
      tags: 'Social Media Videos, Short-form Content, Video Generation, Content Marketing',
      advantages: 'Optimalizace pro sociální sítě, Automatické formátování, Rychlá produkce, Moderní šablony',
      disadvantages: 'Omezená délka videí, Méně možností customizace',
      detailInfo: 'Pipio se specializuje na vytváření krátkých, poutavých videí pro sociální sítě pomocí AI. Ideální pro marketéry a tvůrce obsahu.',
      pricingInfo: 'Od 750 Kč měsíčně, firemní plány na vyžádání.',
      videoUrls: 'https://www.youtube.com/watch?v=example2',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.colossyan.com',
    data: {
      name: 'Colossyan',
      description: 'AI platforma pro tvorbu výukových videí s realistickými avatary.',
      price: 2000,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_0i1a2b3c4d5e6f7g8h/colossyan.png',
      tags: 'E-learning Videos, AI Presenters, Training Content, Corporate Videos',
      advantages: 'Vysoce realistické avatary, Profesionální vzhled, Mnoho jazyků, Firemní přizpůsobení',
      disadvantages: 'Vyšší cena, Delší doba renderování pro kvalitní výstupy',
      detailInfo: 'Colossyan vytváří profesionální výuková videa s realistickými AI prezentátory. Vhodné pro firemní školení a e-learning.',
      pricingInfo: 'Základní plán od 2000 Kč měsíčně, enterprise řešení dle potřeb.',
      videoUrls: 'https://www.youtube.com/watch?v=example3',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.vidau.ai',
    data: {
      name: 'Vidau.ai',
      description: 'AI nástroj pro automatickou tvorbu produktových a reklamních videí.',
      price: 1200,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_1a2b3c4d5e6f7g8h9i/vidau-ai.png',
      tags: 'Product Videos, Ad Creation, E-commerce Content, Video Marketing',
      advantages: 'Specializace na produktová videa, Automatické generování z textu, Marketingové šablony',
      disadvantages: 'Omezené možnosti úprav, Zaměření především na e-commerce',
      detailInfo: 'Vidau.ai automatizuje tvorbu produktových a reklamních videí pomocí AI. Ideální pro e-shopy a online marketing.',
      pricingInfo: 'Od 1200 Kč měsíčně, množstevní slevy pro větší objemy.',
      videoUrls: 'https://www.youtube.com/watch?v=example4',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.fliki.ai',
    data: {
      name: 'Fliki',
      description: 'AI platforma pro převod textu na video s realistickým hlasem.',
      price: 800,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_2b3c4d5e6f7g8h9i0j/fliki.png',
      tags: 'Text to Video, Voice Synthesis, Content Creation, Video Generation',
      advantages: 'Přirozený hlas, Mnoho jazyků, Jednoduchý proces, Rychlé výsledky',
      disadvantages: 'Omezený výběr vizuálů v základní verzi, Standardizované šablony',
      detailInfo: 'Fliki převádí text na video s realistickým AI hlasem. Nabízí širokou škálu jazyků a hlasových stylů.',
      pricingInfo: 'Základní plán od 800 Kč měsíčně.',
      videoUrls: 'https://www.youtube.com/watch?v=example5',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.elai.io',
    data: {
      name: 'ELAI',
      description: 'AI platforma pro tvorbu videí s digitálními prezentátory.',
      price: 1500,
      category: 'video-generation',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_3c4d5e6f7g8h9i0j1k/elai.png',
      tags: 'Digital Presenters, Video Creation, AI Avatars, Business Videos',
      advantages: 'Profesionální prezentátoři, Multijazyčnost, Firemní přizpůsobení, Vysoká kvalita',
      disadvantages: 'Vyšší cena pro pokročilé funkce, Omezený počet avatarů',
      detailInfo: 'ELAI poskytuje nástroje pro vytváření videí s digitálními prezentátory. Vhodné pro firemní prezentace a vzdělávací obsah.',
      pricingInfo: 'Od 1500 Kč měsíčně, enterprise řešení na vyžádání.',
      videoUrls: 'https://www.youtube.com/watch?v=example6',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.invideo.io',
    data: {
      name: 'InVideo',
      description: 'Online platforma pro tvorbu videí s AI asistencí.',
      price: 600,
      category: 'video-editing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_4d5e6f7g8h9i0j1k2l/invideo.png',
      tags: 'Video Editing, Content Creation, Marketing Videos, Social Media',
      advantages: 'Rozsáhlá knihovna šablon, Snadné použití, Automatické přizpůsobení, Rychlá tvorba',
      disadvantages: 'Omezení v bezplatné verzi, Závislost na internetovém připojení',
      detailInfo: 'InVideo nabízí intuitivní nástroje pro tvorbu profesionálních videí s pomocí AI. Obsahuje tisíce šablon a mediálních prvků.',
      pricingInfo: 'Základní verze zdarma, business plán od 600 Kč měsíčně.',
      videoUrls: 'https://www.youtube.com/watch?v=example7',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.flexclip.com',
    data: {
      name: 'FlexClip',
      description: 'Online video editor s AI funkcemi pro rychlou tvorbu videí.',
      price: 500,
      category: 'video-editing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_5e6f7g8h9i0j1k2l3m/flexclip.png',
      tags: 'Video Editor, Content Creation, Marketing, Social Media',
      advantages: 'Jednoduchý interface, Bohatá knihovna obsahu, Rychlé zpracování, Cenově dostupné',
      disadvantages: 'Základní AI funkce, Omezená délka v bezplatné verzi',
      detailInfo: 'FlexClip je uživatelsky přívětivý online video editor s AI asistencí. Nabízí šablony a nástroje pro rychlou tvorbu videí.',
      pricingInfo: 'Základní verze zdarma, PRO od 500 Kč měsíčně.',
      videoUrls: 'https://www.youtube.com/watch?v=example8',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.faceswapper.ai',
    data: {
      name: 'FaceSwapper.ai',
      description: 'AI nástroj pro realistickou výměnu tváří ve videích.',
      price: 1000,
      category: 'video-editing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_6f7g8h9i0j1k2l3m4n/faceswapper.png',
      tags: 'Face Swap, Video Editing, AI Effects, Deep Fake',
      advantages: 'Vysoká kvalita výměny, Rychlé zpracování, Jednoduché použití, Realistické výsledky',
      disadvantages: 'Etická omezení použití, Potřeba kvalitních zdrojových materiálů',
      detailInfo: 'FaceSwapper.ai používá pokročilé AI algoritmy pro realistickou výměnu tváří ve videích. Určeno pro legální a etické použití.',
      pricingInfo: 'Od 1000 Kč měsíčně podle objemu zpracování.',
      videoUrls: 'https://www.youtube.com/watch?v=example9',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.swapanything.io',
    data: {
      name: 'SwapAnything',
      description: 'AI platforma pro výměnu objektů a pozadí ve videích.',
      price: 1200,
      category: 'video-editing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7g8h9i0j1k2l3m4n5o/swapanything.png',
      tags: 'Object Swap, Background Replacement, Video Editing, AI Effects',
      advantages: 'Univerzální použití, Pokročilé AI algoritmy, Široké možnosti úprav',
      disadvantages: 'Náročnější na výpočetní výkon, Vyšší cena pro profesionální použití',
      detailInfo: 'SwapAnything umožňuje pomocí AI měnit různé objekty a pozadí ve videích. Vhodné pro kreativní projekty a marketing.',
      pricingInfo: 'Základní plán od 1200 Kč měsíčně, PRO verze dle potřeb.',
      videoUrls: 'https://www.youtube.com/watch?v=example10',
      hasTrial: true
    }
  },
  {
    externalUrl: 'https://www.reface.app',
    data: {
      name: 'Reface',
      description: 'Mobilní aplikace pro zábavnou výměnu tváří ve videích pomocí AI.',
      price: 300,
      category: 'video-editing',
      imageUrl: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_8h9i0j1k2l3m4n5o6p/reface.png',
      tags: 'Face Swap, Mobile App, Entertainment, Social Media',
      advantages: 'Zábavné použití, Mobilní dostupnost, Rychlé výsledky, Sociální funkce',
      disadvantages: 'Omezené profesionální využití, Základní funkce editace',
      detailInfo: 'Reface je populární mobilní aplikace pro zábavnou výměnu tváří ve videích a GIFech pomocí AI. Zaměřeno na sociální sdílení.',
      pricingInfo: 'Základní funkce zdarma, PRO verze od 300 Kč měsíčně.',
      videoUrls: 'https://www.youtube.com/watch?v=example11',
      hasTrial: true
    }
  }
];

async function updateOrCreateProducts() {
  console.log('Začínám ukládat AI nástroje pro práci s videem do databáze...');

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