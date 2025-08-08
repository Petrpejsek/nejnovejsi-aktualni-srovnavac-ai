#!/usr/bin/env bash
set -euo pipefail

REMOTE="comparee-production"
APP_DIR="/var/www/comparee"
APP_NAME="comparee-nextjs"

TAG="${1:-}"
if [ -z "$TAG" ]; then
  echo "Usage: $0 <git-tag>"; exit 1;
fi

echo "=== Rollback to $TAG ==="

ssh "$REMOTE" bash -s <<EOF
set -euo pipefail
cd "$APP_DIR"
sudo -u comparee git fetch --tags origin
sudo -u comparee git checkout -f "$TAG"

npm ci --no-audit --no-fund
npm run db:migrate:deploy
npm run build

sudo -u comparee pm2 restart "$APP_NAME" || sudo -u comparee pm2 start \"npm start\" --name \"$APP_NAME\"
sudo -u comparee pm2 save || true
EOF

echo "✅ Rolled back to $TAG"


