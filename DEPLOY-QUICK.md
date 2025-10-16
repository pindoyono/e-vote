# 📚 Deployment Quick Start Guide

Panduan singkat untuk deploy sistem e-voting SMK N 2 Malinau.

## 🚀 Quick Deployment Options

### Option 1: Automatic Script (Recommended)
```bash
# Download and run deployment script
wget https://raw.githubusercontent.com/pindoyono/e-vote/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh your-domain.com your-email@domain.com
```

### Option 2: Docker (Advanced)
```bash
# Clone repository
git clone https://github.com/pindoyono/e-vote.git
cd e-vote

# Copy and edit environment
cp .env.example .env.docker
nano .env.docker

# Run with Docker
docker-compose up -d --build
```

### Option 3: Manual (Full Control)
Ikuti langkah lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📋 Prerequisites

### Minimum Server Requirements
- **OS**: Ubuntu 20.04+ 
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB SSD
- **CPU**: 2 vCPU
- **Domain**: Pointing to server IP

### Software Requirements
- Node.js 20+
- Nginx
- SSL Certificate (Let's Encrypt)

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
Check generated passwords in deployment output or:
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

# Renew manually if needed
sudo certbot renew
```

## 🛠️ Troubleshooting

### Application Not Starting
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

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Database Issues
```bash
# Check database file
ls -la /var/www/e-vote-production/prisma/production.db

# Reset database (WARNING: deletes all data)
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
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### Log Monitoring
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs e-vote-production
```

## 📞 Support

- **📖 Full Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **🐳 Docker Guide**: [DOCKER.md](./DOCKER.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/pindoyono/e-vote/issues)
- **📧 Email**: support@smkn2malinau.sch.id

---

**SMK Negeri 2 Malinau - E-Voting System 2024**