# 🚀 Panduan Deployment E-Voting di VPS Ubuntu dengan Nginx

Panduan lengkap untuk deploy sistem e-voting SMK N 2 Malinau di VPS Ubuntu menggunakan Nginx sebagai reverse proxy.

## 📋 Prasyarat VPS

### Spesifikasi Server Minimum
- **OS**: Ubuntu 20.04 LTS atau 22.04 LTS
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB SSD minimum
- **CPU**: 2 vCPU minimum
- **Bandwidth**: 1TB/bulan minimum
- **IP**: Static IP address
- **Domain**: Domain yang mengarah ke IP server

### Akses VPS
```bash
# Login ke VPS via SSH
ssh root@your-server-ip
# atau
ssh username@your-server-ip

# Update sistem
sudo apt update && sudo apt upgrade -y
```

## 🛠️ Instalasi Dependencies

### 1. Install Node.js 20.x
```bash
# Install Node.js repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Install Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Enable dan start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Cek status
sudo systemctl status nginx

# Test nginx (optional)
curl -I http://localhost
```

### 3. Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup
# Jalankan command yang ditampilkan oleh PM2 startup

# Verifikasi
pm2 --version
```

### 4. Install Git dan Tools Lainnya
```bash
# Install git dan tools
sudo apt install git curl wget htop ufw -y

# Install SQLite3
sudo apt install sqlite3 -y
```

## 📥 Deploy Aplikasi

### 1. Clone Repository
```bash
# Buat direktori web
sudo mkdir -p /var/www

# Clone repository
cd /var/www
sudo git clone https://github.com/pindoyono/e-vote.git
sudo mv e-vote e-vote-production

# Set ownership
sudo chown -R $USER:$USER /var/www/e-vote-production
cd /var/www/e-vote-production
```

### 2. Install Dependencies
```bash
# Install dependencies untuk production
npm ci --production

# Install dev dependencies juga (untuk build)
npm install
```

### 3. Setup Environment
```bash
# Copy environment file
cp .env.example .env.production

# Edit file environment
nano .env.production
```

**Isi file `.env.production`:**
```env
# Database
DATABASE_URL="file:./production.db"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secure-secret-key-min-32-characters-long"

# Application
NODE_ENV="production"
PORT=3000

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="SecureAdminPassword2024!"

# Committee Credentials
COMMITTEE_USERNAME="committee"
COMMITTEE_PASSWORD="SecureCommitteePassword2024!"

# Upload Settings
UPLOAD_DIR="/var/www/e-vote-production/uploads"
MAX_FILE_SIZE="5242880"
```

### 4. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database dengan data awal (opsional)
npx prisma db seed
```

### 5. Build Aplikasi
```bash
# Build aplikasi untuk production
npm run build

# Test build
npm start &
sleep 5
curl -I http://localhost:3000
killall node
```

### 6. Setup Direktori Upload
```bash
# Buat direktori upload
mkdir -p uploads

# Set permissions
sudo chown -R www-data:www-data uploads
sudo chmod -R 755 uploads
```

## ⚙️ Konfigurasi PM2

### 1. Buat PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

**Isi file `ecosystem.config.js`:**
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
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

### 2. Start Aplikasi dengan PM2
```bash
# Buat direktori log
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start aplikasi
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs e-vote-production
```

## 🌐 Konfigurasi Nginx

### 1. Buat Konfigurasi Site
```bash
# Buat file konfigurasi
sudo nano /etc/nginx/sites-available/e-vote
```

**Isi file konfigurasi:**
```nginx
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (akan dikonfigurasi oleh Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # File upload limit
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate max-age=0;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Access logs
    access_log /var/log/nginx/e-vote-access.log;
    error_log /var/log/nginx/e-vote-error.log;
    
    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Upload files
    location /uploads/ {
        alias /var/www/e-vote-production/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        
        # Security untuk upload files
        location ~* \.(php|php5|phtml|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    # API routes
    location /api/ {
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
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|db)$ {
        deny all;
    }
    
    location /prisma/ {
        deny all;
    }
}
```

### 2. Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/e-vote /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 Setup SSL dengan Let's Encrypt

### 1. Install Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Dapatkan SSL Certificate
```bash
# Stop nginx sementara untuk standalone mode
sudo systemctl stop nginx

# Dapatkan certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Atau gunakan nginx plugin (jika nginx jalan)
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Start nginx kembali
sudo systemctl start nginx

# Test SSL
curl -I https://your-domain.com
```

### 3. Auto-renewal SSL
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Setup cron job untuk auto-renewal
sudo crontab -e

# Tambahkan baris ini:
0 12 * * * /usr/bin/certbot renew --quiet && /bin/systemctl reload nginx
```

## 🛡️ Security Configuration

### 1. Setup Firewall (UFW)
```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status verbose
```

### 2. Fail2Ban (Opsional)
```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Create jail config
sudo nano /etc/fail2ban/jail.local
```

**Isi file jail.local:**
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
sudo chmod 600 /var/www/e-vote-production/.env.production
sudo chown -R www-data:www-data /var/www/e-vote-production/uploads
sudo chmod -R 755 /var/www/e-vote-production
```

