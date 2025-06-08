# 🚀 Deployment Guide - Vercel

## 📋 Přehled funkcionalit připravených k deployment

### ✅ Hotové funkcionality
- **📊 Firemní statistiky** - Kompletní dashboard s analýzami
- **🎁 Vlastní částka (Custom Payment)** - S kupóny a target groups
- **💳 Billing systém** - Auto-payment, faktury, kredit management  
- **🔧 Admin interface** - Kompletní správa přes `/admin`
- **🏢 Company admin** - Billing interface pro firmy
- **📈 Analytics** - Click tracking a reporting
- **🛡️ Authentication** - JWT + NextAuth

### ❌ Zakázané funkcionality (NEBUDOU na produkci)
- **🚫 Admin URL Upload** - Zakázáno přes `NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD=false`

## 🔧 Environment Variables na Vercel

Nastavte tyto environment variables v Vercel dashboard:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication  
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="..."

# OpenAI
OPENAI_API_KEY="..."

# JWT
JWT_SECRET="e9d77b5ea0174f493f7bf2c5a6f2383298b0c2c558084dbb371ae6c9ca3ad05e4e829e0c76385bcc6166356a5d2a951ed098e1ebf7eef6473e54086e06a35325"

# Admin Upload - DŮLEŽITÉ: nastavte na false!
NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD="false"

# Vercel optimalizace
VERCEL_BYPASS_FALLBACK_OVERSIZED_ERROR="1"

# Stripe (volitelné)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Python Backend (volitelné)
PYTHON_API_URL="https://your-python-api.com/api/v1"
```

## 🚀 Deployment kroky

### 1. Připojení repozitáře
```bash
git push origin main  # ✅ HOTOVO
```

### 2. Vercel projekt
- Importujte projekt z GitHubu
- Framework: Next.js
- Build Command: `npm run vercel-build`
- Output Directory: `.next`

### 3. Database setup
- Vytvořte PostgreSQL databázi (Supabase doporučeno)
- Nastavte `DATABASE_URL`
- Migrace se spustí automaticky při build

### 4. Testování
Po deployment otestujte:
- ✅ `/` - Hlavní stránka
- ✅ `/admin` - Admin dashboard  
- ✅ `/admin/company-statistics` - Statistiky
- ✅ `/admin/promotional-packages` - Vlastní částka
- ✅ `/company-admin/billing` - Billing pro firmy
- ❌ `/admin/url-upload` - Mělo by být zakázané

## 📊 Funkcionality v produkci

### Admin Dashboard (`/admin`)
- ✅ Správa produktů
- ✅ Firemní statistiky s real-time daty
- ✅ Konfigurace vlastní částky
- ✅ Target groups management
- ✅ Analytics a reporting

### Company Admin (`/company-admin`)  
- ✅ Billing overview
- ✅ Credit management
- ✅ Auto-payment setup
- ✅ Invoice download
- ✅ Custom amount s kupóny

### API Endpoints
- ✅ `/api/admin/company-statistics` - Statistiky
- ✅ `/api/admin/custom-payment-settings` - Nastavení
- ✅ `/api/promotional-packages` - Balíčky
- ✅ `/api/validate-coupon` - Validace kupónů
- ✅ `/api/advertiser/billing` - Billing pro firmy

## 🎯 Production Ready Features

### Performance
- ✅ ISR (Incremental Static Regeneration)
- ✅ API route optimization  
- ✅ Image optimization
- ✅ Database indexing

### Security
- ✅ JWT authentication
- ✅ Input validation
- ✅ XSS protection
- ✅ SQL injection protection

### Monitoring
- ✅ Error handling
- ✅ Loading states
- ✅ User feedback
- ✅ Admin logging

## 🔄 Post-deployment

Po úspěšném deployment:

1. **Otestujte všechny funkcionality**
2. **Ověřte databázové migrace**  
3. **Zkontrolujte admin zakázání URL upload**
4. **Nastavte monitoring/alerting**

## 🆘 Troubleshooting

### Build chyby
- Zkontrolujte TypeScript errors
- Ověřte environment variables
- Zkontrolujte Prisma schema

### Runtime chyby  
- Zkontrolujte database connection
- Ověřte API keys
- Zkontrolujte CORS nastavení

### Performance issues
- Optimalizujte database queries
- Použijte caching
- Zkontrolujte image sizes 