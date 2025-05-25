# 📖 Kompletní dokumentace projektu comparee.ai

## 🎯 O projektu

**comparee.ai** je moderní webová aplikace určená pro srovnávání AI nástrojů a služeb. Projekt byl vyvinut pomocí Next.js 14 s TypeScript a používá umělou inteligenci (OpenAI GPT) pro personalizovaná doporučení.

### 🌟 Hlavní funkce
- **Katalog AI nástrojů** - Přehled všech dostupných AI řešení
- **Personalizované doporučení** - AI asistent doporučí nástroje na základě konkrétních potřeb
- **Detailní srovnávání** - Porovnání funkcí, cen a výhod různých nástrojů
- **Admin rozhraní** - Správa produktů a dat
- **Responzivní design** - Optimalizováno pro všechna zařízení

## 🏗️ Technický zásobník

### Frontend
- **Next.js 14** - React framework s App Router
- **TypeScript** - Pro type-safe kód
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Správa formulářů
- **Zustand** - State management

### Backend & Databáze
- **Prisma ORM** - Databázový toolkit
- **PostgreSQL** - Produkční databáze (Vercel Postgres)
- **SQLite** - Vývojová databáze
- **OpenAI API** - Generování doporučení

### Deployment & Tools
- **Vercel** - Hostování a deployment
- **Node.js** - Runtime prostředí
- **ESLint** - Linting kódu

## 📁 Struktura projektu

```
/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpointy
│   │   ├── products/            # CRUD operace s produkty
│   │   ├── assistant-recommendations/ # AI doporučení
│   │   ├── admin-products/      # Admin API
│   │   └── ...
│   ├── recommendations/         # Stránka s doporučeními
│   ├── products/               # Stránka s produkty
│   ├── admin/                  # Admin rozhraní
│   └── ...
├── components/                  # React komponenty
│   ├── AiAdvisor.tsx           # AI chatbot komponenta
│   ├── ProductCard.tsx         # Karta produktu
│   ├── TagFilter.tsx           # Filtrování podle tagů
│   └── ...
├── lib/                        # Utility knihovny
│   ├── assistantRecommendations.ts # OpenAI Assistants API
│   ├── openai.ts              # OpenAI integrace
│   ├── prisma.ts              # Databázové připojení
│   └── ...
├── prisma/                     # Databázové schéma a seeds
│   ├── schema.prisma           # Databázové schéma
│   └── seed.ts                 # Počáteční data
├── scripts/                    # Utility skripty
├── data/                       # Data a konfigurace
└── ...
```

## 🔧 Instalace a spuštění

### Předpoklady
- Node.js 18+ 
- npm nebo yarn
- PostgreSQL databáze (pro produkci)

### 1. Klonování projektu
```bash
git clone https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai.git
cd nejnovejsi-aktualni-srovnavac-ai
```

### 2. Instalace závislostí
```bash
npm install
```

### 3. Nastavení prostředí
Vytvořte `.env` soubor podle tohoto vzoru:

```env
# Databáze
DATABASE_URL="postgresql://user:password@localhost:5432/comparee"

# OpenAI API
OPENAI_API_KEY="sk-..."

# Next.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Vercel (pro produkci)
POSTGRES_URL="..."
POSTGRES_URL_NON_POOLING="..."
```

### 4. Nastavení databáze
```bash
# Generování Prisma klienta
npx prisma generate

# Aplikování schématu
npx prisma db push

# Naplnění testovacími daty
npx prisma db seed
```

### 5. Spuštění vývojového serveru
```bash
npm run dev
```

Aplikace bude dostupná na `http://localhost:3000`

## 🤖 AI Doporučovací systém

### Přehled
Projekt využívá OpenAI Assistants API pro generování personalizovaných doporučení AI nástrojů. Systém je optimalizován pro nízké náklady a vysokou rychlost.

### Jak to funguje

1. **Export produktů** - Data se exportují do JSON souboru
2. **Nahrání do OpenAI** - JSON se nahraje jako knowledge base
3. **Vytvoření asistenta** - OpenAI asistent s přístupem k datům
4. **Generování doporučení** - Na základě dotazu uživatele
5. **Zpracování výsledků** - Mapování na konkrétní produkty

### Klíčové soubory

- `lib/assistantRecommendations.ts` - Hlavní logika AI doporučení
- `app/api/assistant-recommendations/route.ts` - API endpoint
- `lib/exportProducts.js` - Export dat pro OpenAI
- `components/AiAdvisor.tsx` - UI komponenta

### Použití

```javascript
// Volání API pro doporučení
const response = await fetch('/api/assistant-recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: "Potřebujem nástroj pro tvorbu obsahu na sociální sítě" 
  })
});

const { recommendations } = await response.json();
```

### Aktualizace systému
```bash
# Kompletní refresh doporučovacího systému
node refresh-recommendations.js

# Jen export produktů
npm run export-products

# Testování
node test-assistant.js
```

## 📊 Databázové schéma

