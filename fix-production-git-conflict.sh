#!/bin/bash

# 🔧 OPRAVA GIT KONFLIKTU NA PRODUCTION SERVERU
# =============================================

echo "🔧 OPRAVUJI GIT KONFLIKT NA PRODUCTION SERVERU"
echo "=============================================="

SSH_HOST="comparee-production"
PROD_PATH="/var/www/comparee"

echo "🗂️  1. RESET PRODUCTION SERVERU NA NEJNOVĚJŠÍ VERZI"
echo "=================================================="
echo "⚠️  POZOR: Toto přepíše všechny lokální změny na serveru!"

# Force reset serveru na origin/main
ssh $SSH_HOST "cd $PROD_PATH && git fetch origin && git reset --hard origin/main"

if [ $? -ne 0 ]; then
    echo "❌ CHYBA při git reset"
    exit 1
fi

echo "✅ Git reset dokončen"
echo ""

echo "📦 2. INSTALACE DEPENDENCIES"
echo "============================"
ssh $SSH_HOST "cd $PROD_PATH && npm install"

echo ""
echo "🏗️  3. BUILD PRODUCTION"
echo "======================"
ssh $SSH_HOST "cd $PROD_PATH && rm -rf .next && npm run build"

echo ""
echo "🗄️  4. BEZPEČNÁ MIGRACE DATABÁZE"
echo "==============================="
echo "⚠️  POZOR: Pouze prisma migrate deploy - BEZ resetování!"
ssh $SSH_HOST "cd $PROD_PATH && npx prisma migrate deploy"

echo ""
echo "🔄 5. RESTART PM2"
echo "================"
ssh $SSH_HOST "cd $PROD_PATH && pm2 restart all"

echo ""
echo "✅ 6. KONTROLA STAVU"
echo "==================="
ssh $SSH_HOST "cd $PROD_PATH && pm2 status"

echo ""
echo "🎉 PRODUCTION DEPLOYMENT DOKONČEN!"
echo "================================="
echo "🌐 Test URL: http://23.88.98.49"