#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://127.0.0.1:3000}"

TOKEN="${GSC_CRON_TOKEN:-}"
if [[ -z "${TOKEN}" && -f ".env.local" ]]; then
  TOKEN="$(grep -E '^GSC_CRON_TOKEN=' .env.local | cut -d= -f2- | tr -d '"')"
fi

fail() { echo "❌ $*" >&2; exit 1; }
pass() { echo "✅ $*"; }

echo "== BASE_URL: $BASE =="

echo "== summary =="
code="$(curl -sS -o /tmp/sum.json -w '%{http_code}' "$BASE/api/seo/gsc-summary")" || true
[[ "$code" == "200" ]] || fail "summary HTTP $code (expected 200)"
grep -q '"propertyUrl"' /tmp/sum.json || fail "summary missing propertyUrl"
grep -q '"siteType"'    /tmp/sum.json || fail "summary missing siteType"
pass "summary OK (200 + propertyUrl + siteType)"

echo "== sync without token =="
code="$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/seo/gsc-sync")" || true
[[ "$code" == "403" ]] || fail "sync without token HTTP $code (expected 403)"
pass "sync without token -> 403 OK"

echo "== sync dryRun =="
if [[ -z "${TOKEN}" ]]; then
  fail "missing GSC_CRON_TOKEN (export GSC_CRON_TOKEN=... or ensure .env.local contains it)"
fi
code="$(curl -sS -o /tmp/dry.json -w '%{http_code}' -X POST \
  -H "X-GSC-CRON-TOKEN: $TOKEN" -H "Content-Type: application/json" \
  -d '{"limit":10,"dryRun":true,"priority":"not_indexed_first"}' \
  "$BASE/api/seo/gsc-sync")" || true
[[ "$code" == "200" ]] || fail "sync dryRun HTTP $code (expected 200)"
grep -q '"status"'    /tmp/dry.json || fail "dryRun missing status"
grep -q '"processed"' /tmp/dry.json || fail "dryRun missing processed"
pass "sync dryRun -> 200 OK"

echo "All sanity checks passed."



