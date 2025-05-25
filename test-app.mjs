/**
 * Jednoduchý testovací skript pro API doporučení
 * 
 * Tento skript:
 * 1. Testuje /api/recommendations a /api/assistant-recommendations
 * 2. Kontroluje správné generování doporučení
 * 3. Zobrazuje chyby, pokud nějaké nastaly
 */

// Importujeme potřebné moduly
import fetch from 'node-fetch';

// Konfigurace
const BASE_URL = 'http://localhost:3000';
const TEST_QUERY = 'doporučte mi nástroj pro psaní obsahu';

async function testEndpoint(endpoint, query) {
  console.log(`\n=== Testování endpointu ${endpoint} ===`);
  
  try {
    console.log(`Odesílám dotaz: "${query}"`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    console.log(`Status odpovědi: ${response.status}`);
    
    if (!response.ok) {
      // Pokusíme se získat chybovou zprávu, pokud existuje
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData, null, 2);
      } catch (e) {
        errorText = await response.text();
      }
      
      console.error(`Endpoint ${endpoint} vrátil chybu:`);
      console.error(errorText);
      return null;
    }
    
    const data = await response.json();
    console.log(`Odpověď úspěšně přijata. Počet doporučení: ${data.recommendations?.length || 0}`);
    
    // Zobrazíme první 2 doporučení, pokud nějaká jsou
    if (data.recommendations && data.recommendations.length > 0) {
      console.log("\nUkázka doporučení:");
      
      data.recommendations.slice(0, 2).forEach((rec, index) => {
        console.log(`\n[${index + 1}] ID: ${rec.id}`);
        console.log(`Shoda: ${rec.matchPercentage}%`);
        console.log(`Text: ${rec.recommendation.substring(0, 100)}...`);
      });
    } else {
      console.log("Žádná doporučení nebyla vrácena.");
    }
    
    return data;
  } catch (error) {
    console.error(`Chyba při testování endpointu ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log("=== TESTOVÁNÍ API DOPORUČENÍ ===");
  
  // Test endpointu /api/recommendations
  const recData = await testEndpoint('/api/recommendations', TEST_QUERY);
  
  // Test endpointu /api/assistant-recommendations
  const assistantRecData = await testEndpoint('/api/assistant-recommendations', TEST_QUERY);
  
  // Porovnání výsledků
  if (recData && assistantRecData) {
    console.log("\n=== POROVNÁNÍ VÝSLEDKŮ ===");
    console.log(`/api/recommendations: ${recData.recommendations?.length || 0} doporučení`);
    console.log(`/api/assistant-recommendations: ${assistantRecData.recommendations?.length || 0} doporučení`);
    
    // Kontrola, zda ID existují v obou výsledcích
    if (recData.recommendations && assistantRecData.recommendations) {
      const recIds = new Set(recData.recommendations.map(r => r.id));
      const assistantIds = new Set(assistantRecData.recommendations.map(r => r.id));
      
      const commonIds = [...recIds].filter(id => assistantIds.has(id));
      console.log(`Společná ID: ${commonIds.length}`);
      
      if (commonIds.length === 0) {
        console.log("Není žádný průnik mezi ID - asistent pravděpodobně vrací neplatná ID.");
      }
    }
  }
  
  console.log("\n=== KONEC TESTOVÁNÍ ===");
}

// Spustíme testy
runTests(); 