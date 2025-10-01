# 🚀 Panduan Deployment E-Vote ke VPS Production

Dokumentasi lengkap untuk deploy aplikasi e-voting dari GitHub ke VPS production dengan **Nginx** atau **FrankenPHP**, PM2, dan SSL.

## 🌟 Pilihan Server Web

### **Option 1: Nginx (Traditional & Stable)**
- ✅ Mature dan battle-tested
- ✅ Ekstensif dokumentasi
- ✅ Wide compatibility
- ✅ Manual SSL configuration

### **Option 2: FrankenPHP (Modern & Automated)**
- ✅ Automatic HTTPS dengan Let's Encrypt
- ✅ HTTP/3 dan modern protocols
- ✅ Zero-config SSL setup
- ✅ Built-in performance optimizations

**Recommendation**: Pilih **FrankenPHP** untuk setup modern dan otomatis, atau **Nginx** untuk kompatibilitas maksimal.

---

## 📋 Prerequisites

### 1. VPS Requirements
- Ubuntu 20.04 LTS atau lebih baru
- Minimal 2GB RAM
- 20GB storage
- Domain name (opsional untuk SSL)

### 2. Software Yang Dibutuhkan
- Node.js 18+ 
- **Nginx** ATAU **FrankenPHP** (pilih salah satu)
- PM2 (Process Manager)
- Git
- SQLite3

---

## 🛠️ Setup VPS Production

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 18+
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
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
```

### 4. Install PM2 Global
```bash
sudo npm install -g pm2
```

### 5. Install Git
```bash
sudo apt install git -y
```

---

## 📁 Clone dan Setup Project

### 1. Clone Repository
```bash
# Clone ke direktori production
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/username/e-vote.git
sudo chown -R $USER:$USER /var/www/e-vote
cd e-vote
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Production
```bash
# Copy environment file
cp .env.example .env.production

# Edit file environment
nano .env.production
```

Isi `.env.production`:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (Generate random string)
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# App Environment
NODE_ENV=production
PORT=3000

# App URL
NEXTAUTH_URL=https://yourdomain.com
# Atau jika tidak ada domain:
# NEXTAUTH_URL=http://your-server-ip:3000
```

### 4. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed
```

### 5. Build Application
```bash
npm run build
```

---

## ⚙️ Konfigurasi PM2

### 1. Buat File PM2 Ecosystem
```bash
nano ecosystem.config.js
```

Isi file `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'e-vote',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/e-vote',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/e-vote/logs/err.log',
      out_file: '/var/www/e-vote/logs/out.log',
      log_file: '/var/www/e-vote/logs/combined.log',
      time: true
    }
  ]
};
```

### 2. Buat Direktori Logs
```bash
mkdir -p /var/www/e-vote/logs
```

### 3. Start Application dengan PM2
```bash
# Start aplikasi
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Jalankan command yang diberikan oleh PM2

# Verify aplikasi running
pm2 status
pm2 logs e-vote
```

---

## 🌐 Konfigurasi Nginx

### 1. Buat Konfigurasi Nginx
```bash
sudo nano /etc/nginx/sites-available/e-vote
```

Isi konfigurasi untuk **dengan domain**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
        
        # Upload file size limit
        client_max_body_size 10M;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Atau untuk **tanpa domain (IP only)**:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

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
        
        # Upload file size limit
        client_max_body_size 10M;
    }
}
```

### 2. Enable Site dan Test
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/e-vote /etc/nginx/sites-enabled/

# Remove default site (opsional)
sudo rm /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🌐 Alternatif: Konfigurasi FrankenPHP (Modern Server)

**FrankenPHP adalah alternatif modern untuk Nginx yang mendukung HTTP/3, Caddy server, dan performa tinggi.**

### 1. Install FrankenPHP
```bash
# Download FrankenPHP binary
sudo curl -L https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-linux-x86_64 -o /usr/local/bin/frankenphp
sudo chmod +x /usr/local/bin/frankenphp

