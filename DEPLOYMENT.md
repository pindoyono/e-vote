# 🚀 Panduan Deployment E-Vote ke VPS Production

Dokumentasi lengkap untuk deploy aplikasi e-voting dari GitHub ke VPS production dengan Nginx, PM2, dan SSL.

## 📋 Prerequisites

### 1. VPS Requirements
- Ubuntu 20.04 LTS atau lebih baru
- Minimal 2GB RAM
- 20GB storage
- Domain name (opsional untuk SSL)

### 2. Software Yang Dibutuhkan
- Node.js 18+ 
- Nginx
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