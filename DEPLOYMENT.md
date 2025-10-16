# 🚀 E-Voting System Deployment Guide with Nginx

Panduan lengkap untuk deploy sistem e-voting SMK N 2 Malinau menggunakan Nginx sebagai reverse proxy dan production server.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Database Setup](#database-setup)
- [Application Build](#application-build)
- [Nginx Configuration](#nginx-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [PM2 Process Manager](#pm2-process-manager)
- [Security Configuration](#security-configuration)
- [Backup Strategy](#backup-strategy)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04 LTS atau yang lebih baru
- **RAM**: Minimum 2GB (Recommended 4GB)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2 vCPU minimum
- **Network**: Static IP address

### Software Requirements
```bash
# Node.js (v18 or higher)
# Nginx (v1.18 or higher)
# PM2 (Process Manager)
# Certbot (for SSL)
# SQLite3 atau PostgreSQL
```

## 🖥️ Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 4. Install PM2
```bash
sudo npm install -g pm2
pm2 startup
```

### 5. Install Git
```bash
sudo apt install git -y
```

## 🗄️ Database Setup

### Option A: SQLite (Recommended for small-medium scale)
```bash
sudo apt install sqlite3 -y

# SQLite database akan otomatis dibuat oleh Prisma
# Lokasi: /var/www/e-vote/prisma/production.db
```

### Option B: PostgreSQL (Recommended for large scale)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database user
sudo -u postgres createuser --interactive
# Username: evote_user
# Superuser: y

# Create database
sudo -u postgres createdb evote_production

# Set password
sudo -u postgres psql
ALTER USER evote_user PASSWORD 'your_secure_password';
\q
```

## 🏗️ Application Build

### 1. Clone Repository
```bash
# Create web directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/pindoyono/e-vote.git
sudo mv e-vote e-vote-production
cd e-vote-production

# Set permissions
sudo chown -R $USER:$USER /var/www/e-vote-production
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env.production

# Edit production environment
nano .env.production
```

#### Production Environment Variables:
```env
# Database (SQLite)
DATABASE_URL="file:./production.db"

# Database (PostgreSQL - if using)
# DATABASE_URL="postgresql://evote_user:your_secure_password@localhost:5432/evote_production"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secure-secret-key-min-32-chars"

# Application Settings
NODE_ENV="production"
PORT=3000

# Admin Default Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="secure_admin_password_2024"

# Committee Default Credentials  
COMMITTEE_USERNAME="committee"
COMMITTEE_PASSWORD="secure_committee_password_2024"

# Upload Configuration
UPLOAD_DIR="/var/www/e-vote-production/uploads"
MAX_FILE_SIZE="5242880"  # 5MB
```

### 4. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 5. Build Application
```bash
npm run build
```

## ⚙️ Nginx Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/e-vote
```

#### Basic Configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (will be configured later)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Upload size limit
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static files
    location /_next/static/ {
        alias /var/www/e-vote-production/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/e-vote-production/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API routes (rate limiting)
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Security - Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)$ {
        deny all;
    }
}

# Rate limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=1r/s;
}
```

### 2. Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/e-vote /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 SSL/HTTPS Setup

### 1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate
```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

### 3. Auto-renewal Setup
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 PM2 Process Manager

### 1. Create PM2 Configuration
```bash
nano /var/www/e-vote-production/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'e-vote-production',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/e-vote-production',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '/var/www/e-vote-production/.env.production',
    error_file: '/var/log/pm2/e-vote-error.log',
    out_file: '/var/log/pm2/e-vote-out.log',
    log_file: '/var/log/pm2/e-vote-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

### 2. Start Application
```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application
cd /var/www/e-vote-production
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

# Check status
pm2 status
pm2 logs e-vote-production
```

## 🛡️ Security Configuration

### 1. Firewall Setup
```bash
# Install and configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 2. Fail2Ban (Optional but recommended)
```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Create custom jail
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
logpath = /var/log/nginx/error.log
maxretry = 10
```

```bash
# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. File Permissions
```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/e-vote-production/uploads
sudo chmod -R 755 /var/www/e-vote-production
sudo chmod 600 /var/www/e-vote-production/.env.production
sudo chmod 644 /var/www/e-vote-production/prisma/production.db
```

## 💾 Backup Strategy

### 1. Database Backup Script
```bash
sudo nano /usr/local/bin/backup-evote.sh
```

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/e-vote"
APP_DIR="/var/www/e-vote-production"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
if [ -f "$APP_DIR/prisma/production.db" ]; then
    sqlite3 $APP_DIR/prisma/production.db ".backup $BACKUP_DIR/database_$DATE.db"
fi

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR uploads/

# Backup configuration
cp $APP_DIR/.env.production $BACKUP_DIR/env_$DATE.backup

# Remove old backups
find $BACKUP_DIR -name "*.db" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.backup" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-evote.sh

# Add to crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-evote.sh
```

### 2. Application Backup
```bash
# Create full application backup
tar -czf /var/backups/e-vote/app_$(date +%Y%m%d).tar.gz -C /var/www e-vote-production
```

## 📊 Monitoring & Maintenance

### 1. Log Monitoring
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs e-vote-production

# System logs
sudo journalctl -u nginx -f
```

### 2. Performance Monitoring
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Check system resources
htop
df -h
free -h

# PM2 monitoring
pm2 monit
```

### 3. Health Check Script
```bash
sudo nano /usr/local/bin/health-check.sh
```

```bash
#!/bin/bash

# Configuration
APP_URL="https://your-domain.com"
LOG_FILE="/var/log/e-vote-health.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check if application is responding
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $HTTP_STATUS -eq 200 ]; then
    log "✅ Application is healthy (HTTP $HTTP_STATUS)"
else
    log "❌ Application is down (HTTP $HTTP_STATUS)"
    # Restart PM2 if needed
    pm2 restart e-vote-production
    log "🔄 PM2 restarted"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    log "⚠️ Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3/$2*100}')
if [ $MEMORY_USAGE -gt 85 ]; then
    log "⚠️ Memory usage is high: ${MEMORY_USAGE}%"
fi
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/health-check.sh

# Add to crontab (every 5 minutes)
*/5 * * * * /usr/local/bin/health-check.sh
```

## 🚀 Deployment Commands

### Initial Deployment
```bash
# Complete deployment script
#!/bin/bash
cd /var/www/e-vote-production
git pull origin main
npm ci --production
npm run build
npx prisma migrate deploy
pm2 reload ecosystem.config.js
sudo systemctl reload nginx
```

### Update Deployment
```bash
# Create update script
sudo nano /usr/local/bin/update-evote.sh
```

```bash
#!/bin/bash

APP_DIR="/var/www/e-vote-production"
BACKUP_DIR="/var/backups/e-vote"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment..."

# Backup before update
echo "📦 Creating backup..."
/usr/local/bin/backup-evote.sh

cd $APP_DIR

# Pull latest changes
echo "📡 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build application
echo "🏗️ Building application..."
npm run build

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Reload PM2
echo "🔄 Reloading application..."
pm2 reload ecosystem.config.js

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"

# Health check
sleep 10
/usr/local/bin/health-check.sh
```

```bash
sudo chmod +x /usr/local/bin/update-evote.sh
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs e-vote-production

# Check Node.js version
node --version

# Check dependencies
npm list --depth=0

# Rebuild application
npm run build
```

#### 2. Nginx 502 Bad Gateway
```bash
# Check if application is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart e-vote-production
sudo systemctl restart nginx
```

#### 3. Database Connection Issues
```bash
# Check database file permissions
ls -la /var/www/e-vote-production/prisma/

# Reset database
npx prisma migrate reset

# Check disk space
df -h
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

### Performance Optimization

#### 1. Enable Nginx Caching
```nginx
# Add to nginx configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 2. Optimize PM2
```javascript
// In ecosystem.config.js
{
  instances: 'max',
  exec_mode: 'cluster',
  max_memory_restart: '500M',
  node_args: '--max-old-space-size=512'
}
```

## 📋 Production Checklist

### Before Go-Live
- [ ] SSL certificate installed and working
- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Backup system configured
- [ ] Monitoring setup
- [ ] Security measures implemented
- [ ] Performance testing completed
- [ ] Domain DNS configured
- [ ] Load testing completed
- [ ] Admin credentials changed from defaults

### Post-Deployment
- [ ] Health checks passing
- [ ] All features tested
- [ ] Backup restore tested
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Support procedures established

## 📞 Support

Untuk bantuan deployment atau troubleshooting:
- 📧 Email: support@smkn2malinau.sch.id
- 🐛 Issues: [GitHub Issues](https://github.com/pindoyono/e-vote/issues)
- 📖 Documentation: [README.md](./README.md)

---

**© 2024 SMK Negeri 2 Malinau - E-Voting System**