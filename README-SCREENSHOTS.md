# 📸 Screenshot Management Guide

## 🎯 Jak funguje ukládání obrázků

### 📂 **Struktura:**
- **Databáze:** Ukládá pouze URL cesty (např. `/screenshots/product-123.png`)
- **Fyzické soubory:** Ukládají se lokálně do `public/screenshots/`
- **Vercel deployment:** Screenshoty se NEzahrnují kvůli `.gitignore`

### 🚫 **Problém s Vercel:**
```bash
# V .gitignore
public/screenshots/*.png  # ← Screenshoty se nedeployují!
```

## 🔧 Použití scriptů

### 1️⃣ **Kontrola stavu screenshotů**
```bash
npm run check-screenshots
```
Zobrazí:
- Kolik produktů má/nemá screenshoty
- Které soubory chybí
- Detailní statistiky

### 2️⃣ **Automatická oprava chybějících screenshotů**
```bash
# 1. Spusť screenshot server
./start-screenshot-server.sh

# 2. Spusť opravu
npm run fix-screenshots
```

### 3️⃣ **Manuální spuštění screenshot serveru**
```bash
# Aktivuj Python prostředí
source venv/bin/activate

# Nainstaluj závislosti (první spuštění)
pip install -r requirements-screenshot-server.txt

# Spusť server
python screenshot-server.py
```

## 📊 **Co scripty dělají:**

### `check-screenshot-status.js`
- Analyzuje databázi
- Kontroluje existenci fyzických souborů
- Poskytuje statistiky a doporučení

### `fix-missing-screenshots.js`
- Najde produkty bez screenshotů
- Automaticky vytvoří screenshoty pomocí Python serveru
- Aktualizuje databázi s novými cestami
- Poskytuje detailní reporting

## ⚙️ **Jak screenshot server funguje:**

1. **Selenium + Chrome:** Headless browser pro návštěvu stránek
2. **Cookies handling:** Automaticky odklikne cookie bannery
3. **Screenshot:** Vytvoří PNG obrázek
4. **Uložení:** Soubor se uloží do `public/screenshots/`
5. **Návrat URL:** Vrátí relativní cestu pro databázi

## 🔄 **Workflow pro nové produkty:**

### URL Upload systém (lokální):
1. URL Upload analyzuje stránku
2. Screenshot server vytvoří obrázek
3. Databáze se aktualizuje s cestou
4. ✅ Hotovo

### Ruční přidání:
1. Přidej produkt bez obrázku
2. Spusť `npm run fix-screenshots`
3. ✅ Screenshot se vytvoří automaticky

## 🚨 **Důležité poznámky:**

### ✅ **Pro lokální development:**
- Všechno funguje perfektně
- Screenshot server běží na localhost:5000
- Soubory se ukládají lokálně

### ⚠️ **Pro produkci (Vercel):**
- Screenshot server musí běžet externálně NEBO
- Nahrát screenshoty na CDN NEBO
- Používat placeholder obrázky

## 🎯 **Doporučení:**

1. **Lokální development:** Pokračuj s aktuálním nastavením
2. **Pro screenshoty stávajících produktů:** Použij `npm run fix-screenshots`
3. **Pro produkci:** Prozatím jsou zakázané URL uploads (ENABLE_ADMIN_UPLOAD=false)

## 🆘 **Troubleshooting:**

### Screenshot server nefunguje:
```bash
# Zkontroluj zdraví
curl http://localhost:5000/health

# Restartuj
./start-screenshot-server.sh
```

### Permission chyby:
```bash
chmod +x start-screenshot-server.sh
```

### Python chyby:
```bash
# Reinstal dependencies
pip install -r requirements-screenshot-server.txt --force-reinstall
```

### Databáze chyby:
```bash
# Zkontroluj připojení
npm run db:studio
```

## 📈 **Statistiky po opravě:**

Po spuštění `fix-screenshots` uvidíš:
- ✅ Úspěšně vytvořené screenshoty
- ❌ Neúspěšné pokusy (s důvody)
- ⏭️ Přeskočené produkty (chybí URL)
- �� Celkové statistiky 