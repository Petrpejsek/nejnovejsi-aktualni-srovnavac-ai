# 🚀 Comparee.ai - Dokumentace projektu

## 🎯 Co to je a k čemu to slouží

**Comparee.ai** je webová platforma pro srovnávání AI nástrojů a služeb. Je to v podstatě jako Heureka, ale specializovaně pro AI technologie. Uživatelé si můžou prohlížet různé AI nástroje, porovnávat je, číst recenze a najít ten nejlepší pro svoje potřeby.

**Ale pozor!** Není to jen běžný katalog - má v sobě zabudovaný **sofistikovaný reklamní systém**, kde firmy můžou platit za zobrazování svých produktů, a dokonce i **AI doporučovací engine**, který uživatelům navrhuje nástroje na míru.

## 🏗️ Architektura projektu

### Frontend (Next.js)
- **Next.js 14** s **TypeScript** - moderní React framework
- **Tailwind CSS** - pro stylování
- **NextAuth.js** - autentifikace (Google OAuth)
- **Prisma** - ORM pro práci s databází

### Backend (Python FastAPI)
- **FastAPI** - rychlé Python API
- Slouží jako doplněk pro složitější logiku (AI analýzy, platby)
- Běží na portu **8000**

### Databáze
- **PostgreSQL** - produkční databáze (Hetzner server)
- **SQLite** - pro lokální development
- **Prisma** jako ORM vrstva

## 📁 Struktura projektu

```
ai new new new/
├── app/                    # Next.js aplikace (App Router)
│   ├── admin/             # Admin rozhraní
│   ├── api/               # API routes
│   ├── company-admin/     # Rozhraní pro firmy
│   └── page.tsx           # Hlavní stránka
├── backend/               # Python FastAPI
│   └── app/
│       ├── api/           # API endpointy
│       ├── models/        # Databázové modely
│       └── services/      # Business logika
├── components/            # React komponenty
├── prisma/               # Databázové schema
└── scripts/              # Utility skripty
```

## 🎪 Hlavní funkcionalita

### Pro běžné uživatele:
1. **Procházení AI nástrojů** - katalog s filtrováním podle kategorií
2. **Detaily produktů** - ceny, funkce, recenze
3. **Porovnávání** - side-by-side srovnání nástrojů
4. **AI Advisor** - chatbot pro doporučení nástrojů
5. **Uložené produkty** - oblíbené pro později
6. **Historie kliknutí** - co už uživatel prohlížel

### Pro firmy (company-admin):
1. **Registrace a přihlášení** - vlastní admin panel
2. **Správa kampaní** - vytváření reklamních kampaní
3. **Nastavení budgetů** - denní/celkové limity
4. **Sledování statistik** - kliknutí, zobrazení, konverze
5. **Billing system** - automatické účtování za kliky
6. **Správa produktů** - přidávání a editace svých nástrojů

### Pro super-adminy:
1. **Správa všech produktů** - schvalování, editace
2. **Správa uživatelů** - přehled registrací
3. **Analytics** - globální statistiky platformy
4. **Finanční přehledy** - výdělky z reklam
5. **Content moderace** - schvalování změn

## 🛠️ Technické detaily

### Klíčové technologie:
- **Next.js 14** (App Router) - server-side rendering, API routes
- **TypeScript** - typová bezpečnost
- **Prisma** - ORM s migrations
- **Tailwind CSS** - utility-first styling
- **NextAuth.js** - autentifikace přes Google
- **FastAPI** - Python backend
- **Stripe** - platební systém
- **PostgreSQL** - relační databáze

### Databázové modely (nejdůležitější):
## 🌐 Ingest landing pages (shrnutí)

