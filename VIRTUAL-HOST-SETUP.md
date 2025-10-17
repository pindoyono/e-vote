# 🌐 Virtual Host Setup - e.vote
## E-Vote SMK Negeri 2 Malinau

**Setup Date:** October 17, 2025  
**Domain:** e.vote, www.e.vote

---

## ✅ Virtual Host Configuration

### Domain Names
- **Primary:** `e.vote`
- **Alias:** `www.e.vote`
- **IP:** `172.27.110.18` (local network)

### Nginx Configuration
- **Config File:** `/etc/nginx/sites-available/e.vote`
- **Symlink:** `/etc/nginx/sites-enabled/e.vote`
- **Access Log:** `/var/log/nginx/evote-access.log`
- **Error Log:** `/var/log/nginx/evote-error.log`

### Features Enabled
✅ HTTP/1.1 and HTTP/2 ready  
✅ Reverse proxy to Next.js (port 3000)  
✅ Static file caching (1 year)  
✅ File upload support (max 10MB)  
✅ Security headers configured  
✅ Health check endpoint `/health`

---

## 🔧 Configuration Details

### Server Block
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name e.vote www.e.vote;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        # ... proxy settings
    }
}
```

### Static Assets Optimization
- **Uploads:** `/uploads` → cached for 1 year
- **Next.js static:** `/_next/static` → cached for 1 year
- **Immutable cache** for better performance

### Security Headers
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
```

---

## 🌍 DNS Configuration

### For Local Testing (Already Done)
Entry in `/etc/hosts`:
```
127.0.0.1 e.vote www.e.vote
```

### For Production (If using real domain)

**DNS Records to add:**

#### A Record
```
Type: A
Name: @
Value: 172.27.110.18
TTL: 3600
```

#### A Record (www)
```
Type: A
Name: www
Value: 172.27.110.18
TTL: 3600
```

Or alternatively use CNAME for www:
```
Type: CNAME
Name: www
Value: e.vote
TTL: 3600
```

**Note:** Ganti IP `172.27.110.18` dengan IP public server jika deploy ke internet.

---

## 🚀 Access URLs

### Local Access (Server Only)
- `http://e.vote`
- `http://www.e.vote`

### Network Access (Same LAN)
- `http://172.27.110.18`
- Configure client's hosts file:
  ```
  172.27.110.18 e.vote www.e.vote
  ```

### Panel URLs
- **Admin Login:** `http://e.vote/admin/login`
- **Committee Login:** `http://e.vote/committee/login`
- **Monitoring Dashboard:** `http://e.vote/monitoring`
- **Voting Page:** `http://e.vote/vote/[token]`
- **Health Check:** `http://e.vote/health`

---

## 🔍 Testing & Verification

### Test HTTP Response
```bash
curl -I http://e.vote
# Should return: HTTP/1.1 200 OK

curl -I http://www.e.vote
# Should return: HTTP/1.1 200 OK
```

### Test with Browser
```bash
# For GUI environments
xdg-open http://e.vote
# or
firefox http://e.vote
```

### Check Content
```bash
curl -s http://e.vote | grep -o '<title>.*</title>'
# Should return: <title>E-Vote SMK N 2 Malinau...</title>
```

### Test Health Endpoint
```bash
curl http://e.vote/health
# Should return: healthy
```

### Check Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/evote-access.log

# Error logs
sudo tail -f /var/log/nginx/evote-error.log
```

---

## 🔐 SSL/HTTPS Setup (Optional - Future)

### Using Let's Encrypt (Free SSL)

**Prerequisites:**
- Domain pointing to server IP
- Port 80 and 443 open on firewall
- Certbot installed

**Installation:**
```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d e.vote -d www.e.vote

# Follow the prompts:
# - Enter email address
# - Agree to Terms of Service
# - Choose redirect HTTP to HTTPS (recommended)
```

**Auto-renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
# Certificate auto-renews every 60 days
```

**After SSL setup, access via:**
- `https://e.vote`
- `https://www.e.vote`

---

## 🛠️ Maintenance Commands

### Reload Nginx (after config changes)
```bash
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Apply changes
```

### Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### View Active Virtual Hosts
```bash
ls -la /etc/nginx/sites-enabled/
```

### Disable Virtual Host
```bash
sudo rm /etc/nginx/sites-enabled/e.vote
sudo systemctl reload nginx
```

