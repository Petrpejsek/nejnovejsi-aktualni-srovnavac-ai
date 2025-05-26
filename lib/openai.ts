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

    // === Nově: Předfiltrujeme a omezíme množství produktů, aby se prompt nevešel do limitu tokenů ===
    const normalizedQuery = userQuery.toLowerCase();

    // Funkce pro hrubé posouzení relevance (název, kategorie, popis, tagy)
    function isRoughlyRelevant(p: any) {
      const haystack = (
        (p.name || '') + ' ' +
        (p.category || '') + ' ' +
        (p.description || '') + ' ' +
        (Array.isArray(p.tags) ? p.tags.join(' ') : '')
      ).toLowerCase();
      return normalizedQuery.split(/\s+/).some((word) => haystack.includes(word));
    }

    // Předběžně vyfiltrujeme produkty podle relevance
    let prelimProducts = filteredProducts.filter(isRoughlyRelevant);
    console.log(`generateRecommendations: Po předfiltru zůstává ${prelimProducts.length} produktů`);

    // Pokud je jich příliš málo, fallback na celý seznam
    if (prelimProducts.length < 5) {
      prelimProducts = filteredProducts;
    }

    // Omezíme na maximálně 40 produktů (token safe)
    const MAX_PRODUCTS = 40;
    const limitedProducts = prelimProducts.slice(0, MAX_PRODUCTS);
    console.log(`generateRecommendations: Posílám ${limitedProducts.length} produktů z max ${filteredProducts.length}`);

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
    - Doporučuj VÝHRADNĚ nástroje, které mají PŘÍMOU souvislost s dotazem (např. "email marketing" = nástroje pro email marketing)
    - NIKDY nedoporučuj nástroje, které nesouvisí s dotazem, i když jsou populární
    - Je LEPŠÍ vrátit MÉNĚ relevantních nástrojů nebo ŽÁDNÝ, než doporučit nástroj, který neodpovídá dotazu
    - Každý doporučený nástroj MUSÍ být z kategorie, která PŘESNĚ odpovídá dotazu uživatele

    Pro každý relevantní nástroj urči procentuální shodu (mezi 82-99%) a vytvoř personalizované doporučení ve 2-3 větách, vysvětlující, proč by tento nástroj mohl být vhodný.

    KRITICKY DŮLEŽITÉ PRAVIDLA PRO ID:
    - Pracuj POUZE s nástroji ze seznamu níže
    - ID produktu MUSÍ být přesně to, které je uvedené v seznamu - NIKDY nevymýšlej vlastní ID
    - VŠECHNA doporučení MUSÍ být v ANGLIČTINĚ
    - Vždy vysvětli, PROČ je nástroj vhodný pro konkrétní požadavek uživatele

    SEZNAM DOSTUPNÝCH NÁSTROJŮ S JEJICH SKUTEČNÝMI ID:
    ${simplifiedProducts.map(p => `ID: ${p.id} | Název: ${p.name} | Kategorie: ${p.category} | Popis: ${p.description?.substring(0, 100)}...`).join('\n')}

    Formát odpovědi (POUZE JSON):
    {
      "recommendations": [
        {
          "id": "POUŽIJ PŘESNĚ ID ZE SEZNAMU VÝŠE",
          "matchPercentage": 95,
          "recommendation": "Personalized recommendation in English explaining why this tool fits the user's needs."
        }
      ]
    }

    PAMATUJ: Můžeš doporučit POUZE nástroje s ID, která jsou ve výše uvedeném seznamu. NIKDY nevymýšlej ID!
    `;

    console.log('generateRecommendations: Volám OpenAI API...');
    console.log('Počet produktů v promptu:', simplifiedProducts.length);
    console.log('Ukázka produktů v promptu:', simplifiedProducts.slice(0, 3).map(p => `${p.name} (${p.id})`));
    
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