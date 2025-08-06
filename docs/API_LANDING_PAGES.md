# 🚀 Landing Pages API Documentation

## Přehled

API pro automatizované vytváření landing pages v systému Comparee.ai s plnou podporou internacionalizace (i18n) pro 5 jazyků.

### Podporované jazyky
- `cs` - Čeština (výchozí)
- `en` - English
- `de` - Deutsch
- `fr` - Français
- `es` - Español

## 📡 API Endpoint

**URL:** `POST /api/landing-pages`  
**Content-Type:** `application/json`

## 🎯 AI Farma Format (Doporučený)

### Požadavek

```json
{
  "title": "Název stránky",
  "contentHtml": "<h1>Obsah</h1><p>HTML nebo Markdown obsah...</p>",
  "keywords": ["klíčové", "slovo", "seo"],
  "language": "cs",
  "slug": "muj-unikatni-slug",
  "summary": "Krátký popis pro meta description (max 300 znaků)",
  "imageUrl": "https://example.com/image.jpg",
  "publishedAt": "2024-01-15T10:30:00.000Z",
  "category": "ai-tools",
  "faq": [
    {
      "question": "Často kladená otázka?",
      "answer": "Odpověď na otázku."
    }
  ]
}
```

### Povinná pole

| Pole | Typ | Popis |
|------|-----|-------|
| `title` | string | Název stránky (max 200 znaků) |
| `contentHtml` | string | HTML obsah (min 100 znaků doporučeno) |
| `keywords` | string[] | Klíčová slova pro SEO (max 20 doporučeno) |
| `language` | string | Kód jazyka (`cs`, `en`, `de`, `fr`, `es`) |

### Volitelná pole

| Pole | Typ | Popis |
|------|-----|-------|
| `slug` | string | URL slug (automaticky generován z title) |
| `summary` | string | Meta description (max 300 znaků) |
| `imageUrl` | string | URL obrázku |
| `publishedAt` | string | Datum publikování (ISO formát) |
| `category` | string | Kategorie stránky |
| `faq` | object[] | FAQ sekce |

### Úspěšná odpověď (201)

```json
{
  "status": "ok",
  "url": "/en/landing/muj-unikatni-slug",
  "slug": "muj-unikatni-slug"
}
```

### Chybové odpovědi

