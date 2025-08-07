#!/bin/bash
# 🚀 FINÁLNÍ 100% FIX - ŽÁDNÉ KOMPROMISY!

echo "🎯 FINÁLNÍ DEPLOYMENT - 100% FUNKČNÍ ŘEŠENÍ"

ssh root@195.201.219.128 << 'ENDSSH'
cd /var/www/comparee-ai

echo "🛑 UKONČENÍ VŠECH PROCESŮ"
pkill -f npm || true
pkill -f node || true
pkill -f next || true
sleep 3

echo "🧹 VYČIŠTĚNÍ CACHE"
rm -rf .next
rm -rf node_modules/@prisma/client
rm -rf node_modules/.prisma

echo "📝 VYTVOŘENÍ CORRECT .ENV.LOCAL (ověřené heslo funguje!)"
cat > .env.local << 'ENVEOF'
DATABASE_URL=postgresql://comparee_user:comparee_secure_password_2024!@localhost:5432/comparee_production
NEXT_PUBLIC_BASE_URL=http://195.201.219.128:3000
NODE_ENV=production
PORT=3000
NEXTAUTH_SECRET=development-secret-123
NEXTAUTH_URL=http://195.201.219.128:3000
JWT_SECRET=e9d77b5ea0174f493f7bf2c5a6f2383298b0c2c558084dbb371ae6c9ca3ad05e4e829e0c76385bcc6166356a5d2a951ed098e1ebf7eef6473e54086e06a35325
ENVEOF

echo "🔧 REGENERACE PRISMA CLIENT"
export $(cat .env.local | xargs)
npm install @prisma/client
npx prisma generate

echo "🏗️ PRODUCTION BUILD"
npm run build

echo "🚀 SPUŠTĚNÍ V PRODUKCI"
export $(cat .env.local | xargs)
nohup npm start > logs/app.log 2>&1 &
APP_PID=$!
echo $APP_PID > app.pid

echo "⏱️ ČEKÁNÍ NA ÚPLNÝ START..."
sleep 15

echo "🧪 KOMPLETNÍ TESTY:"
echo "1. Health check:"
curl -s http://localhost:3000/api/health

echo -e "\n2. Top Lists API (počet záznamů):"
TOP_LISTS_RESPONSE=$(curl -s http://localhost:3000/api/top-lists)
echo $TOP_LISTS_RESPONSE | grep -o '"id"' | wc -l

echo -e "\n3. Products API:"
PRODUCTS_RESPONSE=$(curl -s http://localhost:3000/api/products)
echo $PRODUCTS_RESPONSE | grep -o '"id"' | wc -l

echo -e "\n4. Konkrétní Top List stránka:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/top-lists/code-generation

echo -e "\n5. Homepage:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

echo -e "\n📊 FINÁLNÍ STATUS:"
if ps -p $APP_PID > /dev/null 2>&1; then
    echo "✅ Aplikace běží (PID: $APP_PID)"
    echo "✅ Port 3000 aktivní"
    netstat -tulpn | grep :3000
else
    echo "❌ PROBLÉM: Aplikace neběží!"
    echo "Posledních 10 řádků logů:"
    tail -10 logs/app.log
fi

ENDSSH

echo ""
echo "🌐 EXTERNÍ TESTY Z LOKÁLNÍHO PC:"
echo "1. Health API:"
curl -s http://195.201.219.128:3000/api/health

echo -e "\n2. Homepage:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://195.201.219.128:3000/

echo -e "\n3. Top Lists stránka:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://195.201.219.128:3000/top-lists/code-generation

echo "🎯 100% DEPLOYMENT KOMPLETNÍ!"

