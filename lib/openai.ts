import { OpenAI } from 'openai';

// Ověříme, že API klíč je načtený
console.log('OpenAI API klíč je načtený:', process.env.OPENAI_API_KEY ? 'Ano (klíč končí na: ' + process.env.OPENAI_API_KEY.slice(-4) + ')' : 'Ne');

// Vytváříme OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

/**
 * Funkce pro generování doporučení produktů na základě dotazu
 */
export async function generateRecommendations(userQuery: string, products: any[]): Promise<Recommendation[]> {
  try {
    console.log('generateRecommendations: Začátek generování', { 
      productCount: products.length, 
      query: userQuery 
    });

    // Připravíme data o produktech pro OpenAI - odstraníme problematické produkty
    const filteredProducts = products.filter(product => product.id !== '8b1ad8a1-5afb-40d4-b11d-48c33b606723');
    console.log(`generateRecommendations: Filtrováno ${products.length - filteredProducts.length} problematických produktů`);

    // Limitujeme množství produktů pro API kvůli velikosti kontextu
    const limitedProducts = filteredProducts;
    console.log(`generateRecommendations: Používám všechny (${limitedProducts.length}) produktů pro dotaz`);

    // Zjednodušíme produkty pro API
    const simplifiedProducts = limitedProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      tags: Array.isArray(product.tags) ? product.tags : [],
      advantages: Array.isArray(product.advantages) ? product.advantages : []
    }));

    // Vytvoříme seznam reálných ID pro validaci
    const validProductIds = new Set(simplifiedProducts.map(p => p.id));
    console.log(`generateRecommendations: Vytvořeno ${validProductIds.size} validních ID pro ověření`);
    console.log('Seznam validních ID:', Array.from(validProductIds));

    const prompt = `
    Uživatel hledá AI nástroj na základě následujícího požadavku:
    "${userQuery}"

    Analyzuj tento požadavek a porovnej jej s následujícími AI nástroji. Identifikuj POUZE nástroje, které PŘÍMO souvisejí s dotazem uživatele.

    KRITICKY DŮLEŽITÁ PRAVIDLA RELEVANCE:
    - Doporučuj VÝHRADNĚ nástroje, které mají PŘÍMOU souvislost s dotazem (např. "mailing and ads" = nástroje pro email marketing a reklamy)
    - NIKDY nedoporučuj nástroje, které nesouvisí s dotazem, i když jsou populární
    - Je LEPŠÍ vrátit MÉNĚ relevantních nástrojů nebo ŽÁDNÝ, než doporučit nástroj, který neodpovídá dotazu
    - Každý doporučený nástroj MUSÍ být z kategorie, která PŘESNĚ odpovídá dotazu uživatele

    Pro každý relevantní nástroj urči procentuální shodu (mezi 82-99%) a vytvoř personalizované doporučení ve 2-3 větách, vysvětlující, proč by tento nástroj mohl být vhodný.

    KRITICKY DŮLEŽITÉ PRAVIDLA:
    - Pracuj POUZE s nástroji ze seznamu níže. NIKDY nevymýšlej vlastní nástroje s ID jako "tool-1", "tool-2" apod.
    - ID produktu MUSÍ být přesně to, které je uvedené v seznamu - např. "${simplifiedProducts[0]?.id || 'example-id'}"
    - VŠECHNA doporučení MUSÍ být v ANGLIČTINĚ.
    - Doporučení by měla být personalizovaná na základě dotazu uživatele.
    - Doporučení by měla být objektivní a založená na funkcích nástroje.
    - Vždy vysvětli, PROČ je nástroj vhodný pro konkrétní požadavek uživatele.
    - Vrať seznam doporučení seřazený podle procentuální shody (od nejvyšší po nejnižší).
    - Vrať přesně ve formátu JSON, jak je uvedeno níže.
    - Pracuj VÝHRADNĚ s těmito nástroji a jejich ID:

    ${simplifiedProducts.map(p => `${p.name} (${p.category})`).join('\n')}

    Formát doporučení:
    {
      "recommendations": [
        {
          "id": "a8196ba8-6c89-4259-aca0-fbab388b201c",
          "matchPercentage": 97,
          "recommendation": "Personalized recommendation in the same language as the input query."
        },
        {
          "id": "b7d45e2c-f138-42e1-9a91-2d78af8ed323",
          "matchPercentage": 94,
          "recommendation": "Another personalized recommendation."
        }
      ]
    }

    PAMATUJ: Je LEPŠÍ nedoporučit ŽÁDNÝ nástroj, než doporučit něco, co není relevantní pro dotaz "${userQuery}".
    `;

    console.log('generateRecommendations: Volám OpenAI API...');
    
    try {
      // Voláme OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo", 
        messages: [
          { role: "system", content: "Jsi odborník na AI nástroje, který pomáhá zákazníkům najít nejvhodnější AI nástroje pro jejich potřeby. Tvým cílem je přesvědčit zákazníka o užitečnosti doporučených nástrojů. Všechna tvá doporučení musí být pouze v angličtině. MUSÍŠ odpovídat POUZE ve formátu JSON, který je specifikován v požadavku." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }, // Vracet jako JSON
        temperature: 0.5, // Nižší teplota pro konzistentnější výsledky
        max_tokens: 2000, 
      });

      console.log('generateRecommendations: Odpověď z OpenAI přijata');
      
      // Zpracujeme odpověď
      const content = response.choices[0]?.message?.content || '';
      console.log('OpenAI odpověď zkrácená:', content.substring(0, 300) + '... (zkráceno)');
      
      try {
        // Robustní parsování JSON
        let jsonContent = content;
        
        // Pokusíme se najít JSON v případě, že by obsahoval Markdown nebo jiný text
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || content.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        
        const data = JSON.parse(jsonContent);
        console.log(`generateRecommendations: Nalezeno ${data.recommendations?.length || 0} doporučení`);
        
        // Ověříme, že všechna doporučení odkazují na produkty v naší databázi
        const processedRecommendations = data.recommendations?.filter((rec: Recommendation) => {
          const validProduct = validProductIds.has(rec.id);
          if (!validProduct) {
            console.log(`generateRecommendations: Ignoruji doporučení s neexistujícím ID: ${rec.id}`);
            console.log('Toto ID není v seznamu validních ID:', Array.from(validProductIds));
          }
          return validProduct;
        }) || [];
        
        console.log(`generateRecommendations: Po filtraci zůstalo ${processedRecommendations.length} validních doporučení`);
        
        // Zajistíme, že procenta jsou v požadovaném rozsahu 82-99%
        const finalRecommendations = processedRecommendations.map((rec: Recommendation) => ({
          ...rec,
          matchPercentage: Math.min(99, Math.max(82, rec.matchPercentage))
        }));
        
        console.log(`generateRecommendations: Vracím ${finalRecommendations.length} validních doporučení`);
        return finalRecommendations;
      } catch (parseError) {
        console.error('Chyba při parsování odpovědi z OpenAI:', parseError);
        console.error('Kompletní odpověď z OpenAI:', content);
        return [];
      }
    } catch (apiError) {
      console.error('Chyba při volání OpenAI API:', apiError);
      console.error('Detaily chyby:', typeof apiError === 'object' ? JSON.stringify(apiError, null, 2) : apiError);
      if (apiError instanceof Error) {
        console.error('Error name:', apiError.name);
        console.error('Error message:', apiError.message);
        console.error('Error stack:', apiError.stack);
      }
      return [];
    }
  } catch (error) {
    console.error('Chyba při generování doporučení:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
} 