#!/bin/bash

# Deploy script untuk e-vote production
cd /var/www/e-vote

echo "🚀 Starting deployment..."

# Backup current database
if [ -f "prisma/dev.db" ]; then
    echo "📦 Backing up database..."
    mkdir -p backups
    cp prisma/dev.db backups/backup-$(date +%Y%m%d-%H%M%S).db
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations (if any)
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build application
echo "🏗️ Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart e-vote

# Clean up old builds (optional)
echo "🧹 Cleaning up..."
npm run clean

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at: http://localhost:3000"

# Show PM2 status
pm2 status