- Endpoint: `POST /api/landing-pages`
- Auth: `x-webhook-secret` (+ volitelně `x-secret-id: primary|secondary` pro dual‑active rotaci)
- Anti‑replay (volitelné): `X-Signature-Timestamp` + `X-Signature` (sha256 HMAC nad `timestamp + "\n" + rawBody`)
- Idempotence: `Idempotency-Key` (UUID v4), TTL 30 dní, replay vrací stejnou 2xx odpověď + `Idempotency-Replayed: true`
- Payload: AI Farma JSON (`title`, `contentHtml`, `keywords`, `language`, …). `keywords` přijímáme i v `meta.keywords`.
- 409 slug+language = hard fail bez auto‑oprav.
- BASE URL: z `NEXT_PUBLIC_BASE_URL` (žádné fallbacky).
- FAQ: pokud je posíláno, MUSÍ být pole objektů `{ question: string, answer: string }`. Jakákoli jiná forma (např. string) → `422 Unprocessable Entity` a stránka se nevytvoří.
- Produkční secret pro ingest: používej `X-Webhook-Secret` s aktuálně aktivním klíčem (sekundární je povolen s `X-Secret-Id: secondary`).

Detailní specifikace a cURL příklady: viz `docs/landing-ingest.md`.


**Product** - AI nástroje
- Základní info (název, popis, cena, URL)
- Kategorie, tagy, výhody/nevýhody
- Screenshots, video URLs
- Approval workflow pro změny

**User** - Registrovaní uživatelé
- Google OAuth integrace
- Premium účty, body, levelování
- Uložené produkty, historie

**Company** - Firemní účty
- Billing info, zůstatek
- Auto-recharge funkcionalita
- Kampně a produkty

**Campaign** - Reklamní kampaně
- Budget management
- Target kategorie/země
- Real-time statistiky

**AdClick/AdImpression** - Tracking
- Detailní analytics
- Fraud detection
- Cost per click

### API struktura:

**Next.js API Routes** (`/api/`):
- `/api/products` - CRUD pro produkty
- `/api/auth` - NextAuth.js endpoints
- `/api/companies` - firemní správa
- `/api/admin` - admin operace

**Python FastAPI** (port 8000):
- `/api/v1/billing` - platební logika
- `/api/v1/ai` - AI doporučení
- `/api/v1/analytics` - pokročilé analýzy

## 🚀 Jak se to spouští

### Lokální development:

1. **Frontend (Next.js)**:
```bash
npm install
npm run dev  # spustí na portu 3000 (nebo 5000 s --port 5000)
```

2. **Backend (Python)**:
```bash
cd backend
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

3. **Databáze**:
- Lokálně: SQLite (`prisma/dev.db`)
- Produkčně: PostgreSQL na Hetzner serveru
- SSH tunnel pro připojení k produkční DB:
```bash
ssh -L 5433:localhost:5432 root@195.201.219.128
```

### 🔧 UPDATED SETUP (Aktuální funkční konfigurace):

**⚠️ KRITICKÉ PRAVIDLO: ŽÁDNÉ SQLite FALLBACKY!**
- Používáme POUZE produkční PostgreSQL databázi
- SQLite fallbacky jsou ZAKÁZANÉ

**SSH připojení (aktuální způsob):**
```bash
# 1. Načtení SSH klíčů:
ssh-add ~/.ssh/hetzner_comparee
ssh-add ~/.ssh/comparee_deploy_key

# 2. SSH tunnel pomocí aliasu:
ssh -L 5433:localhost:5432 comparee-database -N -f
```

**SSH config (~/.ssh/config):**
```
Host comparee-database
    HostName 195.201.219.128
    User root

Host comparee-production  
    HostName 23.88.98.49
    User root
