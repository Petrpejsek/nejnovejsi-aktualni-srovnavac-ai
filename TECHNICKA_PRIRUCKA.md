# 🔧 Technická příručka - comparee.ai

## 📋 Rychlý přehled

Tato příručka obsahuje detailní technické návody pro práci s projektem comparee.ai. Je určena pro vývojáře, kteří budou projekt udržovat nebo rozšiřovat.

## 🚀 Základní nastavení

### 1. Prvotní instalace (krok za krokem)

```bash
# 1. Klonování repozitáře
git clone https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai.git
cd nejnovejsi-aktualni-srovnavac-ai

# 2. Instalace závislostí
npm install

# 3. Kopírování prostředí
cp .env.example .env  # pokud existuje, jinak vytvořte ručně

# 4. Nastavení databáze
npx prisma generate
npx prisma db push

# 5. Naplnění testovacími daty
npx prisma db seed

# 6. Export produktů pro AI
npm run export-products

# 7. Spuštění
npm run dev
```

### 2. Prostředí (.env)

**Vývojové prostředí:**
```env
# Databáze - SQLite pro vývoj
DATABASE_URL="file:./dev.db"

# OpenAI
OPENAI_API_KEY="sk-proj-abcd..."

# Next.js
NEXTAUTH_SECRET="development-secret-123"
NEXTAUTH_URL="http://localhost:3000"
```

**Produkční prostředí:**
```env
# Databáze - PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database"

# Nebo Vercel Postgres
POSTGRES_URL="postgres://default:abc123@ep-xyz.pooler.supabase.com:5432/verceldb"

# OpenAI
OPENAI_API_KEY="sk-proj-xyz..."

# Next.js
NEXTAUTH_SECRET="super-secure-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 🗄️ Práce s databází

### Základní Prisma příkazy

```bash
# Generování klienta po změně schématu
npx prisma generate

# Aplikování změn do databáze
npx prisma db push

# NIKDY NEPOUŽÍVAT: Resetování databáze (MAŽE VŠECHNA DATA!)
# npx prisma db push --force-reset  <-- NEBEZPEČNÉ! POUŽITO POUZE PRO VÝVOJ
# Místo toho použij: npx prisma migrate deploy (bezpečné pro produkci)

# Otevření databázového prohlížeče
npx prisma studio

