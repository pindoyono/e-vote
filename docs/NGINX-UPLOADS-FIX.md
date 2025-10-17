# Fix Upload Foto Kandidat - Nginx Direct Serve

## 📋 Masalah
Setelah deploy aplikasi, foto kandidat yang diupload tidak langsung ter-load. Perlu restart server PM2 dulu baru foto bisa terlihat.

## 🔍 Penyebab
- Next.js melakukan static file caching untuk folder `public/`
- Foto yang baru diupload ke `/public/uploads/` tidak terdeteksi tanpa rebuild/restart
- Static optimization Next.js tidak cocok untuk dynamic uploaded files

## ✅ Solusi: Nginx Direct Serve

Konfigurasi Nginx untuk serve folder `/uploads/` secara langsung, bypass Next.js completely.

### Konfigurasi `/etc/nginx/sites-available/e.vote`

```nginx
# Uploads directory - NO CACHE for fresh images
location /uploads/ {
    alias /var/www/e-vote2/public/uploads/;
    
    # Disable all caching - always serve fresh
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma "no-cache";
    add_header Expires "0";
    
    # CORS for cross-origin requests
    add_header Access-Control-Allow-Origin "*";
    
    # Try file, if not found return 404
    try_files $uri =404;
}
```

### Cara Apply

```bash
# Backup konfigurasi lama
sudo cp /etc/nginx/sites-available/e.vote /etc/nginx/sites-available/e.vote.backup

# Edit konfigurasi (sudah diupdate)
sudo nano /etc/nginx/sites-available/e.vote

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Verifikasi

```bash
# Test akses file upload
curl -I http://localhost/uploads/filename.jpeg

# Check headers - harus ada:
# Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
# Pragma: no-cache
# Expires: 0
```

## 🎯 Hasil

✅ **Upload foto kandidat langsung terlihat** tanpa restart server
✅ **Performance lebih baik** - Nginx serve file statis lebih cepat dari Node.js
✅ **No-cache headers** - Browser selalu load foto terbaru
✅ **Scalable** - Nginx handle banyak request gambar tanpa overload Node.js

## 📊 Before vs After

### Before (Next.js serve uploads)
- ❌ Foto baru tidak terlihat
- ❌ Perlu restart PM2
- ⚠️ Static file caching
- ⚠️ Node.js handle semua requests

### After (Nginx direct serve)
- ✅ Foto baru langsung terlihat
- ✅ No restart needed
- ✅ No caching
- ✅ Nginx handle uploads, Node.js handle dynamic routes

## 🔧 Maintenance

Folder uploads sudah dikonfigurasi untuk:
- **No cache** - Selalu fresh
- **Direct serve** - Bypass Next.js
- **CORS enabled** - Support cross-origin
- **404 handling** - File not found error proper

**Tidak perlu restart lagi saat upload foto!** 🎉

---

**Tanggal**: 18 Oktober 2025  
**Status**: ✅ Implemented & Tested  
**Performance**: 🚀 Excellent
