# 🎉 APLIKASI E-VOTE SUDAH BERJALAN!
## SMK Negeri 2 Malinau - Pemilihan Ketua OSIS 2025

**Status:** ✅ **ONLINE & READY**  
**Tanggal:** 17 Oktober 2025  
**Waktu:** Running sejak 09:25 WIB

---

## 📊 Status Aplikasi

### Services Running
| Service | Status | Details |
|---------|--------|---------|
| **PM2** | 🟢 Online | 1 instance, fork mode |
| **Next.js** | 🟢 Ready | Port 3000, ~64MB memory |
| **Nginx** | 🟢 Running | Port 80, reverse proxy |
| **Virtual Host** | 🟢 Active | e.vote configured |
| **Database** | 🟢 Connected | PostgreSQL (Supabase) |

### Performance Metrics
- **Memory Usage:** 63.6 MB
- **CPU Usage:** 0%
- **Restart Count:** 0 (stable)
- **Uptime:** Running continuously
- **Response Time:** < 100ms

---

## 🌐 CARA AKSES APLIKASI

### 1️⃣ Via Domain (Recommended)
```
http://e.vote
http://www.e.vote
```

### 2️⃣ Via IP Address
```
http://172.27.110.18
http://localhost
```

### 3️⃣ Direct Port (Development)
```
http://localhost:3000
```

---

## 🔐 Panel Login

### Administrator
**URL:** http://e.vote/admin/login  
**Akses:** Kelola kandidat, pemilih, dan hasil pemilihan

### Panitia/Committee
**URL:** http://e.vote/committee/login  
**Akses:** Verifikasi pemilih dan monitoring

### Monitoring Real-time
**URL:** http://e.vote/monitoring  
**Akses:** Dashboard hasil pemilihan real-time

---

## 🗳️ Halaman Voting

### Pemilih/Voter
**URL:** http://e.vote/vote/[TOKEN]  
**Akses:** Halaman voting dengan token unik

**Contoh:**
- http://e.vote/vote/abc123def456
- Token diberikan oleh admin/panitia

---

## 🖥️ AKSES DARI KOMPUTER LAIN

### Windows
1. **Buka Notepad as Administrator**
2. **File → Open:** `C:\Windows\System32\drivers\etc\hosts`
3. **Tambahkan baris:**
   ```
   172.27.110.18 e.vote www.e.vote
   ```
4. **Save & Close**
5. **Buka browser:** http://e.vote

### Linux/Mac
```bash
sudo nano /etc/hosts

# Tambahkan baris:
172.27.110.18 e.vote www.e.vote

# Save: Ctrl+O, Exit: Ctrl+X
```

### Android/iOS
- Install app: **Hosts Editor** atau **Virtual Hosts**
- Tambahkan: `172.27.110.18 e.vote`
- Buka browser: http://e.vote

---

## ✅ Fitur yang Tersedia

### Admin Features
- ✅ Kelola Kandidat (CRUD)
- ✅ Upload Foto Kandidat
- ✅ Kelola Data Pemilih (CRUD)
- ✅ Import Pemilih dari Excel
- ✅ Generate Token Voting
- ✅ Lihat Hasil Real-time
- ✅ Export Hasil

### Committee Features
- ✅ Verifikasi Pemilih
- ✅ Approve/Reject Token
- ✅ Monitoring Aktivitas
- ✅ Lihat Status Voting

### Voter Features
- ✅ Login dengan Token
- ✅ Lihat Profil Kandidat
- ✅ Cast Vote (pilih kandidat)
- ✅ Konfirmasi Pilihan
- ✅ Lihat Status "Sudah Memilih"

### Monitoring Features
- ✅ Dashboard Real-time
- ✅ Chart Perolehan Suara
- ✅ Jumlah Total Suara
- ✅ Persentase Partisipasi
- ✅ Auto-refresh data

---

## 🚀 Quick Start Guide

### Untuk Administrator

1. **Buka browser:** http://e.vote/admin/login
2. **Login** dengan kredensial admin
3. **Tambah Kandidat:**
   - Menu: Kandidat → Tambah Kandidat
   - Isi nama, visi, misi
   - Upload foto kandidat
4. **Tambah Pemilih:**
   - Menu: Pemilih → Tambah Pemilih
   - Atau Import dari Excel
5. **Generate Token:**
   - Klik "Generate Token" untuk setiap pemilih
   - Bagikan token ke pemilih

### Untuk Pemilih

1. **Terima Token** dari admin/panitia
2. **Buka:** http://e.vote/vote/[TOKEN-ANDA]
3. **Lihat profil kandidat:**
   - Foto
   - Nama
   - Visi & Misi
4. **Klik "PILIH"** pada kandidat pilihan
5. **Konfirmasi** pilihan Anda
6. **Selesai!** Anda sudah memilih

### Untuk Monitoring

1. **Buka:** http://e.vote/monitoring
2. **Lihat dashboard:**
   - Bar chart perolehan suara
   - Pie chart persentase
   - Total suara masuk
   - Refresh otomatis

