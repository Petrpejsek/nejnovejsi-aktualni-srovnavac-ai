# Comparee.ai - AI Tools Comparison Platform

[![CI](https://github.com/<ORG_OR_USER>/<REPO>/actions/workflows/ci.yml/badge.svg)](https://github.com/<ORG_OR_USER>/<REPO>/actions/workflows/ci.yml)

AI-powered platform for comparing and discovering AI tools, with comprehensive SEO monitoring via Google Search Console integration.

## 🚀 Quick Start

### Production Deployment
1. Set up GitHub Secrets:
   - `SSH_HOST`: `23.88.98.49`
   - `SSH_USER`: `root`
   - `SSH_PRIVATE_KEY`: Your SSH private key
   - `APP_DIR`: `/var/www/comparee`
   - `GSC_CRON_TOKEN`: Same as `GSC_CRON_TOKEN` in .env.production

2. Push to `main` branch triggers automatic deployment

### Secrets & Safety
⚠️ **Important**: The `.env.production.sample` file contains only placeholder values. Never commit real credentials to git!
- All sensitive values use `__SET__` or `__PLACEHOLDER__` format
- Database URL uses generic placeholders: `__DB_USER__`, `__DB_PASS__`, etc.
- Copy `.env.production.sample` to `.env.production` and fill in actual values

### Environment Setup
Copy `env.production.sample` to `.env.production` and configure:

```bash
# Required for GSC integration
NEXT_PUBLIC_BASE_URL=https://comparee.ai
GSC_SITE_URL=https://comparee.ai/
GSC_SYNC_ENABLED=true
GSC_CRON_TOKEN=__SET__
GCP_SA_JSON_BASE64=__BASE64__

# Database
DATABASE_URL=postgresql://comparee_user:comparee_secure_password_2024!@195.201.219.128:5432/comparee_production
```

## 🔍 SEO GSC Integration (URL Inspection MVP)

Production‑only, fail‑fast integration with Google Search Console URL Inspection API for monitoring indexing status of landing pages.

**Requirements and guarantees:**
- Service Account only (no OAuth fallbacks). If SA is missing/invalid, endpoints return 503.
- Read‑only impact (writes only to `seo_gsc_status` table).
- Prod‑only and token‑guarded sync endpoint.
- Feature flag default OFF.

### Go-Live GSC Checklist

1. **Add Service Account to GSC UI:**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Select property `https://comparee.ai/`
   - Add user: `comparee-gsc-indexing-971@ai-srovnavac.iam.gserviceaccount.com` with "Full" permissions

2. **Configure Environment:**
   ```bash
   # Copy sample and configure
   cp .env.production.sample .env.production
   
   # Generate base64 from SA JSON
   base64 -w0 /path/to/gsc-sa.json
   
   # Update .env.production
   GCP_SA_JSON_BASE64=<base64-output>
   GSC_SYNC_ENABLED=true
   GSC_CRON_TOKEN=$(openssl rand -hex 24)
   ```

3. **Add GitHub Secret:**
   - Repository Settings → Secrets → `GSC_CRON_TOKEN`
   - Value: Same as `GSC_CRON_TOKEN` from .env.production

4. **First Sanity Run:**
   ```bash
   # Test summary endpoint
   curl -s https://comparee.ai/api/seo/gsc-summary | jq .
   
   # Test sync endpoint (dry-run)
   curl -s -X POST -H "X-GSC-CRON-TOKEN: $GSC_CRON_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"limit":10,"dryRun":true,"priority":"not_indexed_first"}' \
     https://comparee.ai/api/seo/gsc-sync | jq .
   ```

**Note:** We use GitHub Actions cron as the only scheduler; server cron should be disabled.

### GSC_SITE_URL Configuration

| Property Type | GSC_SITE_URL Format | Example |
|---------------|---------------------|---------|
| **Domain** | `sc-domain:hostname` | `sc-domain:comparee.ai` |
| **URL-prefix** | `https://hostname/` (trailing slash required) | `https://comparee.ai/` |

**Auto-detection:** If `GSC_SITE_URL` is not set, the system will:
1. Try domain property: `sc-domain:comparee.ai`
2. Try URL-prefix property: `https://comparee.ai/`
3. Use the first accessible property found

### Troubleshooting Runbook

#### Reading errorSummary
- `PERMISSION_DENIED`: SA lacks access to property or wrong property type
- `INVALID_ARGUMENT`: URL doesn't belong to the configured property or is not https
- `NOT_FOUND`: URL is not within the property scope or couldn't be verified
- `RESOURCE_EXHAUSTED`: Hit GSC API quota limits
- `RATE_LIMIT`: Hit GSC API rate limits (429 errors)
- `SERVER_ERROR`: GSC API 5xx errors
- `TIMEOUT`: Request timeout (25s)

#### Common Issues

**`property_not_accessible_by_sa` warning:**
- SA email not added to GSC property
- Wrong property type (domain vs url-prefix)
- Property doesn't exist in GSC

**100% PERMISSION_DENIED:**
- Check `GSC_SITE_URL` format (domain vs url-prefix)
- Verify SA has "Full" permissions in GSC
- Ensure property exists and is verified

**`processed: 0` in sync response:**
- DB has no landing pages
- Sitemap fallback failed
- All candidates failed inspection

### Endpoints

- `GET /api/seo/gsc-summary` - Read-only summary of GSC data
- `POST /api/seo/gsc-sync` - Token-guarded sync endpoint (requires `X-GSC-CRON-TOKEN`)

### Scheduled Sync

- **Cron**: Daily at 03:15 Europe/Madrid timezone
- **GitHub Actions**: Health check with retry logic
- **Limit**: 1500 URLs/day (under GSC quota of 2000/day)

### GSC sanity test (local)

Prepare a minimal local env (fetch only GSC variables from production):

```bash
# Recommended (no DB/Stripe locally)
SSH_HOST=root@23.88.98.49 APP_DIR=/var/www/comparee SSH_KEY=~/.ssh/hetzner_comparee \
  npm run fetch:gsc-env

# Start locally
npm run dev

# Run sanity
npm run sanity:gsc
```

Expected:
- Summary: HTTP 200 JSON containing `propertyUrl` and `siteType`
- Sync without token: HTTP 403
- Sync dryRun with token: HTTP 200 structured JSON (`status`, `dryRun`, `limit`, ...)

Important: `.env.local` contains Service Account secrets (GCP_SA_JSON_BASE64). Never commit this file.

## 📋 Environment Variables

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

## 🔧 Development

### Local Setup
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Migrations
```bash
npx prisma migrate deploy
```

## 📊 Monitoring

- **PM2**: Process management on production
- **GitHub Actions**: Automated deployment and health checks
- **GSC Integration**: SEO monitoring with fail-fast design

## 🛡️ Security

- Service Account authentication only
- Token-guarded sync endpoints
- Production-only GSC integration
- Rate limiting (1500 URLs/day)