#!/bin/bash

# =============================================================================
# Comparee.ai - Hetzner CX32 Server Setup Script
# =============================================================================

echo "🚀 Starting Comparee.ai server setup on CX32..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    htop \
    nano \
    vim

# Install Node.js 18.x
echo "📱 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Python 3.11
echo "🐍 Installing Python 3.11..."
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.11 python3.11-pip python3.11-venv python3.11-dev

# Install PM2 for process management
echo "⚙️ Installing PM2..."
npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install PostgreSQL client
echo "🗄️ Installing PostgreSQL client..."
apt install -y postgresql-client-14

# Install Redis
echo "🔴 Installing Redis..."
apt install -y redis-server

# Configure firewall
echo "🔒 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000  # Next.js (temporary for testing)
ufw allow 8000  # Python FastAPI (temporary for testing)
ufw --force enable

# Create app user
echo "👤 Creating app user..."
useradd -m -s /bin/bash comparee
usermod -aG sudo comparee

# Create app directories
echo "📁 Creating application directories..."
mkdir -p /var/www/comparee
mkdir -p /var/log/comparee
chown -R comparee:comparee /var/www/comparee
chown -R comparee:comparee /var/log/comparee

# Configure Redis
echo "🔴 Configuring Redis..."
systemctl enable redis-server
systemctl start redis-server

# Install SSL certificate tool
echo "🔐 Installing Certbot for SSL..."
snap install core; snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

echo "✅ Server setup completed!"
echo "📋 Next steps:"
echo "   1. Run 02-app-deployment.sh"
echo "   2. Configure environment variables"
echo "   3. Setup SSL certificates"

# Display system info
echo ""
echo "📊 System Information:"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $4}')"
echo "Node.js: $(node --version)"
echo "Python: $(python3.11 --version)"
echo "Nginx: $(nginx -v 2>&1)" 