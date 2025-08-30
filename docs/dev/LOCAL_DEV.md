# Local Development with Docker

## 1) Copy env files

- Backend:
```bash
cp backend/.env.example.dev backend/.env.dev
# then edit backend/.env.dev and set:
# - POSTMARK_SERVER_TOKEN=__FILL_DEV__ (your dev token)
# - EMAIL_ENABLE_DEV=true (only when you want to truly send emails)
```

- Frontend:
```bash
cp .env.local.example .env.local.dev
```

## 2) Start stack
```bash
make dev-up
```
- Web: http://localhost:3000
- API (through Next proxy): http://localhost:3000/api/
- API direct (container): http://localhost:8000

## 3) Test Password Reset flow
- Open http://localhost:3000/forgot-password and submit your email
- Or via curl:
```bash
curl -s http://localhost:3000/api/auth/password/reset-request \
  -H "Content-Type: application/json" \
  -d {email:your@mail.com}
```
- In API logs you should see a Postmark send attempt; delivery should appear in your inbox and in Postmark Activity.

## 4) Enabling local email sending
- By default, emails are disabled in development.
- To enable, set in `backend/.env.dev`:
```
EMAIL_ENABLE_DEV=true
POSTMARK_SERVER_TOKEN=__FILL_DEV__
```
- Restart the stack (`make dev-down && make dev-up`).

## Notes
- Production configuration is untouched.
- Keep `EMAIL_ENABLE_DEV=false` unless you are actively testing emails.
- Use only English templates.
