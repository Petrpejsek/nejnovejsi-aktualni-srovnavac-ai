#!/bin/bash

# =============================================================================
# 📋 Manual Deployment Instructions Generator
# =============================================================================

echo "📋 Generating manual deployment instructions..."

cat > MANUAL_DEPLOYMENT.md << 'EOF'
# 🚀 Manual Hetzner Deployment Instructions

## Prerequisites
- Hetzner CX32 server (Ubuntu 22.04 LTS)
- SSH access to the server
- Domain pointing to server IP

## Step 1: Connect to Server
```bash
ssh root@YOUR_SERVER_IP
```

## Step 2: Update System
```bash
apt update && apt upgrade -y
```

## Step 3: Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
node --version  # Should show v18.x
```

## Step 4: Install Python 3.11
```bash
add-apt-repository ppa:deadsnakes/ppa
apt update
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

## Step 5: Install PostgreSQL Client
```bash
apt install -y postgresql-client-14
```

## Step 6: Install Redis
```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

## Step 7: Install Nginx
```bash
apt install -y nginx
systemctl enable nginx
```

## Step 8: Install PM2
```bash
npm install -g pm2
pm2 startup
```

## Step 9: Create App User
```bash
useradd -m -s /bin/bash comparee
usermod -aG sudo comparee
```

## Step 10: Setup Application
```bash
# Switch to app user
sudo -u comparee bash

# Create app directory
mkdir -p /var/www/comparee
cd /var/www/comparee

# Clone repository
git clone https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai.git .

# Install Node.js dependencies
npm install

# Create production build
npm run build

# Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

## Step 11: Environment Variables
```bash
# Create .env file
cat > .env << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=postgresql://username:password@localhost:5432/comparee_production
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://comparee.ai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
ENVEOF
```

## Step 12: Setup Database
```bash
# Connect to your PostgreSQL database
export DATABASE_URL="postgresql://username:password@host:port/database"

# Run Prisma migrations
npx prisma generate
npx prisma db push
```

## Step 13: Start Services with PM2
```bash
# Start Next.js app
pm2 start npm --name "comparee-frontend" -- start

# Start Python backend
pm2 start "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "comparee-backend"

# Save PM2 configuration
pm2 save
```

## Step 14: Configure Nginx
```bash
cat > /etc/nginx/sites-available/comparee << 'NGINXEOF'
server {
    listen 80;
    server_name comparee.ai www.comparee.ai;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/backend/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Enable site
ln -s /etc/nginx/sites-available/comparee /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 15: Setup SSL with Certbot
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d comparee.ai -d www.comparee.ai
```

## Step 16: Setup Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Step 17: Verify Deployment
```bash
# Check services status
pm2 status
systemctl status nginx
systemctl status redis-server

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:8000/health

# Check public access
curl https://comparee.ai/api/health
```

## 🎉 Deployment Complete!

Your application is now running at:
- **Production**: https://comparee.ai
- **Admin Panel**: https://comparee.ai/admin
- **API Health**: https://comparee.ai/api/health

## Useful Commands
```bash
# View logs
pm2 logs

# Restart services
pm2 restart all

# Update application
cd /var/www/comparee
git pull origin main
npm install
npm run build
pm2 restart all

# Check SSL certificate
certbot certificates
```

## Landing Page Features ✅
- **Dynamic Content Rendering**: HTML/Markdown support
- **Image Support**: Full-width, side-float, inline layouts
- **Comparison Tables**: Pricing, features, comparison tables
- **SEO Optimized**: Meta tags, canonical URLs, keywords
- **Responsive Design**: Mobile-first approach
- **Lazy Loading**: Optimized performance
EOF

echo "✅ Manual deployment guide created: MANUAL_DEPLOYMENT.md"
echo ""
echo "📋 You can now either:"
echo "  1. Follow the manual guide: cat MANUAL_DEPLOYMENT.md"
echo "  2. Use automated deployment: ./deploy-production.sh"
echo "  3. Setup SSH first: ./setup-ssh.sh"