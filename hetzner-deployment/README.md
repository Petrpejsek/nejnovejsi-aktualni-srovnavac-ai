# 🚀 Comparee.ai - Hetzner Migration Guide

Kompletní návod pro migraci Comparee.ai z Vercel + Neon na Hetzner servery.

## 📋 Přehled architektury

```
🖥️  CX32 Server (Produkční aplikace)
    ├── Next.js aplikace (port 3000)
    ├── Python FastAPI (port 8000)
    ├── Nginx (reverse proxy + SSL)
    ├── Redis (cachování)
    └── PM2 (process management)

🗄️  CX21 Server (PostgreSQL databáze)
    ├── PostgreSQL 14
    ├── Automatické zálohování
    └── Monitoring
```

## ⚡ Rychlý start

1. **Připravte CX32 server:**
   ```bash
   chmod +x 01-server-setup.sh
   ./01-server-setup.sh
   ```

2. **Nasaďte aplikaci:**
   ```bash
   chmod +x 02-app-deployment.sh  
   ./02-app-deployment.sh
   ```

3. **Konfigurujte Nginx:**
   ```bash
   chmod +x 03-nginx-config.sh
   ./03-nginx-config.sh
   ```

4. **Migrujte databázi:**
   ```bash
   chmod +x 04-database-migration.sh
   ./04-database-migration.sh
   ```

## 📝 Detailní kroky

### 1️⃣ Příprava CX32 serveru

```bash
# Spusťte setup skript
./01-server-setup.sh

# Ověřte instalaci
node --version    # Node.js 18.x
python3.11 --version
nginx -v
redis-cli ping    # PONG
```

### 2️⃣ Deployment aplikace

```bash
# Nasaďte aplikaci
./02-app-deployment.sh

# Upravte environment variables
nano /var/www/comparee/.env.production

# Potřebné hodnoty:
# - DATABASE_URL (po migraci databáze)
# - OPENAI_API_KEY
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL (vaše doména)
# - GOOGLE_CLIENT_ID/SECRET (pokud používáte)
```

### 3️⃣ Objednání CX21 serveru pro databázi

1. **Objednejte CX21 na Hetzner**
2. **Nainstalujte PostgreSQL:**
   ```bash
   apt update
   apt install postgresql postgresql-contrib
   systemctl enable postgresql
   systemctl start postgresql
   ```

### 4️⃣ Migrace databáze

```bash
# Na CX32 serveru:
# 1. Upravte proměnné v 04-database-migration.sh
nano 04-database-migration.sh

# 2. Spusťte migraci
./04-database-migration.sh

# 3. Zkopírujte backup na CX21 server
scp /tmp/db-migration/* root@cx21-server-ip:/tmp/

# Na CX21 serveru:
# 4. Spusťte restore
bash restore_to_new_server.sh

# Zpět na CX32:
# 5. Aktualizujte připojení k databázi
bash update_env_file.sh
```

### 5️⃣ Nginx a SSL konfigurace

```bash
# 1. Upravte doménu v Nginx konfigu
nano /etc/nginx/sites-available/comparee
# Nahraďte 'yourdomain.com' za vaši skutečnou doménu

# 2. Restartujte Nginx
systemctl reload nginx

# 3. Nastavte SSL
nano /var/www/comparee/setup-ssl.sh
# Upravte doménu a email
bash /var/www/comparee/setup-ssl.sh
```

### 6️⃣ Spuštění aplikace

```bash
# Přepněte na app uživatele
sudo -u comparee bash

# Spusťte aplikace
cd /var/www/comparee
pm2 start ecosystem.config.js

# Ověřte stav
pm2 status
pm2 logs

# Nastavte auto-start
pm2 save
pm2 startup
```

## 🔍 Testování

### Funkční testy

```bash
# 1. Health check
curl http://your-server-ip/health

# 2. Next.js aplikace
curl http://your-server-ip:3000

# 3. Python API
curl http://your-server-ip:8000/api/v1/docs

# 4. Nginx proxy
curl http://your-domain.com

# 5. SSL
curl https://your-domain.com
```

### Databázové testy

```bash
# Připojení k databázi
PGPASSWORD=password psql -h cx21-server-ip -U comparee_user -d comparee_db

# Ověření dat
SELECT count(*) FROM "Product";
SELECT name FROM "Product" LIMIT 5;
```

## 📊 Monitoring

### PM2 monitoring

```bash
# Živé sledování
sudo -u comparee pm2 monit

# Logy
sudo -u comparee pm2 logs comparee-nextjs
sudo -u comparee pm2 logs comparee-python

# Restart
sudo -u comparee pm2 restart all
```

### Systémové monitoring

```bash
# Využití zdrojů
htop

# Nginx logy
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Aplikační logy
tail -f /var/log/comparee/nextjs-combined.log
tail -f /var/log/comparee/python-combined.log
```

## 🎯 DNS přepnutí

Po úspěšném testování:

1. **Ověřte funkčnost na IP adrese**
2. **Aktualizujte DNS záznamy:**
   ```
   A     @           your-cx32-server-ip
   A     www         your-cx32-server-ip
   ```
3. **Počkejte na propagaci DNS (až 48h)**
4. **Otestujte finální doménu**
5. **Vypněte Vercel Comparee projekt**

## 💰 Náklady

```
✅ Původní setup:
   Vercel Pro: ~40-60€/měsíc
   Neon Database: ~20-40€/měsíc
   CELKEM: ~80-120€/měsíc

✅ Nový Hetzner setup:
   CX32 (aplikace): Už zaplaceno
   CX21 (databáze): ~25€/měsíc
   CELKEM: ~25€/měsíc

🎉 ÚSPORA: ~70-90€/měsíc (75-90%)
```

## 🔒 Bezpečnost

- ✅ Firewall konfigurován (UFW)
- ✅ SSL certifikáty (Let's Encrypt)  
- ✅ Rate limiting (Nginx)
- ✅ Security headers
- ✅ Dedicated user account
- ✅ Process isolation (PM2)

## 📞 Podpora

V případě problémů:

1. **Zkontrolujte logy:** `pm2 logs`
2. **Ověřte procesy:** `pm2 status` 
3. **Testujte připojení:** health checky
4. **Rollback možnost:** Vercel projekt lze znovu zapnout

## 🎉 Po dokončení migrace

1. ✅ Otestujte všechny funkce
2. ✅ Nastavte monitoring
3. ✅ Vytvořte backup strategie
4. ✅ Dokumentujte nové údaje
5. ✅ Vypněte Vercel služby

**Gratulujeme k úspěšné migraci! 🚀** 