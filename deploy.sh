#!/bin/bash

# E-Voting System - Quick Deployment Script
# SMK Negeri 2 Malinau
# Usage: ./deploy.sh [domain] [email]

set -e

# Configuration
DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"admin@your-domain.com"}
APP_NAME="e-vote-production"
APP_DIR="/var/www/$APP_NAME"
LOG_FILE="/var/log/evote-deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" >> $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1" >> $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Create log directory
sudo mkdir -p /var/log
sudo touch $LOG_FILE
sudo chown $USER:$USER $LOG_FILE

log "🚀 Starting E-Voting System deployment for domain: $DOMAIN"

# Check system requirements
info "📋 Checking system requirements..."

# Check Ubuntu version
if ! lsb_release -d | grep -q "Ubuntu"; then
    warning "This script is designed for Ubuntu. Proceed with caution."
fi

# Check memory
MEMORY=$(free -g | awk 'NR==2{print $2}')
if [ $MEMORY -lt 2 ]; then
    warning "System has less than 2GB RAM. Performance may be affected."
fi

# Update system
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
log "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log "Node.js already installed: $(node --version)"
fi

# Install additional packages
log "📦 Installing additional packages..."
sudo apt install -y nginx git sqlite3 certbot python3-certbot-nginx htop ufw fail2ban

# Install PM2
log "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 startup | grep -o 'sudo.*' | bash
else
    log "PM2 already installed"
fi

# Configure firewall
log "🛡️ Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443

# Clone repository
log "📥 Cloning repository..."
sudo mkdir -p /var/www
if [ -d "$APP_DIR" ]; then
    log "Application directory exists. Backing up..."
    sudo mv $APP_DIR $APP_DIR.backup.$(date +%Y%m%d_%H%M%S)
fi

cd /var/www
sudo git clone https://github.com/pindoyono/e-vote.git $APP_NAME
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

# Install dependencies
log "📦 Installing application dependencies..."
npm install --production

# Setup environment
log "⚙️ Setting up environment..."
if [ ! -f .env.production ]; then
    cp .env.example .env.production || touch .env.production
    
    # Generate secure secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    ADMIN_PASSWORD=$(openssl rand -base64 16)
    COMMITTEE_PASSWORD=$(openssl rand -base64 16)
    
    cat > .env.production << EOF
# Database
DATABASE_URL="file:./production.db"

# NextAuth
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Application Settings
NODE_ENV="production"
PORT=3000

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="$ADMIN_PASSWORD"

# Committee Credentials
COMMITTEE_USERNAME="committee"
COMMITTEE_PASSWORD="$COMMITTEE_PASSWORD"

# Upload Configuration
UPLOAD_DIR="/var/www/$APP_NAME/uploads"
MAX_FILE_SIZE="5242880"
EOF

    log "✅ Environment configured with secure passwords:"
    log "   Admin Password: $ADMIN_PASSWORD"
    log "   Committee Password: $COMMITTEE_PASSWORD"
    log "   🔐 Please save these passwords securely!"
fi

# Setup database
log "🗄️ Setting up database..."
npx prisma generate
npx prisma migrate deploy

# Create uploads directory
mkdir -p uploads
sudo chown -R www-data:www-data uploads
sudo chmod -R 755 uploads

# Build application
log "🏗️ Building application..."
npm run build

# Create PM2 ecosystem config
log "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '$APP_DIR/.env.production',
    error_file: '/var/log/pm2/e-vote-error.log',
    out_file: '/var/log/pm2/e-vote-out.log',
    log_file: '/var/log/pm2/e-vote-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
EOF