### Product (Produkt)
```prisma
model Product {
  id          String   @id @default(uuid())
  name        String              // Název produktu
  description String?             // Krátký popis
  price       Float               // Cena
  category    String?             // Kategorie
  imageUrl    String?             // URL obrázku
  tags        String?             // Tagy (JSON array)
  advantages  String?             // Výhody (JSON array)
  disadvantages String?           // Nevýhody (JSON array)
  reviews     String?             // Recenze (JSON array)
  detailInfo  String?             // Detailní popis
  pricingInfo String?             // Cenové informace (JSON)
  videoUrls   String?             // Video URLs (JSON array)
  externalUrl String?             // Externí odkaz
  hasTrial    Boolean @default(false) // Má zkušební verzi
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Click (Sledování kliků)
```prisma
model Click {
  id         Int      @id @default(autoincrement())
  productId  String              // ID produktu
  visitorId  String              // Unikátní ID návštěvníka
  ipAddress  String?             // IP adresa
  createdAt  DateTime @default(now())
}
```

## 🎨 Komponenty

### Hlavní komponenty

**AiAdvisor.tsx** - AI chatbot
- Zpracovává dotazy uživatelů
- Zobrazuje doporučení
- Integrováno s OpenAI API

**ProductCard.tsx** - Karta produktu
- Zobrazení základních informací
- Expandable detaily
- Call-to-action tlačítka

**TagFilter.tsx** - Filtrování produktů
- Filtrování podle kategorií
- Dynamické načítání tagů
- Multi-select funkcionalita

**CompareBar.tsx** - Srovnávání produktů
- Výběr produktů k srovnání
- Floating akční panel
- Navigace na srovnávací stránku

### UI komponenty (components/ui/)
- Button, Modal, Input a další základní komponenty
- Konzistentní design system
- TypeScript typy

## 🛠️ API Endpointy

### Produkty
- `GET /api/products` - Seznam všech produktů
- `GET /api/products/[id]` - Detail produktu
- `POST /api/admin-products` - Vytvoření produktu (admin)
- `PUT /api/admin-products/[id]` - Úprava produktu (admin)
- `DELETE /api/admin-products/[id]` - Smazání produktu (admin)

### Doporučení
- `POST /api/assistant-recommendations` - AI doporučení
- `POST /api/recommendations` - Základní doporučení

### Export/Import
- `GET /api/export-products` - Export produktů
- `GET /api/export-csv` - Export do CSV
- `GET /api/export-markdown` - Export do Markdown

### Analytika
- `POST /api/clicks` - Sledování kliků

## 🚀 Deployment

### Vercel (doporučeno)

1. **Připojení repozitáře**
   - Importujte projekt z GitHub do Vercel
   - Automatická detekce Next.js

2. **Nastavení environment variables**
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   NEXTAUTH_SECRET=...
   ```

3. **Databáze**
   - Použijte Vercel Postgres
   - Nebo vlastní PostgreSQL instanci

4. **Build nastavení**
   ```json
   {
     "buildCommand": "npm run vercel-build",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

### Manuální deployment

```bash
# Build produkční verze
npm run build

# Start produkčního serveru
npm start
```

## 📈 Optimalizace a best practices

### Performance
- Image optimalizace přes Next.js Image
- API route caching
- Database indexy pro rychlé vyhledávání
- Lazy loading komponent

### SEO
- Meta tagy pro všechny stránky
- Open Graph protokol
- Strukturovaná data (JSON-LD)
- Sitemap.xml

### Security
- Environment variables pro citlivé údaje
- Input validace na API úrovni
- Rate limiting pro API
- CORS policy

### Monitoring
- Error boundary komponenty
- Console logging pro debugging
- Click tracking pro analytiku

## 🧪 Testování

### Dostupné test skripty
```bash
# Test OpenAI API připojení
node test-openai.js

# Test doporučovacího systému
node test-assistant.js

# Test API endpointů
node test-api.js

# Test relevance doporučení
node test-relevance.mjs
```

### Manuální testování
1. Funkčnost AI doporučení
2. CRUD operace s produkty
3. Responzivní design
4. Cross-browser kompatibilita

## 🔧 Údržba a aktualizace

### Pravidelné úkoly

**Aktualizace dat**
```bash
# Refresh doporučovacího systému
node refresh-recommendations.js

# Backup databáze
npm run backup
```

**Monitoring**
- Sledování API usage (OpenAI)
- Database performance
- Error logs
- User analytics

### Řešení problémů

**Časté problémy a řešení:**

1. **AI doporučení nefungují**
   - Zkontrolujte OPENAI_API_KEY
   - Ověřte existenci `data/products.json`
   - Resetujte asistenta smazáním `data/assistant-id.txt`

2. **Databázové chyby**
   - Zkontrolujte DATABASE_URL
   - Spusťte `npx prisma db push`
   - Zkontrolujte dostupnost databáze

3. **Build chyby**
   - Vyčistěte `.next` složku
   - Reinstalujte dependencies
   - Zkontrolujte TypeScript chyby

## 📚 Další vývoj

### Plánované funkce
- User authentication a profily
- Pokročilé filtrování a sorting
- Review systém od uživatelů
- Integration s dalšími AI API
- Mobile aplikace

### Možná vylepšení
- GraphQL API
- Real-time updates
- Advanced analytics
- A/B testing framework
- Multi-language support

## 📞 Podpora

### Dokumentace
- [Next.js dokumentace](https://nextjs.org/docs)
- [Prisma dokumentace](https://www.prisma.io/docs)
- [OpenAI API dokumentace](https://platform.openai.com/docs)
- [Tailwind CSS dokumentace](https://tailwindcss.com/docs)

### Kontakt
- GitHub Issues pro bug reporty
- Email: petr.pejsek@gmail.com
- Project repository: https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai

---

*Tato dokumentace byla vytvořena pro projekt comparee.ai verze 1.0.0* 