# Create frankenphp user
sudo useradd --system --create-home --shell /bin/bash frankenphp
```

### 2. Buat Konfigurasi FrankenPHP
```bash
sudo mkdir -p /etc/frankenphp
sudo nano /etc/frankenphp/Caddyfile
```

Isi konfigurasi **dengan domain**:
```caddy
yourdomain.com, www.yourdomain.com {
    # Enable automatic HTTPS
    tls {
        email your-email@example.com
    }
    
    # Reverse proxy to Next.js
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # XSS Protection
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        # CSP
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        # Remove server info
        -Server
    }
    
    # File upload limit
    request_body {
        max_size 10MB
    }
    
    # Logging
    log {
        output file /var/log/frankenphp/access.log
        format json
    }
}
```

Atau untuk **tanpa domain (IP only)**:
```caddy
:80 {
    # Reverse proxy to Next.js
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # Security headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        -Server
    }
    
    # File upload limit
    request_body {
        max_size 10MB
    }
    
    # Logging
    log {
        output file /var/log/frankenphp/access.log
        format json
    }
}
```

### 3. Setup FrankenPHP Service
```bash
sudo nano /etc/systemd/system/frankenphp.service
```

Isi service file:
```ini
[Unit]
Description=FrankenPHP HTTP Server
Documentation=https://frankenphp.dev/
After=network.target

[Service]
Type=notify
ExecStart=/usr/local/bin/frankenphp run --config /etc/frankenphp/Caddyfile
ExecReload=/bin/kill -USR1 $MAINPID
TimeoutStopSec=5s
KillMode=mixed
KillSignal=SIGINT
User=frankenphp
Group=frankenphp
Restart=on-failure
RestartSec=5s

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/log/frankenphp /var/lib/frankenphp

# Environment
Environment=HOME=/home/frankenphp

[Install]
WantedBy=multi-user.target
```

### 4. Setup Logs dan Permissions
```bash
# Create log directory
sudo mkdir -p /var/log/frankenphp
sudo chown frankenphp:frankenphp /var/log/frankenphp

# Create lib directory
sudo mkdir -p /var/lib/frankenphp
sudo chown frankenphp:frankenphp /var/lib/frankenphp

# Set file permissions
sudo chown frankenphp:frankenphp /etc/frankenphp/Caddyfile
sudo chmod 644 /etc/frankenphp/Caddyfile
```

### 5. Start FrankenPHP Service
```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable frankenphp
sudo systemctl start frankenphp

# Check status
sudo systemctl status frankenphp

# View logs
sudo journalctl -u frankenphp -f
```

### 6. FrankenPHP Firewall (jika menggunakan UFW)
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw --force enable
```

### **Keuntungan FrankenPHP vs Nginx:**

✅ **FrankenPHP Advantages:**
- **Automatic HTTPS**: SSL certificate otomatis dengan Let's Encrypt
- **HTTP/3 Support**: Performa lebih cepat dengan QUIC protocol
- **Zero Configuration**: Setup minimal untuk HTTPS
- **Modern Features**: WebSocket support, Server-Sent Events
- **Better Performance**: Built with Go, optimized untuk modern web
- **Automatic Reload**: Configuration reload tanpa downtime

✅ **Nginx Advantages:**
- **Mature & Stable**: Lebih banyak dokumentasi dan community
- **Wide Support**: Compatible dengan banyak hosting provider
- **Extensive Modules**: Plugin ecosystem yang besar
- **Battle Tested**: Proven di production skala besar

### **Pilihan Server Recommendation:**

- **FrankenPHP**: Pilih jika ingin setup modern, otomatis HTTPS, HTTP/3
- **Nginx**: Pilih jika butuh kompatibilitas luas dan ecosystem mature

---

## 🔒 Setup SSL dengan Let's Encrypt (Opsional)

**Hanya jika memiliki domain name**

### 1. Install Certbot
```bash
sudo apt install snapd -y
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Generate SSL Certificate
```bash
# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 3. Update Nginx untuk HTTPS
Certbot akan otomatis update konfigurasi Nginx untuk HTTPS.

