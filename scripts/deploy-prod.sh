#!/usr/bin/env bash
set -euo pipefail

# Comparee.ai – Production deploy (Hetzner)
# - Server: 23.88.98.49
# - App dir: /var/www/comparee
# - PM2 process: comparee-nextjs
# - Safe DB migrations: prisma migrate deploy (NO reset/dev/push)

echo "==> Loading SSH key (if needed)"
ssh-add -l >/dev/null 2>&1 || ssh-add ~/.ssh/hetzner_comparee >/dev/null 2>&1 || true

REMOTE="root@23.88.98.49"

echo "==> Deploying on ${REMOTE}"
ssh "$REMOTE" <<'EOS'
set -euo pipefail
APP_DIR="/var/www/comparee"
cd "$APP_DIR"
echo "DIR:$(pwd)"

echo "==> Sync code to origin/main"
git fetch --all -q || true
git checkout -q main || true
git reset -q --hard origin/main || true

echo "==> Ensure production env"
[ -f .env.production ] || touch .env.production
grep -q '^NEXT_PUBLIC_ASSET_PREFIX=' .env.production || echo NEXT_PUBLIC_ASSET_PREFIX=http://23.88.98.49 >> .env.production
grep -q '^NEXTAUTH_URL=' .env.production || echo NEXTAUTH_URL=http://23.88.98.49 >> .env.production

echo "==> Install deps (with dev)"
unset NODE_ENV
npm ci --include=dev --no-audit --no-fund --silent || npm install --include=dev --no-audit --no-fund --silent

echo "==> Prisma generate & deploy"
npx prisma generate >/dev/null 2>&1 || true
npx prisma migrate deploy --schema prisma/schema.prisma >/dev/null 2>&1 || true

echo "==> Clean & build"
rm -rf .next
NODE_ENV=production npm run build --silent

echo "==> Restart PM2"
if pm2 describe comparee-nextjs >/dev/null 2>&1; then
  pm2 restart comparee-nextjs >/dev/null 2>&1
else
  if [ -f ecosystem.config.cjs ]; then
    pm2 start ecosystem.config.cjs --only comparee-nextjs --update-env >/dev/null 2>&1
  else
    pm2 start npm --name comparee-nextjs -- start >/dev/null 2>&1
  fi
fi
pm2 save >/dev/null 2>&1 || true

# Readiness check with timeout (wait for Next.js to bind on :3000)
READY=0
for i in $(seq 1 60); do
  CODE=$(curl -s --max-time 2 -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health || true)
  case "$CODE" in
    2*|3*|4*) READY=1; break;;
  esac
  sleep 1
done

HEAD=$(git rev-parse --short HEAD || echo none)
BUILD_ID=$( [ -f .next/BUILD_ID ] && cat .next/BUILD_ID || echo none)
echo "HEALTH_CODE:${CODE}"
echo "READY:${READY}"
echo "HEAD:${HEAD}"
echo "BUILD_ID:${BUILD_ID}"

[ "$READY" = "1" ] || { echo "Deploy health check failed (service not ready)" >&2; exit 1; }
EOS

echo "==> Deploy finished"
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
echo "1. curl http://23.88.98.49/api/health"
echo "2. Zkontroluj web v prohlížeči"
echo "3. Sleduj logy: ssh $SSH_USER@$SERVER_IP 'pm2 logs $APP_NAME'" 