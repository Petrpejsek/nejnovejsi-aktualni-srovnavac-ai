# 🚀 Deployment Pipeline - Comparee.ai

## Přehled systému

Kompletní automatizovaný deployment pipeline s pre-commit kontrolami a jednoduchým nasazením na Hetzner server.

## 🔧 Komponenty

### 1. Pre-commit kontroly (`scripts/precommit-check.sh`)
- ✅ TypeScript kompilace (`tsc --noEmit`)
- ✅ ESLint kontrola + auto-fix 
- ✅ Build test (`npm run build`)
- ✅ API health check (`/api/health`)
- ✅ Prisma migrace status

### 2. Husky Git hooks (`.husky/pre-commit`)
- Automaticky spouští pre-commit kontroly před každým commitem
- Zabraňuje commit s chybami

### 3. Deployment script (`scripts/deploy-prod.sh`)
- SSH připojení na Hetzner server
- Git pull nejnovějších změn
- NPM dependencies update
- Prisma migrace
- Build & restart PM2

### 4. Health endpoint (`/api/health`)
- Jednoduché API pro kontrolu stavu aplikace
- Používá se v pre-commit kontrolách

## 🎯 Workflow

### Lokální vývoj a commit

```bash
# 1. Udělej změny v kódu
# 2. Pre-commit kontroly (automaticky při git commit)
git add .
git commit -m "feat: nová funkcionalita"

# Nebo manuálně:
bash scripts/precommit-check.sh
```

### Deployment na produkci

```bash
# Po úspěšném commit & push
git push origin main

# Deployment na Hetzner
bash scripts/deploy-prod.sh
```

## 📋 Checklist pro deployment

### Před commitem
- [ ] ✅ TypeScript bez chyb
- [ ] ✅ ESLint bez chyb  
- [ ] ✅ Build úspěšný
- [ ] ✅ API endpointy dostupné
- [ ] ✅ Prisma migrace aktuální

### Deployment
- [ ] 🌐 SSH přístup na server
- [ ] 📡 Git pull úspěšný
- [ ] 📦 Dependencies update
- [ ] 🗄️ Prisma migrace
- [ ] 🏗️ Build produkční verze
- [ ] ♻️ PM2 restart
- [ ] 🩺 Health check

## ⚡ Rychlé příkazy

```bash
# Pre-commit kontroly
bash scripts/precommit-check.sh

# Deployment
bash scripts/deploy-prod.sh

# Health check
curl http://localhost:3000/api/health
curl https://comparee.ai/api/health

# Server logy
ssh root@195.201.219.128 'pm2 logs comparee-ai'

# PM2 status
ssh root@195.201.219.128 'pm2 list'
```

## 🔥 Troubleshooting

### Pre-commit selhává
```bash
# TypeScript chyby
npx tsc --noEmit

# ESLint chyby
npx eslint . --ext .ts,.tsx --fix

# Build chyby  
npm run build

# API nedostupné
npm run dev  # spusť dev server

# Prisma migrace
npx prisma migrate dev
```

### Deployment selhává
```bash
# SSH problém
ssh root@195.201.219.128

# Git problém na serveru
ssh root@195.201.219.128 'cd /var/www/comparee-ai && git status'

# PM2 problém
ssh root@195.201.219.128 'pm2 restart comparee-ai'

# Logy z produkce
ssh root@195.201.219.128 'pm2 logs comparee-ai --lines 50'
```

## 🏗️ Setup pro nový projekt

1. **Install Husky:**
```bash
npx husky-init && npm install
```

2. **Nastav pre-commit hook:**
```bash
echo 'bash scripts/precommit-check.sh' > .husky/pre-commit
```

3. **Udělej skripty spustitelné:**
```bash
chmod +x scripts/precommit-check.sh scripts/deploy-prod.sh
```

4. **První test:**
```bash
bash scripts/precommit-check.sh
```

## 🎯 Výhody tohoto setupu

✅ **Žádný špatný kód v Gitu** - pre-commit kontroly blokují problematické commity  
✅ **Rychlý deployment** - jeden příkaz na kompletní nasazení  
✅ **Automatické rollbacky** - snadný git reset na serveru  
✅ **Zero-downtime** - PM2 restart bez výpadku  
✅ **Health monitoring** - kontrola stavu API  
✅ **Konzistentní kvalita** - automatické lint & format

**Pipeline je připraven k použití!** 🚀 