# Setup PM2 logs directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application with PM2
log "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Configure Nginx
log "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/e-vote << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Temporary location for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (will be configured by certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static files
    location /_next/static/ {
        alias $APP_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploads
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)\$ {
        deny all;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/e-vote /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    log "✅ Nginx configuration is valid"
    sudo systemctl reload nginx
else
    error "❌ Nginx configuration is invalid"
fi

# Setup SSL with Let's Encrypt
log "🔒 Setting up SSL certificate..."
if sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect; then
    log "✅ SSL certificate installed successfully"
else
    warning "⚠️ SSL certificate installation failed. You may need to configure DNS first."
fi

# Setup auto-renewal for SSL
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

# Create backup script
log "💾 Setting up backup system..."
sudo tee /usr/local/bin/backup-evote.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/e-vote"
APP_DIR="/var/www/e-vote-production"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup database
if [ -f "$APP_DIR/prisma/production.db" ]; then
    sqlite3 $APP_DIR/prisma/production.db ".backup $BACKUP_DIR/database_$DATE.db"
fi

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR uploads/ 2>/dev/null || true

# Backup configuration
cp $APP_DIR/.env.production $BACKUP_DIR/env_$DATE.backup 2>/dev/null || true

# Remove old backups
find $BACKUP_DIR -name "*.db" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.backup" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "Backup completed: $DATE"
EOF

sudo chmod +x /usr/local/bin/backup-evote.sh
sudo mkdir -p /var/backups/e-vote

# Setup daily backups
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-evote.sh") | sudo crontab -

# Create update script
log "🔄 Creating update script..."
sudo tee /usr/local/bin/update-evote.sh << EOF
#!/bin/bash
APP_DIR="$APP_DIR"
echo "🚀 Starting deployment update..."

# Backup before update
/usr/local/bin/backup-evote.sh

cd \$APP_DIR

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Run migrations
npx prisma migrate deploy

# Reload PM2
pm2 reload $APP_NAME

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Update completed successfully!"
EOF

sudo chmod +x /usr/local/bin/update-evote.sh

# Create health check script
log "📊 Setting up health monitoring..."
sudo tee /usr/local/bin/health-check.sh << EOF
#!/bin/bash
APP_URL="https://$DOMAIN"
LOG_FILE="/var/log/e-vote-health.log"

log() {
    echo "\$(date '+%Y-%m-%d %H:%M:%S') - \$1" >> \$LOG_FILE
}

HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" \$APP_URL)

if [ \$HTTP_STATUS -eq 200 ]; then
    log "✅ Application is healthy (HTTP \$HTTP_STATUS)"
else
    log "❌ Application is down (HTTP \$HTTP_STATUS)"
    pm2 restart $APP_NAME
    log "🔄 PM2 restarted"
fi

DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 85 ]; then
    log "⚠️ Disk usage is high: \${DISK_USAGE}%"
fi

MEMORY_USAGE=\$(free | awk 'NR==2{printf "%.0f", \$3/\$2*100}')
if [ \$MEMORY_USAGE -gt 85 ]; then
    log "⚠️ Memory usage is high: \${MEMORY_USAGE}%"
fi
EOF

sudo chmod +x /usr/local/bin/health-check.sh

# Setup health check cron
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/health-check.sh") | crontab -

# Set proper permissions
sudo chmod 600 $APP_DIR/.env.production
sudo chown -R www-data:www-data $APP_DIR/uploads

# Final status check
log "🔍 Performing final health check..."
sleep 10

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" | grep -q "200"; then
    log "✅ Application is running on localhost:3000"
else
    warning "⚠️ Application may not be responding on localhost:3000"
fi

# Display summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 DEPLOYMENT COMPLETED!          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "   🌐 Domain: https://$DOMAIN"
echo -e "   📁 Application: $APP_DIR"
echo -e "   🗄️ Database: SQLite (production.db)"
echo -e "   🔐 SSL: Let's Encrypt"
echo -e "   🚀 Process Manager: PM2"
echo -e "   🌐 Web Server: Nginx"
echo ""
echo -e "${YELLOW}🔑 Admin Credentials:${NC}"
echo -e "   Username: admin"
echo -e "   Password: (check .env.production file)"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "   Update: sudo /usr/local/bin/update-evote.sh"
echo -e "   Backup: sudo /usr/local/bin/backup-evote.sh"
echo -e "   Health: /usr/local/bin/health-check.sh"
echo -e "   PM2 Status: pm2 status"
echo -e "   PM2 Logs: pm2 logs $APP_NAME"
echo -e "   Nginx Status: sudo systemctl status nginx"
echo ""
echo -e "${GREEN}✅ E-Voting System is ready for SMK Negeri 2 Malinau!${NC}"
echo ""

log "🎉 Deployment completed successfully for domain: $DOMAIN"