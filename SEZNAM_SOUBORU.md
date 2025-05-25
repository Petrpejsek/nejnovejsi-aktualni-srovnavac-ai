# 📁 Seznam důležitých souborů - comparee.ai

## 🔧 Konfigurační soubory

| Soubor | Popis |
|--------|-------|
| `package.json` | NPM závislosti a skripty |
| `tsconfig.json` | TypeScript konfigurace |
| `tailwind.config.js` | Tailwind CSS nastavení |
| `next.config.js` | Next.js konfigurace |
| `vercel.json` | Vercel deployment nastavení |
| `.env` | Environment variables (lokální) |
| `.gitignore` | Git ignored files |

## 🗄️ Databáze a data

| Soubor | Popis |
|--------|-------|
| `prisma/schema.prisma` | Databázové schéma |
| `prisma/seed.ts` | Počáteční data pro DB |
| `data/products.json` | Export produktů pro OpenAI |
| `data/assistant-id.txt` | ID OpenAI asistenta |
| `databaze-produkty.txt` | Backup databáze produktů |

## 🏗️ Hlavní aplikace (app/)

### 📄 Stránky

| Soubor | URL | Popis |
|--------|-----|-------|
| `app/page.tsx` | `/` | Hlavní stránka |
| `app/layout.tsx` | * | Layout pro všechny stránky |
| `app/recommendations/page.tsx` | `/recommendations` | Stránka s doporučeními AI |
| `app/products/page.tsx` | `/products` | Katalog produktů |
| `app/admin/page.tsx` | `/admin` | Admin rozhraní |
| `app/compare/page.tsx` | `/compare` | Srovnávání produktů |

### 🔌 API Endpointy

| Soubor | Endpoint | Popis |
|--------|----------|-------|
| `app/api/products/route.ts` | `/api/products` | Seznam produktů |
| `app/api/products/[id]/route.ts` | `/api/products/[id]` | Detail produktu |
| `app/api/assistant-recommendations/route.ts` | `/api/assistant-recommendations` | AI doporučení |
| `app/api/admin-products/route.ts` | `/api/admin-products` | CRUD pro admin |
| `app/api/export-products/route.ts` | `/api/export-products` | Export produktů |
| `app/api/export-csv/route.ts` | `/api/export-csv` | Export do CSV |
| `app/api/clicks/route.ts` | `/api/clicks` | Sledování kliků |

## 🎨 Komponenty (components/)

### 🔧 Hlavní komponenty

| Soubor | Popis |
|--------|-------|
| `components/AiAdvisor.tsx` | AI chatbot pro doporučení |
| `components/ProductCard.tsx` | Karta jednotlivého produktu |
| `components/ProductGrid.tsx` | Mřížka produktů |
| `components/TagFilter.tsx` | Filtrování podle tagů |
| `components/CompareBar.tsx` | Panel pro srovnávání |
| `components/Header.tsx` | Hlavička stránky |
| `components/Navbar.tsx` | Navigační menu |
| `components/Footer.tsx` | Patička stránky |

### 🎛️ UI komponenty

| Soubor | Popis |
|--------|-------|
| `components/ui/Button.tsx` | Tlačítko |
| `components/ui/Modal.tsx` | Modální okno |
| `components/ui/Input.tsx` | Vstupní pole |

### 📝 Formulářové komponenty

| Soubor | Popis |
|--------|-------|
| `components/LoginForm.tsx` | Přihlašovací formulář |
| `components/RegisterForm.tsx` | Registrační formulář |
| `components/ProductSelectionModal.tsx` | Výběr produktů |

## 📚 Knihovny (lib/)

| Soubor | Popis |
|--------|-------|
| `lib/assistantRecommendations.ts` | OpenAI Assistants API logika |
| `lib/openai.ts` | Původní OpenAI integrace |
| `lib/prisma.ts` | Databázové připojení |
| `lib/exportProducts.js` | Export produktů do JSON |
| `lib/uploadToOpenAI.ts` | Nahrání dat do OpenAI |
| `lib/scraper.ts` | Web scraping nástroje |

## 🧪 Test skripty

