#!/bin/bash
set -e

# Konfigurace serveru
SSH_USER="root"
SERVER_IP="195.201.219.128"
APP_PATH="/var/www/comparee-ai"
APP_NAME="comparee-ai"

echo "🚀 DEPLOYMENT NA HETZNER - Comparee.ai"
echo "====================================="

# Ověř, že máme přístup k serveru
echo "🔍 Testování SSH připojení..."
if ssh -o ConnectTimeout=10 $SSH_USER@$SERVER_IP "echo 'SSH OK'" > /dev/null; then
    echo "   ✓ SSH připojení funguje"
else
    echo "   ❌ SSH připojení selhalo! Zkontroluj server a klíče."
    exit 1
fi

echo ""
echo "🔄 Provádím deployment na serveru..."

ssh $SSH_USER@$SERVER_IP <<EOF
    set -e
    
    echo "📂 Přecházím do aplikačního adresáře..."
    cd $APP_PATH || { echo "❌ Adresář $APP_PATH neexistuje!"; exit 1; }
    
    echo "📡 Git pull latest changes..."
    git fetch origin
    git reset --hard origin/main
    
    echo "📦 Instalace/update závislostí..."
    npm ci --production
    
    echo "🗄️  Prisma migrace a generování klienta..."
    npx prisma migrate deploy
    npx prisma generate
    
    echo "🏗️  Build produkční verze..."
    npm run build
    
    echo "♻️  Restart aplikace přes PM2..."
    if pm2 list | grep -q "$APP_NAME"; then
        echo "   Restartuji existující aplikaci..."
        pm2 restart $APP_NAME
    else
        echo "   Spouštím novou instanci..."
        pm2 start npm --name "$APP_NAME" -- run start
    fi
    
    echo "📊 Čekám na start aplikace..."
    sleep 5
    
    echo "🩺 Health check..."
    pm2 show $APP_NAME
    
    echo ""
    echo "✅ DEPLOYMENT ÚSPĚŠNÝ!"
    echo "🌐 Aplikace běží na: https://comparee.ai"
    echo "📊 PM2 status:"
    pm2 list
EOF

echo ""
echo "🎉 DEPLOYMENT DOKONČEN!"
echo "====================================="
echo ""
echo "Ověř deployment:"
echo "1. curl https://comparee.ai/api/health"
echo "2. Zkontroluj web v prohlížeči"
echo "3. Sleduj logy: ssh $SSH_USER@$SERVER_IP 'pm2 logs $APP_NAME'" 