# 🎯 CURSOR AI - INSTRUKCE PRO PŘÍPRAVU LANDING PAGE DAT

## 📋 ÚKOL
**NE-generuj obsah! Pouze zpracuj a připrav data** pro landing page template podle této specifikace.

## 🏗️ VÝSTUPNÍ JSON STRUKTURA

```json
{
  "title": "Přesný titulek článku",
  "slug": "url-friendly-slug-bez-diakritiky", 
  "language": "cs",
  "meta": {
    "description": "SEO popis 150-160 znaků",
    "keywords": ["klíčové", "slovo", "seznam"],
    "ogImage": "URL k hlavnímu obrázku"
  },
  "contentHtml": "HTML obsah zde - viz níže",
  "visuals": {
    "comparisonTables": [],
    "pricingTables": [], 
    "featureTables": []
  }
}
```

## 🖼️ ZPRACOVÁNÍ OBRÁZKŮ

### Povinné atributy pro každý obrázek:
```html
<img src="URL_OBRÁZKU" alt="popisný alt text" title="LAYOUT_TYP" />
```

### Layout typy v title atributu:
- **`title="full-width"`** - Roztáhne na celou šířku stránky
- **`title="side-float"`** - Plovoucí obrázek vpravo s obtékáním textu
- **Bez title** - Standardní inline obrázek na středu

### Příklady použití:
```html
<!-- Hero obrázek -->
<img src="https://example.com/hero.jpg" alt="Hlavní obrázek tématu" title="full-width" />

<!-- Plovoucí obrázek -->
<img src="https://example.com/side.jpg" alt="Doplňkový obrázek" title="side-float" />

<!-- Normální obrázek -->
<img src="https://example.com/normal.jpg" alt="Ilustrace konceptu" />
```

## 📊 TABULKY - 3 TYPY

### 1. Comparison Table (comparisonTables)
```json
{
  "type": "comparison",
  "title": "Srovnání produktů/služeb",
  "subtitle": "Detailní analýza...",
  "headers": ["Funkce", "Produkt A", "Produkt B", "Produkt C"],
  "highlightColumns": [2, 3],
  "style": "modern",
  "rows": [
    {
      "feature": "Název funkce",
      "values": ["hodnota1", "hodnota2", true, "20$"],
      "type": "text|number|boolean|price|rating"
    }
  ]
}
```

### 2. Pricing Table (pricingTables)
```json
{
  "type": "pricing", 
  "title": "Cenové plány",
  "subtitle": "Najděte nejlepší poměr cena/výkon",
  "headers": ["Plán", "Free", "Pro", "Business", "Enterprise"],
  "highlightColumns": [2, 3],
  "rows": [
    {
      "feature": "Cena za měsíc",
      "values": ["Zdarma", "20 Kč", "50 Kč", "Na vyžádání"],
      "type": "price"
    }
  ]
}
```

### 3. Features Table (featureTables)  
```json
{
  "type": "features",
  "title": "Klíčové funkce",
  "subtitle": "Kompletní přehled možností", 
  "headers": ["Funkce", "Popis", "Dostupnost"],
  "rows": [
    {
      "feature": "AI asistent",
      "values": ["Inteligentní pomocník", "✓ Všechny plány"],
      "type": "text"
    }
  ]
}
```

## 📝 CONTENT HTML STRUKTURA

```html
<h1>Hlavní nadpis článku</h1>

<img src="URL" alt="Hero obrázek" title="full-width" />

<h2>Úvod</h2>
<p>Úvodní text...</p>

<img src="URL" alt="Doplňkový obrázek" title="side-float" />
<p>Text obtékající obrázek...</p>

<h2>Hlavní sekce 1</h2>
<p>Obsah sekce...</p>

<h2>Hlavní sekce 2</h2>
<p>Další obsah...</p>

<img src="URL" alt="Ilustrace" />

<h2>Závěr</h2>
<p>Závěrečné shrnutí...</p>
```

## ⚠️ KRITICKÉ POŽADAVKY

### 1. URL a slug
- **Pouze ASCII znaky, pomlčky, malá písmena**
- **Bez diakritiky**: "příklad" → "priklad"
- **Bez mezer**: "AI nástroje 2025" → "ai-nastroje-2025"

### 2. HTML formát
- **Používej HTML tagy, NE Markdown**
- **`<h1>`, `<h2>`, `<p>`, `<img>`** 
- **Minimálně 5 H2 sekcí** pro správné rozdělení obsahu

### 3. Obrázky
- **Každý obrázek MUSÍ mít alt text**
- **URL musí být validní a dostupné**
- **Rozumně rozmísti layout typy** (full-width, side-float, normální)

### 4. Tabulky
- **Vytvoř všechny 3 typy** (comparison, pricing, features)
- **Minimálně 3-5 řádků v každé tabulce**
- **Zvýrazni 1-2 sloupce** pomocí highlightColumns

### 5. SEO optimalizace
- **Title**: 50-60 znaků
- **Meta description**: 150-160 znaků  
- **Keywords**: 5-8 relevantních klíčových slov
- **Alt texty**: Popisné, ale stručné

## 📋 CHECKLIST PŘED ODESLÁNÍM

- [ ] JSON je validní a kompletní
- [ ] Všechny obrázky mají alt + title atributy
- [ ] Minimálně 5 H2 sekcí v contentHtml  
- [ ] Všechny 3 typy tabulek jsou vyplněné
- [ ] Slug je bez diakritiky a mezer
- [ ] Meta description má správnou délku
- [ ] Headers array začíná popisným sloupcem

## 🎯 VÝSTUP
**Jeden validní JSON objekt připravený k odeslání na API endpoint**

```
POST /api/landing-pages
Content-Type: application/json
```

**NEPIŠ HTML do konzole - pouze finální JSON!**