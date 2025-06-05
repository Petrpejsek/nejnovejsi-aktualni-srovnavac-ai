# 🧪 Test Review Systému

## Testovací postup:

### 1. Testovací URL adresy
```
https://openai.com
https://midjourney.com
https://notion.so
```

### 2. Kroky testování:

#### A) Scraping do Review Queue
1. Jdi na `/admin/url-upload`
2. Zadej testovací URL adresy
3. Zkontroluj že produkty jdou do review queue (ne přímo do DB)
4. Verifikuj limit 50 produktů

#### B) Review Interface
1. Ověř že produkty se zobrazují v review tabulce
2. Test výběru produktů (jednotlivě i hromadně)
3. Test modal editace produktu
4. Test screenshot regenerace/upload

#### C) Approval Process
1. Test jednotlivého schválení (s double confirmation)
2. Test hromadného schválení (s double confirmation) 
3. Verify produkty jsou uloženy do DB a odstraněny z review queue

#### D) Delete Functions
1. Test smazání jednotlivého produktu (s double confirmation)
2. Test vymazání celé review queue

### 3. API Endpointy k testování:

- `GET /api/review-queue` - Načtení review queue
- `POST /api/review-queue` - Přidání produktů do review
- `DELETE /api/review-queue?reviewId=xxx` - Smazání produktu
- `POST /api/review-queue/approve` - Schválení produktů
- `PUT /api/review-queue/approve` - Aktualizace produktu v review
- `POST /api/screenshot/regenerate` - Regenerace screenshotu
- `POST /api/upload-image` - Upload vlastního obrázku

### 4. Očekávané výsledky:

✅ **Scraping**: Produkty jdou do review queue místo DB
✅ **Review Interface**: Funkční tabulka s editací
✅ **Screenshot Management**: Regenerace + manual upload
✅ **Approval**: Single + batch s confirmations
✅ **Quality Control**: Možnost úprav před schválením

### 5. Nové funkce:

🎯 **Workflow změna**: Scraping → Review → Approval → Database
📋 **Review Queue**: Max 50 produktů, kompletní správa
✏️ **Modal editace**: Všechna pole, screenshot management
🔄 **Screenshot regenerace**: API endpoint pro nový screenshot
📁 **Manual upload**: Možnost nahrát vlastní obrázek
✅ **Batch operations**: Hromadné schválení/mazání
🛡️ **Double confirmations**: Bezpečnost při důležitých akcích

## 🚀 Systém je připraven k testování! 