---

## 🔄 Setup Auto-Deploy dengan GitHub Webhook

### 1. Buat Script Deploy
```bash
nano /var/www/e-vote/deploy.sh
```

Isi script:
```bash
#!/bin/bash

# Deploy script untuk e-vote
cd /var/www/e-vote

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install/update dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart e-vote

echo "✅ Deployment completed!"
```

### 2. Make Script Executable
```bash
chmod +x /var/www/e-vote/deploy.sh
```

### 3. Setup GitHub Webhook (Opsional)
Buat webhook endpoint atau gunakan GitHub Actions untuk auto-deploy.

---

## 📊 Monitoring dan Maintenance

### 1. PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs e-vote

# Restart application
pm2 restart e-vote

# Stop application
pm2 stop e-vote

# Delete application
pm2 delete e-vote

# Monitor real-time
pm2 monit
```

### 2. Nginx Commands
```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 3. Database Backup
```bash
# Backup database
cp /var/www/e-vote/prisma/dev.db /var/www/e-vote/backups/backup-$(date +%Y%m%d-%H%M%S).db

# Automated backup script
nano /var/www/e-vote/backup.sh
```

Isi backup script:
```bash
#!/bin/bash
BACKUP_DIR="/var/www/e-vote/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR
cp /var/www/e-vote/prisma/dev.db $BACKUP_DIR/backup-$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup-*.db" -mtime +7 -delete

echo "✅ Backup completed: backup-$DATE.db"
```

### 4. Setup Cron untuk Auto Backup
```bash
crontab -e
```

Tambahkan:
```cron
# Backup database setiap hari jam 2 pagi
0 2 * * * /var/www/e-vote/backup.sh
```

---

## 🔧 Troubleshooting

### 1. Application Won't Start
```bash
# Check logs
pm2 logs e-vote

# Check if port is being used
sudo netstat -tulpn | grep :3000

# Restart PM2
pm2 restart e-vote
```

### 2. Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

### 3. Database Issues
```bash
# Check database file permissions
ls -la /var/www/e-vote/prisma/dev.db

# Reset database (DANGER!)
rm /var/www/e-vote/prisma/dev.db
npx prisma migrate deploy
npm run db:seed
```

### 4. SSL Issues
```bash
# Renew SSL certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 📋 Checklist Deployment

### Pre-deployment
- [ ] VPS prepared with Ubuntu 20.04+
- [ ] Domain name configured (jika menggunakan SSL)
- [ ] Repository pushed to GitHub
- [ ] Environment variables configured

### Deployment Steps
- [ ] Node.js installed
- [ ] Nginx installed and configured
- [ ] PM2 installed globally
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Database migrated and seeded
- [ ] Application built
- [ ] PM2 configured and started
- [ ] Nginx configured as reverse proxy
- [ ] SSL configured (jika ada domain)

### Post-deployment
- [ ] Application accessible via browser
- [ ] Admin login working
- [ ] Voting system functional
- [ ] File upload working
- [ ] Dashboard real-time updates
- [ ] Monitoring setup
- [ ] Backup strategy implemented

---

## 🌐 Akses Aplikasi

Setelah deployment berhasil:

### Dengan Domain + SSL:
- **URL**: https://yourdomain.com
- **Admin**: https://yourdomain.com/admin
- **Committee**: https://yourdomain.com/committee

### Tanpa Domain (IP):
- **URL**: http://your-server-ip
- **Admin**: http://your-server-ip/admin
- **Committee**: http://your-server-ip/committee

### Default Login:
- **Admin**: admin@admin.com / password123
- **Committee**: committee@committee.com / password123

---

## 🆘 Support

Jika ada masalah:
1. Check PM2 logs: `pm2 logs e-vote`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify services: `pm2 status` dan `sudo systemctl status nginx`
4. Check port accessibility: `curl http://localhost:3000`

**Happy Deploying! 🚀**