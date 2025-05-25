import { OpenAI } from 'openai';
import fs from 'fs';

// Načtení API klíče z .env souboru
const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/OPENAI_API_KEY="([^"]+)"/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

console.log('OpenAI API klíč je načtený:', apiKey ? 'Ano (klíč končí na: ' + apiKey.slice(-4) + ')' : 'Ne');

// Vytvoření klienta
const openai = new OpenAI({
  apiKey: apiKey,
});

// Jednoduchý test
async function testOpenAI() {
  try {
    console.log('Testuji volání OpenAI API...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello and respond in JSON format." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 100,
    });
    
    console.log('Odpověď z OpenAI:');
    console.log(JSON.stringify(response, null, 2));
    
    const content = response.choices[0]?.message?.content || '';
    console.log('Obsah odpovědi:');
    console.log(content);
    
    try {
      const parsedContent = JSON.parse(content);
      console.log('Úspěšně zparsováno jako JSON:');
      console.log(parsedContent);
    } catch (parseError) {
      console.error('Chyba při parsování JSON:', parseError);
    }
    
  } catch (error) {
    console.error('Chyba při volání OpenAI:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.error('Stack trace:', error.stack);
  }
}

// Spustit test
testOpenAI(); 