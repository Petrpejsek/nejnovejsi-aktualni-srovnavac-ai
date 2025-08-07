#!/bin/bash
# 🔧 FINÁLNÍ OPRAVA DATABÁZE

ssh root@195.201.219.128 << 'ENDSSH'
cd /var/www/comparee-ai

echo "🛑 Zastavení všech procesů..."
pkill -f npm || echo "No npm processes"
pkill -f node || echo "No node processes"
sleep 3

echo "📝 Vytváření .env.local s správným heslem..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_BASE_URL=http://195.201.219.128:3000
DATABASE_URL=postgresql://comparee_user:comparee_secure_password_2024!@localhost:5432/comparee_production
NODE_ENV=production
PORT=3000
EOF

echo "🔧 Regenerace Prisma s novým připojením..."
source .env.local
npx prisma generate
npx prisma db pull --force || echo "DB pull failed, continuing..."

echo "🚀 Spuštění aplikace s novým .env..."
source .env.local
nohup npm start > logs/app.log 2>&1 & echo $! > app.pid

echo "⏱️ Čekání na start..."
sleep 8

echo "🧪 Test API..."
curl -s http://localhost:3000/api/top-lists | head -5

ENDSSH

