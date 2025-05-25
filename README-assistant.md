# Assistants API pro doporučování AI nástrojů

Tento dokumentace popisuje novou implementaci doporučovacího systému využívajícího OpenAI Assistants API pro efektivnější a ekonomičtější doporučování AI nástrojů.

## Výhody řešení

1. **Nižší náklady na OpenAI API**
   - Data o produktech se nahrají jen jednou a pak se využívají opakovaně
   - Při každém dotazu se posílá jen dotaz uživatele, ne data produktů
   - Úspora až 90% nákladů na API volání

2. **Vyšší rychlost odezvy**
   - Menší velikost požadavku = rychlejší odpověď
   - Není potřeba zpracovávat velké množství dat při každém dotazu

3. **Odstranění chyb s JSON parsováním**
   - Eliminuje problém s poškozeným JSON v některých produktech
   - Více odolné proti chybám

## Použití

### 1. Příprava dat a vytvoření asistenta (jednorázově)

```bash
# Export produktů do JSON souboru
npm run export-products

# Po úspěšném exportu se produkty automaticky nahrají do OpenAI
# a vytvoří se asistent při prvním API volání
```

### 2. Používání doporučovacího API

API endpoint `/api/assistant-recommendations` se používá stejným způsobem jako původní endpoint:

```javascript
// Příklad volání API
const response = await fetch('/api/assistant-recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: "Hledám nástroj pro psaní obsahu" })
});

const data = await response.json();
const recommendations = data.recommendations;
```

## Jak to funguje

1. **Inicializace (jednorázově)**
   - Export produktů do JSON souboru v `data/products.json`
   - Vytvoření OpenAI asistenta a nahrání souboru s produkty
   - Uložení ID asistenta pro další použití

2. **Při každém doporučení**
   - Zaslání dotazu uživatele existujícímu asistentovi
   - Asistent vyhledá relevantní produkty v nahraném souboru
   - Výsledky jsou zpracovány a vráceny v jednotném formátu

## Struktura kódu

- **`/scripts/export-products.js`** - Skript pro export produktů do JSON
- **`/lib/assistantRecommendations.ts`** - Implementace Assistants API volání
- **`/app/api/assistant-recommendations/route.ts`** - API endpoint
- **`/components/AiAdvisor.tsx`** - UI komponenta používající nový endpoint
- **`/app/recommendations/page.tsx`** - Stránka s výsledky doporučení

## Potenciální vylepšení

1. **Cache pro častá doporučení**
   - Ukládání výsledků pro podobné dotazy
   - Snížení počtu volání API

2. **Pravidelná aktualizace produktových dat**
   - Vytvoření automatizovaného procesu pro aktualizaci dat
   - Skript pro opětovné nahrání dat při změnách

3. **Vylepšení vyhledávání**
   - Implementace vektorového vyhledávání pro přesnější výsledky
   - Použití embeddings pro lepší sémantické porozumění dotazům

## Řešení problémů

Pokud se vyskytnou problémy s doporučením:

1. **Ověřte existenci souboru s produkty**
   - Zkontrolujte, zda existuje soubor `data/products.json`
   - Pokud ne, spusťte `npm run export-products`

2. **Resetujte asistenta**
   - Smažte soubor `data/assistant-id.txt`
   - Při dalším volání se vytvoří nový asistent

3. **Zkontrolujte logy**
   - Sledujte konzoli pro detailní informace o průběhu volání
   - Sledujte chybové zprávy pro identifikaci problémů 