# 🚀 Production Environment Setup - Google OAuth

## ✅ Rychlý přehled - Co potřebujete udělat

1. **Vytvořit `.env.production`** s Google OAuth credentials
2. **Nastavit redirect URIs v Google Console** pro produkční doménu
3. **Vygenerovat bezpečný NEXTAUTH_SECRET**
4. **Rebuild a restart aplikace**

---

## 1️⃣ Vytvoření .env.production souboru

Vytvořte soubor `.env.production` v root adresáři projektu s následujícím obsahem:

```bash
# ===========================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ===========================================

# Database (Production PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# === GOOGLE OAUTH (PRODUCTION) ===
# Google OAuth credentials for production environment
# Get these from Google Cloud Console > APIs & Credentials > OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# === NEXTAUTH CONFIGURATION ===
# Production domain URL - UPDATE THIS TO YOUR ACTUAL DOMAIN
NEXTAUTH_URL="https://yourproductiondomain.com"

# NextAuth secret - Generate secure random string (64+ characters)
# Example: g/q5a3s/dFFP3w+dtWBI+Amww6ExxKLIWPp5I25gxcfYAl/nuTZhxoy1TKAjh/i7hsZ8pAtSlsxqqXQZxkkpzg==
NEXTAUTH_SECRET="<GENERATE_SECURE_RANDOM_STRING_64_CHARS_OR_MORE>"

# === AI SERVICES ===
# OpenAI API for AI recommendations and chat
OPENAI_API_KEY="your-production-openai-api-key"

# === PAYMENT PROCESSING ===
# Stripe (Production keys)
STRIPE_SECRET_KEY="sk_live_your_production_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_production_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"

# === BACKEND API ===
# Python FastAPI Backend URL (Production)
PYTHON_API_URL="https://api.yourproductiondomain.com/api/v1"

# JWT Secret for company authentication
JWT_SECRET="production-jwt-secret-super-secure-64-chars-minimum"

# === FEATURE FLAGS ===
# Disable admin upload in production for security
NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD="false"

# Vercel ISR bypass (if using Vercel)
VERCEL_BYPASS_FALLBACK_OVERSIZED_ERROR="1"
```

## 2️⃣ Google Cloud Console Configuration

### Přihlášení a navigace:
1. Přihlaste se do [Google Cloud Console](https://console.cloud.google.com/)
2. Vyberte projekt používaný pro tento web
3. Navigujte: **APIs & Services** → **Credentials**

### Najděte OAuth 2.0 Client ID:
4. Najděte existující OAuth 2.0 Client ID pro tento projekt
5. Klikněte na název credential pro editaci

### Přidejte produkční redirect URIs:

#### Authorized redirect URIs:
```
https://yourproductiondomain.com/api/auth/callback/google
```

#### Authorized JavaScript origins:
```
https://yourproductiondomain.com
```

### Zkopírujte credentials:
6. Zkopírujte **Client ID** a **Client secret**
7. Doplňte je do `.env.production` souboru

## 3️⃣ Generování NEXTAUTH_SECRET

Vygenerujte bezpečný secret string:

```bash
# MacOS/Linux
openssl rand -base64 64

# Výstup bude například:
# g/q5a3s/dFFP3w+dtWBI+Amww6ExxKLIWPp5I25gxcfYAl/nuTZhxoy1TKAjh/i7hsZ8pAtSlsxqqXQZxkkpzg==
```

## 4️⃣ Restart produkční instance

Po nastavení všech env proměnných:

```bash
# Rebuild aplikace
npm run build
# nebo
pnpm build

# Restart produkční server
pm2 restart your-app-name
# nebo
systemctl restart your-service
# nebo podle vašeho deployment manageru
```

## 5️⃣ Testování Google OAuth

1. Otevřte produkční web: `https://yourproductiondomain.com`
2. Klikněte na **"Log In"** nebo **"Sign Up"**
3. Zkuste **"Continue with Google"**
4. Ověřte, že redirect funguje správně

## ⚠️ Důležité poznámky

- **Aktualizujte `NEXTAUTH_URL`** na skutečnou produkční doménu
- **Použijte produkční Google OAuth credentials** (ne development)
- **Vygenerujte silný `NEXTAUTH_SECRET`** (min. 64 znaků)
- **Ověřte všechne redirect URIs** v Google Console
- **Otestujte OAuth flow** po nasazení

## 🔍 Troubleshooting

### Chyba "redirect_uri_mismatch":
- Zkontrolujte `NEXTAUTH_URL` v `.env.production`
- Ověřte redirect URIs v Google Console

### Google OAuth nefunguje:
- Zkontrolujte `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET`
- Ujistěte se, že používáte produkční credentials

### Session problémy:
- Ověřte `NEXTAUTH_SECRET` (musí být stejný napříč všemi instancemi)
- Zkontrolujte že `NEXTAUTH_URL` odpovídá skutečné doméně

---

## 🎯 Souhrn implementace

**✅ NextAuth + Google OAuth je kompletně implementováno:**
- Frontend: `signIn('google')` v LoginForm/RegisterForm
- Backend: GoogleProvider v `lib/auth.ts`
- Session: SessionProvider v layout
- Callbacks: JWT + session callbacks

**🔧 Zbývá pouze nastavit:**
- Produkční env proměnné (`.env.production`)
- Google Console redirect URIs
- Vygenerovat `NEXTAUTH_SECRET`

**Po dokončení bude Google OAuth plně funkční na produkci!** 🚀 