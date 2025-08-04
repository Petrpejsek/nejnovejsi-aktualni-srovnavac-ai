#!/bin/bash

# 🚀 SSH TUNNEL PRODUCTION DEPLOYMENT SCRIPT
# ==========================================
# ⚠️  KRITICKÉ: NIKDY NERESETOVAT DATABÁZI!

echo "🔐 SSH TUNNEL PRODUCTION DEPLOY"
echo "==============================="

# SSH Tunnel Configuration (VYPLŇ SPRÁVNÉ ÚDAJE)
JUMP_SERVER="YOUR_JUMP_SERVER"
JUMP_PORT="YOUR_JUMP_PORT"
JUMP_USER="YOUR_JUMP_USER"
LOCAL_PORT="2222"
TARGET_SERVER="23.88.98.49"
TARGET_USER="comparee"
TARGET_PATH="/var/www/comparee"

echo "🔧 1. VYTVÁŘENÍ SSH TUNELU"
echo "=========================="
echo "Jump server: $JUMP_USER@$JUMP_SERVER:$JUMP_PORT"
echo "Target: $TARGET_USER@$TARGET_SERVER via tunel"

# Vytvoření SSH tunelu na pozadí
ssh -fN -L $LOCAL_PORT:$TARGET_SERVER:22 $JUMP_USER@$JUMP_SERVER -p $JUMP_PORT

if [ $? -ne 0 ]; then
    echo "❌ CHYBA: Nepodařilo se vytvořit SSH tunel"
    exit 1
fi

echo "✅ SSH tunel vytvořen na portu $LOCAL_PORT"

# Funkce pro provádění příkazů přes tunel
run_via_tunnel() {
    ssh -p $LOCAL_PORT $TARGET_USER@localhost "$1"
}

echo ""
echo "📊 2. GIT PULL PŘES TUNEL"
echo "========================"
run_via_tunnel "cd $TARGET_PATH && git pull origin main"

echo ""
echo "📦 3. INSTALACE DEPENDENCIES"
echo "============================"
run_via_tunnel "cd $TARGET_PATH && npm install"

echo ""
echo "🏗️  4. BUILD PRODUCTION"
echo "======================"
run_via_tunnel "cd $TARGET_PATH && npm run build"

echo ""
echo "🗄️  5. BEZPEČNÁ MIGRACE DATABÁZE (BEZ RESETU!)"
echo "==============================================="
echo "⚠️  Pouze prisma migrate deploy - BEZ resetování!"
run_via_tunnel "cd $TARGET_PATH && npx prisma migrate deploy"

echo ""
echo "🔄 6. RESTART PM2"
echo "================"
run_via_tunnel "cd $TARGET_PATH && pm2 restart all"

echo ""
echo "✅ 7. KONTROLA STAVU"
echo "==================="
run_via_tunnel "cd $TARGET_PATH && pm2 status"

echo ""
echo "📋 8. POSLEDNÍ LOGY"
echo "=================="
run_via_tunnel "cd $TARGET_PATH && pm2 logs --lines 10"

echo ""
echo "🧹 9. UKONČENÍ SSH TUNELU"
echo "========================"
# Najdi a ukonči SSH tunel proces
TUNNEL_PID=$(ps aux | grep "ssh.*-L $LOCAL_PORT:$TARGET_SERVER:22" | grep -v grep | awk '{print $2}')
if [ ! -z "$TUNNEL_PID" ]; then
    kill $TUNNEL_PID
    echo "✅ SSH tunel ukončen (PID: $TUNNEL_PID)"
else
    echo "⚠️  SSH tunel proces nenalezen"
fi

echo ""
echo "🎉 DEPLOYMENT DOKONČEN!"
echo "======================="
echo "🌐 Test URL: http://23.88.98.49"
echo "🔐 Admin: http://23.88.98.49/admin"
echo "🏢 Company: http://23.88.98.49/company"
echo "👤 User: http://23.88.98.49/user-area"