```

**Environment (.env.local):**
```bash
DATABASE_URL="postgresql://comparee_user:comparee_secure_password_2024!@localhost:5433/comparee_production"
NEXTAUTH_SECRET="development-secret-123"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="e9d77b5ea0174f493f7bf2c5a6f2383298b0c2c558084dbb371ae6c9ca3ad05e4e829e0c76385bcc6166356a5d2a951ed098e1ebf7eef6473e54086e06a35325"
```

**Kontrolní checklist:**
- [ ] SSH klíče načtené (`ssh-add -l`)
- [ ] SSH tunnel běží (`lsof -i :5433`)
- [ ] .env.local obsahuje správné DATABASE_URL
- [ ] Žádné *.db soubory v projektu
- [ ] API vrací 500+ produktů (ne 20 testovacích)

### Environment variables (původní):
```bash
# Hlavní konfigurace
DATABASE_URL="postgresql://..."  # PostgreSQL connection (viz UPDATED SETUP výše pro aktuální verzi)
NEXTAUTH_SECRET="..."           # NextAuth.js secret
GOOGLE_CLIENT_ID="..."          # Google OAuth
OPENAI_API_KEY="..."           # Pro AI funkcionalita

# Reklamní systém
STRIPE_SECRET_KEY="..."         # Platby
JWT_SECRET="..."               # Company auth
PYTHON_API_URL="http://localhost:8000/api/v1"
```

## 💰 Business model

1. **Reklamní příjmy** - firmy platí za zobrazení/kliky
2. **Premium účty** - rozšířené funkce pro uživatele
3. **Affiliate marketing** - provize z prodejů
4. **Sponsored content** - placené recenze/články

## 🔥 Zajímavé funkce

### AI Advisor Chatbot
- Využívá OpenAI API
- Personalizovaná doporučení na základě uživatelských potřeb
- Integrovaný do hlavní stránky

### Real-time Analytics
- Live tracking kliků a zobrazení
- Fraud detection pro reklamní kliky
- Dashboard s grafy a metrikami

### Approval Workflow
- Všechny změny produktů musí projít schválením
- Verzování změn, rollback možnosti
- Admin notifikace

### Auto-billing System
- Automatické strhávání z firemního kreditu
- Auto-recharge při nízkém zůstatku
- Detailní invoice generation

## 🐛 Známé problémy a workaroundy

1. **SSH tunnel se občas odpojí** - nutné manuálně restartovat
2. **Next.js cache** - občas nutné `rm -rf .next`
3. **Prisma client** - po schema změnách spustit `prisma generate`

## 📈 Co by se dalo vylepšit

1. **Elasticsearch** - pro lepší vyhledávání
2. **Redis cache** - pro rychlejší response times
3. **CDN** - pro obrázky a static content
4. **Monitoring** - Sentry pro error tracking
5. **Testing** - unit a integration testy

---

**TL;DR**: Je to jako Heureka pro AI nástroje s vestavěným reklamním systémem a AI doporučovacím enginem. Frontend je Next.js, backend Python, databáze PostgreSQL. Firmy platí za reklamy, uživatelé dostanou personalizovaná doporučení AI nástrojů. 

---

## 🔄 Production Deploy (Hetzner)

### Potvrzená produkční konfigurace
- **Server**: `23.88.98.49`
- **App dir**: `/var/www/comparee`
- **PM2 proces**: `comparee-nextjs`
- **Povinné env v `/var/www/comparee/.env.production`**:
  - `NEXT_PUBLIC_ASSET_PREFIX=http://23.88.98.49`
  - `NEXTAUTH_URL=http://23.88.98.49`
- **Databáze**: PostgreSQL (Hetzner). V produkci VŽDY pouze `prisma migrate deploy` (žádné reset/dev/push).

### Standardní postup deploye (bez výjimek)
1) SSH přístup a přechod do app dir
```bash
ssh root@23.88.98.49
cd /var/www/comparee
```

2) Sync kódu na `main`
```bash
git fetch --all -q
git checkout main || true
git reset -q --hard origin/main
```