### Enable Virtual Host
```bash
sudo ln -s /etc/nginx/sites-available/e.vote /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Check Nginx Configuration
```bash
sudo nginx -T | grep server_name
# Should show: e.vote www.e.vote
```

---

## 📊 Performance Monitoring

### Monitor Access Logs
```bash
# Real-time access log
sudo tail -f /var/log/nginx/evote-access.log

# Count requests today
sudo grep "$(date +%d/%b/%Y)" /var/log/nginx/evote-access.log | wc -l

# Most accessed pages
sudo awk '{print $7}' /var/log/nginx/evote-access.log | sort | uniq -c | sort -rn | head -10
```

### Monitor Response Times
```bash
# Check Nginx status (if enabled)
curl http://localhost/nginx_status

# Check application health
curl -w "\nTime: %{time_total}s\n" http://e.vote/health
```

---

## 🔄 Update Configuration

### Edit Config File
```bash
sudo nano /etc/nginx/sites-available/e.vote
```

### Test & Reload
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Backup Config
```bash
sudo cp /etc/nginx/sites-available/e.vote \
        /etc/nginx/sites-available/e.vote.backup.$(date +%Y%m%d)
```

---

## 🚨 Troubleshooting

### 502 Bad Gateway
**Cause:** Next.js not running on port 3000

**Solution:**
```bash
pm2 status
pm2 restart e-vote-production
```

### 404 Not Found
**Cause:** Virtual host not enabled or wrong server_name

**Solution:**
```bash
ls -la /etc/nginx/sites-enabled/e.vote
sudo nginx -T | grep "server_name"
```

### DNS Resolution Failed
**Cause:** Domain not in /etc/hosts or DNS not configured

**Solution (Local):**
```bash
# Check /etc/hosts
cat /etc/hosts | grep e.vote

# Add if missing
echo "127.0.0.1 e.vote www.e.vote" | sudo tee -a /etc/hosts
```

### Cannot Access from Other Computers
**Cause:** Firewall or hosts file not configured on client

**Solution (Client Computer):**

**Windows:**
Edit `C:\Windows\System32\drivers\etc\hosts`:
```
172.27.110.18 e.vote www.e.vote
```

**Linux/Mac:**
Edit `/etc/hosts`:
```
172.27.110.18 e.vote www.e.vote
```

**Firewall (Server):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## 📋 Quick Reference

### Service Status
```bash
sudo systemctl status nginx
pm2 status
```

### Test Domain Resolution
```bash
ping e.vote
nslookup e.vote
dig e.vote
```

### Check Which Process Uses Port 80
```bash
sudo lsof -i :80
sudo netstat -tlnp | grep :80
```

### View All Nginx Virtual Hosts
```bash
sudo nginx -T | grep "server_name"
```

---

## 📝 Files Created/Modified

1. ✅ `/etc/nginx/sites-available/e.vote` - Main config
2. ✅ `/etc/nginx/sites-enabled/e.vote` - Symlink
3. ✅ `/etc/hosts` - DNS entry added
4. ✅ `/var/www/e-vote2/nginx-evote-domain.conf` - Config source

---

## 🎯 Next Steps

### Optional Enhancements:

1. **Setup SSL Certificate** (for HTTPS)
   - Get real domain name
   - Point DNS to server
   - Run certbot

2. **Configure DNS** (if using real domain)
   - Buy domain e.vote
   - Add A records
   - Wait for propagation

3. **Add CDN** (optional)
   - Cloudflare (free tier available)
   - AWS CloudFront
   - Improves global performance

4. **Monitor Uptime**
   - UptimeRobot
   - Pingdom
   - StatusCake

5. **Backup Strategy**
   - Setup automated nginx config backups
   - Monitor log file sizes
   - Implement log rotation

---

## ✅ Verification Checklist

- [x] Nginx config file created
- [x] Config copied to sites-available
- [x] Symlink created in sites-enabled
- [x] Nginx config tested (nginx -t)
- [x] Nginx reloaded
- [x] /etc/hosts updated
- [x] HTTP test successful (curl)
- [x] Domain resolves correctly
- [x] Application accessible via e.vote
- [x] www.e.vote also works

---

**Status:** ✅ **ACTIVE**  
**Last Updated:** October 17, 2025  
**Maintained by:** E-Vote Development Team

**Virtual Host e.vote is now LIVE! 🎉**
