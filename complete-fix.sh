#!/bin/bash
# 🚀 KOMPLETNÍ OPRAVA - 100% DEPLOYMENT

ssh root@195.201.219.128 << 'ENDSSH'
cd /var/www/comparee-ai

echo "🛑 Úplné zastavení všech procesů..."
pkill -f npm || echo "No npm processes"
pkill -f node || echo "No node processes"
pkill -f next || echo "No next processes"
sleep 5

echo "🗑️ Vymazání cache a built souborů..."
rm -rf .next
rm -rf node_modules/@prisma/client
rm -rf node_modules/.prisma

echo "📝 Vytváření správného .env.local..."
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://comparee_user:comparee_secure_password_2024!@localhost:5432/comparee_production
NEXT_PUBLIC_BASE_URL=http://195.201.219.128:3000
NODE_ENV=production
PORT=3000
EOF

echo "🔧 Reinstall Prisma client s novými credentials..."
export DATABASE_URL="postgresql://comparee_user:comparee_secure_password_2024!@localhost:5432/comparee_production"
npm install @prisma/client
npx prisma generate

echo "🏗️ Kompletní rebuild aplikace..."
npm run build

echo "🚀 Spuštění aplikace..."
npm start &
echo $! > app.pid

echo "⏱️ Čekání na start aplikace..."
sleep 10

echo "🧪 Test API endpointů..."
curl -s http://localhost:3000/api/health
echo ""
curl -s http://localhost:3000/api/top-lists | head -5

echo ""
echo "📊 Status aplikace:"
if ps -p $(cat app.pid) > /dev/null 2>&1; then
    echo "✅ Aplikace běží (PID: $(cat app.pid))"
else
    echo "❌ Aplikace neběží"
fi

ENDSSH

