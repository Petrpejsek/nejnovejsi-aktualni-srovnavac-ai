# 🚀 URL Upload Produktů - Dokumentace

Automatický systém pro scrapování a přidávání AI produktů do databáze pomocí URL adres.

## 🎯 Co dělá

1. **Navštíví webové stránky** - Stáhne HTML obsah z URL
2. **Extrahuje data pomocí OpenAI** - Analyzuje obsah a vytvoří strukturovaná data
3. **Vytvoří screenshot** - Automaticky vytvoří obrázek homepage
4. **Uloží do databáze** - Přidá kompletní produkt do Neon databáze

## 🚀 Jak spustit

### 1. Spustit Screenshot Server

```bash
# V root adresáři projektu
./start-screenshot-server.sh

# Nebo manuálně:
source venv/bin/activate
pip install -r requirements-screenshot-server.txt
python screenshot-server.py
```

Server běží na `http://localhost:5000`

### 2. Spustit Next.js aplikaci

```bash
npm run dev
```

### 3. Přejít do admin panelu

Otevři: `http://localhost:3000/admin/url-upload`

## 📋 Jak používat

1. **Otevři admin panel** - `/admin/url-upload`
2. **Vlož URL adresy** - Každou na nový řádek
3. **Klikni "Spustit scraping"** - Systém zpracuje všechny URL
4. **Sleduj výsledky** - Uvidíš real-time feedback

### Příklad URL:
```
https://openai.com
https://midjourney.com
https://claude.ai
https://notion.ai
```

## 🔧 Konfigurace

### Proměnné prostředí

Přidej do `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Databáze

Systém používá existující Prisma schéma s těmito poli:
- `name` - Název produktu
- `description` - Krátký popis
- `category` - Kategorie
- `price` - Cena
- `advantages` - Výhody (JSON)
- `disadvantages` - Nevýhody (JSON)
- `tags` - Tagy (JSON)
- `imageUrl` - URL screenshotu
- `externalUrl` - Původní URL
- `hasTrial` - Má zkušební verzi

## ⚙️ API Endpoints

### `/api/products/scrape`

**POST** - Hlavní endpoint pro scraping

```json
{
  "urls": [
    "https://example1.com",
    "https://example2.com"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "totalProcessed": 2,
  "successCount": 1,
  "failCount": 1,
  "results": [
    {
      "url": "https://example1.com",
      "success": true,
      "productId": "uuid",
      "productName": "Example Product",
      "screenshotUrl": "/screenshots/example_homepage.png"
    }
  ]
}
```

### Screenshot Server: `http://localhost:5000/screenshot`

**POST** - Vytvoří screenshot

```json
{
  "url": "https://example.com",
  "filename": "optional_filename.png"
}
```

## 📊 Funkcionalita

### ✅ Co systém umí:

- **Automatické scrapování** - Kompletní extrakce dat z webových stránek
- **AI analýza** - OpenAI GPT-4 analyzuje obsah a strukturuje data
- **Screenshot homepage** - Automatické vytvoření obrázku bez cookies bannerů
- **Detekce duplikátů** - Kontroluje existující produkty v databázi
- **Batch zpracování** - Můžete nahrát více URL najednou
- **Real-time feedback** - Vidíte průběh zpracování
- **Error handling** - Systém pokračuje i při chybách jednotlivých URL

### 🎨 Co extrahuje:

- **Základní info**: název, popis, kategorie, cena
- **Výhody**: 4-6 klíčových výhod produktu
- **Nevýhody**: 1-3 realistické nevýhody
- **Tagy**: relevantní klíčová slova
- **Cenové plány**: struktura pricing s plány
- **Trial info**: zda má zkušební verzi

## 🔍 Troubleshooting

### Screenshot server nefunguje

```bash
# Zkontroluj že běží
curl http://localhost:5000/health

# Restartuj server
./start-screenshot-server.sh
```

### OpenAI API chyby

- Zkontroluj `OPENAI_API_KEY` v `.env.local`
- Zkontroluj kredit v OpenAI účtu

### Databáze chyby

- Zkontroluj `DATABASE_URL` v `.env.local`
- Zkontroluj připojení k Neon databázi

## 📁 Struktura souborů

```
├── app/
│   ├── admin/
│   │   └── url-upload/
│   │       └── page.tsx              # Admin stránka
│   └── api/
│       └── products/
│           └── scrape/
│               └── route.ts          # API endpoint
├── screenshot-server.py              # Flask server pro screenshoty
├── requirements-screenshot-server.txt # Python dependencies
├── start-screenshot-server.sh        # Startup script
└── public/
    └── screenshots/                  # Generované screenshoty
```

## 🚨 Důležité poznámky

1. **Screenshot server musí běžet** před použitím admin panelu
2. **OpenAI API key** je povinný pro extrakci dat
3. **Chrome/Chromium** musí být nainstalovaný pro screenshoty
4. **Zpracování trvá čas** - několik sekund na URL
5. **Respektuj robots.txt** - neděrej weby

## 🎯 Výsledek

Po úspěšném zpracování máte v databázi kompletní produkty s:
- ✅ Všemi potřebnými daty v angličtině
- ✅ Screenshot homepage
- ✅ Strukturovanými výhodami/nevýhodami
- ✅ Cenovými plány
- ✅ Relevantními tagy

Produkty se automaticky zobrazí na frontendové stránce!

## �� Happy scraping! 🚀 