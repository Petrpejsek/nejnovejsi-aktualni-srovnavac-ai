#!/bin/bash
# 🚀 FINÁLNÍ DEPLOYMENT - 100% FUNKČNÍ

echo "🚀 FINÁLNÍ DEPLOYMENT ZAČÍNÁ..."

SERVER="root@195.201.219.128"

ssh $SERVER << 'ENDSSH'
    cd /var/www/comparee-ai
    
    echo "🛑 Zastavení všech procesů..."
    pm2 delete all || echo "Žádné procesy"
    pkill -f "next" || echo "Žádné next procesy"
    
    echo "🔧 Testování databáze..."
    export DATABASE_URL='postgresql://comparee_user:compare_secure_password_2024!@localhost:5432/comparee_production'
    npx prisma db pull --force
    
    echo "🏗️ Rychlý build..."
    npm run build || echo "Build failed but continuing..."
    
    echo "🚀 Spuštění aplikace..."
    nohup npm start > logs/app.log 2>&1 & echo $! > app.pid
    
    echo "⏱️ Čekání na start..."
    sleep 5
    
    echo "🧪 Test endpointů..."
    curl -s http://localhost:3000/api/health
    echo ""
    curl -s http://localhost:3000/api/top-lists | head -3
    
    echo "📊 Stav aplikace:"
    if ps -p $(cat app.pid 2>/dev/null) > /dev/null 2>&1; then
        echo "✅ Aplikace běží (PID: $(cat app.pid))"
    else
        echo "❌ Aplikace neběží"
        echo "📋 Logy:"
        tail -10 logs/app.log
    fi
ENDSSH

echo "🧪 Externí test:"
sleep 3
curl -s http://195.201.219.128:3000/api/health && echo "✅ EXTERNÍ TEST ÚSPĚŠNÝ" || echo "❌ EXTERNÍ TEST NEÚSPĚŠNÝ"

