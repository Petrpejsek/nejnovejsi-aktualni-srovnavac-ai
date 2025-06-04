// Test API pro doporučení produktů
// Jednoduchý skript, který volá API a zobrazí výsledky

const fetch = require('node-fetch');

const TEST_QUERIES = [
  'marketing',
  'video',
  'restaurant',
  'social media',
  'blog'
];

const API_ENDPOINT = 'http://localhost:3000/api/recommendations';

async function testQuery(query) {
  console.log(`\n\n---- Testuji dotaz: "${query}" ----`);
  
  try {
    const startTime = Date.now();
    
    // Voláme API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      console.error(`Chyba API: ${response.status} ${response.statusText}`);
      return;
    }
    
    // Nejprve získáme textovou odpověď pro případný debugging
    const rawText = await response.text();
    
    // Zkusíme parsovat jako JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error('Chyba při parsování JSON odpovědi:', err);
      console.log('Raw odpověď:', rawText);
      return;
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Zobrazíme výsledky
    console.log(`API odpovědělo za ${duration}s`);
    
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      console.error('Chybějící pole recommendations v odpovědi nebo není pole');
      console.log('Data:', data);
      return;
    }
    
    console.log(`Počet doporučení: ${data.recommendations.length}`);
    
    // Kontrola struktury doporučení
    if (data.recommendations.length > 0) {
      const firstRec = data.recommendations[0];
      console.log('\nPrvní doporučení:');
      console.log(`- ID: ${firstRec.id}`);
      console.log(`- Match: ${firstRec.matchPercentage}%`);
      console.log(`- Doporučení: ${firstRec.recommendation}`);
      
      if (firstRec.product) {
        console.log(`- Produkt: ${firstRec.product.name}`);
        console.log(`- Kategorie: ${firstRec.product.category || 'N/A'}`);
      } else {
        console.error('CHYBA: Chybí informace o produktu!');
      }
    }
    
  } catch (err) {
    console.error('Chyba při volání API:', err);
  }
}

async function runTests() {
  console.log('===== TEST DOPORUČOVACÍHO API =====');
  console.log(`API endpoint: ${API_ENDPOINT}`);
  
  for (const query of TEST_QUERIES) {
    await testQuery(query);
  }
  
  console.log('\n===== TEST DOKONČEN =====');
}

// Spustíme testy
runTests(); 