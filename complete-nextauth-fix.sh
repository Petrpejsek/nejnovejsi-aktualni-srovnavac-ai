#!/bin/bash

echo "🚀 Complete NextAuth Production Fix"
echo "=================================="

# Backup current state
echo "💾 Creating backup..."
sudo -u comparee cp /var/www/comparee/.env.production /var/www/comparee/.env.production.backup.$(date +%Y%m%d_%H%M%S)

# 1. Fix NEXTAUTH_URL for production IP
echo "🔧 Fixing NEXTAUTH_URL..."
sudo -u comparee sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL="http://23.88.98.49"|' /var/www/comparee/.env.production

# 2. Ensure secure NEXTAUTH_SECRET
echo "🔐 Ensuring NEXTAUTH_SECRET..."
if ! sudo -u comparee grep -q "NEXTAUTH_SECRET=" /var/www/comparee/.env.production; then
    SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=\"$SECRET\"" | sudo -u comparee tee -a /var/www/comparee/.env.production > /dev/null
elif [ "$(sudo -u comparee grep NEXTAUTH_SECRET /var/www/comparee/.env.production | cut -d'=' -f2 | tr -d '\"' | wc -c)" -lt 32 ]; then
    SECRET=$(openssl rand -base64 32)
    sudo -u comparee sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" /var/www/comparee/.env.production
fi

# 3. Ensure NODE_ENV is production
echo "🌟 Setting NODE_ENV..."
sudo -u comparee sed -i 's|NODE_ENV=.*|NODE_ENV="production"|' /var/www/comparee/.env.production
if ! sudo -u comparee grep -q "NODE_ENV=" /var/www/comparee/.env.production; then
    echo 'NODE_ENV="production"' | sudo -u comparee tee -a /var/www/comparee/.env.production > /dev/null
fi

# 4. Check Google OAuth setup (warn if missing)
echo "🔍 Checking Google OAuth..."
if ! sudo -u comparee grep -q "GOOGLE_CLIENT_ID=" /var/www/comparee/.env.production || sudo -u comparee grep -q "your-google-client-id" /var/www/comparee/.env.production; then
    echo "⚠️  WARNING: Google OAuth not configured! Add real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
fi

# 5. Show current config
echo -e "\n📋 Current NextAuth Configuration:"
sudo -u comparee grep -E "(NEXTAUTH|GOOGLE|NODE_ENV)" /var/www/comparee/.env.production

# 6. Clear Next.js cache and rebuild
echo -e "\n🏗️  Rebuilding application..."
cd /var/www/comparee
sudo -u comparee rm -rf .next
sudo -u comparee npm run build

# 7. Restart PM2 process
echo "🔄 Restarting PM2 process..."
sudo -u comparee pm2 restart comparee-nextjs

# 8. Wait for startup
echo "⏱️  Waiting for startup..."
sleep 5

# 9. Test endpoints
echo -e "\n🧪 Testing NextAuth endpoints..."
echo "Internal tests:"
curl -s -o /dev/null -w "  /api/auth/session: %{http_code}\n" http://localhost:3000/api/auth/session
curl -s -o /dev/null -w "  /api/auth/providers: %{http_code}\n" http://localhost:3000/api/auth/providers

echo "External tests:"
curl -s -o /dev/null -w "  /api/auth/session: %{http_code}\n" http://23.88.98.49/api/auth/session
curl -s -o /dev/null -w "  /api/auth/providers: %{http_code}\n" http://23.88.98.49/api/auth/providers

# 10. Show recent logs
echo -e "\n📋 Recent logs:"
sudo -u comparee pm2 logs comparee-nextjs --lines 10 --nostream

echo -e "\n✅ Fix completed!"
echo -e "\n🎯 Next steps:"
echo "   1. Test login at: http://23.88.98.49"
echo "   2. If Google OAuth fails, configure real credentials in .env.production"
echo "   3. Check that Google Console has redirect URI: http://23.88.98.49/api/auth/callback/google"
echo "   4. Monitor logs: sudo -u comparee pm2 logs comparee-nextjs" 