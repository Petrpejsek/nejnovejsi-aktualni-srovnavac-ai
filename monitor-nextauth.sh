#!/bin/bash

echo "🔍 NextAuth Health Monitor"
echo "========================"

# Function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "200" ]; then
        echo "✅ $name: OK ($status)"
    else
        echo "❌ $name: FAILED ($status)"
        return 1
    fi
}

# Function to check environment consistency
check_env_consistency() {
    echo -e "\n🔧 Environment Consistency Check:"
    
    # Check if NEXTAUTH_URL matches production
    local nextauth_url=$(sudo -u comparee grep NEXTAUTH_URL /var/www/comparee/.env.production | cut -d'=' -f2 | tr -d '"')
    if [ "$nextauth_url" = "http://23.88.98.49" ]; then
        echo "✅ NEXTAUTH_URL: OK"
    else
        echo "❌ NEXTAUTH_URL: WRONG ($nextauth_url) - should be http://23.88.98.49"
    fi
    
    # Check if NEXTAUTH_SECRET exists and is long enough
    local secret_length=$(sudo -u comparee grep NEXTAUTH_SECRET /var/www/comparee/.env.production | cut -d'=' -f2 | tr -d '"' | wc -c)
    if [ "$secret_length" -gt 32 ]; then
        echo "✅ NEXTAUTH_SECRET: OK (${secret_length} chars)"
    else
        echo "❌ NEXTAUTH_SECRET: TOO SHORT (${secret_length} chars) - should be 32+"
    fi
    
    # Check NODE_ENV
    local node_env=$(sudo -u comparee grep NODE_ENV /var/www/comparee/.env.production | cut -d'=' -f2 | tr -d '"')
    if [ "$node_env" = "production" ]; then
        echo "✅ NODE_ENV: OK"
    else
        echo "❌ NODE_ENV: WRONG ($node_env) - should be production"
    fi
}

# Main checks
echo "🧪 API Endpoint Tests:"
failed=0

check_endpoint "http://localhost:3000/api/auth/session" "Internal Session API" || ((failed++))
check_endpoint "http://localhost:3000/api/auth/providers" "Internal Providers API" || ((failed++))
check_endpoint "http://23.88.98.49/api/auth/session" "External Session API" || ((failed++))
check_endpoint "http://23.88.98.49/api/auth/providers" "External Providers API" || ((failed++))

# Environment checks
check_env_consistency

# PM2 Process check
echo -e "\n📊 PM2 Process Status:"
if sudo -u comparee pm2 list | grep -q "comparee-nextjs.*online"; then
    echo "✅ PM2 Process: ONLINE"
else
    echo "❌ PM2 Process: OFFLINE"
    ((failed++))
fi

# Recent error check
echo -e "\n📋 Recent Error Check:"
error_count=$(sudo -u comparee pm2 logs comparee-nextjs --lines 50 --nostream | grep -i "error\|fail\|exception" | wc -l)
if [ "$error_count" -eq 0 ]; then
    echo "✅ No recent errors in logs"
else
    echo "⚠️  Found $error_count recent errors in logs"
    echo "   Run: sudo -u comparee pm2 logs comparee-nextjs | grep -i error"
fi

# Summary
echo -e "\n📈 Summary:"
if [ "$failed" -eq 0 ]; then
    echo "✅ All NextAuth checks PASSED"
    exit 0
else
    echo "❌ $failed checks FAILED"
    echo "   Run: bash complete-nextauth-fix.sh"
    exit 1
fi 