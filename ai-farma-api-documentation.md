# AI Farma API Endpoint Documentation

## Endpoint: POST /api/landing-pages

### Popis
API endpoint pro automatickou publikaci landing pages z AI farmy. Podporuje dva formáty payloadu:
1. **AI Farma formát** (nový) - pro automatické publikování z SEO/LLM farmy
2. **Legacy formát** (zpětná kompatibilita) - původní formát

### 🤖 AI Farma Formát (Doporučený)

#### Request Payload
```json
{
  "slug": "kompletni-pruvodce-ai-nastroji-pro-e-commerce-2024",
  "title": "Kompletní průvodce AI nástroji pro e-commerce 2024",
  "summary": "Krátké shrnutí článku pro SEO",
  "contentHtml": "<h2>HTML obsah článku...</h2>",
  "imageUrl": "https://cdn.comparee.ai/images/ai-ecommerce.webp",
  "publishedAt": "2025-08-02T12:00:00Z",
  "keywords": ["AI", "e-commerce", "chatboty"],
  "category": "AI Tools",
  "faq": [
    {
      "question": "Otázka?",
      "answer": "Odpověď"
    }
  ]
}
```

#### Response (201 Created)
```json
{
  "status": "ok",
  "url": "/landing/kompletni-pruvodce-ai-nastroji-pro-e-commerce-2024"
}
```

#### Validace
- ✅ `slug` - povinný, string, musí být unikátní
- ✅ `title` - povinný, string
- ✅ `contentHtml` - povinný, string (HTML nebo Markdown)
- ✅ `keywords` - povinný, neprázdný array
- ⚪ `summary` - volitelný, string
- ⚪ `imageUrl` - volitelný, string (URL)
- ⚪ `category` - volitelný, string
- ⚪ `publishedAt` - volitelný, ISO date string
- ⚪ `faq` - volitelný, array objektů s `question` a `answer`

### 🔄 Legacy Formát (Zpětná kompatibilita)

#### Request Payload
```json
{
  "title": "Název článku",
  "slug": "volitelny-slug",
  "language": "cs",
  "meta": {
    "description": "Meta popis",
    "keywords": ["klíčová", "slova"]
  },
  "content_html": "<h2>HTML obsah...</h2>",
  "visuals": [...],
  "faq": [...],
  "schema_org": "...",
  "format": "html"
}
```

#### Response (201 Created)
```json
{
  "id": "uuid",
  "slug": "generovany-slug",
  "title": "...",
  "language": "cs",
  "contentHtml": "...",
  "metaDescription": "...",
  "metaKeywords": [...],
  "finalSlug": "generovany-slug",
  ...
}
```

### ❌ Error Responses

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": ["seznam chyb validace"]
}
```

#### 409 Conflict
```json
{
  "error": "Slug conflict",
  "details": "A landing page with slug 'example-slug' already exists"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to create landing page",
  "details": "popis chyby"
}
```

### 🔧 Automatické funkce

1. **Slug kontrola** - automatická kontrola unikátnosti
2. **Sitemap update** - automatická aktualizace sitemap.xml
3. **SEO ping** - automatické pingování Google a Bing
4. **Meta generování** - automatické generování meta description z summary/content
5. **Schema.org** - automatické generování Article, BreadcrumbList a FAQPage markup

### 🎯 Příklad použití

```bash
# AI Farma formát
curl -X POST http://localhost:3000/api/landing-pages \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-article-2024",
    "title": "Test článek 2024",
    "contentHtml": "<h2>Obsah článku</h2>",
    "keywords": ["test", "2024"]
  }'

# Legacy formát
curl -X POST http://localhost:3000/api/landing-pages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test článek",
    "language": "cs",
    "meta": {
      "description": "Test popis",
      "keywords": ["test"]
    },
    "content_html": "<h2>Obsah článku</h2>"
  }'
```

### 📊 Database Schema

```sql
-- landing_pages tabulka
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,                    -- Nové pole pro AI farmu
  language TEXT DEFAULT 'cs',
  content_html TEXT NOT NULL,
  image_url TEXT,                  -- Nové pole pro hlavní obrázek
  category TEXT,                   -- Nové pole pro kategorii
  meta_description TEXT NOT NULL,
  meta_keywords TEXT NOT NULL,     -- JSON array as text
  schema_org TEXT,                 -- JSON as text
  visuals JSONB,                   -- Array of visual objects
  faq JSONB,                       -- Array of FAQ objects
  format TEXT DEFAULT 'html',
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexy
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_language ON landing_pages(language);
CREATE INDEX idx_landing_pages_published_at ON landing_pages(published_at);
CREATE INDEX idx_landing_pages_category ON landing_pages(category);
```

### 🚀 Produkční nasazení

1. **Kapacita**: Endpoint je připraven na stovky requestů denně
2. **Validace**: Komplexní validace všech vstupních dat
3. **Error handling**: Robustní zpracování chyb s detailními odpověďmi
4. **SEO**: Automatické SEO optimalizace (meta tags, schema.org, sitemap)
5. **Kompatibilita**: Zpětná kompatibilita s legacy formátem

Endpoint je plně funkční a připravený pro produkční nasazení AI farmy! 🎉

---

## 🔧 Finální vylepšení (verze 2.0)

### Nové funkce
- ✅ **Vylepšená validace**: Comprehensive validation s warnings a detailními error messages
- ✅ **Czech transliterace**: Automatický převod diakritiky v slug (á→a, č→c, ř→r, ž→z atd.)
- ✅ **Enhanced error handling**: 422 status kódy pro validační chyby, detailní error responses
- ✅ **Performance optimizations**: Rate limiting pro sitemap (1x/min), async operations
- ✅ **SEO enhancements**: Enhanced structured data, canonical links, BreadcrumbList

### Testované scénáře ✅
- Validní AI farma payload s českými znaky a FAQ
- Nevalidní data s detailními error messages
- Konflikt slugů s 409 response a informace o existující stránce
- Legacy formát pro zpětnou kompatibilitu
- Frontend rendering s kompletním SEO a structured data

**Verze API:** 2.0  
**Datum:** 2. srpna 2025  
**Status:** ✅ Produkčně připraven pro škálování