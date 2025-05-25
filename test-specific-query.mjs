import { generateAssistantRecommendations } from './lib/assistantRecommendations.js';

async function testSpecificQuery() {
  try {
    console.log('=== TESTOVÁNÍ KONKRÉTNÍHO DOTAZU ===');
    console.log('Dotaz: "mailing and ads"');
    
    const result = await generateAssistantRecommendations('mailing and ads');
    
    console.log('=== VÝSLEDEK ===');
    console.log('Počet doporučení:', result.length);
    console.log('Doporučení:', JSON.stringify(result, null, 2));
    
    if (result.length === 0) {
      console.log('❌ Žádná doporučení nebyla vrácena!');
    } else {
      console.log('✅ Doporučení byla úspěšně vrácena');
    }
  } catch (error) {
    console.error('❌ Chyba při testování:', error);
  }
}

testSpecificQuery(); 