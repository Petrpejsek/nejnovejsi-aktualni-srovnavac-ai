# SEO GSC Integration (URL Inspection MVP)

This project includes a production‑only, fail‑fast integration with Google Search Console URL Inspection API for monitoring indexing status of landing pages.

Requirements and guarantees:

- Service Account only (no OAuth fallbacks). If SA is missing/invalid, endpoints return 503.
- Read‑only impact (writes only to `seo_gsc_status` table).
- Prod‑only and token‑guarded sync endpoint.
- Feature flag default OFF.

## Environment variables

Add the following to your `.env.production`:

```
# Required base URL
NEXT_PUBLIC_BASE_URL=https://comparee.ai

# GSC feature flag (default OFF)
GSC_SYNC_ENABLED=false

# GSC Service Account (base64 of the JSON file)
GCP_SA_JSON_BASE64=<base64-of-service-account-json>

# Cron token (used to authorize batch sync)
GSC_CRON_TOKEN=<openssl rand -hex 24>
```

Notes:
- Encode your SA file with: `base64 -w0 /path/to/gsc-sa.json`
- The SA must have access (Owner/User) to the Search Console property `https://comparee.ai/`.

## Enabling and verification (prod)

1) Insert SA as base64 and enable the flag:
```
sed -i "/^GCP_SA_JSON_BASE64=/d" .env.production; echo "GCP_SA_JSON_BASE64=$(base64 -w0 /root/gsc-sa.json)" >> .env.production
sed -i "/^GSC_SYNC_ENABLED=/d" .env.production; echo "GSC_SYNC_ENABLED=true" >> .env.production
pm2 restart comparee-nextjs --update-env
```

2) Verify endpoints (prod):
```
# Summary (read-only) — should return 200 JSON
curl -fsS https://comparee.ai/api/seo/gsc-summary | jq .

# Sync — 403 without token
curl -i -s -X POST https://comparee.ai/api/seo/gsc-sync | sed -n '1,8p'

# Sync — 200 with token (dry-run, no side-effects)
TOKEN=$(grep -E "^GSC_CRON_TOKEN=" .env.production | cut -d"=" -f2-)
curl -fsS -X POST -H "X-GSC-CRON-TOKEN: $TOKEN" -H "Content-Type: application/json" \
  -d '{"limit":25,"dryRun":true,"priority":"not_indexed_first"}' \
  https://comparee.ai/api/seo/gsc-sync | jq .
```

## How cron works

- Runs once per day at 03:15 CET with conservative limit (1500/day).
- Calls the token‑guarded sync endpoint with the cron token.
- Logs to `/var/log/gsc-sync.log`.

Example crontab line:
```
15 3 * * * curl -fsS -X POST -H "X-GSC-CRON-TOKEN: $TOKEN" -H "Content-Type: application/json" -d '{"limit":1500,"priority":"not_indexed_first"}' https://comparee.ai/api/seo/gsc-sync > /var/log/gsc-sync.log 2>&1
```

# comparee.ai

Webová aplikace pro srovnávání AI nástrojů a služeb.

## Lokální vývoj

1. Naklonujte repozitář:
```bash
git clone https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai.git
cd nejnovejsi-aktualni-srovnavac-ai
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte `.env` soubor podle `.env.example` a nastavte proměnné prostředí

4. Spusťte vývojový server:
```bash
npm run dev
```

## Produkční nasazení na Vercel

1. Vytvořte účet na [Vercel](https://vercel.com)
2. Propojte váš GitHub repozitář s Vercel
3. Nastavte proměnné prostředí v Vercel dashboardu
4. Nasaďte aplikaci jedním kliknutím

## Technologie

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- SQLite (vývoj) / PostgreSQL (produkce)

## Funkce

- Přehled AI nástrojů a služeb
- Detailní informace o každém nástroji
- Filtrování podle kategorií
- Porovnávání nástrojů
- Admin rozhraní pro správu produktů

## Licence

MIT

## Verze

1.0.0 

## Deployment → PM2 restart

Viz `docs/deploy/PROD_RESTART.md` pro bezpečný postup (SSH → pm2 ls → pm2 restart → pm2 logs) a pomocné skripty/Make cíle.