#!/usr/bin/env sh
set -eu

usage() {
  cat <<'EOF'
Usage: scripts/pm2-restart.sh <process_name|all> [--update-env]

Examples:
  scripts/pm2-restart.sh all
  scripts/pm2-restart.sh comparee-web --update-env

This script must be run on the server (via SSH). Running it locally will NOT affect production.
EOF
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

PROC="${1:-}"
UPDATE="${2:-}"

echo "host: $(hostname)" || true
echo "uname: $(uname -s)" || true

if [ -z "$PROC" ]; then
  echo "ERROR: Missing process name (or 'all')" >&2
  usage
  exit 2
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "ERROR: pm2 not found in PATH" >&2
  exit 1
fi

# List processes and warn if none online
ONLINE_COUNT=$(pm2 ls | grep -cE "online|online\s*") || true
if [ "$ONLINE_COUNT" -eq 0 ]; then
  SYS=$(uname -s || echo unknown)
  if [ "$SYS" = "Darwin" ]; then
    echo "WARNING: It looks like you're on macOS and no PM2 apps are online." >&2
    echo "This will NOT restart production. SSH into the server first." >&2
  else
    echo "WARNING: PM2 shows no online apps. Check pm2 ls/status." >&2
  fi
fi

set +e
if [ "$PROC" = "all" ]; then
  if [ "$UPDATE" = "--update-env" ]; then
    pm2 restart all --update-env
  else
    pm2 restart all
  fi
  code=$?
else
  if [ "$UPDATE" = "--update-env" ]; then
    pm2 restart "$PROC" --update-env
  else
    pm2 restart "$PROC"
  fi
  code=$?
fi
set -e

if [ "$code" -ne 0 ]; then
  echo "ERROR: pm2 restart failed (code $code)" >&2
  exit $code
fi

echo "OK: pm2 restart command executed"


