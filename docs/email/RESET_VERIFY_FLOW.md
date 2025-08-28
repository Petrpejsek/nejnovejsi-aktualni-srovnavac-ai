# Reset & Verify Email – Flow Overview

This document describes the end‑to‑end architecture for Password Reset and Verify Email flows.

## Architecture
- Python (FastAPI): request endpoints – generate JWT (HS256) and send transactional emails (Postmark) using strict templates
  - POST /auth/password/reset-request → sends `password_reset`
  - POST /auth/email/verify-request → sends `verify_email`
- Next.js (App Router): confirm endpoints – verify JWT (HS256) and update Prisma (no DB migrations)
  - POST /api/auth/password/reset-confirm → set new hashed password
  - POST /api/auth/email/verify-confirm → mark email as verified (boolean `email_verified` or Date `emailVerified` if present)

## Sequences (ASCII)

Password Reset
```
User
  │  POST /api/auth/password/reset-request (Next)
  │  → Next finds userId (if exists) and proxies
  │  POST /auth/password/reset-request (Python) {email,user_id}
  │     Python: JWT(reset) → render password_reset → Postmark send
  │  ← 200 {ok:true}
  │
  │  Click https://comparee.ai/account/reset?token=<JWT>
  │  POST /api/auth/password/reset-confirm (Next)
  │     Next: verify JWT(reset) → validate password → Prisma update
  │  ← 200/202
```

Verify Email
```
User
  │  POST /api/auth/email/verify-request (Next)
  │  → Next finds userId (if exists) and proxies
  │  POST /auth/email/verify-request (Python) {email,user_id}
  │     Python: JWT(verify) → render verify_email → Postmark send
  │  ← 200 {ok:true}
  │
  │  Click https://comparee.ai/account/verify?token=<JWT>
  │  POST /api/auth/email/verify-confirm (Next)
  │     Next: verify JWT(verify) → Prisma mark verified (if field exists)
  │  ← 200 or 204 (already verified / field missing)
```

## URL Patterns
- Reset: `https://comparee.ai/account/reset?token=<JWT>`
- Verify: `https://comparee.ai/account/verify?token=<JWT>`

## ENV Requirements (both apps)
- `EMAIL_TOKEN_SECRET` (HS256 shared secret)
- `PASSWORD_RESET_TOKEN_TTL_MIN` (default 30)
- `EMAIL_VERIFY_TOKEN_TTL_MIN` (default 1440)
- Next only: `PYTHON_API_URL` (reverse proxy to FastAPI, e.g. `https://comparee.ai/api/python`)

## cURL Examples

Request (via Next proxy)
```bash
# Password reset request → always 200 (neutral)
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"email":"test@domain.com"}' \
  https://comparee.ai/api/auth/password/reset-request

# Verify email request → 200 (neutral)
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"email":"test@domain.com"}' \
  https://comparee.ai/api/auth/email/verify-request
```

Request (direct to Python – info)
```bash
# Admin/testing only – direct FastAPI (behind reverse proxy)
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"email":"test@domain.com","user_id":"<uuid-or-id>"}' \
  https://comparee.ai/api/python/auth/password/reset-request
```

Confirm
```bash
# Password reset confirm (token from email)
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"token":"<JWT>","new_password":"StrongPass123"}' \
  https://comparee.ai/api/auth/password/reset-confirm

# Verify email confirm
curl -sS -X POST -H 'Content-Type: application/json' \
  -d '{"token":"<JWT>"}' \
  https://comparee.ai/api/auth/email/verify-confirm
```

## Rate-limits & Idempotence
- Request throttling (Python):
  - Reset: 1 / 5 minutes (key: email+IP)
  - Verify: 1 / 10 minutes (key: email+IP)
- Confirm idempotence (Next):
  - Password reset confirm: max once per 30s per token (duplicate → 202)

## Related
- PROD checklist: `docs/email/PROD_CHECKLIST.md`
- Admin email templates preview: `/admin/email-templates`
- Email events (bounces/complaints): `/admin/email-events`

---

# Smoke testy (REST)

Cíl: jednoduché skripty bez tajemství v logu.
- BASE_URL z ENV (default `https://comparee.ai`)
- curl `-sS -m 8` a minimal output (stav)

Příklady
```bash
make smoke-reset-request EMAIL=test@comparee.ai BASE_URL=https://comparee.ai
make smoke-verify-request EMAIL=test@comparee.ai BASE_URL=https://comparee.ai
```

Poznámka: V developmentu jsou maily vypnuté → requesty vracejí 200, ale neodesílají (OK). V produkci uvidíš doručku v Postmark Activity a token z e‑mailu použij pro confirm skripty.
