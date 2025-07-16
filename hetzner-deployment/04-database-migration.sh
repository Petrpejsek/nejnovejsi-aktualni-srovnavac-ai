#!/bin/bash

# =============================================================================
# Comparee.ai - Database Migration Script  
# =============================================================================

echo "🗄️ Setting up database migration from Neon to Hetzner..."

# Variables (replace with your actual values)
NEON_DB_URL="postgresql://username:password@ep-xyz.pooler.neon.tech:5432/database_name"
NEW_DB_SERVER_IP="your-cx21-server-ip"
NEW_DB_NAME="comparee_db"
NEW_DB_USER="comparee_user"
NEW_DB_PASSWORD="secure_password_here"

echo "📋 Prerequisites:"
echo "   1. Make sure your CX21 PostgreSQL server is running"
echo "   2. Update the variables above with your actual values"
echo ""

# Create database backup from Neon
echo "💾 Creating backup from Neon database..."
mkdir -p /tmp/db-migration
cd /tmp/db-migration

# Export schema and data from Neon
echo "📤 Exporting from Neon..."
pg_dump "$NEON_DB_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --create \
  --if-exists \
  --format=custom \
  --file=neon_backup.dump

if [ $? -eq 0 ]; then
    echo "✅ Neon backup created successfully"
else
    echo "❌ Failed to create Neon backup"
    exit 1
fi

# Also create SQL format for manual inspection
echo "📤 Creating SQL dump for inspection..."
pg_dump "$NEON_DB_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --file=neon_backup.sql

echo "✅ Database export completed!"
echo ""
echo "📋 Files created:"
echo "   - /tmp/db-migration/neon_backup.dump (binary format)"
echo "   - /tmp/db-migration/neon_backup.sql (text format)"
echo ""

# Create restore script
cat > restore_to_new_server.sh << 'RESTORE'
#!/bin/bash

# =============================================================================
# Database Restore Script - Run this on the NEW PostgreSQL server
# =============================================================================

NEW_DB_SERVER_IP="your-cx21-server-ip"
NEW_DB_NAME="comparee_db"
NEW_DB_USER="comparee_user"
NEW_DB_PASSWORD="secure_password_here"

echo "🔄 Restoring database to new PostgreSQL server..."

# Create database and user
echo "👤 Creating database and user..."
sudo -u postgres psql << EOF
CREATE USER $NEW_DB_USER WITH PASSWORD '$NEW_DB_PASSWORD';
CREATE DATABASE $NEW_DB_NAME OWNER $NEW_DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $NEW_DB_NAME TO $NEW_DB_USER;
\q
EOF

# Restore from backup
echo "📥 Restoring data..."
pg_restore \
  --host=$NEW_DB_SERVER_IP \
  --port=5432 \
  --username=$NEW_DB_USER \
  --dbname=$NEW_DB_NAME \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  neon_backup.dump

if [ $? -eq 0 ]; then
    echo "✅ Database restoration completed successfully!"
    
    # Test connection
    echo "🔍 Testing connection..."
    PGPASSWORD=$NEW_DB_PASSWORD psql \
      --host=$NEW_DB_SERVER_IP \
      --port=5432 \
      --username=$NEW_DB_USER \
      --dbname=$NEW_DB_NAME \
      --command="SELECT count(*) as product_count FROM \"Product\";"
    
    echo ""
    echo "🔗 New database connection string:"
    echo "DATABASE_URL=postgresql://$NEW_DB_USER:$NEW_DB_PASSWORD@$NEW_DB_SERVER_IP:5432/$NEW_DB_NAME"
    
else
    echo "❌ Database restoration failed!"
    exit 1
fi
RESTORE

chmod +x restore_to_new_server.sh

# Create environment update script
cat > update_env_file.sh << 'ENV_UPDATE'
#!/bin/bash

# =============================================================================
# Environment File Update Script
# =============================================================================

NEW_DB_SERVER_IP="your-cx21-server-ip"
NEW_DB_NAME="comparee_db"  
NEW_DB_USER="comparee_user"
NEW_DB_PASSWORD="secure_password_here"

NEW_DATABASE_URL="postgresql://$NEW_DB_USER:$NEW_DB_PASSWORD@$NEW_DB_SERVER_IP:5432/$NEW_DB_NAME"

echo "🔧 Updating environment file..."

# Update the production environment file
sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|g" /var/www/comparee/.env.production

echo "✅ Environment file updated!"
echo "🔗 New DATABASE_URL: $NEW_DATABASE_URL"

# Restart applications
echo "🔄 Restarting applications..."
sudo -u comparee pm2 restart all

echo "✅ Applications restarted with new database connection!"
ENV_UPDATE

chmod +x update_env_file.sh

echo "✅ Migration scripts prepared!"
echo ""
echo "📋 Migration steps:"
echo ""
echo "1️⃣  On this server (CX32):"
echo "   - Review and update variables in the scripts above"
echo "   - Copy backup files to your new PostgreSQL server"
echo ""
echo "2️⃣  On your CX21 PostgreSQL server:"
echo "   - Install PostgreSQL: apt install postgresql postgresql-contrib"
echo "   - Copy neon_backup.dump to the server"
echo "   - Run: bash restore_to_new_server.sh"
echo ""
echo "3️⃣  Back on this server (CX32):"
echo "   - Update variables in update_env_file.sh"
echo "   - Run: bash update_env_file.sh"
echo ""
echo "🔍 Useful commands:"
echo "   - Test connection: PGPASSWORD=password psql -h server-ip -U user -d database"
echo "   - Check app logs: sudo -u comparee pm2 logs"
echo "   - Monitor: sudo -u comparee pm2 monit" 