---

## 🛠️ Management Commands

### PM2 Process Management
```bash
# Check status
pm2 status

# View logs
pm2 logs e-vote-production

# Restart application
pm2 restart e-vote-production

# Stop application
pm2 stop e-vote-production

# Start application
pm2 start e-vote-production

# Monitor resources
pm2 monit
```

### Nginx Web Server
```bash
# Check status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Reload config
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/evote-access.log
sudo tail -f /var/log/nginx/evote-error.log
```

### Application Logs
```bash
# PM2 logs
pm2 logs --lines 100

# Nginx access log
sudo tail -100 /var/log/nginx/evote-access.log

# Nginx error log
sudo tail -100 /var/log/nginx/evote-error.log

# Follow logs real-time
pm2 logs --lines 0
```

---

## 🔍 Health Check

### Automated Health Check
```bash
curl http://e.vote/health
# Expected: healthy
```

### Manual Testing
```bash
# Test home page
curl -I http://e.vote
# Expected: HTTP/1.1 200 OK

# Test admin login
curl -I http://e.vote/admin/login
# Expected: HTTP/1.1 200 OK

# Test monitoring
curl -I http://e.vote/monitoring
# Expected: HTTP/1.1 200 OK
```

---

## 📱 Akses via Mobile

### Smartphone di Jaringan yang Sama

1. **Pastikan smartphone terhubung ke WiFi yang sama**
2. **Buka browser (Chrome/Safari)**
3. **Ketik:** http://172.27.110.18
4. **Atau gunakan domain** (setelah edit hosts file)

### Tips untuk Mobile
- Gunakan mode landscape untuk tampilan lebih baik
- Interface sudah responsive
- Touch-friendly buttons
- Optimized untuk layar kecil

---

## 🔐 Security Features

### Implemented Security
✅ Token-based voting authentication  
✅ One vote per token restriction  
✅ Admin/Committee role-based access  
✅ Password hashing (bcrypt)  
✅ SQL injection prevention (Prisma ORM)  
✅ XSS protection headers  
✅ CSRF protection (Next.js built-in)  
✅ Secure file upload validation  

### Security Headers Active
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
```

---

## 📞 Troubleshooting

### "Situs tidak dapat diakses"
**Solusi:**
1. Cek PM2: `pm2 status`
2. Cek Nginx: `sudo systemctl status nginx`
3. Cek koneksi: `curl http://localhost:3000`

### "502 Bad Gateway"
**Solusi:**
```bash
pm2 restart e-vote-production
```

### Token voting tidak berfungsi
**Solusi:**
1. Pastikan token valid (generate dari admin)
2. Cek token belum digunakan
3. Periksa database connection

### Cannot access from another computer
**Solusi:**
1. Edit hosts file di komputer client
2. Check firewall: `sudo ufw status`
3. Verify IP address: `ip addr show`

---

## 📚 Dokumentasi Lengkap

- **`DEPLOY-SUCCESS.md`** - Status deployment
- **`VIRTUAL-HOST-COMPLETE.md`** - Setup virtual host
- **`TROUBLESHOOTING.md`** - Panduan troubleshooting
- **`NGINX-SETUP.md`** - Konfigurasi Nginx
- **`VPS-DEPLOYMENT.md`** - Deployment guide

---

## 🎯 System Requirements

### Server (Already Met)
- ✅ Node.js 18+ (installed)
- ✅ npm/yarn (installed)
- ✅ PM2 (installed & configured)
- ✅ Nginx (installed & running)
- ✅ PostgreSQL (Supabase connected)

### Client (Browser)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Network
- LAN/WiFi connection
- Port 80 accessible
- Port 3000 internal

---

## 📊 Current Statistics

```
Application: E-Vote Production
Status: ONLINE ✅
Uptime: Running
Memory: 63.6 MB / 1 GB limit
CPU: 0% (idle)
Restarts: 0 (stable)
Mode: Fork (optimized for Next.js)
Port: 3000 (internal)
Public Port: 80 (via Nginx)
```

---

## 🎉 APLIKASI SIAP DIGUNAKAN!

### Langkah Selanjutnya:

1. ✅ **Buka di browser:** http://e.vote
2. ✅ **Login sebagai admin**
3. ✅ **Tambahkan kandidat dan pemilih**
4. ✅ **Generate token voting**
5. ✅ **Bagikan token ke pemilih**
6. ✅ **Monitor hasil real-time**

---

### 🌐 URL Utama:
```
🏠 Home:       http://e.vote
👤 Admin:      http://e.vote/admin/login
👥 Committee:  http://e.vote/committee/login
📊 Monitoring: http://e.vote/monitoring
💚 Health:     http://e.vote/health
```

---

**🗳️ Selamat menggunakan aplikasi E-Vote!**  
**Pemilihan Ketua OSIS 2025 - SMK Negeri 2 Malinau**

---

*Last Updated: October 17, 2025*  
*Maintained by: E-Vote Development Team*  
*Status: Production Ready ✅*
