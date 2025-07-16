#!/bin/bash

# =============================================================================
# Comparee.ai - Application Deployment Script
# =============================================================================

echo "🚀 Deploying Comparee.ai application..."

# Switch to app user
sudo -u comparee bash << 'EOF'

# Navigate to app directory
cd /var/www/comparee

# Clone repository (replace with your GitHub repo)
echo "📥 Cloning repository..."
git clone https://github.com/Petrpejsek/nejnovejsi-aktualni-srovnavac-ai.git .

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Setup Python virtual environment
echo "🐍 Setting up Python environment..."
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build

EOF

# Create environment file template
echo "📝 Creating environment file template..."
cat > /var/www/comparee/.env.production << 'ENV'
# Database Configuration
DATABASE_URL="postgresql://username:password@db-server-ip:5432/comparee_db"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secure-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth (if used)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT Configuration
JWT_SECRET="your-jwt-secret-here"

# Production optimizations
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1

# Python FastAPI Configuration
PYTHON_API_URL="http://localhost:8000/api/v1"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
ENV

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > /var/www/comparee/ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'comparee-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/comparee',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '2G',
      error_file: '/var/log/comparee/nextjs-error.log',
      out_file: '/var/log/comparee/nextjs-out.log',
      log_file: '/var/log/comparee/nextjs-combined.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'comparee-python',
      script: '/var/www/comparee/venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/var/www/comparee/backend',
      env: {
        PYTHONPATH: '/var/www/comparee/backend'
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: '/var/log/comparee/python-error.log',
      out_file: '/var/log/comparee/python-out.log',
      log_file: '/var/log/comparee/python-combined.log',
      merge_logs: true,
      time: true
    }
  ]
};
PM2

# Set proper ownership
chown -R comparee:comparee /var/www/comparee

echo "✅ Application deployment completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit /var/www/comparee/.env.production with your actual values"
echo "   2. Run 03-nginx-config.sh to setup reverse proxy"
echo "   3. Setup database connection"
echo "   4. Start applications with: sudo -u comparee pm2 start /var/www/comparee/ecosystem.config.js"
echo ""
echo "🔍 Useful commands:"
echo "   - Check logs: sudo -u comparee pm2 logs"
echo "   - Restart apps: sudo -u comparee pm2 restart all"
echo "   - Monitor: sudo -u comparee pm2 monit" 