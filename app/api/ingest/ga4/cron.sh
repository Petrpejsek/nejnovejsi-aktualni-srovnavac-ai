#!/bin/sh
set -euo pipefail

# Minimal cron wrapper hitting internal ingest endpoint

BASE_URL="${NEXT_PUBLIC_BASE_URL:?NEXT_PUBLIC_BASE_URL is required}"
SECRET="${INTERNAL_NEXT_API_SECRET:?INTERNAL_NEXT_API_SECRET is required}"

curl -sS -X POST -H "x-internal-secret: $SECRET" "$BASE_URL/api/ingest/ga4/today" | cat


