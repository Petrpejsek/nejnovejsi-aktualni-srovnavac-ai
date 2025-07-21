# 🚀 Produkční Nasazení Google OAuth - Přesný Postup

## 1️⃣ Úprava .env.production souboru

Otevři `.env.production` na produkčním serveru a doplň tyto hodnoty:

```ini
# NextAuth Configuration (PRODUCTION)
NEXTAUTH_SECRET=Hd1/eUEw8u97h+F+ro1rlv3Mu48rFL3mWCUmAP4G0DY=
NEXTAUTH_URL=https://tvuj-produkcni-web.cz

# Google OAuth Credentials (PRODUCTION)
GOOGLE_CLIENT_ID=<ZDE_DOSADÍM_SVŮJ_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<ZDE_DOSADÍM_SVŮJ_GOOGLE_CLIENT_SECRET>

# Database (už by měla být nastavená)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# OpenAI API (už by měla být nastavená)  
OPENAI_API_KEY="your-production-openai-api-key"
```

⚠️ **POZOR:** Nahraď `<ZDE_DOSADÍM_SVŮJ_GOOGLE_CLIENT_ID>` a `<ZDE_DOSADÍM_SVŮJ_GOOGLE_CLIENT_SECRET>` reálnými hodnotami z Google Console.

## 2️⃣ Rebuild a restart produkční instance

Po uložení .env.production spusť na produkčním serveru:

```bash
# Rebuild aplikace s novými env proměnnými
npm run build

# Restart produkční instance (upravit název podle tvé aplikace)
pm2 restart <název-aplikace>

# Nebo pokud používáš jiný process manager:
# systemctl restart your-service
# nebo
# supervisorctl restart your-app
```

## 3️⃣ Ověření funkčnosti

1. Otevři produkční web: `https://tvuj-produkcni-web.cz`
2. Klikni na **"Log In"** nebo **"Sign Up"**  
3. Zkus **"Continue with Google"**
4. Ověř, že redirect funguje bez chyb

## 4️⃣ Troubleshooting

Pokud Google OAuth nefunguje, zkontroluj:

- **Browser console** - jsou tam chyby?
- **Server logy** - `pm2 logs <název-aplikace>`
- **Google Console** - jsou nastavené správné redirect URIs?
  - `https://tvuj-produkcni-web.cz/api/auth/callback/google`
  - `https://tvuj-produkcni-web.cz`

---

## ✅ Připraveno k nasazení

**Když pošleš Google Client ID a Secret, doplním je do postupu a provedu deployment!**

### Template pro rychlé doplnění:

```ini
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

### Kompletní příkazy:

```bash
# 1. Editace env souboru
nano .env.production

# 2. Rebuild 
npm run build

# 3. Restart
pm2 restart your-app-name

# 4. Ověření
pm2 logs your-app-name --lines 50
```

**Čekám na tvé Google OAuth credentials pro dokončení! 🎯** 