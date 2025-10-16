# 📚 Panduan Deployment Cepat - VPS Ubuntu

Panduan singkat untuk deploy sistem e-voting SMK N 2 Malinau di VPS Ubuntu dengan Nginx.

## 🚀 Quick Deployment Options

### Option 1: Script Otomatis (Direkomendasikan)
```bash
# Download dan jalankan script deployment
wget https://raw.githubusercontent.com/pindoyono/e-vote/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh your-domain.com your-email@domain.com
```

### Option 2: Manual Step-by-Step
Ikuti langkah lengkap di [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md)

## 📋 Prasyarat VPS

### Spesifikasi Server Minimum
- **OS**: Ubuntu 20.04+ 
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB SSD
- **CPU**: 2 vCPU
- **Domain**: Pointing ke IP server

### Yang Diperlukan
- Node.js 20+
- Nginx
- PM2
- SSL Certificate (Let's Encrypt)
- SQLite3

## ⚡ One-Command Deployment

```bash
curl -fsSL https://raw.githubusercontent.com/pindoyono/e-vote/main/deploy.sh | bash -s your-domain.com admin@your-domain.com
```

## 🔧 Post-Deployment

### 1. Access URLs
- **Main Site**: https://your-domain.com
- **Admin Panel**: https://your-domain.com/admin
- **Committee Panel**: https://your-domain.com/committee

### 2. Default Credentials
Cek password yang di-generate di output deployment atau:
```bash
cat /var/www/e-vote-production/.env.production
```

### 3. Management Commands
```bash
# Update application
sudo /usr/local/bin/update-evote.sh

# Backup system
sudo /usr/local/bin/backup-evote.sh

# Check application status
pm2 status
pm2 logs e-vote-production

# Check web server
sudo systemctl status nginx
sudo nginx -t
```

### 4. SSL Certificate
```bash
# Check certificate status
sudo certbot certificates

# Renew manual jika diperlukan
sudo certbot renew
```

## 🛠️ Troubleshooting Cepat

### Application Tidak Jalan
```bash
# Check PM2 status
pm2 status
pm2 restart e-vote-production

# Check logs
pm2 logs e-vote-production
```

### SSL Issues
```bash
# Check certificate
sudo certbot certificates

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Database Issues
```bash
# Check database file
ls -la /var/www/e-vote-production/prisma/production.db

# Reset database (WARNING: hapus semua data)
cd /var/www/e-vote-production
npx prisma migrate reset
```

## 📊 Monitoring

### Health Check
```bash
# Manual health check
curl -I https://your-domain.com

# View health logs
tail -f /var/log/e-vote-health.log
```

### Server Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
htop
```

## 🔒 Security

### Firewall Status
```bash
sudo ufw status
```

### SSL Configuration
```bash
# Test SSL rating
curl -I https://your-domain.com
```

### Log Monitoring
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/e-vote-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/e-vote-error.log

# Application logs
pm2 logs e-vote-production
```

## 📞 Support

- **📖 Full Documentation**: [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/pindoyono/e-vote/issues)
- **📧 Email**: support@smkn2malinau.sch.id

---

**SMK Negeri 2 Malinau - E-Voting System 2024**