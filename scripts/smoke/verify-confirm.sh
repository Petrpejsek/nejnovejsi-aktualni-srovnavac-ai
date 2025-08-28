#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-https://comparee.ai}"
TOKEN="${1:-${TOKEN:-}}"
if [ -z "$TOKEN" ]; then echo "Usage: TOKEN=... $0"; exit 2; fi

CODE=$(curl -sS -m 8 -o /dev/null -w "%{http_code}" -H 'Content-Type: application/json' \
  -X POST "$BASE_URL/api/auth/email/verify-confirm" \
  --data "{\"token\":\"$TOKEN\"}")

if [ "$CODE" = 200 ] || [ "$CODE" = 204 ]; then echo "OK verify-confirm ($CODE)"; else echo "FAIL verify-confirm ($CODE)"; exit 1; fi


