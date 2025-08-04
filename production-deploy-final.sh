#!/bin/bash

# 🚀 FINÁLNÍ PRODUCTION DEPLOYMENT SCRIPT
# ========================================
# ⚠️  KRITICKÉ: NIKDY NERESETOVAT DATABÁZI!

echo "🚀 SPOUŠTÍM FINÁLNÍ PRODUCTION DEPLOY"
echo "===================================="

# SSH Configuration
SSH_HOST="comparee-production"
PROD_PATH="/var/www/comparee"

echo "🔗 Připojuji se k: $SSH_HOST"
echo "📁 Cílový adresář: $PROD_PATH"
echo ""

# Funkce pro provádění příkazů na serveru
run_on_server() {
    echo "🔧 Spouštím: $1"
    ssh $SSH_HOST "$1"
    if [ $? -ne 0 ]; then
        echo "❌ CHYBA při provádění: $1"
        exit 1
    fi
    echo "✅ Dokončeno: $1"
    echo ""
}

echo "📊 1. GIT PULL - STAHOVÁNÍ NEJNOVĚJŠÍ VERZE"
echo "==========================================="
run_on_server "cd $PROD_PATH && git pull origin main"

echo "📦 2. INSTALACE DEPENDENCIES"
echo "============================"
run_on_server "cd $PROD_PATH && npm install"

echo "🏗️  3. BUILD PRODUCTION APLIKACE"
echo "==============================="
run_on_server "cd $PROD_PATH && rm -rf .next && npm run build"

echo "🗄️  4. BEZPEČNÁ MIGRACE DATABÁZE"
echo "==============================="
echo "⚠️  POZOR: Pouze prisma migrate deploy - BEZ resetování databáze!"
run_on_server "cd $PROD_PATH && npx prisma migrate deploy"

echo "🔄 5. RESTART PM2 PROCESŮ"
echo "========================"
run_on_server "cd $PROD_PATH && pm2 restart all"

echo "✅ 6. KONTROLA STAVU PM2"
echo "======================="
ssh $SSH_HOST "cd $PROD_PATH && pm2 status"

echo ""
echo "📋 7. POSLEDNÍ LOGY (kontrola chyb)"
echo "=================================="
ssh $SSH_HOST "cd $PROD_PATH && pm2 logs --lines 15"

echo ""
echo "🎉 DEPLOYMENT ÚSPĚŠNĚ DOKONČEN!"
echo "==============================="
echo ""
echo "🌐 TESTOVACÍ URL:"
echo "• Hlavní stránka: http://23.88.98.49"
echo "• Admin panel: http://23.88.98.49/admin"
echo "• Company portal: http://23.88.98.49/company"
echo "• User area: http://23.88.98.49/user-area"
echo ""
echo "🔐 TESTOVACÍ PŘIHLÁŠENÍ:"
echo "• Admin: admin@admin.com / admin123"
echo "• Company: petr@firmicka.cz / firma123"
echo "• User: petr@comparee.cz / user123"
echo ""
echo "✅ Ověřte, že všechny funkce fungují správně!"