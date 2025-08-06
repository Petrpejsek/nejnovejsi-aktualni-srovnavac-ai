# 📊 **PROMPT PRO SROVNÁVACÍ TABULKY - CURSOR AI**

## 🎯 **JAK FEEDOVAT DATA PRO SROVNÁVACÍ TABULKY**

### **API ENDPOINT:**
```
POST /api/landing-pages
Content-Type: application/json
```

### **JSON STRUKTURA PRO TABULKY:**

```json
{
  "title": "Srovnání AI nástrojů pro generování textu",
  "slug": "srovnani-ai-nastroju-generovani-textu",
  "language": "cs",
  "contentHtml": "## Úvod\n\nToto je srovnání nejlepších AI nástrojů...\n\n## Základní informace\n\nV této sekci...",
  "keywords": ["AI nástroje", "srovnání", "generování textu"],
  "category": "AI Tools",
  
  "comparisonTables": [
    {
      "type": "comparison",
      "title": "Srovnání AI Nástrojů pro Generování Textu",
      "subtitle": "Detailní analýza funkcí a možností",
      "headers": ["Funkce", "ChatGPT", "Claude", "Gemini", "GPT-4"],
      "highlightColumns": [2, 4],
      "style": "modern",
      "rows": [
        {
          "feature": "Cena za měsíc",
          "values": ["Zdarma/20$", "Zdarma/20$", "Zdarma", "20$"],
          "type": "price",
          "highlight": [2]
        },
        {
          "feature": "Podpora češtiny",
          "values": [true, true, true, false],
          "type": "boolean"
        },
        {
          "feature": "Délka kontextu",
          "values": ["32K tokens", "200K tokens", "128K tokens", "32K tokens"],
          "type": "text",
          "highlight": [2]
        },
        {
          "feature": "Hodnocení uživatelů",
          "values": [4.5, 4.7, 4.2, 4.6],
          "type": "rating"
        },
        {
          "feature": "API přístup",
          "values": [true, true, false, true],
          "type": "boolean"
        }
      ]
    }
  ],
  
  "pricingTables": [
    {
      "type": "pricing",
      "title": "Cenové Srovnání AI Nástrojů",
      "subtitle": "Najděte nejlepší poměr cena/výkon",
      "headers": ["Plán", "ChatGPT", "Claude", "Gemini"],
      "highlightColumns": [2],
      "style": "modern",
      "rows": [
        {
          "feature": "Basic plán",
          "values": ["Zdarma", "Zdarma", "Zdarma"],
          "type": "price"
        },
        {
          "feature": "Pro plán",
          "values": [20, 20, null],
          "type": "price"
        },
        {
          "feature": "Enterprise",
          "values": ["Na vyžádání", "Na vyžádání", "Na vyžádání"],
          "type": "text"
        }
      ]
    }
  ],
  
  "featureTables": [
    {
      "type": "features",
      "title": "Srovnání Funkcí",
      "headers": ["Funkce", "Dostupnost"],
      "style": "minimal",
      "rows": [
        {
          "feature": "Generování kódu",
          "values": ["✓ Pokročilé"],
          "type": "text"
        },
        {
          "feature": "Analýza dokumentů",
          "values": ["✓ PDF, Word, Excel"],
          "type": "text"
        },
        {
          "feature": "Multimodální vstup",
          "values": ["✓ Text, obrázky, zvuk"],
          "type": "text"
        }
      ]
    }
  ]
}
```

## 🔧 **TYPY TABULEK:**

### **1. COMPARISON TABLES (comparisonTables)**
- Srovnávání produktů/služeb side-by-side
- Zvýraznění vítězných sloupců
- Různé datové typy (boolean, price, rating, text)

### **2. PRICING TABLES (pricingTables)**
- Cenové plány a tarify
- Speciální formátování pro ceny
- Zvýraznění doporučených opcí

### **3. FEATURE TABLES (featureTables)**
- Seznam funkcí a jejich popis
- Jednodušší layout
- Minimalistický styl

### **4. DATA TABLES (dataTables)**
- Obecná tabulková data
- Statistiky, čísla, fakta
- Flexibilní formátování

## 🎨 **STYLY TABULEK:**

- **"modern"** - Gradient pozadí, stíny, zaoblené rohy
- **"classic"** - Tradiční bordered tabulka
- **"minimal"** - Čisté linky, minimal design

## 📋 **DATOVÉ TYPY BUNĚK:**

- **"text"** - Obyčejný text
- **"boolean"** - Ano/Ne s barevnými čipy
- **"price"** - Automatické formátování cen (Kč)
- **"rating"** - Hodnocení s hvězdičkami
- **"number"** - Zvýrazněná čísla

## ⭐ **ZVÝRAZNĚNÍ:**

- **highlightColumns**: [2, 4] - Celé sloupce
- **row.highlight**: [1, 3] - Konkrétní buňky v řádku

## 🚀 **EXAMPLE CURL:**

```bash
curl -X POST http://localhost:3000/api/landing-pages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Srovnání AI Nástrojů 2025",
    "slug": "srovnani-ai-nastroju-2025",
    "language": "cs",
    "contentHtml": "## Úvod\n\nNejlepší AI nástroje roku 2025...",
    "keywords": ["AI", "srovnání", "nástroje"],
    "comparisonTables": [/* tabulka zde */]
  }'
```

## 💎 **SEO BENEFITS:**

- **Strukturovaná data** = lepší indexování
- **Rich snippets** v Google výsledcích  
- **Featured snippets** pro srovnání
- **Schema.org markup** automaticky
- **Vysoká CTR** díky vizuální atraktivitě

## 🎯 **PRO GEO & LLM:**

- **Lokalizované ceny** (Kč, €, $)
- **Regionální dostupnost** služeb
- **Jazyk-specifické funkce**
- **Kulturní preference** v designu
- **LLM trénink** na strukturovaných datech

---

**Tato struktura je připravená pro production! 🚀📊**