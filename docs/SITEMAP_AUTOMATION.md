# 🗺️ Sitemap Automation Documentation

Tato dokumentace popisuje automatické generování sitemap.xml souboru pro lepší SEO a indexování vyhledávači.

## 📋 Přehled

### Co je implementováno:
- ✅ **API Endpoint** `/api/sitemap` pro manuální generování sitemap
- ✅ **Cron Job Script** pro automatické denní aktualizace
- ✅ **Kompletní sitemap** včetně landing pages s i18n podporou
- ✅ **Automatické pingování** Google a Bing po aktualizaci
- ✅ **Error handling** a retry logic
- ✅ **Logging** a monitoring

## 🚀 Použití

### 1. Manuální aktualizace sitemap

```bash
# Přes API endpoint (GET)
curl http://localhost:3000/api/sitemap

# Přes NPM script
npm run sitemap:update

# Přes admin API (POST - více detailů)
curl -X POST http://localhost:3000/api/sitemap \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Automatické denní aktualizace

#### Lokální development:
```bash
# Jednoráz spuštění
npm run sitemap:update

# Nastavení cron jobu (každý den v 2:00 AM)
crontab -e
# Přidat řádek:
0 2 * * * cd /Users/petrliesner/ai\ new\ new\ new && npm run sitemap:update >> logs/sitemap-cron.log 2>&1
```

#### Produkční server:
```bash
# SSH na produkční server
ssh comparee-production

# Nastavení cron jobu
crontab -e
# Přidat řádek:
0 2 * * * cd /var/www/comparee && npm run sitemap:update >> logs/sitemap-cron.log 2>&1

# Ověření cron jobů
crontab -l
```

## 📊 Co sitemap obsahuje

### Hlavní stránky:
- **Homepage** (`/`) - priorita 1.0, denní aktualizace
- **About Us** (`/about`) - priorita 0.8, týdenní
- **How It Works** (`/how-it-works`) - priorita 0.8, týdenní  
- **Company** (`/company`) - priorita 0.7, týdenní
- **Categories** (`/categories`) - priorita 0.9, denní
- **Products** (`/products`) - priorita 0.9, denní
- **Recommendations** (`/recommendations`) - priorita 0.8, denní
- **Top Lists** (`/top-lists`) - priorita 0.8, denní
- **Legal pages** (`/privacy`, `/gdpr`) - priorita 0.3, měsíční

### Landing pages:
- **i18n formát:** `/{language}/landing/{slug}`
- **Podporované jazyky:** `cs`, `en`, `de`, `fr`, `es`
- **Priorita:** 0.8, týdenní aktualizace
- **Automatické datum:** podle `updatedAt` ze stránky

### Kategorie produktů:
- **Dynamické URL:** `/categories/{category-slug}`
- **Priorita:** 0.7, týdenní aktualizace

## 🔧 API Endpointy

### GET `/api/sitemap`
**Veřejný endpoint** pro regeneraci sitemap:

```bash
curl http://localhost:3000/api/sitemap
```

**Response:**
- Content-Type: `application/xml`
- Cache: 1 hodina
- Automatické uložení do `public/sitemap.xml`
- Asynchronní pingování vyhledávačů

### POST `/api/sitemap`  
**Admin endpoint** s detailními statistikami:

```json
{
  "success": true,
  "message": "Sitemap successfully regenerated",
  "stats": {
    "urlCount": 45,
    "duration": "1234ms", 
    "fileSize": 5678,
    "lastGenerated": "2025-08-05T09:00:00.000Z",
    "searchEngines": {
      "google": "pinged successfully",
      "bing": "pinged successfully"
    }
  }
}
```

## 📁 Soubory

```
├── app/api/sitemap/route.ts          # API endpoint
├── scripts/update-sitemap-cron.js    # Cron job script
├── public/sitemap.xml                # Generovaný sitemap
├── logs/sitemap-cron.log            # Logy cron jobu
└── docs/SITEMAP_AUTOMATION.md       # Tato dokumentace
```

## 🔍 Monitoring a debugging

### Kontrola posledních aktualizací:
```bash
# Zobrazí čas poslední aktualizace sitemap
ls -la public/sitemap.xml

# Počet URL v sitemap
grep -c "<url>" public/sitemap.xml

# Zobrazí logy cron jobu
tail -f logs/sitemap-cron.log
```

### Manuální test cron scriptu:
```bash
# Spuštění s detailními logy
node scripts/update-sitemap-cron.js

# S přeskočením health check
SKIP_HEALTH_CHECK=true node scripts/update-sitemap-cron.js
```

### Ověření pingování vyhledávačů:
```bash
# Google Search Console
https://search.google.com/search-console

# Bing Webmaster Tools  
https://www.bing.com/webmasters

# Manuální ping
curl "https://www.google.com/ping?sitemap=https://comparee.ai/sitemap.xml"
```

## ⚙️ Konfigurace

### Environment proměnné:
```bash
# .env
NEXT_PUBLIC_BASE_URL=https://comparee.ai  # Pro produkci
NODE_ENV=production                       # Pro produkční logiku

# Pro cron script
SKIP_HEALTH_CHECK=true                   # Přeskočí health check
```

### Přizpůsobení:
```javascript
// V app/api/sitemap/route.ts
const CONFIG = {
  baseUrl: getBaseUrl(),
  timeout: 30000,
  retries: 3
}
```

## 🚨 Troubleshooting

### Časté problémy:

**1. Sitemap se negeneruje:**
```bash
# Zkontroluj databázové připojení
npm run sitemap:update

# Zkontroluj oprávnění souborů
ls -la public/
chmod 755 public/
```

**2. Cron job neběží:**
```bash
# Zkontroluj cron daemon
sudo service cron status

# Zkontroluj cron logy
grep CRON /var/log/syslog

# Zkontroluj cestu v cron jobu
which node
```

**3. API nedostupné:**
```bash
# Zkontroluj server
curl -I http://localhost:3000/api/health

# Zkontroluj port konflikty
lsof -i :3000
```

## 📈 Výhody automatizace

✅ **SEO benefit:** Aktuální sitemap = lepší indexování  
✅ **Automatické:** Žádná manuální práce  
✅ **i18n podpora:** Všechny jazyky v sitemap  
✅ **Search engine ping:** Okamžité informování Google/Bing  
✅ **Monitoring:** Detailní logy a error handling  
✅ **Rychlé:** Generování pod 2 sekundy  

## 🔄 Maintenance

### Týdenní kontrola:
1. Zkontroluj logy: `tail logs/sitemap-cron.log`
2. Ověř velikost sitemap: `ls -lh public/sitemap.xml`  
3. Test API: `curl http://localhost:3000/api/sitemap > /dev/null`

### Měsíční úkoly:
1. Aktualizuj dokumentaci pokud přibyly nové stránky
2. Zkontroluj Google Search Console pro indexované stránky
3. Ověř, že všechny landing pages jsou v sitemap

---

**📞 Podpora:** V případě problémů kontaktuj dev team nebo zkontroluj GitHub issues.

**🔗 Odkazy:**
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Bing Sitemap Guidelines](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)  
- [Next.js Sitemap Best Practices](https://nextjs.org/learn/seo/crawling-and-indexing/xml-sitemaps)