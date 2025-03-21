#!/bin/bash

# Vytvoření zálohy
npm run backup

# Kopírování zálohy do záložní složky (např. Dropbox nebo jiné cloudové úložiště)
# Upravte cestu podle vašeho nastavení
BACKUP_DIR="$HOME/Dropbox/ai-srovnavac-backups"

# Vytvoření záložní složky, pokud neexistuje
mkdir -p "$BACKUP_DIR"

# Kopírování nejnovější zálohy
cp backups/latest-backup.json "$BACKUP_DIR/backup-$(date +%Y-%m-%d).json"

echo "Záloha byla vytvořena a zkopírována do $BACKUP_DIR" 