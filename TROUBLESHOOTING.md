# 🔧 TROUBLESHOOTING GUIDE
## E-Vote SMK Negeri 2 Malinau

---

## ⚠️ Common Issues & Solutions

### 1. ❌ PM2 Cluster Mode Error with Next.js

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Symptoms:**
- Multiple PM2 instances in "errored" state
- High restart count (↺ 9 or 10)
- Port 3000 conflict
- Application not accessible

**Root Cause:**
PM2 cluster mode **incompatible** with Next.js. Next.js already has built-in optimization and handles concurrent requests internally.

**Solution:**
Change PM2 to **fork mode** with **single instance**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'e-vote-production',
    script: 'npm',
    args: 'start',
    instances: 1,              // Single instance only
    exec_mode: 'fork',         // Fork mode, not cluster
    // ... other config
  }]
}
```

**Fix Commands:**
```bash
cd /var/www/e-vote2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

**Verification:**
```bash
pm2 status
# Should show: mode=fork, status=online, ↺=0

curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

---

### 2. ❌ 502 Bad Gateway from Nginx

**Symptoms:**
- Nginx returns 502 Bad Gateway
- Browser shows connection error

**Possible Causes:**
1. Next.js not running on port 3000
2. PM2 application crashed
3. Firewall blocking internal connection

**Diagnostic Steps:**
```bash
# 1. Check PM2 status
pm2 status

# 2. Check if port 3000 is listening
sudo lsof -i :3000
# Should show node process

# 3. Check PM2 logs
pm2 logs --lines 50

# 4. Test direct connection
curl http://localhost:3000
```

**Solutions:**

**A. If PM2 is errored:**
```bash
pm2 restart e-vote-production
pm2 logs
```

**B. If port 3000 not listening:**
```bash
pm2 delete all
pm2 start ecosystem.config.js
```

**C. If build is outdated:**
```bash
npm run build
pm2 restart e-vote-production
```

---

### 3. ❌ Port 80 Already in Use

**Error:**
```
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
```

**Find what's using port 80:**
```bash
sudo lsof -i :80
```

**Common culprits:**
- Apache2
- FrankenPHP
- Another Nginx instance

**Solution:**
```bash
# Stop conflicting service (example with FrankenPHP)
sudo systemctl stop frankenphp
sudo systemctl disable frankenphp

# Or with Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# Then start Nginx
sudo systemctl start nginx
```

---

### 4. ❌ Permission Denied for File Uploads

**Error:**
```
EACCES: permission denied, open '/var/www/e-vote2/public/uploads/...'
```

**Solution:**
```bash
# Fix directory permissions
sudo chown -R www-data:www-data /var/www/e-vote2/public/uploads
sudo chmod 755 /var/www/e-vote2/public/uploads

# Verify
ls -la /var/www/e-vote2/public/
```

---

### 5. ❌ Environment Variables Not Loading

**Symptoms:**
- Database connection errors
- "undefined" in logs for env variables

**Check environment file:**
```bash
cat /var/www/e-vote2/.env.production
# Should contain DATABASE_URL, etc.
```

**Solution:**
```bash
# Make sure .env.production exists
cp .env .env.production

# Restart PM2
pm2 restart e-vote-production
```

---

### 6. ❌ Cannot Access from External IP

**Symptoms:**
- Works on `localhost`
- Fails on `http://172.27.110.18`

**Diagnostic:**
```bash
# Check if Nginx listening on all interfaces
sudo netstat -tlnp | grep :80
# Should show: 0.0.0.0:80 or :::80

# Check firewall
sudo ufw status
```

**Solution:**

**A. Firewall blocking:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # for SSL later
sudo ufw reload
```

**B. Nginx not binding correctly:**
Edit `/etc/nginx/sites-available/evote`:
```nginx
server {
    listen 80;              # IPv4
    listen [::]:80;         # IPv6
    # ...
}
```

Then:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### 7. ❌ PM2 Not Starting on System Reboot

**Problem:**
After server restart, PM2 apps not running

**Solution:**
```bash
# Generate PM2 startup script
pm2 startup

# Copy-paste the command shown and run it with sudo
# Example: sudo env PATH=...

# Save current PM2 list
pm2 save

# Test by rebooting
sudo reboot

# After reboot, verify
pm2 status
```

---

### 8. ❌ Build Errors After Code Changes

**Error during `npm run build`:**

**Common issues:**
1. TypeScript errors
2. ESLint errors
3. Missing dependencies

**Solution:**
```bash
# Check what's wrong
npm run build

# Fix lint errors
npm run lint

# Reinstall dependencies if needed
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

### 9. ❌ Database Connection Errors

**Error:**
```
Error: P1001: Can't reach database server
```

**Check database connectivity:**
```bash
# Test Prisma connection
npx prisma db pull

# Verify DATABASE_URL
grep DATABASE_URL .env.production
```

**Solution:**
- Check if Supabase is accessible
- Verify DATABASE_URL format
- Check firewall/network
- Regenerate Prisma client:
```bash
npx prisma generate
pm2 restart e-vote-production
```

---

### 10. ❌ High Memory Usage

**Symptoms:**
- PM2 shows memory > 500MB
- Server slow or crashing

**Check memory:**
```bash
pm2 status
free -h
```

**Solution:**

**A. Increase max memory restart:**
```javascript
// ecosystem.config.js
max_memory_restart: '1G',  // Increase if needed
```

**B. Optimize Next.js:**
```bash
# Rebuild with optimizations
npm run build

# Clear .next cache
rm -rf .next
npm run build

pm2 restart e-vote-production
```

---

## 🔍 Diagnostic Commands Reference

### Check All Services
```bash
# PM2
pm2 status
pm2 logs --lines 50

# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/evote-error.log

# Ports
sudo lsof -i :80
sudo lsof -i :3000

# Memory & CPU
pm2 monit
htop

# Disk space
df -h
```

### Full Service Restart
```bash
# Complete restart sequence
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
sudo systemctl restart nginx
```

### View Live Logs
```bash
# PM2 application logs
pm2 logs e-vote-production --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/evote-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/evote-error.log

# System logs
sudo journalctl -u nginx -f
```

---

## 📞 Getting Help

### Check Application Health
```bash
# HTTP health check
curl -I http://localhost

# API health check
curl http://localhost/api/status

# PM2 process info
pm2 info e-vote-production
```

### Gather Debug Information
```bash
# System info
uname -a
node --version
npm --version

# PM2 info
pm2 -v
pm2 list

# Nginx info
nginx -v
sudo nginx -t

# Recent errors
pm2 logs --err --lines 50
sudo tail -100 /var/log/nginx/evote-error.log
```

---

## 🎯 Performance Optimization

### Next.js Optimization
```javascript
// next.config.js - already configured
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,  // Fast minification
  compress: true,    // Enable gzip
  poweredByHeader: false,
  // Image optimization
  images: {
    domains: ['your-domain.com'],
  },
}
```

### PM2 Monitoring
```bash
# Enable PM2 monitoring dashboard
pm2 install pm2-server-monit

# View web dashboard
pm2 web
```

### Nginx Cache (Optional)
Add to nginx config for static assets:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Last Updated:** October 17, 2025  
**Maintainer:** E-Vote Development Team