# Naplnění počátečními daty
npx prisma db seed
```

### Úprava databázového schématu

1. **Upravte soubor `prisma/schema.prisma`**
2. **Aplikujte změny:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Příklad přidání nového pole

```prisma
model Product {
  // ... existující pole ...
  newField    String?    // Přidání nového pole
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Zálohování a obnovení

```bash
# Zálohování databáze
npm run backup

# Obnovení ze zálohy
npm run restore
```

## 🤖 AI Doporučovací systém

### Architektura systému

```
Uživatelský dotaz
       ↓
API endpoint (/api/assistant-recommendations)
       ↓
assistantRecommendations.ts
       ↓
OpenAI Assistants API
       ↓
Zpracování odpovědi
       ↓
Mapování na produkty z databáze
       ↓
Vrácení výsledků
```

### Kompletní refresh systému

```bash
# Kompletní obnovení doporučovacího systému
node refresh-recommendations.js
```

Tento skript provede:
1. Opravu problematických produktů v DB
2. Export produktů do JSON
3. Nahrání do OpenAI
4. Vytvoření/aktualizaci asistenta
5. Test funkčnosti

### Manuální kroky

```bash
# 1. Export produktů
npm run export-products

# 2. Test funkčnosti
node test-assistant.js

# 3. Ověření datového souboru
ls -la data/products.json
cat data/assistant-id.txt
```

### Debugging AI systému

**Časté problémy:**

1. **Assistant nefunguje**
   ```bash
   # Resetování asistenta
   rm data/assistant-id.txt
   
   # Nový export a test
   npm run export-products
   node test-assistant.js
   ```

2. **Špatná ID produktů**
   ```bash
   # Oprava dat v databázi
   node scripts/fix-products.js
   
   # Re-export
   npm run export-products
   ```

3. **OpenAI API chyby**
   ```bash
   # Test připojení
   node test-openai.js
   
   # Ověření API klíče
   echo $OPENAI_API_KEY
   ```

## 📊 Správa produktů

### Přidání nového produktu (API)

```javascript
const newProduct = {
  name: "Název nástroje",
  description: "Krátký popis",
  price: 29.99,
  category: "Text Generation",
  imageUrl: "https://example.com/image.jpg",
  tags: ["AI", "Writing", "Content"],
  advantages: ["Rychlé", "Jednoduché"],
  disadvantages: ["Drahé"],
  externalUrl: "https://example.com",
  hasTrial: true
};

// POST na /api/admin-products
const response = await fetch('/api/admin-products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProduct)
});
```

### Hromadný import/export

```bash
# Export všech produktů
GET /api/export-products

# Export jako CSV
GET /api/export-csv

# Export jako Markdown
GET /api/export-markdown
```

### Admin rozhraní

- URL: `http://localhost:3000/admin`
- Funkcionalita:
  - CRUD operace s produkty
  - Náhled změn
  - Hromadné operace

## 🔧 API Endpointy

### Produkty

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/api/products` | Seznam produktů |
| GET | `/api/products/[id]` | Detail produktu |
| POST | `/api/admin-products` | Vytvoření |
| PUT | `/api/admin-products/[id]` | Úprava |
| DELETE | `/api/admin-products/[id]` | Smazání |

### Doporučení

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/assistant-recommendations` | AI doporučení |
| POST | `/api/recommendations` | Základní doporučení |

### Příklady volání API

**Získání produktů s filtrováním:**
```javascript
const response = await fetch('/api/products?category=Text+Generation&limit=10');
const products = await response.json();
```

**AI doporučení:**
```javascript
const response = await fetch('/api/assistant-recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: "Potřebuji nástroj pro psaní článků" 
  })
});
const { recommendations } = await response.json();
```

## 🎨 Frontend vývoj

### Struktura komponent

```
components/
├── ui/                 # Základní UI komponenty
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Input.tsx
├── AiAdvisor.tsx      # AI chatbot
├── ProductCard.tsx    # Karta produktu
├── TagFilter.tsx      # Filtrování
└── CompareBar.tsx     # Srovnávání
```

### Styling a Tailwind CSS

**Klíčové CSS třídy:**
```css
.text-gradient-primary {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #6366f1, #ec4899);
}

.hover-gradient-primary:hover {
  background: linear-gradient(135deg, #5855eb, #db2777);
}
```

**Responzivní design:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Obsah */}
</div>
```

### State management (Zustand)

```typescript
// store/useStore.ts
import { create } from 'zustand'

interface State {
  products: Product[]
  selectedItems: Set<string>
  setProducts: (products: Product[]) => void
  addToSelected: (id: string) => void
}

export const useStore = create<State>((set) => ({
  products: [],
  selectedItems: new Set(),
  setProducts: (products) => set({ products }),
  addToSelected: (id) => set((state) => ({
    selectedItems: new Set([...state.selectedItems, id])
  }))
}))
```

### TypeScript typy

```typescript
// types/index.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category?: string
  tags?: string[]
  advantages?: string[]
  disadvantages?: string[]
  hasTrial?: boolean
  externalUrl?: string
}

export interface Recommendation {
  id: string
  matchPercentage: number
  recommendation: string
  product: Product
}
```

## 🚀 Deployment

### Vercel nasazení

1. **Připojení repozitáře:**
   - Jděte na [vercel.com](https://vercel.com)
   - Import from GitHub
   - Vyberte repozitář

2. **Environment variables:**
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   NEXTAUTH_SECRET=xyz...
   ```

3. **Build settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build`
   - Install Command: `npm install`

### Ruční deployment

```bash
# 1. Build aplikace
npm run build

# 2. Test build lokálně
npm start

