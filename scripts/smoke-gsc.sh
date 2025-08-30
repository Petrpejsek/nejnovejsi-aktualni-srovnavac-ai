#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-https://comparee.ai}"

# Token: 1) z env GSC_CRON_TOKEN, 2) ze serverového .env.production (pokud existuje)
TOKEN="${GSC_CRON_TOKEN:-}"
if [[ -z "${TOKEN}" && -f ".env.production" ]]; then
  TOKEN="$(grep -E '^GSC_CRON_TOKEN=' .env.production | cut -d= -f2- | tr -d '"')"
fi

fail() { echo "❌ $*" >&2; exit 1; }
pass() { echo "✅ $*"; }

echo "== BASE_URL: $BASE =="

# 1) summary → 200 + očekávaná pole
code="$(curl -sS -o /tmp/sum.json -w '%{http_code}' "$BASE/api/seo/gsc-summary")" || true
[[ "$code" == "200" ]] || fail "summary HTTP $code (expected 200)"
grep -q '"propertyUrl"' /tmp/sum.json || fail "summary missing propertyUrl"
grep -q '"siteType"'    /tmp/sum.json || fail "summary missing siteType"
pass "summary OK (200 + propertyUrl + siteType)"

# 2) sync bez tokenu → 403
code="$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/seo/gsc-sync")" || true
[[ "$code" == "403" ]] || fail "sync without token HTTP $code (expected 403)"
pass "sync without token -> 403 OK"

# 3) sync dryRun → 200
if [[ -z "${TOKEN}" ]]; then
  fail "missing GSC_CRON_TOKEN (export GSC_CRON_TOKEN=... or ensure .env.production contains it)"
fi
code="$(curl -sS -o /tmp/dry.json -w '%{http_code}' -X POST \
  -H "X-GSC-CRON-TOKEN: $TOKEN" -H "Content-Type: application/json" \
  -d '{"limit":10,"dryRun":true,"priority":"not_indexed_first"}' \
  "$BASE/api/seo/gsc-sync")" || true
[[ "$code" == "200" ]] || fail "sync dryRun HTTP $code (expected 200)"
grep -q '"status"'    /tmp/dry.json || fail "dryRun missing status"
grep -q '"processed"' /tmp/dry.json || fail "dryRun missing processed"
pass "sync dryRun -> 200 OK"

# 4) sync real small → 200 (nevyžadujeme succeeded>0, jen 200 + pole)
code="$(curl -sS -o /tmp/real.json -w '%{http_code}' -X POST \
  -H "X-GSC-CRON-TOKEN: $TOKEN" -H "Content-Type: application/json" \
  -d '{"limit":5,"dryRun":false,"priority":"not_indexed_first"}' \
  "$BASE/api/seo/gsc-sync")" || true
[[ "$code" == "200" ]] || fail "sync real HTTP $code (expected 200)"
grep -q '"processed"' /tmp/real.json || fail "real sync missing processed"
grep -q '"errorSummary"' /tmp/real.json || fail "real sync missing errorSummary"
pass "sync real -> 200 OK"

# Výpis krátké rekapitulace (bez jq)
echo "---- summary.json (truncated) ----"
head -c 600 /tmp/sum.json; echo
echo "---- dry.json ----"
cat /tmp/dry.json; echo
echo "---- real.json ----"
cat /tmp/real.json; echo

echo "Tip: On server run → pm2 logs comparee-nextjs --lines 100 | egrep '\\[GSC\\] (sync start|sync done)'"
pass "Smoke finished"



