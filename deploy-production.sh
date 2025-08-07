#!/bin/bash

# 🚀 KOMPLETNÍ DEPLOYMENT SCRIPT PRO 100% ÚSPĚCH
set -e  # Stop on any error

echo "🚀 Starting 100% Production Deployment..."

# Configuration
SERVER="root@195.201.219.128"
APP_DIR="/var/www/comparee-ai"
APP_NAME="comparee-ai"

echo "📦 Step 1: Preparing local environment..."
# Ensure we have latest code
git add .
git status

echo "📤 Step 2: Pushing to GitHub..."
git push origin main || echo "⚠️ Git push failed or no changes"

echo "🔧 Step 3: Deploying to production server..."
ssh $SERVER << 'ENDSSH'
    set -e
    cd /var/www/comparee-ai
    
    echo "📥 Pulling latest code..."
    git pull origin main --force
    
    echo "📋 Creating PM2 ecosystem config..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'comparee-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/comparee-ai',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_BASE_URL: 'http://195.201.219.128:3000',
      DATABASE_URL: 'postgresql://comparee_user:compare_secure_password_2024!@localhost:5432/comparee_production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF
    
    echo "📁 Creating logs directory..."
    mkdir -p logs
    
    echo "🛑 Stopping existing processes..."
    pm2 delete all || echo "No processes to delete"
    
    echo "📦 Installing dependencies..."
    npm install --production=false
    
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    echo "🏗️ Building application..."
    rm -rf .next
    npm run build
    
    echo "🚀 Starting with PM2..."
    pm2 start ecosystem.config.js
    
    echo "💾 Saving PM2 configuration..."
    pm2 save
    pm2 startup
    
    echo "📊 Checking status..."
    pm2 status
ENDSSH

echo "⏱️ Waiting for application to start..."
sleep 10

echo "🧪 Testing API endpoints..."
echo "Testing top-lists API..."
curl -s -w "Response time: %{time_total}s\n" "http://195.201.219.128:3000/api/top-lists" | head -5

echo "Testing categories API..."
curl -s -w "Response time: %{time_total}s\n" "http://195.201.219.128:3000/api/products?forHomepage=true&page=1&pageSize=3" | head -5

echo "Testing homepage..."
curl -s -w "Homepage load time: %{time_total}s\n" "http://195.201.219.128:3000/" > /dev/null

echo ""
echo "✅ DEPLOYMENT COMPLETED!"
echo "🌐 Application URL: http://195.201.219.128:3000"
echo "📊 PM2 Dashboard: ssh $SERVER 'pm2 monit'"
echo "📋 Logs: ssh $SERVER 'pm2 logs $APP_NAME'"