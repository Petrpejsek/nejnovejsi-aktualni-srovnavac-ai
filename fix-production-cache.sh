#!/bin/bash

# 🔧 OPRAVA PRODUCTION CACHE - KOMPLETNÍ RESTART
# ==============================================

echo "🔧 OPRAVUJI PRODUCTION CACHE A ROUTING"
echo "======================================"

SSH_HOST="comparee-production"
PROD_PATH="/var/www/comparee"

echo "🗂️  1. KONTROLA AKTUÁLNÍHO STAVU"
echo "==============================="
ssh $SSH_HOST "cd $PROD_PATH && git log --oneline -3"

echo ""
echo "🧹 2. VYČIŠTĚNÍ NEXT.JS CACHE"
echo "============================"
ssh $SSH_HOST "cd $PROD_PATH && rm -rf .next"

echo ""
echo "🏗️  3. NOVÝ BUILD S VYČIŠTĚNÍM"
echo "============================="
ssh $SSH_HOST "cd $PROD_PATH && npm run build"

echo ""
echo "🔄 4. RESTART PM2 S VYČIŠTĚNÍM"
echo "============================="
ssh $SSH_HOST "cd $PROD_PATH && pm2 kill && pm2 start ecosystem.config.js"

echo ""
echo "✅ 5. KONTROLA STAVU"
echo "==================="
ssh $SSH_HOST "cd $PROD_PATH && pm2 status"

echo ""
echo "🌐 6. TEST URL STRUKTUR"
echo "======================"
echo "🔍 Testing main routes..."