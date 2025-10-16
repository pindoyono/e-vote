#!/bin/bash

# E-Vote Application Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting E-Vote Deployment"
echo "=============================="

# Configuration
APP_NAME="e-vote"
APP_DIR="/var/www/e-vote"
BACKUP_DIR="/var/backups/e-vote"
NODE_VERSION="18"
DOMAIN="your-domain.com"  # Change this

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    log "Node.js installed: ${node_version}"
}

# Install PM2
install_pm2() {
    log "Installing PM2..."
    sudo npm install -g pm2
    
    # Setup PM2 startup
    pm2 startup | tail -1 | sudo bash
}

# Install Nginx
install_nginx() {
    log "Installing Nginx..."
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
}

# Clone and setup application
setup_application() {
    log "Setting up application..."
    
    # Create app directory
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Clone repository
    if [ -d "$APP_DIR/.git" ]; then
        log "Updating existing repository..."
        cd $APP_DIR
        git pull origin main
    else
        log "Cloning repository..."
        git clone https://github.com/pindoyono/e-vote.git $APP_DIR
        cd $APP_DIR
    fi
    
    # Install dependencies
    log "Installing dependencies..."
    npm ci --only=production
    
    # Create environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        log "Creating environment file..."
        cp .env.example .env
        warn "Please edit .env file with your production settings"
        read -p "Press enter to continue after editing .env file..."
    fi
    
    # Build application
    log "Building application..."
    npm run build
    
    # Setup database
    log "Setting up database..."
    npx prisma generate
    npx prisma migrate deploy
    
    # Create uploads directory
    mkdir -p public/uploads
    chmod 755 public/uploads
}

# Configure PM2
configure_pm2() {
    log "Configuring PM2..."
    
    # Stop existing process if running
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start application with PM2
    pm2 start npm --name "$APP_NAME" -- start
    
    # Save PM2 configuration
    pm2 save
    
    log "Application started with PM2"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase upload size for photo uploads
        client_max_body_size 10M;
    }
    
    # Serve static files directly
    location /_next/static/ {
        alias $APP_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Test configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    
    log "Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log "Setting up SSL certificate..."
    
    # Install Certbot
    sudo apt install certbot python3-certbot-nginx -y
    
    # Obtain certificate
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    log "SSL certificate installed"
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    
    log "Firewall configured"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    sudo mkdir -p $BACKUP_DIR
    
    sudo tee /usr/local/bin/e-vote-backup > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="$BACKUP_DIR"
APP_DIR="$APP_DIR"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
cp \$APP_DIR/prisma/prod.db \$BACKUP_DIR/db_\$DATE.db

# Backup uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C \$APP_DIR/public uploads/

# Keep only last 7 days
find \$BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF
    
    sudo chmod +x /usr/local/bin/e-vote-backup
    
    # Setup daily backup cron
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/e-vote-backup") | crontab -
    
    log "Backup script created and scheduled"
}

# Health check
health_check() {
    log "Running health check..."
    
    # Check if application is running
    if pm2 list | grep -q "$APP_NAME.*online"; then
        log "✅ Application is running"
    else
        error "❌ Application is not running"
    fi
    
    # Check if Nginx is running
    if sudo systemctl is-active --quiet nginx; then
        log "✅ Nginx is running"
    else
        error "❌ Nginx is not running"
    fi
    
    # Check if port 3000 is listening
    if netstat -tlnp | grep -q ":3000"; then
        log "✅ Application port is listening"
    else
        error "❌ Application port is not listening"
    fi
    
    # Test HTTP response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        log "✅ Application responds to HTTP requests"
    else
        warn "⚠️  Application may not be responding correctly"
    fi
}

# Display final information
show_final_info() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "===================================="
    echo ""
    echo "Application URL: https://$DOMAIN"
    echo "Admin Panel: https://$DOMAIN/admin/login"
    echo "Committee Panel: https://$DOMAIN/committee/login"
    echo "Monitoring: https://$DOMAIN/monitoring"
    echo ""
    echo "⚠️  IMPORTANT: Contact administrator for login credentials!"
    echo "⚠️  Change default passwords immediately after first login!"
    echo ""
    echo "Useful Commands:"
    echo "- View logs: pm2 logs $APP_NAME"
    echo "- Restart app: pm2 restart $APP_NAME"
    echo "- Monitor app: pm2 monit"
    echo "- Manual backup: /usr/local/bin/e-vote-backup"
    echo ""
}

# Main execution
main() {
    log "Starting deployment process..."
    
    check_root
    
    read -p "This will deploy E-Vote application to $DOMAIN. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled"
        exit 0
    fi
    
    update_system
    install_nodejs
    install_pm2
    install_nginx
    setup_application
    configure_pm2
    configure_nginx
    
    read -p "Setup SSL certificate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    setup_firewall
    create_backup_script
    health_check
    show_final_info
}

# Run main function
main "$@"