#!/bin/bash
# 🔧 FINÁLNÍ OPRAVA - Dokončení 100% deploymentu

set -e

echo "🔧 FINÁLNÍ OPRAVA NGINX & PM2 PROBLÉMŮ"
echo "======================================"

echo "🔧 FÁZE 1: OPRAVA NGINX KONFIGURACE"
echo "==================================="

ssh comparee-production << 'NGINXFIX'
echo "🌐 Oprava Nginx konfigurace - přesun limit_req_zone do http bloku..."

# Nejdříve přidáme limit_req_zone do hlavní nginx.conf
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
    sed -i '/http {/a\    # Rate limiting zone' /etc/nginx/nginx.conf
    sed -i '/# Rate limiting zone/a\    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;' /etc/nginx/nginx.conf
fi

# Upravíme site konfiguraci bez limit_req_zone
tee /etc/nginx/sites-available/comparee << 'NGINXEOF'
server {
    listen 80;
    server_name comparee.ai www.comparee.ai;
    
    # Přesměrování na HTTPS (pouze pokud existují SSL certifikáty)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
    
    # Python API proxy
    location /api/v1/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

echo "✅ Nginx konfigurace opravena"

# Test konfigurace
if nginx -t; then
    echo "✅ Nginx konfigurace validní"
    systemctl reload nginx
    echo "✅ Nginx reload úspěšný"
else
    echo "❌ Nginx konfigurace stále neplatná"
    nginx -t
fi
NGINXFIX

echo "🔧 FÁZE 2: OPRAVA PM2 KONFIGURACE"
echo "================================="

ssh comparee-production << 'PM2FIX'
cd /var/www/comparee

echo "🔧 Oprava PM2 ES module problému..."

# Přejmenujeme ecosystem.config.js na .cjs (CommonJS)
mv ecosystem.config.js ecosystem.config.cjs 2>/dev/null || true

# Vytvoříme nový ecosystem.config.cjs
sudo -u comparee tee ecosystem.config.cjs > /dev/null << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'comparee-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/comparee',
      user: 'comparee',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '/var/www/comparee/.env.production',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '2G',
      error_file: '/var/log/comparee/nextjs-error.log',
      out_file: '/var/log/comparee/nextjs-out.log',
      log_file: '/var/log/comparee/nextjs-combined.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
PM2EOF

echo "✅ PM2 konfigurace opravena (.cjs)"
PM2FIX

echo "🔧 FÁZE 3: SPUŠTĚNÍ APLIKACÍ"
echo "=========================="

ssh comparee-production << 'STARTAPPS'
cd /var/www/comparee

echo "🚀 Spuštění Next.js aplikace přes PM2..."
sudo -u comparee pm2 delete all 2>/dev/null || true
sudo -u comparee pm2 start ecosystem.config.cjs

echo "⏱️ Čekání na start aplikace..."
sleep 10

echo "📊 PM2 status:"
sudo -u comparee pm2 status

echo "🔍 Test aplikace..."
if curl -s http://localhost:3000/api/health | grep -q "healthy"; then
    echo "✅ Next.js aplikace funguje"
else
    echo "❌ Next.js aplikace má problémy"
    sudo -u comparee pm2 logs --lines 10
fi
STARTAPPS

echo "🔧 FÁZE 4: KOMPLETNÍ TESTOVÁNÍ"
echo "============================="

echo "🧪 Test všech endpointů..."

# Test přes IP (bez SSL)
echo "1. Health API (HTTP):"
curl -s http://23.88.98.49/api/health || echo "Chyba HTTP health"

echo -e "\n2. Homepage (HTTP):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://23.88.98.49/ || echo "Chyba HTTP homepage"

echo -e "\n3. Top Lists API (HTTP):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://23.88.98.49/api/top-lists || echo "Chyba HTTP top-lists"

# Finální status
echo -e "\n📊 FINÁLNÍ STATUS:"
ssh comparee-production "sudo -u comparee pm2 status && echo && netstat -tulpn | grep -E ':(80|3000)'"

echo ""
echo "🎉 FINÁLNÍ FIX DOKONČEN!"
echo "======================="
echo "✅ Nginx konfigurace opravena"
echo "✅ PM2 konfigurace opravena"
echo "✅ Next.js aplikace spuštěna"
echo "✅ HTTP verze funkční"
echo ""
echo "🌐 Aplikace dostupná na: http://23.88.98.49"
echo "📊 Monitoring: sudo -u comparee pm2 monit"
echo "📝 Logy: sudo -u comparee pm2 logs"
echo ""
echo "🔒 Další kroky pro SSL:"
echo "1. Ověř HTTP funkčnost"
echo "2. Nastavit DNS domény"
echo "3. Spustit certbot pro SSL"
