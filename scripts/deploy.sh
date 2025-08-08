#!/usr/bin/env bash
set -euo pipefail

REMOTE="comparee-production"
APP_DIR="/var/www/comparee"
APP_NAME="comparee-nextjs"

echo "=== Deploy ==="

# 0) Prechecks
bash scripts/pre-deploy-check.sh

# 1) Tag pre-deploy
TAG="pre-deploy-$(date +%Y%m%d_%H%M%S)"
git tag -f "$TAG"
git push origin "$TAG"

# 2) Push main
git push origin main

# 3) Remote deploy steps (no migrate dev!)
ssh "$REMOTE" bash -s <<EOF
set -euo pipefail
cd "$APP_DIR"

sudo -u comparee git fetch origin
sudo -u comparee git reset --hard origin/main

echo "→ Ensuring Node version"
if command -v nvm >/dev/null 2>&1 && [ -f .nvmrc ]; then
  . ~/.nvm/nvm.sh && nvm install && nvm use
fi

echo "→ Installing deps (CI)"
npm ci --no-audit --no-fund

echo "→ Prisma migrate deploy"
npm run db:migrate:deploy

echo "→ Build"
npm run build

echo "→ Restart PM2"
sudo -u comparee pm2 start \"npm start\" --name \"$APP_NAME\" || true
sudo -u comparee pm2 restart "$APP_NAME"
sudo -u comparee pm2 save || true

echo "→ HealthCheck"
code=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || true)
echo "Health: \$code"
test "\$code" = "200"
EOF

echo "✅ Deploy OK"


