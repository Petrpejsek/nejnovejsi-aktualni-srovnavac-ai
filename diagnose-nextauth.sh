#!/bin/bash

echo "🔍 NextAuth Production Diagnostics"
echo "=================================="

# 1. Check PM2 process
echo "📊 PM2 Process Status:"
sudo -u comparee pm2 list | grep comparee-nextjs

# 2. Check environment variables
echo -e "\n🔧 Environment Variables:"
sudo -u comparee pm2 show comparee-nextjs | grep -A10 "Environment"

# 3. Check .env.production file
echo -e "\n📝 .env.production File:"
sudo -u comparee grep -E "(NEXTAUTH|GOOGLE|NODE_ENV)" /var/www/comparee/.env.production

# 4. Test API endpoints
echo -e "\n🧪 API Endpoint Tests:"
echo "Testing localhost:3000..."
curl -s -o /dev/null -w "Status: %{http_code}" http://localhost:3000/api/auth/session && echo " - /api/auth/session"
curl -s -o /dev/null -w "Status: %{http_code}" http://localhost:3000/api/auth/providers && echo " - /api/auth/providers"

echo -e "\nTesting external IP..."
curl -s -o /dev/null -w "Status: %{http_code}" http://23.88.98.49/api/auth/session && echo " - /api/auth/session (external)"
curl -s -o /dev/null -w "Status: %{http_code}" http://23.88.98.49/api/auth/providers && echo " - /api/auth/providers (external)"

# 5. Check nginx config
echo -e "\n🌐 Nginx Configuration:"
sudo nginx -t 2>&1
sudo cat /etc/nginx/sites-enabled/comparee | grep -A5 -B5 "location.*api" || echo "No API location block found"

# 6. Check recent logs
echo -e "\n📋 Recent PM2 Logs (last 20 lines):"
sudo -u comparee pm2 logs comparee-nextjs --lines 20 --nostream

# 7. Test auth route directly
echo -e "\n🎯 Direct Auth Route Test:"
curl -v http://localhost:3000/api/auth/session 2>&1 | head -10

echo -e "\n✅ Diagnostics completed!" 