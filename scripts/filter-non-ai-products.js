import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Klíčová slova pro identifikaci non-AI produktů
const NON_AI_KEYWORDS = [
  'gaming', 'game', 'sport', 'streaming', 'entertainment', 'music', 'video player',
  'social media', 'dating', 'shopping', 'e-commerce', 'marketplace', 'food delivery',
  'travel', 'booking', 'hotel', 'restaurant', 'fitness tracker', 'weather',
  'calculator', 'calendar', 'note taking', 'file manager', 'browser', 'email client',
  'messaging', 'chat app', 'photo editor', 'camera app', 'gallery', 'media player',
  'news reader', 'rss', 'podcast', 'radio', 'tv guide', 'sports scores',
  'stock market', 'banking', 'wallet', 'payment', 'invoice', 'accounting',
  'hardware', 'device', 'gadget', 'accessory', 'cable', 'charger'
];

// Klíčová slova pro identifikaci AI produktů
const AI_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'ai-powered', 'ai-driven',
  'neural network', 'deep learning', 'natural language processing', 'nlp',
  'computer vision', 'ai assistant', 'ai chatbot', 'ai automation',
  'ai analytics', 'ai generator', 'ai writer', 'ai tool', 'predictive analytics',
  'intelligent automation', 'smart algorithm', 'ai platform', 'ml model'
];

async function filterNonAiProducts() {
  try {
    console.log('🔍 Hledám produkty v databázi...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        detailInfo: true,
        tags: true,
        category: true
      }
    });

    console.log(`📊 Nalezeno ${products.length} produktů`);

    const nonAiProducts = [];
    const suspiciousProducts = [];

    for (const product of products) {
      const tagsText = Array.isArray(product.tags) ? product.tags.join(' ') : (product.tags || '');
      const text = `${product.name || ''} ${product.description || ''} ${product.detailInfo || ''} ${tagsText} ${product.category || ''}`.toLowerCase();
      
      // Kontrola non-AI klíčových slov
      const hasNonAiKeywords = NON_AI_KEYWORDS.some(keyword => text.includes(keyword));
      
      // Kontrola AI klíčových slov
      const hasAiKeywords = AI_KEYWORDS.some(keyword => text.includes(keyword));
      
      if (hasNonAiKeywords && !hasAiKeywords) {
        nonAiProducts.push({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          reason: 'Obsahuje non-AI klíčová slova'
        });
      } else if (!hasAiKeywords && !text.includes('ai') && !text.includes('artificial')) {
        suspiciousProducts.push({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          reason: 'Neobsahuje AI klíčová slova'
        });
      }
    }

    console.log('\n❌ NON-AI PRODUKTY K ODSTRANĚNÍ:');
    console.log('=====================================');
    nonAiProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Kategorie: ${product.category}`);
      console.log(`   Popis: ${product.description?.substring(0, 100)}...`);
      console.log(`   Důvod: ${product.reason}`);
      console.log('');
    });

    console.log('\n⚠️ PODEZŘELÉ PRODUKTY (MOŽNÁ NEJSOU AI):');
    console.log('=====================================');
    suspiciousProducts.slice(0, 20).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Kategorie: ${product.category}`);
      console.log(`   Popis: ${product.description?.substring(0, 100)}...`);
      console.log(`   Důvod: ${product.reason}`);
      console.log('');
    });

    console.log(`\n📊 STATISTIKY:`);
    console.log(`Celkem produktů: ${products.length}`);
    console.log(`Non-AI produkty: ${nonAiProducts.length}`);
    console.log(`Podezřelé produkty: ${suspiciousProducts.length}`);
    console.log(`Pravděpodobně AI produkty: ${products.length - nonAiProducts.length - suspiciousProducts.length}`);

    // Uložíme seznam non-AI produktů do souboru
    fs.writeFileSync('non-ai-products.json', JSON.stringify({
      nonAiProducts,
      suspiciousProducts: suspiciousProducts.slice(0, 50)
    }, null, 2));

    console.log('\n💾 Seznam uložen do souboru: non-ai-products.json');
    console.log('\n⚠️ DOPORUČENÍ: Zkontrolujte tyto produkty a odstraňte ty, které nejsou AI nástroje.');

  } catch (error) {
    console.error('❌ Chyba při filtrování produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

filterNonAiProducts(); 