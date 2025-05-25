import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Inicializace klientů
const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cesta k souboru s ID asistenta
const DATA_DIR = path.join(process.cwd(), 'data');
const ASSISTANT_ID_PATH = path.join(DATA_DIR, 'assistant-id.txt');

async function updateAssistant() {
  try {
    console.log('=== Aktualizace asistenta: Začátek ===');

    // Načteme ID asistenta
    if (!fs.existsSync(ASSISTANT_ID_PATH)) {
      throw new Error('Soubor s ID asistenta neexistuje');
    }
    const assistantId = fs.readFileSync(ASSISTANT_ID_PATH, 'utf-8').trim();
    console.log(`Aktualizace asistenta: Načteno ID asistenta: ${assistantId}`);

    // Získáme seznam produktů pro instrukce
    console.log('Aktualizace asistenta: Načítám seznam produktů...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true
      }
    });
    console.log(`Aktualizace asistenta: Načteno ${products.length} produktů`);

    // Aktualizujeme asistenta
    console.log('Aktualizace asistenta: Aktualizuji instrukce...');
    const assistant = await openai.beta.assistants.update(assistantId, {
      instructions: `
      Jsi odborný asistent napojený na vyhledávač a srovnávač AI nástrojů. Dotazy od uživatele dostáváš přes API. Máš přístup pouze k databázi nástrojů, která byla exportována a poskytnuta při integraci. Nikdy nesmíš doporučit nástroj, který není v této databázi.

      HLAVNÍ PRAVIDLA:

      1. Výběr nástrojů provádíš VÝHRADNĚ z databáze, která je ti dostupná. Nikdy nesmíš generovat ani zmiňovat smyšlené produkty.
      2. Ke každému doporučenému nástroji urči procentuální shodu (matchPercentage) na základě relevance dotazu (v rozmezí 82–99 %).
      3. Doporučení musí být personalizované (2–3 věty), na základě konkrétního dotazu a vlastností nástroje.
      4. Jazyk odpovědi se automaticky přizpůsobuje jazyku dotazu. Pokud je dotaz v češtině, odpovídej česky. Pokud ve španělštině, odpovídej španělsky atd.
      5. Výsledky seřaď podle matchPercentage od nejvyššího po nejnižší.
      6. Není stanoven žádný pevný počet doporučení – můžeš vrátit libovolný počet relevantních nástrojů.
      7. Pokud žádný nástroj nemá shodu alespoň 82 %, vrať prázdné pole recommendations.
      8. MŮŽEŠ POUŽÍVAT POUZE ID PRODUKTŮ ZE SEZNAMU NÍŽE. ŽÁDNÁ JINÁ ID NEJSOU PLATNÁ.
      9. NIKDY NEPOUŽÍVEJ ZDROJOVÉ ODKAZY ANI CITACE. Nepoužívej formáty jako 【4:2†newone data.json】 nebo podobné odkazy na soubory. Tvoje doporučení musí být čisté bez jakýchkoliv zdrojových odkazů.

      ROZSAH SHODY:

      - 92–99 % → vynikající shoda
      - 87–91 % → velmi dobrá shoda
      - 82–86 % → potenciálně užitečný nástroj

      POVINNÝ VÝSTUPNÍ FORMÁT:

      Tvoje odpověď musí být výhradně v JSON formátu, bez jakéhokoliv dalšího textu (žádné nadpisy, žádné komentáře, žádné úvodní věty, žádné zdrojové odkazy).

      Formát výstupu:

      {
        "recommendations": [
          {
            "id": "ID produktu z databáze",
            "matchPercentage": 97,
            "recommendation": "Personalizované doporučení ve stejném jazyce jako dotaz - BEZ zdrojových odkazů."
          },
          {
            "id": "Další ID produktu z databáze",
            "matchPercentage": 94,
            "recommendation": "Další personalizované doporučení - BEZ zdrojových odkazů."
          }
        ]
      }

      Pokud není k dispozici žádný vhodný nástroj:

      {
        "recommendations": []
      }

      DŮLEŽITÉ:
      - ID každého nástroje MUSÍ být z následujícího seznamu platných ID. ŽÁDNÁ JINÁ ID NEJSOU POVOLENA.
      - Nikdy nesmíš používat smyšlená nebo generická ID (jako např. "tool-1", "tool-2").
      - Nikdy neodpovídej v jiném než výše uvedeném JSON formátu.
      - NIKDY nepoužívej zdrojové odkazy, citace nebo odkazy na soubory v doporučeních.

      SEZNAM PLATNÝCH ID PRODUKTŮ:
      ${products.map(p => `- ${p.id}: ${p.name}`).join('\n')}
      `
    });

    console.log('Aktualizace asistenta: Hotovo!');
    console.log('=== Aktualizace asistenta: Konec ===');
  } catch (error) {
    console.error('Aktualizace asistenta: Chyba:', error);
    process.exit(1);
  }
}

// Spustíme aktualizaci
updateAssistant(); 