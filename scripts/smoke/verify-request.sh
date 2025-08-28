#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-https://comparee.ai}"
EMAIL="${1:-${EMAIL:-}}"
if [ -z "$EMAIL" ]; then echo "Usage: EMAIL=foo@bar.com $0"; exit 2; fi

CODE=$(curl -sS -m 8 -o /dev/null -w "%{http_code}" -H 'Content-Type: application/json' \
  -X POST "$BASE_URL/api/auth/email/verify-request" \
  --data "{\"email\":\"$EMAIL\"}")

if [ "$CODE" = 200 ] || [ "$CODE" = 204 ]; then echo "OK verify-request ($CODE)"; else echo "FAIL verify-request ($CODE)"; exit 1; fi


