#!/bin/bash

# =============================================================================
# SIMPLE POSTGRESQL BACKUP SCRIPT FOR HETZNER RESCUE
# =============================================================================
# Jednoduchý backup script pro PostgreSQL v Hetzner Rescue systému
# =============================================================================

set -e

echo "🔄 Starting PostgreSQL Backup in Rescue Mode..."

# 1️⃣ Připojit root FS jako read-write
echo "📁 Remounting root filesystem as read-write..."
mount -o remount,rw /

# 2️⃣ Vytvořit backup adresář
BACKUP_DIR="/root/postgres_backups"
echo "📂 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 3️⃣ Vytvořit timestamp pro backup
TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql.gz"

echo "💾 Creating PostgreSQL backup..."
echo "📝 Backup file: $BACKUP_FILE"

# 4️⃣ Provést backup pomocí pg_dumpall
if command -v pg_dumpall >/dev/null 2>&1; then
    echo "✅ pg_dumpall found, starting backup..."
    pg_dumpall -U postgres | gzip > "$BACKUP_FILE"
    
    # Ověřit, že backup vznikl
    if [[ -f "$BACKUP_FILE" ]]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "✅ Backup hotový!"
        echo "📁 Cesta: $BACKUP_FILE"
        echo "📏 Velikost: $BACKUP_SIZE"
        
        # Vypsat seznam všech backupů
        echo ""
        echo "📋 Všechny dostupné backupy:"
        ls -lah "$BACKUP_DIR"
    else
        echo "❌ Chyba: Backup soubor nevznikl!"
        exit 1
    fi
else
    echo "❌ Chyba: pg_dumpall není dostupný!"
    echo "🔍 Hledám PostgreSQL..."
    
    # Zkusit najít PostgreSQL v chroot prostředí
    if [[ -d "/mnt" ]]; then
        echo "🔄 Zkouším chroot přístup..."
        
        # Mount systém pokud není
        if ! mountpoint -q /mnt; then
            mount /dev/sda1 /mnt
        fi
        
        # Bind mounty
        mount --bind /dev /mnt/dev 2>/dev/null || true
        mount --bind /proc /mnt/proc 2>/dev/null || true
        mount --bind /sys /mnt/sys 2>/dev/null || true
        
        # Spustit backup v chroot
        chroot /mnt /bin/bash -c "
            echo '🔄 Chroot backup mode...'
            systemctl start postgresql 2>/dev/null || true
            sleep 2
            
            mkdir -p /root/postgres_backups
            BACKUP_FILE=/root/postgres_backups/postgres_backup_$TIMESTAMP.sql.gz
            
            su - postgres -c 'pg_dumpall' | gzip > \$BACKUP_FILE
            
            if [[ -f \$BACKUP_FILE ]]; then
                echo '✅ Backup hotový!'
                echo '📁 Cesta: '\$BACKUP_FILE
                echo '📏 Velikost: '\$(du -h \$BACKUP_FILE | cut -f1)
                ls -lah /root/postgres_backups/
            else
                echo '❌ Backup failed!'
                exit 1
            fi
        "
    else
        echo "❌ Nelze najít PostgreSQL ani chroot prostředí!"
        exit 1
    fi
fi

echo ""
echo "🎉 Backup process completed!" 