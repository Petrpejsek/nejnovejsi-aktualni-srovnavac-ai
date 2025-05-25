/**
 * Testovací skript pro ověření relevance doporučení
 * 
 * Skript testuje různé typy dotazů a kontroluje relevanci doporučených nástrojů
 */
import fetch from 'node-fetch';

// Testovací dotazy (každý z jiné kategorie)
const testQueries = [
  'Potřebuji nástroj pro psaní obsahu a textů',
  'Hledám AI pro editaci fotografií a obrázků',
  'Doporučte mi nástroj pro nahrávání a úpravu videa',
  'Potřebuji asistenta pro marketing a sociální sítě',
  'Doporučte nástroj pro e-commerce a online prodej'
];

// Funkce pro testování endpointu
async function testRecommendation(query) {
  console.log(`\n=== Test dotazu: "${query}" ===`);
  try {
    // Voláme standardní endpoint pro doporučení
    const response = await fetch('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error(`Chyba při volání API: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    // Výpis počtu doporučení
    const count = data.recommendations?.length || 0;
    console.log(`Počet doporučení: ${count}`);
    
    if (count === 0) {
      console.log("Žádná doporučení nebyla nalezena.");
      return;
    }
    
    // Výpis doporučení
    console.log("\nDoporučené nástroje:");
    data.recommendations.forEach((rec, index) => {
      console.log(`\n[${index + 1}] ${rec.product?.name || 'Unknown'} (ID: ${rec.id})`);
      console.log(`Shoda: ${rec.matchPercentage}%`);
      console.log(`Doporučení: ${rec.recommendation}`);
    });
    
    // Analýza relevance
    console.log("\nAnalýza relevance:");
    
    // Vytáhneme klíčová slova z dotazu
    const queryWords = query.toLowerCase().split(/\s+/);
    const keyWords = queryWords.filter(word => 
      word.length > 3 && 
      !['potřebuji', 'hledám', 'doporučte', 'nástroj', 'pro', 'and', 'the'].includes(word)
    );
    
    console.log(`Klíčová slova v dotazu: ${keyWords.join(', ')}`);
    
    // Kontrola, zda doporučení obsahuje klíčová slova
    let relevantCount = 0;
    data.recommendations.forEach(rec => {
      const text = rec.recommendation.toLowerCase();
      const foundKeywords = keyWords.filter(word => text.includes(word));
      const isRelevant = foundKeywords.length > 0;
      
      if (isRelevant) {
        relevantCount++;
      }
      
      console.log(`- ${rec.product?.name || 'Unknown'}: ${isRelevant ? 'Relevantní' : 'Možná nerelevantní'} (${foundKeywords.length} klíčových slov)`);
    });
    
    console.log(`\nRelevance: ${relevantCount} z ${count} doporučení (${Math.round(relevantCount / count * 100)}%)`);
    
  } catch (error) {
    console.error('Chyba při testování:', error);
  }
}

// Spuštění testů
async function runTests() {
  console.log("=== TESTOVÁNÍ RELEVANCE DOPORUČENÍ ===\n");
  
  for (const query of testQueries) {
    await testRecommendation(query);
  }
  
  console.log("\n=== TESTY DOKONČENY ===");
}

// Spustíme testy
runTests(); 