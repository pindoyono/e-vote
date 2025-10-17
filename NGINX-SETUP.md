# Panduan Setup Nginx Virtual Host
## E-Vote SMK Negeri 2 Malinau

### Metode 1: Setup Otomatis (Recommended)

Jalankan script setup otomatis:

```bash
cd /var/www/e-vote2
sudo bash setup-nginx.sh
```

Script ini akan:
- ✅ Copy konfigurasi Nginx ke sites-available
- ✅ Membuat symlink ke sites-enabled
- ✅ Menonaktifkan default site
- ✅ Membuat directory uploads
- ✅ Test konfigurasi Nginx
- ✅ Restart Nginx service

---

### Metode 2: Setup Manual

#### 1. Copy Konfigurasi Nginx

```bash
sudo cp /var/www/e-vote2/nginx-evote.conf /etc/nginx/sites-available/evote
```

#### 2. Buat Symlink ke sites-enabled

```bash
sudo ln -s /etc/nginx/sites-available/evote /etc/nginx/sites-enabled/evote
```

#### 3. Nonaktifkan Default Site (opsional)

```bash
sudo rm /etc/nginx/sites-enabled/default
```

#### 4. Buat Directory Uploads

```bash
mkdir -p /var/www/e-vote2/public/uploads
chmod 755 /var/www/e-vote2/public/uploads
```

#### 5. Test Konfigurasi Nginx

```bash
sudo nginx -t
```

#### 6. Restart Nginx

```bash
sudo systemctl restart nginx
```

---

## Konfigurasi Tambahan

### A. Jika Menggunakan HTTP Saja (Tanpa SSL)

Edit file `/etc/nginx/sites-available/evote`:

1. Comment/hapus bagian `server` block untuk HTTPS (port 443)
2. Uncomment bagian `HTTP Only Server Block`

```bash
sudo nano /etc/nginx/sites-available/evote
```

Kemudian reload Nginx:

```bash
sudo systemctl reload nginx
```

### B. Setup SSL dengan Let's Encrypt

#### Install Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

#### Dapatkan SSL Certificate

```bash
sudo certbot --nginx -d evote.smkn2malinau.sch.id -d www.evote.smkn2malinau.sch.id
```

Ikuti instruksi interaktif untuk:
- Masukkan email untuk notifikasi
- Setuju dengan Terms of Service
- Pilih apakah redirect HTTP ke HTTPS (recommended: yes)

#### Auto-Renewal Certificate

Certbot sudah setup auto-renewal. Test dengan:

```bash
sudo certbot renew --dry-run
```

---

## Setup Domain

### Jika Menggunakan Domain Sendiri

Update DNS record di registrar domain Anda:

```
Type: A
Name: evote.smkn2malinau.sch.id
Value: [IP_SERVER_ANDA]
TTL: 3600
```

```
Type: A
Name: www.evote.smkn2malinau.sch.id
Value: [IP_SERVER_ANDA]
TTL: 3600
```

### Jika Menggunakan IP Langsung

Edit file `/etc/nginx/sites-available/evote`:

Ganti:
```nginx
server_name evote.smkn2malinau.sch.id www.evote.smkn2malinau.sch.id;
```

Dengan IP server Anda:
```nginx
server_name 172.27.110.18 localhost;
```

Kemudian reload:
```bash
sudo systemctl reload nginx
```

---

## Testing

### 1. Test dari Server (Local)

```bash
curl -I http://localhost
curl -I http://127.0.0.1
```

### 2. Test dari Browser

Buka browser dan akses:
- `http://localhost` (dari server)
- `http://[IP_SERVER]` (dari komputer lain)
- `http://evote.smkn2malinau.sch.id` (jika domain sudah di-setup)

### 3. Check Status Services

```bash
# Status Nginx
sudo systemctl status nginx

# Status PM2
pm2 status

# Check port 3000 (Next.js)
sudo netstat -tulpn | grep :3000

# Check port 80 & 443 (Nginx)
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## Troubleshooting

### Error: "Address already in use"

Ada service lain menggunakan port 80/443:

```bash
# Check process di port 80
sudo lsof -i :80

# Stop Apache jika terinstall
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Error: "Permission denied" untuk uploads

```bash
sudo chown -R www-data:www-data /var/www/e-vote2/public/uploads
sudo chmod 755 /var/www/e-vote2/public/uploads
```

### Error: "502 Bad Gateway"

Next.js tidak berjalan:

```bash
# Check PM2 status
pm2 status

# Restart PM2
pm2 restart e-vote-production

# Check logs
pm2 logs e-vote-production
```

### Error: "nginx: [emerg] could not build server_names_hash"

Terlalu banyak server name, tingkatkan hash size:

Edit `/etc/nginx/nginx.conf`:

```nginx
http {
    ...
    server_names_hash_bucket_size 64;
    ...
}
```

---

## Monitoring

### View Real-time Logs

```bash
# Nginx access log
sudo tail -f /var/log/nginx/evote-access.log

# Nginx error log
sudo tail -f /var/log/nginx/evote-error.log

# PM2 logs
pm2 logs e-vote-production

# System logs
sudo journalctl -u nginx -f
```

### Check Resource Usage

```bash
# Nginx processes
ps aux | grep nginx

# PM2 monitoring
pm2 monit

# Disk usage
df -h

# Memory usage
free -h
```

---

## Security Checklist

- ✅ Firewall aktif dan hanya allow port yang diperlukan
- ✅ SSL/HTTPS enabled dengan certificate valid
- ✅ Security headers configured (X-Frame-Options, CSP, dll)
- ✅ Rate limiting untuk mencegah brute force
- ✅ Regular backup database dan files
- ✅ Update system dan packages secara berkala
- ✅ Strong password untuk database dan admin
- ✅ File permissions yang tepat (755 untuk directories, 644 untuk files)

---

## Perintah Berguna

```bash
# Restart semua services
sudo systemctl restart nginx
pm2 restart e-vote-production

# Reload Nginx tanpa downtime
sudo systemctl reload nginx

# Test konfigurasi Nginx
sudo nginx -t

# View Nginx version dan modules
nginx -V

# Check open ports
sudo netstat -tulpn

# Monitor PM2 apps
pm2 monit

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

---

## Dokumentasi Terkait

- [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md) - Panduan deploy lengkap di VPS
- [DEPLOY-QUICK.md](./DEPLOY-QUICK.md) - Quick start deployment
- [README.md](./README.md) - Dokumentasi aplikasi
- [ecosystem.config.js](./ecosystem.config.js) - Konfigurasi PM2

---

## Support

Jika ada masalah, check:
1. Nginx error logs: `/var/log/nginx/evote-error.log`
2. PM2 logs: `pm2 logs e-vote-production`
3. System logs: `sudo journalctl -xe`

Atau hubungi tim IT SMK Negeri 2 Malinau.
