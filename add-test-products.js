#!/usr/bin/env node
/**
 * 🎯 PŘIDÁNÍ TESTOVACÍCH PRODUKTŮ
 * 
 * Přidá několik testovacích produktů do databáze pro testování funkcionalita duplicit
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testProducts = [
  {
    name: "OpenAI ChatGPT",
    description: "Pokročilý AI chatbot pro konverzace a asistenci",
    category: "AI Chatbots",
    price: 20,
    externalUrl: "https://openai.com",
    advantages: JSON.stringify(["Velmi inteligentní", "Široká znalostní báze", "Podporuje mnoho jazyků"]),
    disadvantages: JSON.stringify(["Může být drahý", "Někdy generuje nepřesné informace"]),
    hasTrial: true,
    tags: JSON.stringify(["AI", "chatbot", "OpenAI", "GPT"]),
    detailInfo: "ChatGPT je pokročilý AI model vyvinutý OpenAI",
    pricingInfo: JSON.stringify({
      plans: [
        { name: "Free", price: 0, features: ["Omezený přístup"] },
        { name: "Plus", price: 20, features: ["Unlimited přístup", "GPT-4"] }
      ]
    })
  },
  {
    name: "Claude AI",
    description: "AI asistent od Anthropic pro produktivní práci",
    category: "AI Assistants", 
    price: 20,
    externalUrl: "https://claude.ai",
    advantages: JSON.stringify(["Velmi bezpečný", "Dlouhý kontext", "Etické chování"]),
    disadvantages: JSON.stringify(["Méně známý než ChatGPT"]),
    hasTrial: true,
    tags: JSON.stringify(["AI", "assistant", "Anthropic", "Claude"]),
    detailInfo: "Claude je AI asistent zaměřený na bezpečnost a užitečnost",
    pricingInfo: JSON.stringify({
      plans: [
        { name: "Free", price: 0, features: ["Omezené použití"] },
        { name: "Pro", price: 20, features: ["Rychlejší odpovědi", "Více použití"] }
      ]
    })
  },
  {
    name: "Midjourney",
    description: "AI generátor obrázků z textových popisů",
    category: "AI Image Generation",
    price: 10,
    externalUrl: "https://midjourney.com", 
    advantages: JSON.stringify(["Vysoce kvalitní obrázky", "Kreativní výsledky", "Jednoduchá interakce"]),
    disadvantages: JSON.stringify(["Pouze přes Discord", "Placené od začátku"]),
    hasTrial: false,
    tags: JSON.stringify(["AI", "image", "generation", "art"]),
    detailInfo: "Midjourney vytváří úžasné AI obrázky prostřednictvím Discord bota",
    pricingInfo: JSON.stringify({
      plans: [
        { name: "Basic", price: 10, features: ["200 obrázků/měsíc"] },
        { name: "Standard", price: 30, features: ["Unlimited obrázky"] }
      ]
    })
  }
];

async function addTestProducts() {
  console.log('🎯 Přidávám testovací produkty do databáze...\n');
  
  try {
    for (const product of testProducts) {
      // Kontrola, zda produkt již existuje
      const existing = await prisma.product.findFirst({
        where: { externalUrl: product.externalUrl }
      });

      if (existing) {
        console.log(`⏭️  Přeskakuji ${product.name} - již existuje`);
        continue;
      }

      // Přidání nového produktu
      const newProduct = await prisma.product.create({
        data: product
      });

      console.log(`✅ Přidán: ${product.name} (ID: ${newProduct.id})`);
    }

    console.log('\n🎉 Testovací produkty byly úspěšně přidány!');
    console.log('\n💡 Nyní můžete otestovat kontrolu duplicit s následujícími URL:');
    testProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.externalUrl}`);
    });

  } catch (error) {
    console.error('❌ Chyba při přidávání produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProducts(); 