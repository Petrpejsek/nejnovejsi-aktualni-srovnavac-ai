# Doporučovací systém s vektorovou databází

Tento doporučovací systém využívá embeddingy a vektorovou podobnost pro efektivní vyhledávání a doporučování produktů.

## Architektura

Systém je postaven na následujících komponentách:

1. **Vektorová databáze** - Používáme PostgreSQL s JSON datovým typem pro ukládání embeddingů (může být nahrazeno specializovanou vektorovou databází)
2. **OpenAI API** - Používáme model `text-embedding-3-small` pro vytváření embeddingů a `gpt-4o-mini` pro generování doporučení
3. **Next.js API endpoints** - Endpointy pro generování doporučení a správu embeddingů

## Workflow

1. **Příprava dat**
   - Pro každý produkt v databázi vytvoříme embedding reprezentaci textu pomocí OpenAI API
   - Embeddingy ukládáme do databáze v tabulce `product_embeddings`

2. **Vyhledávání**
   - Uživatel zadá dotaz (např. "Potřebuji software pro marketingovou automatizaci")
   - Vytvoříme embedding z dotazu uživatele
   - Vyhledáme nejpodobnější produkty pomocí kosinové podobnosti s embeddingem dotazu
   - Nejpodobnější produkty posíláme do OpenAI API pro doporučení

3. **Generování doporučení**
   - OpenAI model dostane kontext nejpodobnějších produktů a dotaz uživatele
   - Model vybere nejrelevantnější produkty a vytvoří personalizovaná doporučení
   - Výsledky vracíme uživateli

## API Endpointy

### 1. `/api/recommendations`

Hlavní endpoint pro generování doporučení.

```
POST /api/recommendations
{
  "query": "string" // Dotaz uživatele
}
```

### 2. `/api/generate-embeddings`

Admin endpoint pro generování a ukládání embeddingů pro všechny produkty.

```
GET /api/generate-embeddings?key=ADMIN_API_KEY&limit=50&skip=0
```

## Použití

### Generování embeddingů

Před používáním doporučovacího systému je potřeba vygenerovat embeddingy pro všechny produkty. To můžete udělat pomocí následujícího příkazu:

```bash
# Generovat embeddingy po 50 produktech
curl "http://localhost:3000/api/generate-embeddings?key=YOUR_ADMIN_KEY&limit=50&skip=0"
curl "http://localhost:3000/api/generate-embeddings?key=YOUR_ADMIN_KEY&limit=50&skip=50"
# ...atd.
```

### Získání doporučení

```javascript
// Příklad volání API pro získání doporučení
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Potřebuji software pro marketingovou automatizaci' })
});

const data = await response.json();
console.log(data.recommendations);
```

## Výhody tohoto přístupu

1. **Rychlost** - Vektorové vyhledávání je mnohem rychlejší než textové vyhledávání
2. **Relevance** - Embeddingy zachycují sémantický význam textu, což umožňuje najít relevantní produkty i když neobsahují přesně stejná slova
3. **Škálovatelnost** - Přístup funguje efektivně i s velkým množstvím produktů
4. **Efektivita nákladů** - Generování embeddingů je jednorázový náklad, poté už nemusíme posílat všechny produkty do OpenAI API

## Další vylepšení

1. **Přechod na specializovanou vektorovou databázi** - Pro produkční nasazení doporučujeme použít specializovanou vektorovou databázi jako Pinecone, Weaviate nebo Qdrant
2. **Přidání metadat k embeddingům** - Pro ještě lepší filtrování a doporučování
3. **Fine-tuning OpenAI modelu** - Pro ještě přesnější doporučení

## Nastavení prostředí

Pro správné fungování systému je potřeba nastavit následující proměnné prostředí:

```
OPENAI_API_KEY=sk-xxx
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
ADMIN_API_KEY=your-secret-key
``` 