#### 422 - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    "title is required and must be a non-empty string",
    "language must be one of: cs, en, de, fr, es"
  ],
  "warnings": [
    "contentHtml is shorter than 100 characters, consider adding more content for SEO"
  ]
}
```

#### 409 - Conflict
```json
{
  "error": "Slug and language conflict",
  "details": "A landing page with slug 'test-page' and language 'en' already exists",
  "conflictingPage": {
    "title": "Existing Page Title",
    "language": "en",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🧪 Testování API

### cURL Příklady

#### Základní stránka v češtině
```bash
curl -X POST http://localhost:3000/api/landing-pages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Nástroje pro Marketing",
    "contentHtml": "<h1>Nejlepší AI nástroje</h1><p>Kompletní průvodce AI nástroji pro marketing...</p>",
    "keywords": ["ai", "marketing", "nástroje"],
    "language": "cs",
    "summary": "Objevte nejlepší AI nástroje pro marketingové kampaně",
    "faq": [
      {
        "question": "Jaké jsou nejlepší AI nástroje?",
        "answer": "K nejlepším AI nástrojům patří ChatGPT, Midjourney a další..."
      }
    ]
  }'
```

#### Anglická stránka s custom slug
```bash
curl -X POST http://localhost:3000/api/landing-pages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Best AI Tools 2024",
    "contentHtml": "<h1>Top AI Tools Guide</h1><p>Comprehensive guide to the best AI tools...</p>",
    "keywords": ["ai", "tools", "2024", "guide"],
    "language": "en",
    "slug": "best-ai-tools-2024",
    "summary": "Discover the top AI tools for 2024"
  }'
```

#### Německá stránka
```bash
curl -X POST http://localhost:3000/api/landing-pages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "KI-Tools für Unternehmen",
    "contentHtml": "<h1>Die besten KI-Tools</h1><p>Entdecken Sie die besten KI-Tools für Ihr Unternehmen...</p>",
    "keywords": ["ki", "tools", "unternehmen"],
    "language": "de",
    "summary": "Die besten KI-Tools für deutsche Unternehmen"
  }'
```

## 🌐 URL Struktura

Vytvořené stránky jsou dostupné na:
```
https://comparee.ai/{language}/landing/{slug}
```

### Příklady URL:
- `https://comparee.ai/cs/landing/ai-nastroje-marketing`
- `https://comparee.ai/en/landing/best-ai-tools-2024`
- `https://comparee.ai/de/landing/ki-tools-unternehmen`
- `https://comparee.ai/fr/landing/outils-ia-francais`
- `https://comparee.ai/es/landing/herramientas-ia-espanol`

## 🔧 Automatické funkce

### 1. Slug generování
- Automatické z `title` pokud není `slug` zadáno
- Transliterace českých znaků (ž→z, ř→r, atd.)
- Unikátnost per jazyk
- Timestamp suffix pro zajištění unikátnosti

### 2. SEO optimalizace
- Automatická meta description z `summary` nebo `contentHtml`
- OpenGraph tagy
- Twitter Card metadata
- Canonical URLs
- Language alternates pro všechny jazyky
- Strukturovaná data (JSON-LD) pro FAQ

### 3. Sitemap aktualizace
- Automatická aktualizace `sitemap.xml`
- Rate limiting (max 1x za minutu)
- Pingování Google a Bing vyhledávačů
- i18n URL podpora

### 4. Error handling
- Validace všech vstupních dat
- Konflikt detekce (duplikát slug+language)
- Graceful degradation při chybách
- Detailní error zprávy

## 📊 Monitoring & Debugging

### Listing stránek
```bash
curl "http://localhost:3000/api/landing-pages?page=1&pageSize=10"
```

### Response:
```json
{
  "landingPages": [
    {
      "id": "uuid",
      "slug": "test-page",
      "title": "Test Page",
      "language": "en",
      "metaDescription": "Test description",
      "format": "html",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## 📈 Performance

### Rate Limiting
- Sitemap update: max 1x za 60 sekund
- API requests: bez limitu (přidat dle potřeby)

### Response Times
- API vytvoření: < 1s
- Stránka render: < 200ms (production build)
- Sitemap generování: < 500ms

## 🚨 Troubleshooting

### Častá problémová místa

1. **Locale chyby**: Ujistěte se, že používáte správné locale formáty (`en-US`, ne `en_US`)
2. **Slug konflikty**: API automaticky detekuje duplikáty per jazyk
3. **Validace**: Všechna povinná pole musí být vyplněna
4. **HTML obsah**: Minimálně 100 znaků doporučeno pro SEO

### Console logy
API poskytuje detailní logy pro debugging:
```
📥 Received landing page creation request
🤖 Processing AI farma format
📋 AI Payload received: { title: "Test", hasContent: true }
💾 AI Landing page created with ID: uuid
✅ AI Landing page successfully created and published
🚀 Available at: https://comparee.ai/en/landing/test-page
```

## 🔄 Legacy Format (Backward Compatibility)

API také podporuje starší formát pro kompatibilitu:

```json
{
  "title": "Page Title",
  "language": "cs",
  "meta": {
    "description": "Meta description",
    "keywords": ["keyword1", "keyword2"]
  },
  "content_html": "<h1>Content</h1>",
  "format": "html"
}
```

## 🎉 Automatizace

Systém je připravený pro plnou automatizaci:

1. **API je stabilní** - kompletní validace a error handling
2. **Sitemap se aktualizuje automaticky** - vyhledávače jsou ping-ovány
3. **Jazykové mutace fungují** - 5 jazyků plně podporováno
4. **SEO je optimalizované** - metadata, strukturovaná data, performance
5. **Monitoring je implementován** - logy, debugging, listing API

**✅ Systém je připravený na produkční automatizované použití!**