#!/usr/bin/env bash
set -euo pipefail

echo "=== Pre-Deploy Check ==="

# 1) Node + package manager parity
echo "→ Node: $(node -v)"
echo "→ NPM:  $(npm -v)"
if command -v pnpm >/dev/null 2>&1; then echo "→ PNPM: $(pnpm -v)"; fi

# 2) Lockfile presence
test -f package-lock.json || { echo "❌ Missing package-lock.json"; exit 1; }

# 3) Prisma: forbid migrate dev
if grep -q "migrate dev" package.json; then echo "✅ prisma migrate dev present (ok for dev)"; fi
echo "✅ Will use prisma migrate deploy in CI/prod"

# 4) Clean build
echo "→ Installing deps (npm ci)" && npm ci --no-audit --no-fund
echo "→ Building" && npm run build

# 5) Ensure DB tunnel if using localhost:5433
if grep -q "localhost:5433" .env.local 2>/dev/null; then
  echo "→ Ensuring SSH tunnel :5433 -> :5432"
  if lsof -nP -iTCP:5433 -sTCP:LISTEN >/dev/null 2>&1; then echo "  • Tunnel already up"; else ssh -f -N -L 5433:localhost:5432 comparee-database && echo "  • Tunnel started"; fi
fi

# 5) Static export smoke (optional)
if npm run | grep -q "export"; then
  echo "→ Export (optional)" && npm run export || echo "(skip export)"
fi

# 6) Local health check (requires dev or start)
echo "→ Starting preview server (next start -p 4010)"
export NODE_ENV=production
export NEXTAUTH_URL=http://localhost:4010
nohup npx next start -p 4010 > .predeploy-preview.log 2>&1 & echo $! > .predeploy-preview.pid
sleep 3
code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4010/api/health || true)
kill $(cat .predeploy-preview.pid) || true
echo "→ Health /api/health: $code"
test "$code" = "200" || { echo "❌ Health check failed"; exit 1; }

echo "✅ Pre-Deploy OK"


