# 📸 SCREENSHOT TESTOVÁNÍ - NÁVOD

## 🎯 Cíl
Automaticky udělat screenshot homepage produktů bez cookies bannerů a uložit je do databáze.

## 🚀 RYCHLÝ TEST

### 1. Instalace dependencí
```bash
pip install -r requirements-screenshot.txt

# Nainstalovat Chrome driver automaticky
# (webdriver-manager to udělá automaticky)
```

### 2. Spuštění Python testu
```bash
# Ujistěte se že běží Next.js server
npm run dev

# Spustit screenshot test na 5 produktech
python test-screenshot-simple.py
```

### 3. Výsledky
```bash
# Screenshots budou v složce:
./screenshots/

# Názvy souborů:
- product_name_homepage.png
- klaviyo_homepage.png
- shopify_homepage.png
- atd.
```

## 📋 CO SCRIPT DĚLÁ

### Fáze 1: Získání produktů
- Vezme prvních 5 produktů z databáze
- Filtruje pouze produkty s platným `externalUrl`

### Fáze 2: Cookies handling
- Navštíví homepage produktu
- Automaticky hledá cookies banner pomocí 18 různých selektorů:
  - `button[data-testid="accept-all"]`
  - `button[id*="accept"]`
  - `button[class*="accept"]`
  - `#cookie-accept`
  - `.cookies-accept-all`
  - atd.

### Fáze 3: Screenshot
- Počká na načtení stránky (3 sekundy)
- Udělá screenshot celé stránky (1280x720)
- Uloží jako PNG soubor

### Fáze 4: Databáze (volitelné)
- Pokusí se aktualizovat produkt s screenshot URL
- Vyžaduje PUT endpoint v API

## 🔧 N8N WORKFLOW ALTERNATIVA

### Importování N8N workflow
```bash
1. Otevřete N8N
2. Import → n8n-screenshot-workflow.json
3. Nastavte credentials pokud potřeba
```

### N8N workflow dělá:
- ✅ Získá 5 testovacích produktů
- ✅ Otevře browser automaticky
- ✅ Handluje cookies bannery
- ✅ Udělá screenshots
- ✅ Uloží soubory
- ✅ Aktualizuje databázi

## 📊 OČEKÁVANÉ VÝSLEDKY

### Po úspěšném testu:
```
🚀 SCREENSHOT TEST - START
==================================================
✅ Nalezeno 5 testovacích produktů
   - Klaviyo: https://www.klaviyo.com
   - Shopify: https://www.shopify.com
   - etc.

[1/5] Zpracovávám: Klaviyo
📸 Screenshot: Klaviyo
   URL: https://www.klaviyo.com
   🍪 Cookies banner kliknuto: button[data-testid="accept-all"]
   ✅ Screenshot uložen: screenshots/klaviyo_homepage.png
   ✅ Screenshot URL uloženo do databáze

==================================================
📊 FINÁLNÍ REPORT
==================================================
✅ Úspěšné: 4/5
❌ Chybné: 1/5

📸 Výsledky:
   ✅ Klaviyo 🍪 💾
      Screenshot: klaviyo_homepage.png
   ✅ Shopify 🍪 💾
      Screenshot: shopify_homepage.png
   ❌ BrokenSite: Connection timeout

📁 Screenshots uloženy v: ./screenshots/
🎯 Test dokončen!
```

## 🛠️ ROZŠÍŘENÍ PRO VŠECHNY PRODUKTY

### Úprava scriptu pro všechny produkty:
```python
# V get_test_products() změnit:
pageSize=5  # na pageSize=1000

# Nebo v N8N workflow:
# Změnit "pageSize": "5" na "pageSize": "1000"
```

### Bulk zpracování:
```bash
# Postupné dávky po 20 produktech
# Aby se browser nezasekl
```

## ⚠️ ŘEŠENÍ PROBLÉMŮ

### Chrome driver chyba:
```bash
# Nainstalovat Chrome browser
# webdriver-manager automaticky stáhne driver
```

### Cookies banner se neodklikl:
```bash
# Normální - některé weby nemají cookies banner
# Nebo používají jiné selektory
# Script pokračuje dál
```

### API update failed:
```bash
# Možná ještě nemáte PUT endpoint
# Screenshot se uloží lokálně i tak
# Později můžete přidat do API
```

### Screenshot je prázdný:
```bash
# Některé weby blokují headless browser
# To je také normální
```

## 🎯 DOPORUČENÍ

1. **Začněte s 5 produkty** - otestujte funkcionalitu
2. **Zkontrolujte výsledky** - podívejte se na screenshots
3. **Postupně zvyšujte** - 20, 50, všechny produkty  
4. **Pravidelně spouštějte** - nové produkty = nové screenshots
5. **Integrace s głównym scraperem** - přidat do hlavního N8N workflow

## 📈 VÝSLEDEK

Po dokončení budete mít:
- ✅ Screenshot každého produktu bez cookies bannerů
- ✅ Automatické ukládání do databáze
- ✅ Vizuální identifikaci produktů na webu
- ✅ Lepší uživatelský zážitek 