## 💾 Setup Backup System

### 1. Backup Script
```bash
# Buat backup script
sudo nano /usr/local/bin/backup-evote.sh
```

**Isi script:**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/e-vote"
APP_DIR="/var/www/e-vote-production"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup process: $DATE"

# Backup database
if [ -f "$APP_DIR/prisma/production.db" ]; then
    echo "Backing up database..."
    sqlite3 $APP_DIR/prisma/production.db ".backup $BACKUP_DIR/database_$DATE.db"
    echo "Database backup completed"
fi

# Backup uploads
if [ -d "$APP_DIR/uploads" ]; then
    echo "Backing up uploads..."
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR uploads/
    echo "Uploads backup completed"
fi

# Backup configuration
if [ -f "$APP_DIR/.env.production" ]; then
    echo "Backing up configuration..."
    cp $APP_DIR/.env.production $BACKUP_DIR/env_$DATE.backup
    echo "Configuration backup completed"
fi

# Remove old backups
echo "Cleaning old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.db" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.backup" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
echo "Backup location: $BACKUP_DIR"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-evote.sh

# Test backup
sudo /usr/local/bin/backup-evote.sh

# Setup daily backup
sudo crontab -e
# Tambahkan: 0 2 * * * /usr/local/bin/backup-evote.sh
```

### 2. Update Script
```bash
# Buat update script
sudo nano /usr/local/bin/update-evote.sh
```

**Isi script:**
```bash
#!/bin/bash

APP_DIR="/var/www/e-vote-production"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment update: $DATE"

# Backup before update
echo "📦 Creating backup..."
/usr/local/bin/backup-evote.sh

cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build application
echo "🏗️ Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Reload PM2
echo "🔄 Reloading application..."
pm2 reload e-vote-production

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Update completed successfully: $DATE"

# Health check
sleep 10
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is responding"
else
    echo "❌ Application may not be responding"
    pm2 restart e-vote-production
fi
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/update-evote.sh
```

## 📊 Monitoring & Maintenance

### 1. Health Check Script
```bash
# Buat health check script
nano /usr/local/bin/health-check.sh
```

**Isi script:**
```bash
#!/bin/bash

APP_URL="https://your-domain.com"
LOG_FILE="/var/log/e-vote-health.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Check application
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $HTTP_STATUS -eq 200 ]; then
    log "✅ Application is healthy (HTTP $HTTP_STATUS)"
else
    log "❌ Application is down (HTTP $HTTP_STATUS)"
    # Restart PM2
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
chmod +x /usr/local/bin/health-check.sh

# Setup cron job setiap 5 menit
crontab -e
# Tambahkan: */5 * * * * /usr/local/bin/health-check.sh
```

### 2. Log Management
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/e-vote
```

**Isi file:**
```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/e-vote-*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 www-data adm
    postrotate
        systemctl reload nginx
    endscript
}
```

## 🔧 Management Commands

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs e-vote-production

# Restart application
pm2 restart e-vote-production

# Reload application (zero downtime)
pm2 reload e-vote-production

# Stop application
pm2 stop e-vote-production

# Monitor resources
pm2 monit
```

### Nginx Commands
```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/e-vote-access.log
sudo tail -f /var/log/nginx/e-vote-error.log
```

### Database Commands
```bash
# View database
cd /var/www/e-vote-production
sqlite3 prisma/production.db

# Backup database manual
sqlite3 prisma/production.db ".backup backup_$(date +%Y%m%d).db"

# Check database size
ls -lh prisma/production.db
```

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs e-vote-production

# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Restart PM2
pm2 restart e-vote-production

# Check environment variables
pm2 env 0
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Restart services
pm2 restart e-vote-production
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Check certificate files
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# Renew certificate
sudo certbot renew

# Test SSL
curl -I https://your-domain.com
```

### Database Connection Error
```bash
# Check database file
ls -la /var/www/e-vote-production/prisma/

# Check file permissions
sudo chmod 644 /var/www/e-vote-production/prisma/production.db

# Check disk space
df -h

# Reset database (WARNING: deletes all data)
cd /var/www/e-vote-production
npx prisma migrate reset
```

### High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart PM2 with memory limit
pm2 stop e-vote-production
pm2 start ecosystem.config.js

# Check for memory leaks
pm2 logs e-vote-production | grep memory
```

## ✅ Post-Deployment Checklist

- [ ] Domain pointing to server IP
- [ ] SSL certificate installed and working
- [ ] Application accessible via HTTPS
- [ ] Admin panel accessible (/admin)
- [ ] Committee panel accessible (/committee)
- [ ] File uploads working
- [ ] Database migrations completed
- [ ] Backup system configured
- [ ] Monitoring scripts setup
- [ ] Firewall configured
- [ ] Log rotation configured
- [ ] Health checks working
- [ ] Performance testing done
- [ ] Admin credentials changed from defaults

## 📞 Support

Untuk bantuan deployment atau troubleshooting:
- 📧 Email: support@smkn2malinau.sch.id
- 🐛 Issues: [GitHub Issues](https://github.com/pindoyono/e-vote/issues)

---

**© 2024 SMK Negeri 2 Malinau - E-Voting System**