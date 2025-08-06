#!/bin/bash

# =============================================================================
# Comparee.ai - Nginx Configuration Script
# =============================================================================

echo "🌐 Configuring Nginx reverse proxy..."

# Remove default Nginx config
rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration for Comparee.ai
cat > /etc/nginx/sites-available/comparee << 'NGINX'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Upstream servers
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

upstream python_backend {
    server 127.0.0.1:8000;
}

# HTTP Server (redirect to HTTPS)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be filled by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml
        application/json;
    
    # Client upload limit
    client_max_body_size 50M;
    
    # API routes to Python FastAPI
    location /api/python/ {
        limit_req zone=api burst=20 nodelay;
        
        rewrite ^/api/python/(.*) /api/v1/$1 break;
        proxy_pass http://python_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files (images, uploads)
    location /uploads/ {
        alias /var/www/comparee/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /screenshots/ {
        alias /var/www/comparee/public/screenshots/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Next.js static assets
    location /_next/static/ {
        proxy_pass http://nextjs_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # All other requests to Next.js
    location / {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX

# Enable the site
ln -sf /etc/nginx/sites-available/comparee /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    systemctl reload nginx
    systemctl enable nginx
    
    echo "✅ Nginx configured successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update 'yourdomain.com' in /etc/nginx/sites-available/comparee"
    echo "   2. Run: certbot --nginx -d yourdomain.com -d www.yourdomain.com"
    echo "   3. Start your applications with PM2"
    echo "   4. Test the setup"
    
else
    echo "❌ Nginx configuration has errors!"
    echo "Please check the configuration and fix any issues."
    exit 1
fi

# Create SSL setup script
cat > /var/www/comparee/setup-ssl.sh << 'SSL'
#!/bin/bash

# Replace yourdomain.com with your actual domain
DOMAIN="yourdomain.com"

echo "🔐 Setting up SSL certificate for $DOMAIN..."

# Get SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email your-email@example.com

# Setup auto-renewal
echo "⏰ Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ SSL setup completed!"
SSL

chmod +x /var/www/comparee/setup-ssl.sh

echo ""
echo "📝 SSL Setup:"
echo "   1. Edit /var/www/comparee/setup-ssl.sh with your domain and email"
echo "   2. Run: bash /var/www/comparee/setup-ssl.sh" 