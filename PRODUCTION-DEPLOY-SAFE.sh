#!/bin/bash

# 🚀 BEZPEČNÝ PRODUCTION DEPLOY SCRIPT
# ==================================
# ⚠️  KRITICKÉ: NIKDY NERESETOVAT DATABÁZI!

echo "🚀 SPOUŠTÍM BEZPEČNÝ PRODUCTION DEPLOY"
echo "======================================"

# Production server details
PROD_SERVER="comparee@23.88.98.49"
PROD_PATH="/var/www/comparee"

echo "📊 1. GIT PULL NA PRODUCTION SERVERU"
echo "===================================="
ssh $PROD_SERVER "cd $PROD_PATH && git pull origin main"

echo ""
echo "📦 2. INSTALACE DEPENDENCIES"
echo "============================="
ssh $PROD_SERVER "cd $PROD_PATH && npm install"

echo ""
echo "🏗️  3. BUILD PRODUCTION"
echo "======================"
ssh $PROD_SERVER "cd $PROD_PATH && npm run build"

echo ""
echo "🗄️  4. BEZPEČNÁ MIGRACE DATABÁZE (BEZ RESETU!)"
echo "==============================================="
echo "⚠️  Pouze prisma migrate deploy - BEZ ztráty dat!"
ssh $PROD_SERVER "cd $PROD_PATH && npx prisma migrate deploy"

echo ""
echo "🔄 5. RESTART PM2 PROCESŮ"
echo "========================="
ssh $PROD_SERVER "cd $PROD_PATH && pm2 restart all"

echo ""
echo "✅ 6. OVĚŘENÍ STAVU"
echo "=================="
ssh $PROD_SERVER "cd $PROD_PATH && pm2 status && pm2 logs --lines 10"

echo ""
echo "🎉 DEPLOYMENT DOKONČEN!"
echo "======================="
echo "🌐 Kontrola: http://23.88.98.49"
echo "🔐 Admin: http://23.88.98.49/admin"
echo "🏢 Company: http://23.88.98.49/company"  
echo "👤 User: http://23.88.98.49/user-area"