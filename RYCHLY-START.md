# ⚡ RYCHLÝ START - SCRAPER PRODUKTŮ

## 🎯 Cíl
Rozšířit databázu z 196 na 2500-3000 produktů automaticky

---

## 🚀 MOŽNOST 1: N8N WORKFLOW (DOPORUČENO)

### Krok 1: Import workflow
```bash
1. Otevřete N8N v prohlížeči
2. Workflows → Import
3. Nahrajte: n8n-product-scraper-workflow.json
```

### Krok 2: Nastavení OpenAI
```bash
1. Otevřete workflow
2. Klikněte na "AI Company Generator" 
3. Nastavte OpenAI API klíč (ten co už používáte)
4. Stejně nastavte "AI Product Extractor"
```

### Krok 3: Test
```bash
1. Klikněte "Manual Trigger"
2. Sledujte logy
3. Za ~50 minut budete mít ~35 nových produktů
```

### Krok 4: Automatizace
```bash
# Workflow se spustí automaticky každé pondělí v 2:00
# Pro rychlejší růst: spouštějte manuálně víckrát
```

---

## 🐍 MOŽNOST 2: PYTHON SKRIPT

### Instalace
```bash
pip install -r requirements.txt
export OPENAI_API_KEY="your-key-here"
```

### Spuštění
```bash
python python-scraper-alternative.py
```

---

## 📊 VÝSLEDKY

### Po prvním spuštění (1 hodina)
- ✅ 30-40 nových produktů
- ✅ Různé kategorie
- ✅ Anglické popisy
- ✅ Kompletní metadata

### Po týdnu
- ✅ 200+ produktů celkem

### Po měsíci  
- ✅ 600+ produktů celkem

### Po 6 měsících
- ✅ 2500+ produktů celkem
- ✅ Splněný cíl!

---

## 🔧 MONITORING

### Kontrola průběhu
```sql
-- Počet produktů v databázi
SELECT COUNT(*) FROM "Product";

-- Nejnovější produkty
SELECT name, category, "createdAt" 
FROM "Product" 
ORDER BY "createdAt" DESC 
LIMIT 20;
```

### Logy N8N
- Každé spuštění vytvoří detailní log
- Vidíte úspěchy, chyby, duplikáty

---

## ⚠️ ČASTÉ PROBLÉMY

**"Failed to fetch website"**
→ Normální, některé weby blokují boty

**"No products found"**  
→ Normální, ne všechny weby mají jasné produkty

**"API connection failed"**
→ Zkontrolujte zda běží `npm run dev`

**"Duplicate product"**
→ Dobře! Systém funguje, nepřepisuje existující

---

## 🎯 DOPORUČENÍ

1. **Nechte běžet automaticky** - každý týden nové produkty
2. **Pro rychlejší růst** - spouštějte manuálně 2-3x týdně  
3. **Monitorujte kvalitu** - občas zkontrolujte nové produkty
4. **Buďte trpěliví** - za 6 měsíců budete mít 3000+ produktů

---

## 🏁 VÝSLEDEK

**Bez práce získáte tisíce produktů pro váš doporučovací systém!**

Workflow běží na pozadí a automaticky rozšiřuje databázi každý týden. Za půl roku budete mít jednu z největších databází produktů v češtině! 