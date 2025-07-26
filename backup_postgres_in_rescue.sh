#!/bin/bash

# =============================================================================
# HETZNER RESCUE POSTGRESQL BACKUP SCRIPT
# =============================================================================
# Tento script provede kompletní backup PostgreSQL z Hetzner Rescue systému
# Autor: Comparee.ai Infrastructure Team
# Datum: $(date +%Y-%m-%d)
# =============================================================================

set -e # Exit při chybě
set -u # Exit při nedefinované proměnné

# Barevné výstupy
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logování
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kontrola, zda běžíme v rescue systému
check_rescue_system() {
    log_info "Kontroluji Rescue System..."
    if [[ ! -f /etc/hetzner-rescue ]]; then
        log_error "Tento script musí běžet v Hetzner Rescue systému!"
        exit 1
    fi
    log_success "Rescue systém detekován"
}

# 1️⃣ Mount a chroot setup
setup_mounts() {
    log_info "Nastavuji mount body..."
    
    # Kontrola, zda je disk už připojený
    if ! mountpoint -q /mnt; then
        log_info "Připojuji hlavní disk /dev/sda1 na /mnt..."
        mount /dev/sda1 /mnt || {
            log_error "Nepodařilo se připojit /dev/sda1"
            exit 1
        }
    else
        log_success "Disk už je připojený na /mnt"
    fi
    
    # Bind mount systémových adresářů
    log_info "Nastavuji bind mounty..."
    
    if ! mountpoint -q /mnt/dev; then
        mount --bind /dev /mnt/dev
        log_success "Bind mount /dev"
    fi
    
    if ! mountpoint -q /mnt/proc; then
        mount --bind /proc /mnt/proc
        log_success "Bind mount /proc"
    fi
    
    if ! mountpoint -q /mnt/sys; then
        mount --bind /sys /mnt/sys
        log_success "Bind mount /sys"
    fi
    
    log_success "Všechny mounty připraveny"
}

# 2️⃣ PostgreSQL kontrola a start
check_postgresql() {
    log_info "Vstupuji do chroot prostředí..."
    
    chroot /mnt /bin/bash -c "
        echo '=== PostgreSQL STATUS CHECK ==='
        
        # Verze PostgreSQL
        echo '--- PostgreSQL Version ---'
        if command -v psql >/dev/null 2>&1; then
            psql --version
        else
            echo 'PostgreSQL client není nainstalován!'
            exit 1
        fi
        
        # Status služby
        echo -e '\n--- Service Status ---'
        systemctl status postgresql || true
        
        # Pokud neběží, zkusíme spustit
        if ! systemctl is-active postgresql >/dev/null 2>&1; then
            echo 'PostgreSQL neběží, spouštím...'
            systemctl start postgresql
            sleep 3
            systemctl status postgresql
        fi
        
        # Seznam databází
        echo -e '\n--- Database List ---'
        su - postgres -c 'psql -l' || {
            echo 'Chyba při připojení k PostgreSQL'
            exit 1
        }
        
        # Konfigurace
        echo -e '\n--- Configuration ---'
        echo 'Listen addresses:'
        cat /etc/postgresql/*/main/postgresql.conf | grep -E '^listen_addresses' || echo 'Žádné explicitní nastavení'
        
        echo -e '\nHBA Configuration (non-comments):'
        cat /etc/postgresql/*/main/pg_hba.conf | grep -v '^#' | grep -v '^$' || echo 'Prázdná konfigurace'
    "
}

# 3️⃣ Vytvoření kompletního backupu
create_backup() {
    local BACKUP_DIR="/mnt/var/backups/postgresql"
    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    local BACKUP_FILE="comparee_full_backup_${TIMESTAMP}.sql"
    
    log_info "Vytvářím backup všech databází..."
    
    chroot /mnt /bin/bash -c "
        # Vytvoření backup adresáře
        mkdir -p ${BACKUP_DIR}
        
        # Kompletní dump všech databází
        echo 'Vytváření pg_dumpall backup...'
        su - postgres -c 'pg_dumpall --verbose' > ${BACKUP_DIR}/${BACKUP_FILE} 2>/tmp/backup.log || {
            echo 'Chyba při vytváření backupu:'
            cat /tmp/backup.log
            exit 1
        }
        
        # Komprese backupu
        echo 'Komprimace backupu...'
        gzip ${BACKUP_DIR}/${BACKUP_FILE}
        
        # Informace o backupu
        echo -e '\n=== BACKUP DOKONČEN ==='
        echo \"Backup file: ${BACKUP_DIR}/${BACKUP_FILE}.gz\"
        echo \"Size: \$(du -h ${BACKUP_DIR}/${BACKUP_FILE}.gz | cut -f1)\"
        echo \"Created: \$(date)\"
        
        # Seznam všech backupů
        echo -e '\n--- Všechny dostupné backupy ---'
        ls -lah ${BACKUP_DIR}/
    "
    
    log_success "Backup dokončen!"
}

# 4️⃣ Export databázových credentials
export_credentials() {
    log_info "Exportuji databázové přihlašovací údaje..."
    
    chroot /mnt /bin/bash -c "
        echo '=== DATABASE CREDENTIALS ==='
        
        # Hledání env souborů s DB credentials
        echo '--- Comparee.ai Environment Files ---'
        find /var/www -name '.env*' -type f 2>/dev/null | while read env_file; do
            echo \"File: \$env_file\"
            grep -E 'DATABASE_URL|DB_|POSTGRES' \"\$env_file\" 2>/dev/null || echo 'Žádné DB credentials'
            echo '---'
        done
        
        # PostgreSQL konfigurace
        echo -e '\n--- PostgreSQL Cluster Info ---'
        su - postgres -c 'psql -c \"SELECT version();\"' 2>/dev/null || echo 'Nelze získat verzi'
        su - postgres -c 'psql -c \"SHOW data_directory;\"' 2>/dev/null || echo 'Nelze získat data directory'
        su - postgres -c 'psql -c \"SHOW port;\"' 2>/dev/null || echo 'Nelze získat port'
    "
}

# 5️⃣ Cleanup
cleanup() {
    log_info "Provádím cleanup..."
    
    # Umount v opačném pořadí
    umount /mnt/sys 2>/dev/null || true
    umount /mnt/proc 2>/dev/null || true  
    umount /mnt/dev 2>/dev/null || true
    # /mnt necháme připojené pro přístup k backupům
    
    log_success "Cleanup dokončen"
}

# Main execution
main() {
    echo "=============================================="
    echo "   HETZNER RESCUE POSTGRESQL BACKUP"
    echo "   $(date)"
    echo "=============================================="
    
    check_rescue_system
    setup_mounts
    check_postgresql
    create_backup
    export_credentials
    
    echo -e "\n${GREEN}✅ VŠECHNY ÚKOLY DOKONČENY!${NC}"
    echo -e "${BLUE}Backup je dostupný v /mnt/var/backups/postgresql/${NC}"
    echo -e "${YELLOW}Pro přístup k backupu zůstává /mnt připojené${NC}"
}

# Trap pro cleanup při ukončení
trap cleanup EXIT

# Spuštění
main "$@" 