# 3. Deploy na server
# Zkopírujte složky: .next, public, package.json
# Spusťte: npm install --production && npm start
```

### Databáze na produkci

**Vercel Postgres:**
1. Jděte do Vercel dashboard
2. Storage → Create Database
3. Zkopírujte connection string

**Externí PostgreSQL:**
1. Vytvořte databázi
2. Nastavte DATABASE_URL
3. Spusťte migrace: `npx prisma db push`

## 🔍 Monitoring a debugging

### Logy pro AI systém

```javascript
// V lib/assistantRecommendations.ts jsou detailní logy:
console.log('🔥 fetchRecommendations: Začínám s query:', query);
console.log('🔥 fetchRecommendations: OpenAI vrátil doporučení:', recsRaw.length);
```

### Error handling

```javascript
// Základní error boundary
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Performance monitoring

```bash
# Bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Přidejte do next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)

# Spusťte analýzu:
ANALYZE=true npm run build
```

## 🧪 Testování

### Test skripty

```bash
# Test OpenAI připojení
node test-openai.js

# Test AI asistenta
node test-assistant.js

# Test API endpoints
node test-api.js

# Test relevance doporučení
node test-relevance.mjs
```

### Manuální testování

**Checklist před release:**
- [ ] AI doporučení fungují
- [ ] Všechny produkty se načítají
- [ ] Admin rozhraní funguje
- [ ] Responzivní design
- [ ] SEO meta tagy
- [ ] Performance (< 3s load time)

### Unit testy (budoucí rozšíření)

```bash
# Instalace Jest
npm install --save-dev jest @types/jest

# Příklad testu
describe('Product API', () => {
  test('should return products', async () => {
    const products = await fetch('/api/products');
    expect(products.status).toBe(200);
  });
});
```

## 🛠️ Maintenance

### Pravidelné úkoly

**Denně:**
- Zkontrolovat OpenAI API usage
- Sledovat error logy

**Týdně:**
- Zálohovat databázi: `npm run backup`
- Aktualizovat dependencies: `npm update`

**Měsíčně:**
- Refresh AI asistenta: `node refresh-recommendations.js`
- Kontrola performance
- Bezpečnostní aktualizace

### Upgrade závislostí

```bash
# Kontrola zastaralých balíčků
npm outdated

# Aktualizace všech
npm update

# Aktualizace konkrétního balíčku
npm install package@latest
```

### Backup strategie

**Automatický backup:**
```bash
# Cron job pro denní backup
0 2 * * * cd /path/to/project && npm run backup
```

**Manuální backup:**
```bash
npm run backup
# Soubor bude v backups/backup_YYYY-MM-DD.sql
```

## 🚨 Řešení problémů

### Časté chyby a řešení

1. **Build chyby**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Databázové chyby**
   ```bash
   # BEZPEČNÁ CESTA - bez mazání dat:
   npx prisma migrate deploy
   npx prisma db seed
   
   # POUZE PRO LOKÁLNÍ VÝVOJ (MAŽE DATA):
   # npx prisma db push --force-reset  <-- NEBEZPEČNÉ!
   ```

3. **OpenAI timeout**
   ```javascript
   // V lib/assistantRecommendations.ts zvyšte timeout:
   waited < 30000 // místo 5000
   ```

4. **Vercel deployment chyby**
   - Zkontrolujte environment variables
   - Ověřte build logs
   - Zkontrolujte package.json scripts

### Debug checklist

- [ ] Environment variables nastaveny
- [ ] Database připojení funkční
- [ ] OpenAI API klíč platný
- [ ] Produkty exportovány (`data/products.json`)
- [ ] Assistant ID existuje (`data/assistant-id.txt`)

## 📚 Užitečné zdroje

### Dokumentace
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Databázový prohlížeč
- [Vercel Dashboard](https://vercel.com/dashboard) - Deployment management
- [OpenAI Playground](https://platform.openai.com/playground) - API testování

---

*Technická příručka pro comparee.ai verze 1.0.0* 