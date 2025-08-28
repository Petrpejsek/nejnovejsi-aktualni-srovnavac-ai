# Production restart (PM2) – safe guide

## A) Nedělej to lokálně
- Spuštění `pm2 restart comparee-nextjs` na vašem Macu neovlivní produkci.
- Nejprve se přihlas na produkční server přes SSH.

## B) Rychlý postup (PM2)
```bash
# 1) přihlášení na PROD
ssh <user>@<PROD_HOST_OR_IP>

# 2) zjištění procesů
pm2 ls         # nebo: pm2 status

# 3) restart konkrétního procesu (název z 'pm2 ls')
pm2 restart <NAZEV_PROCESU>

# 4) pokud se mění ENV, použij update-env
pm2 restart <NAZEV_PROCESU> --update-env

# 5) (volitelné) restart všeho
pm2 restart all

# 6) logy a rychlá kontrola
pm2 logs --lines 50
```

## C) Po restartu – ověření transakčních e‑mailů
- Otevři `https://comparee.ai/forgot-password` → odešli formulář → v Postmark Activity se objeví e‑mail `password_reset`.
- Z e‑mailu klikni na `…/account/reset?token=…` → nastav nové heslo → přihlášení OK.
- `https://comparee.ai/verify-email` → Resend → e‑mail → `…/account/verify?token=…` → 200/204.

## D) Validátor .env (Python)
```bash
make check-prod-env
# očekávám:
# ENV OK: .env.production passed all checks
```

## E) Když PM2 není v použití
- Docker / compose
```bash
docker ps
docker compose ps
docker compose restart <service>
```
- systemd
```bash
sudo systemctl status <service>
sudo systemctl restart <service>
```
- Vercel/Netlify
  - Redeploy přes jejich UI/CLI (PM2 se nepoužívá).

## F) Tipy
- Pokud nevíš název procesu, použij `pm2 ls` a restartuj ten správný (např. `web`, `frontend`, `api`).
- `--update-env` použij po změnách `.env`.
- Po restartu zkontroluj DKIM/SPF v doručeném e‑mailu (Gmail → Show original → `pass`).

---

## Rychlé utility v repozitáři
- Skript: `scripts/pm2-restart.sh`
  - Bezpečně vypíše `hostname` a OS, ověří přítomnost `pm2` a procesů.
  - Použití:
    ```bash
    bash scripts/pm2-restart.sh all
    bash scripts/pm2-restart.sh comparee-web --update-env
    ```
- Make cíle (spouštěj NA SERVERU po SSH):
```bash
make pm2-list                    # pm2 ls || pm2 status
make pm2-restart PROC=<name>     # volitelně UPDATE_ENV=true
make pm2-restart-all
make pm2-logs PROC=<name> N=100
```

## Po merge – co udělat
```bash
ssh <user>@<PROD_HOST>
pm2 ls   # zjisti název procesu (frontend/backend)
make pm2-restart PROC=<NAZEV> UPDATE_ENV=true
pm2 logs --lines 50

# Smoke
make smoke-reset-request EMAIL=<tvuj_test>@example.com BASE_URL=https://comparee.ai
# z e‑mailu token →
make smoke-reset-confirm TOKEN=<Z_EMAILU> NEW_PASSWORD=Nov3Hesl0 BASE_URL=https://comparee.ai
make smoke-verify-request EMAIL=<tvuj_test>@example.com BASE_URL=https://comparee.ai
make smoke-verify-confirm TOKEN=<Z_EMAILU> BASE_URL=https://comparee.ai
```
