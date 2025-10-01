#!/bin/bash

# Backup script untuk database e-vote
BACKUP_DIR="/var/www/e-vote/backups"
DATE=$(date +%Y%m%d-%H%M%S)
DB_FILE="/var/www/e-vote/prisma/dev.db"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Check if database file exists
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
cp $DB_FILE $BACKUP_DIR/backup-$DATE.db

# Verify backup
if [ -f "$BACKUP_DIR/backup-$DATE.db" ]; then
    echo "✅ Backup completed successfully: backup-$DATE.db"
    
    # Get backup file size
    SIZE=$(du -h "$BACKUP_DIR/backup-$DATE.db" | cut -f1)
    echo "📊 Backup size: $SIZE"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "backup-*.db" -mtime +7 -delete

# Show remaining backups
echo "📋 Available backups:"
ls -lh $BACKUP_DIR/backup-*.db 2>/dev/null || echo "No backups found"

echo "🎉 Backup process completed!"