#!/usr/bin/env bash
set -euo pipefail

APP_NAME="comparee-nextjs"

echo "=== PM2 Status ==="
pm2 status "$APP_NAME" || true

echo "=== Last 50 log lines ==="
pm2 logs "$APP_NAME" --lines 50 | cat

echo "=== Health ==="
curl -s -o /dev/null -w "Health: %{http_code}\n" http://localhost:3000/api/health || true


