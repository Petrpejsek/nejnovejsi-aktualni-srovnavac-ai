#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-https://comparee.ai}"
TOKEN="${1:-${TOKEN:-}}"
NEW_PASSWORD="${2:-${NEW_PASSWORD:-}}"
if [ -z "$TOKEN" ] || [ -z "$NEW_PASSWORD" ]; then echo "Usage: TOKEN=... NEW_PASSWORD=... $0"; exit 2; fi

CODE=$(curl -sS -m 8 -o /dev/null -w "%{http_code}" -H 'Content-Type: application/json' \
  -X POST "$BASE_URL/api/auth/password/reset-confirm" \
  --data "{\"token\":\"$TOKEN\",\"new_password\":\"$NEW_PASSWORD\"}")

case "$CODE" in
  200) echo "OK reset-confirm ($CODE)" ;;
  202) echo "OK already processed ($CODE)" ;;
  4*) echo "FAIL reset-confirm ($CODE)"; exit 1 ;;
  5*) echo "FAIL reset-confirm ($CODE)"; exit 1 ;;
  *) echo "FAIL reset-confirm ($CODE)"; exit 1 ;;
esac


