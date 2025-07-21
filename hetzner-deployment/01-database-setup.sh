#!/bin/bash

# =============================================================================
# Comparee.ai - Database Server Setup Script (CPX21)
# =============================================================================

echo "🗄️ Starting Comparee.ai DATABASE server setup on CPX21..."

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

# Install PostgreSQL 14
echo "🗄️ Installing PostgreSQL 14..."
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-14 postgresql-contrib-14

# Configure PostgreSQL
echo "⚙️ Configuring PostgreSQL..."

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user for comparee
sudo -u postgres psql <<EOF
CREATE DATABASE comparee_production;
CREATE USER comparee_user WITH ENCRYPTED PASSWORD 'comparee_secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE comparee_production TO comparee_user;
ALTER USER comparee_user CREATEDB;
\q
EOF

# Configure PostgreSQL for remote connections
echo "🌐 Configuring PostgreSQL for remote connections..."

# Backup original configs
cp /etc/postgresql/14/main/postgresql.conf /etc/postgresql/14/main/postgresql.conf.backup
cp /etc/postgresql/14/main/pg_hba.conf /etc/postgresql/14/main/pg_hba.conf.backup

# Allow connections from application server
echo "listen_addresses = '*'" >> /etc/postgresql/14/main/postgresql.conf
echo "port = 5432" >> /etc/postgresql/14/main/postgresql.conf
echo "max_connections = 100" >> /etc/postgresql/14/main/postgresql.conf
echo "shared_buffers = 256MB" >> /etc/postgresql/14/main/postgresql.conf
echo "effective_cache_size = 1GB" >> /etc/postgresql/14/main/postgresql.conf

# Add connection rules (replace with actual web server IP)
echo "# Comparee application server access" >> /etc/postgresql/14/main/pg_hba.conf
echo "host    comparee_production    comparee_user    23.88.98.49/32    md5" >> /etc/postgresql/14/main/pg_hba.conf
echo "host    comparee_production    comparee_user    localhost          md5" >> /etc/postgresql/14/main/pg_hba.conf

# Configure firewall
echo "🔒 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow from 23.88.98.49 to any port 5432  # Allow web server to connect to PostgreSQL
ufw --force enable

# Restart PostgreSQL to apply configs
echo "🔄 Restarting PostgreSQL..."
systemctl restart postgresql

# Install backup tools
echo "💾 Installing backup tools..."
apt install -y postgresql-client-14 cron

# Create backup script
cat > /usr/local/bin/postgres-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup comparee database
sudo -u postgres pg_dump comparee_production > $BACKUP_DIR/comparee_production_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/comparee_production_$DATE.sql"
EOF

chmod +x /usr/local/bin/postgres-backup.sh

# Add daily backup cron job
echo "0 2 * * * root /usr/local/bin/postgres-backup.sh" >> /etc/crontab

echo "✅ Database server setup completed!"
echo ""
echo "📋 Database Configuration:"
echo "   Database: comparee_production"
echo "   User: comparee_user"
echo "   Password: comparee_secure_password_2024!"
echo "   Host: localhost (for internal) | 195.201.219.128 (for external)"
echo "   Port: 5432"
echo ""
echo "🔐 Security:"
echo "   - Firewall configured (only SSH + web server access)"
echo "   - PostgreSQL configured for remote access from web server"
echo "   - Daily backups scheduled at 2 AM"
echo ""
echo "📊 System Information:"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $4}')"
echo "PostgreSQL: $(sudo -u postgres psql -c 'SELECT version();' -t | head -1)" 