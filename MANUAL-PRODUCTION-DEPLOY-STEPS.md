# 🚀 MANUÁLNÍ PRODUCTION DEPLOY - KROK ZA KROKEM

## ⚠️ KRITICKÉ: NIKDY NERESETOVAT DATABÁZI!

### 🔐 SSH Připojení k production serveru:
```bash
ssh comparee@23.88.98.49
```

### 📊 1. Git Pull na production serveru:
```bash
cd /var/www/comparee
git pull origin main
```

### 📦 2. Instalace dependencies:
```bash
npm install
```

### 🏗️ 3. Build production:
```bash
npm run build
```

### 🗄️ 4. BEZPEČNÁ migrace databáze (BEZ RESETU!):
```bash
npx prisma migrate deploy
```

### 🔄 5. Restart PM2 procesů:
```bash
pm2 restart all
```

### ✅ 6. Ověření stavu:
```bash
pm2 status
pm2 logs --lines 20
```

### 🌐 Test URL po deploymentu:
- **Hlavní stránka:** http://23.88.98.49
- **Admin panel:** http://23.88.98.49/admin (admin@admin.com / admin123)
- **Company portal:** http://23.88.98.49/company  
- **User area:** http://23.88.98.49/user-area

## 🔧 Pokud něco nefunguje:
```bash
# Zkontroluj PM2 logy
pm2 logs --lines 50

# Zkontroluj git status
git status
git log --oneline -5

# Restart konkrétní aplikace
pm2 restart comparee
```

## ✅ Po úspěšném deploymentu ověř:
1. ✅ Hlavní stránka načte správně
2. ✅ Admin login funguje (admin@admin.com / admin123)
3. ✅ Company registrace/login funguje
4. ✅ User login funguje
5. ✅ Žádné testovací credentials nejsou zobrazené

---
**🎯 OČEKÁVANÉ ZMĚNY PO DEPLOYMENTU:**
- ✅ Unifikovaný NextAuth systém pro všechny role
- ✅ Odstraněné testovací credentials z login formulářů  
- ✅ Nová URL struktura (/company místo /advertise)
- ✅ Bezpečný database authentication
- ✅ Funkční logout tlačítka ve všech sekcích