| Soubor | Popis |
|--------|-------|
| `test-assistant.js` | Test AI asistenta |
| `test-openai.js` | Test OpenAI připojení |
| `test-api.js` | Test API endpointů |
| `test-relevance.mjs` | Test relevance doporučení |
| `test-app.mjs` | Test celé aplikace |

## 🔄 Utility skripty

| Soubor | Popis |
|--------|-------|
| `refresh-recommendations.js` | Kompletní refresh AI systému |
| `update-assistant.js` | Aktualizace OpenAI asistenta |
| `cleanup.sh` | Čištění dočasných souborů |

## 📁 Adresářová struktura

```
comparee.ai/
├── 📁 app/                    # Next.js aplikace
│   ├── 📁 api/               # API routes
│   ├── 📁 recommendations/   # Stránka doporučení
│   ├── 📁 products/         # Katalog produktů
│   ├── 📁 admin/            # Admin rozhraní
│   └── 📄 layout.tsx        # Hlavní layout
├── 📁 components/            # React komponenty
│   ├── 📁 ui/               # Základní UI komponenty
│   └── 📄 *.tsx             # Specifické komponenty
├── 📁 lib/                  # Utility knihovny
│   ├── 📄 assistantRecommendations.ts
│   ├── 📄 openai.ts
│   └── 📄 prisma.ts
├── 📁 prisma/               # Databáze
│   ├── 📄 schema.prisma     # DB schéma
│   └── 📄 seed.ts           # Seed data
├── 📁 data/                 # Data soubory
│   ├── 📄 products.json     # Export pro OpenAI
│   └── 📄 assistant-id.txt  # ID asistenta
├── 📁 scripts/              # Utility skripty
├── 📁 backups/              # Zálohy databáze
├── 📁 public/               # Statické soubory
├── 📄 package.json          # NPM konfigurace
├── 📄 next.config.js        # Next.js konfigurace
└── 📄 tailwind.config.js    # Tailwind konfigurace
```

## 🔑 Klíčové soubory pro funkčnost

### ⭐ Nejdůležitější soubory

1. **`app/recommendations/page.tsx`** - Hlavní stránka s AI doporučeními
2. **`lib/assistantRecommendations.ts`** - Logika OpenAI asistenta
3. **`app/api/assistant-recommendations/route.ts`** - API endpoint pro doporučení
4. **`components/AiAdvisor.tsx`** - UI komponenta pro AI chat
5. **`prisma/schema.prisma`** - Databázové schéma

### 🔧 Konfigurační soubory

1. **`package.json`** - Závislosti a skripty
2. **`.env`** - Environment variables
3. **`next.config.js`** - Next.js nastavení
4. **`vercel.json`** - Deployment konfigurace

### 📊 Data a export

1. **`data/products.json`** - Data pro OpenAI (generováno)
2. **`data/assistant-id.txt`** - ID asistenta (generováno)
3. **`lib/exportProducts.js`** - Export skript
4. **`refresh-recommendations.js`** - Kompletní refresh

## 🚀 Spuštění a deployment

### Vývojové prostředí
```bash
npm install           # Instalace závislostí
npx prisma generate   # Generování DB klienta
npx prisma db push    # Aplikování schématu
npx prisma db seed    # Naplnění daty
npm run export-products # Export pro AI
npm run dev           # Spuštění dev serveru
```

### Produkční nasazení
```bash
npm run build         # Build aplikace
npm start            # Spuštění prod serveru
```

## 📝 Dokumentace

| Soubor | Popis |
|--------|-------|
| `README.md` | Základní dokumentace |
| `README-doporucovaci-system.md` | Dokumentace AI systému |
| `README-assistant.md` | Dokumentace OpenAI asistenta |
| `DOKUMENTACE_PROJEKTU.md` | Kompletní projektová dokumentace |
| `TECHNICKA_PRIRUCKA.md` | Technická příručka |
| `SEZNAM_SOUBORU.md` | Tento soubor |

## 🔍 Monitoring a logy

### Log soubory (generované)
- Console logy v browseru pro debugging
- Vercel function logs pro produkci
- OpenAI API usage logy

### Důležité cesty pro debugging
- `data/products.json` - Ověření exportu dat
- `data/assistant-id.txt` - ID asistenta
- Browser console - Detailní logy AI systému
- Network tab - API volání

---

*Seznam souborů pro comparee.ai verze 1.0.0* 