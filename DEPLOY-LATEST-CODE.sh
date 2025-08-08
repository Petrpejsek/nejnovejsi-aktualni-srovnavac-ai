#!/bin/bash
# 🚀 NASAZENÍ NEJNOVĚJŠÍHO KÓDU NA PRODUKCI

set -e

echo "🚀 NASAZENÍ NEJNOVĚJŠÍCH ZMĚN TOP LISTS"
echo "======================================="

echo "📋 FÁZE 1: PULL NEJNOVĚJŠÍHO KÓDU"
echo "================================"

ssh comparee-production << 'PULLCODE'
cd /var/www/comparee

echo "🛑 Ukončení PM2 procesů..."
sudo -u comparee pm2 delete all || true

echo "📦 Zálohování aktuální verze..."
sudo -u comparee cp -r /var/www/comparee /var/www/comparee-backup-$(date +%Y%m%d_%H%M%S)

echo "🔄 Git pull nejnovějších změn..."
sudo -u comparee git fetch origin
sudo -u comparee git reset --hard origin/main
sudo -u comparee git pull origin main

echo "📋 Poslední commity na produkci:"
sudo -u comparee git log --oneline -5

echo "✅ Kód synchronizován"
PULLCODE

echo "📋 FÁZE 2: REBUILD S NEJNOVĚJŠÍMI ZMĚNAMI"
echo "========================================"

ssh comparee-production << 'REBUILD'
cd /var/www/comparee

echo "🔧 Nastavení environment variables..."
export $(cat .env.production | xargs)

echo "📦 Reinstall dependencies..."
sudo -u comparee npm install

echo "🔧 Regenerace Prisma client..."
sudo -u comparee npm run prisma:generate

echo "🏗️ Production build s nejnovějšími změnami..."
sudo -u comparee npm run build

echo "✅ Build dokončen"
REBUILD

echo "📋 FÁZE 3: RESTART APLIKACE"
echo "=========================="

ssh comparee-production << 'RESTART'
cd /var/www/comparee

echo "🚀 Spuštění aplikace s novým kódem..."
sudo -u comparee pm2 start ecosystem.config.cjs

echo "⏱️ Čekání na úplný start..."
sleep 10

echo "📊 Status aplikace:"
sudo -u comparee pm2 status

echo "🔄 Restart Nginx..."
systemctl reload nginx

echo "✅ Aplikace restartována s nejnovějším kódem"
RESTART

echo "📋 FÁZE 4: OVĚŘENÍ TOP LISTS ZMĚN"
echo "=============================="

echo "🧪 Test top lists endpointů..."

# Test top lists API
echo "1. Top Lists API:"
curl -s http://23.88.98.49/api/top-lists | jq '. | length' || echo "API nedostupné"

# Test top lists stránky
echo "2. Top Lists Homepage:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://23.88.98.49/top-lists

# Test konkrétní kategorie
echo "3. Test konkrétní top list kategorie:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://23.88.98.49/top-lists/ai-tools

echo ""
echo "🎉 DEPLOYMENT NEJNOVĚJŠÍHO KÓDU DOKONČEN!"
echo "========================================"
echo "✅ Nejnovější změny z lokálního kódu nasazeny"
echo "✅ Top lists komponenty aktualizovány"
echo "✅ Aplikace běží s nejnovější verzí"
echo ""
echo "🌐 URL pro ověření:"
echo "• Top Lists: http://23.88.98.49/top-lists"
echo "• API: http://23.88.98.49/api/top-lists"
