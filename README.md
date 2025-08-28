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

2. Push to `main` branch triggers automatic deployment

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

### Endpoints

- `GET /api/seo/gsc-summary` - Read-only summary of GSC data
- `POST /api/seo/gsc-sync` - Token-guarded sync endpoint (requires `X-GSC-CRON-TOKEN`)

### Scheduled Sync

- **Cron**: Daily at 03:15 Europe/Madrid timezone
- **GitHub Actions**: Health check with retry logic
- **Limit**: 1500 URLs/day (under GSC quota of 2000/day)

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