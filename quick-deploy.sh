#!/bin/bash

# =============================================================================
# ⚡ Quick Deploy - For existing Hetzner setup
# =============================================================================

echo "⚡ Quick deployment to existing Hetzner server..."

# Load environment if exists
if [ -f ".env.deployment" ]; then
    source .env.deployment
    echo "✅ Loaded configuration from .env.deployment"
else
    echo "❌ No .env.deployment found. Run ./setup-ssh.sh first!"
    exit 1
fi

# Quick health check
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$HETZNER_USER@$HETZNER_IP" "echo 'Connected'" >/dev/null 2>&1; then
    echo "❌ Cannot connect to server!"
    exit 1
fi

echo "🚀 Deploying latest changes..."

# Deploy latest code
ssh -i "$SSH_KEY" "$HETZNER_USER@$HETZNER_IP" << 'EOF'
cd /var/www/comparee

# Pull latest changes
echo "📥 Pulling latest code..."
sudo -u comparee git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
sudo -u comparee npm install

# Build application
echo "🔨 Building application..."
sudo -u comparee npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart all

echo "✅ Quick deployment completed!"
EOF

# Health check
echo "🏥 Running health check..."
sleep 10

if ssh -i "$SSH_KEY" "$HETZNER_USER@$HETZNER_IP" "curl -f http://localhost:3000/api/health" >/dev/null 2>&1; then
    echo "✅ Application is running!"
    echo "🌐 Available at: ${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"
else
    echo "⚠️ Health check failed. Check logs: ssh $HETZNER_USER@$HETZNER_IP 'pm2 logs'"
fi