3) ENV jistota (nevypisovat tajemství)
```bash
[ -f .env.production ] || touch .env.production
grep -q '^NEXT_PUBLIC_ASSET_PREFIX=' .env.production || echo NEXT_PUBLIC_ASSET_PREFIX=http://23.88.98.49 >> .env.production
grep -q '^NEXTAUTH_URL=' .env.production || echo NEXTAUTH_URL=http://23.88.98.49 >> .env.production
```

4) Instalace závislostí, Prisma a build
```bash
unset NODE_ENV
npm ci --include=dev --no-audit --no-fund --silent || npm install --include=dev --no-audit --no-fund --silent
npx prisma generate
npx prisma migrate deploy --schema prisma/schema.prisma
rm -rf .next
NODE_ENV=production npm run build --silent
```

5) Restart aplikace přes PM2
```bash
pm2 describe comparee-nextjs >/dev/null 2>&1 && pm2 restart comparee-nextjs || pm2 start ecosystem.config.cjs --only comparee-nextjs --update-env
pm2 save || true

### Rychlý production sanity check (ingest)
```bash
# Špatné FAQ (oček. 422)
curl -X POST http://127.0.0.1:3000/api/landing-pages \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Secret: <SECRET>' -H 'X-Secret-Id: secondary' \
  --data '{"title":"Bad","language":"en","contentHtml":"<p>..</p>","keywords":["ai"],"slug":"bad-faq","faq":"[{}]"}'

# Validní (oček. 201) + ruční kontrola FAQ na /landing/<slug>
TS=$(date +%s)
curl -X POST http://127.0.0.1:3000/api/landing-pages \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Secret: <SECRET>' -H 'X-Secret-Id: secondary' \
  --data '{"title":"OK","language":"en","contentHtml":"<h2>Title</h2>","keywords":["ai"],"slug":"ok-faq-'"$TS"'","faq":[{"question":"Q?","answer":"A."}]}'
```
```

6) Ověření na serveru
```bash
curl -s -o /dev/null -w "HTTP:%{http_code}\n" http://127.0.0.1:3000/api/health
echo HEAD:$(git rev-parse --short HEAD)
[ -f .next/BUILD_ID ] && echo BUILD_ID:$(cat .next/BUILD_ID)
```

### One-shot (bezpečný skript)
```bash
ssh root@23.88.98.49 <<'EOS'
set -e
cd /var/www/comparee || exit 1
git fetch --all -q || true
git checkout -q main || true
git reset -q --hard origin/main || true
[ -f .env.production ] || touch .env.production
grep -q '^NEXT_PUBLIC_ASSET_PREFIX=' .env.production || echo NEXT_PUBLIC_ASSET_PREFIX=http://23.88.98.49 >> .env.production
grep -q '^NEXTAUTH_URL=' .env.production || echo NEXTAUTH_URL=http://23.88.98.49 >> .env.production
unset NODE_ENV
npm ci --include=dev --no-audit --no-fund --silent || npm install --include=dev --no-audit --no-fund --silent
npx prisma generate || true
npx prisma migrate deploy --schema prisma/schema.prisma || true
rm -rf .next
NODE_ENV=production npm run build --silent
pm2 describe comparee-nextjs >/dev/null 2>&1 && pm2 restart comparee-nextjs || pm2 start ecosystem.config.cjs --only comparee-nextjs --update-env
pm2 save || true
printf "HEALTH:%s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/health || true)"
printf "HEAD:%s\n" "$(git rev-parse --short HEAD || true)"
[ -f .next/BUILD_ID ] && printf "BUILD_ID:%s\n" "$(cat .next/BUILD_ID)" || true
EOS
```

### Poznámky a troubleshooting
- Husky hlášky typu `husky: not found` při CI/instalaci jsou neškodné (používáme `--include=dev` a/nebo `--ignore-scripts`).
- Pokud se změny neprojeví: smaž `.next`, proveď nový build, a restartuj PM2 dle kroků výše.
- V produkci nikdy nepoužívat: `prisma migrate dev`, `prisma db push`, `prisma migrate reset`.