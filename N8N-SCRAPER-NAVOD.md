# 🚀 N8N PRODUCT SCRAPER - KOMPLETNÍ NÁVOD

## 📋 Co tento systém dělá

Automaticky scrapuje tisíce webových stránek firem, extrahuje informace o jejich produktech pomocí AI a ukládá je do vaší PostgreSQL databáze. 

**Výsledek:** Z 196 produktů na 2500-3000 produktů bez manuální práce!

---

## 🛠️ INSTALACE A NASTAVENÍ

### 1. Nastavení N8N

Jelikož už máte N8N připravené, stačí pouze:

```bash
# Otevřete N8N v prohlížeči
# Přejděte do Workflows
# Klikněte na "Import Workflow"
# Nahrajte soubor: n8n-product-scraper-workflow.json
```

### 2. Konfigurace OpenAI připojení

V N8N workflow nastavte vaše OpenAI credentials:

1. **AI Company Generator node** - nastavte OpenAI API klíč
2. **AI Product Extractor node** - nastavte stejný klíč
3. Model: `gpt-4o-mini` (což už používáte)

### 3. Ověření API endpointů

Ujistěte se, že tyto URL fungují:
- `http://localhost:3000/api/products` (GET - kontrola existujících)
- `http://localhost:3000/api/products` (POST - přidání nového)

---

## 🎯 JAK TO FUNGUJE

### Fáze 1: Generování seznamu firem
- AI vygeneruje 50 společností s jejich weby
- Pokrývá různé kategorie (SaaS, fintech, zdravotnictví atd.)
- Vytvoří JSON seznam s URL a kategoriemi

### Fáze 2: Scrapování webů
- Navštíví každý web automaticky
- Stáhne HTML obsah
- Odešle AI pro analýzu

### Fáze 3: Extrakce produktů
- AI analyzuje HTML a najde produkty/služby
- Extrahuje: název, popis, cenu, výhody, nevýhody
- Přeloží vše do angličtiny
- Standardizuje formát

### Fáze 4: Kontrola duplikací
- Porovná s existujícími produkty v databázi
- Přeskočí duplikáty podle názvu
- Ukládá pouze nové produkty

### Fáze 5: Uložení do databáze
- Volá váš API endpoint `/api/products`
- Ukládá do PostgreSQL přes Prisma
- Loguje výsledky

---

## 🚀 SPUŠTĚNÍ

### Testovací spuštění
1. V N8N klikněte na "Manual Trigger"
2. Spustí se zpracování 50 firem
3. Sledujte progress v logách
4. Zkontrolujte výsledky

### Automatické spuštění
- Workflow se spustí každé pondělí v 2:00 ráno
- Zpracuje dalších 50 firem
- Po 50-60 týdnech budete mít 2500-3000 produktů

### Rychlejší získání produktů
Pro rychlejší naplnění databáze:

```bash
# Spouštějte manuálně několikrát za den
# Každé spuštění = 50 nových firem
# 60 spuštění = 3000 produktů
```

---

## 📊 MONITORING A VÝSLEDKY

### Sledování průběhu
Workflow vytváří detailní logy:
- Počet zpracovaných firem
- Počet nalezených produktů  
- Počet přeskočených duplikátů
- Chyby a problémy

### Kontrola výsledků
```sql
-- Zkontrolujte počet produktů
SELECT COUNT(*) FROM "Product";

-- Najděte nejnovější produkty
SELECT name, category, "createdAt" 
FROM "Product" 
ORDER BY "createdAt" DESC 
LIMIT 20;

-- Produkty podle kategorií
SELECT category, COUNT(*) 
FROM "Product" 
GROUP BY category 
ORDER BY COUNT(*) DESC;
```

---

## ⚙️ NASTAVENÍ A OPTIMALIZACE

### Rychlost zpracování
- **Pomalé:** 1 firma za minutu = 50 minut na dávku
- **Rychlé:** Paralelní zpracování (nastavte v N8N)

### Kvalita dat
- AI je nastavena na vysokou přesnost
- Filtruje hlavní produkty, ne blog posty
- Standardizuje anglické popisy

### Kategorie produktů
AI automaticky rozpozná kategorie:
- SaaS Tools
- Financial Technology  
- Healthcare Solutions
- Marketing Automation
- E-commerce Platforms
- atd.

---

## 🔧 ŘEŠENÍ PROBLÉMŮ

### Časté problémy

**1. "Failed to fetch website"**
- Některé weby blokují automatické requesty
- Normální, workflow pokračuje dál

**2. "No products found"**
- Web nemá jasné produkty
- AI nenašla relevantní informace
- Také normální, přeskakuje se

**3. "API connection failed"**
- Zkontrolujte zda běží váš Next.js server
- URL: `http://localhost:3000`

**4. "OpenAI API error"**
- Zkontrolujte API klíč
- Zkontrolujte limity (rate limits)

### Ladění výkonu

```javascript
// V N8N můžete upravit nastavení:
// - Timeout na 60 sekund pro pomalé weby
// - Retry logic pro failed requesty
// - Batch processing po menších dávkách
```

---

## 📈 OČEKÁVANÉ VÝSLEDKY

### Po 1 týdnu
- **50 nových produktů** (úspěšnost ~70%)
- Různé kategorie
- Anglické popisy

### Po 1 měsíci  
- **200+ nových produktů**
- Lepší pokrytí kategorií
- Stabilní běh systému

### Po 6 měsících
- **1200+ nových produktů** 
- Blížení se k cíli 2500-3000
- Bohatá databáze pro doporučovací systém

---

## 💡 POKROČILÉ NASTAVENÍ

### Vlastní kategorie
Můžete upravit AI prompt pro zaměření na specifické odvětví:

```text
"Focus on companies in these categories:
- Fintech startups
- AI/ML platforms  
- E-commerce tools
- Marketing automation"
```

### Více produktů na web
Změňte v AI promptu:
```text
"Extract 1-3 primary products maximum per website"
// na:
"Extract up to 5 products per website"
```

### Geografické zaměření
```text
"Focus on companies from Europe/US/Global"
```

---

## 🎯 ZÁVĚR

Tento N8N workflow vám automaticky:
- ✅ Najde tisíce firem s produkty
- ✅ Scrapuje jejich weby pomocí AI
- ✅ Extrahuje detailní informace o produktech
- ✅ Kontroluje duplikace
- ✅ Ukládá do vaší databáze
- ✅ Běží automaticky týdně
- ✅ Poskytuje detailní reporty

**Výsledek:** Z 196 na 3000+ produktů během 6-12 měsíců!

---

## 📞 PODPORA

Pokud máte problémy:
1. Zkontrolujte logy v N8N
2. Ověřte API endpoints
3. Zkontrolujte OpenAI kredity
4. Testujte menší dávky

Workflow je navržen tak, aby běžel spolehlivě a automaticky rozšiřoval vaši produktovou databázi! 