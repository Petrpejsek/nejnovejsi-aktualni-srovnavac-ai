#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   SSH_HOST=root@23.88.98.49 APP_DIR=/var/www/comparee SSH_KEY=~/.ssh/hetzner_comparee \
#     bash scripts/fetch-gsc-env.sh

SSH_HOST="${SSH_HOST:-root@23.88.98.49}"
APP_DIR="${APP_DIR:-/var/www/comparee}"
SSH_KEY="${SSH_KEY:-}"

SSH_CMD=(ssh -o BatchMode=yes)
SCP_CMD=(scp)
if [[ -n "$SSH_KEY" ]]; then SSH_CMD+=( -i "$SSH_KEY" ); SCP_CMD+=( -i "$SSH_KEY" ); fi

echo "== fetching GSC env from $SSH_HOST:$APP_DIR =="
"${SSH_CMD[@]}" "$SSH_HOST" /bin/bash -lc "cd '$APP_DIR' && { \
  grep -E '^(GSC_SYNC_ENABLED|GSC_SITE_URL|GSC_CRON_TOKEN)=' .env.production || true; \
  grep -E '^GCP_SA_JSON_BASE64=' .env.production || true; \
} > /tmp/.env.gsc.local"

"${SCP_CMD[@]}" "$SSH_HOST":/tmp/.env.gsc.local .env.local

printf '\nNEXTAUTH_URL=http://localhost:3000\nNEXT_PUBLIC_BASE_URL=http://localhost:3000\n' >> .env.local

echo "Wrote .env.local (GSC vars + local NEXT_*). Do NOT commit this file."



