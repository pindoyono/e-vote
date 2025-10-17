#!/bin/bash

# Script Setup Nginx Virtual Host untuk E-Vote SMK N 2 Malinau
# Run dengan: sudo bash setup-nginx.sh

set -e

echo "================================================"
echo "Setup Nginx Virtual Host untuk E-Vote"
echo "SMK NEGERI 2 MALINAU"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Script ini harus dijalankan dengan sudo"
    echo "Jalankan: sudo bash setup-nginx.sh"
    exit 1
fi

# Variables
DOMAIN="evote.smkn2malinau.sch.id"
APP_DIR="/var/www/e-vote2"
NGINX_AVAILABLE="/etc/nginx/sites-available/evote"
NGINX_ENABLED="/etc/nginx/sites-enabled/evote"
NGINX_CONF="${APP_DIR}/nginx-evote.conf"

echo "📋 Konfigurasi:"
echo "   Domain: ${DOMAIN}"
echo "   App Directory: ${APP_DIR}"
echo "   Nginx Config: ${NGINX_AVAILABLE}"
echo ""

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx belum terinstall!"
    echo "Install dengan: sudo apt update && sudo apt install nginx -y"
    exit 1
fi

echo "✅ Nginx terdeteksi"

# Check if config file exists
if [ ! -f "${NGINX_CONF}" ]; then
    echo "❌ File konfigurasi tidak ditemukan: ${NGINX_CONF}"
    exit 1
fi

echo "✅ File konfigurasi ditemukan"

# Backup existing config if exists
if [ -f "${NGINX_AVAILABLE}" ]; then
    echo "📦 Backup konfigurasi lama..."
    cp "${NGINX_AVAILABLE}" "${NGINX_AVAILABLE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup disimpan"
fi

# Copy config to sites-available
echo "📝 Copy konfigurasi ke sites-available..."
cp "${NGINX_CONF}" "${NGINX_AVAILABLE}"
echo "✅ Konfigurasi di-copy"

# Create symlink to sites-enabled
if [ -L "${NGINX_ENABLED}" ]; then
    echo "🔗 Symlink sudah ada, akan di-update..."
    rm "${NGINX_ENABLED}"
fi

echo "🔗 Membuat symlink ke sites-enabled..."
ln -s "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
echo "✅ Symlink dibuat"

# Remove default Nginx config if exists
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️  Menonaktifkan default site..."
    rm "/etc/nginx/sites-enabled/default"
    echo "✅ Default site dinonaktifkan"
fi

# Create uploads directory if not exists
UPLOADS_DIR="${APP_DIR}/public/uploads"
if [ ! -d "${UPLOADS_DIR}" ]; then
    echo "📁 Membuat directory uploads..."
    mkdir -p "${UPLOADS_DIR}"
    chown -R $SUDO_USER:$SUDO_USER "${UPLOADS_DIR}"
    chmod 755 "${UPLOADS_DIR}"
    echo "✅ Directory uploads dibuat"
else
    echo "✅ Directory uploads sudah ada"
fi

# Test Nginx configuration
echo ""
echo "🧪 Testing konfigurasi Nginx..."
if nginx -t; then
    echo "✅ Konfigurasi Nginx valid!"
else
    echo "❌ Konfigurasi Nginx tidak valid!"
    echo "Periksa error di atas dan perbaiki."
    exit 1
fi

# Restart Nginx
echo ""
echo "🔄 Restart Nginx..."
systemctl restart nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx berhasil di-restart"
else
    echo "❌ Gagal restart Nginx!"
    systemctl status nginx
    exit 1
fi

# Enable Nginx on boot
echo "⚙️  Enable Nginx on boot..."
systemctl enable nginx
echo "✅ Nginx akan auto-start saat boot"

echo ""
echo "================================================"
echo "✅ SETUP NGINX VIRTUAL HOST SELESAI!"
echo "================================================"
echo ""
echo "📊 Status Aplikasi:"
echo "   - Nginx: $(systemctl is-active nginx)"
echo "   - PM2 App: $(pm2 describe e-vote-production > /dev/null 2>&1 && echo 'Running' || echo 'Stopped')"
echo ""
echo "🌐 Akses aplikasi di:"
echo "   - HTTP:  http://${DOMAIN}"
echo "   - HTTPS: https://${DOMAIN} (jika SSL sudah di-setup)"
echo "   - Local: http://localhost atau http://127.0.0.1"
echo ""
echo "📝 Catatan:"
echo "   1. Pastikan domain ${DOMAIN} sudah di-pointing ke IP server ini"
echo "   2. Untuk HTTP saja (tanpa SSL), edit /etc/nginx/sites-available/evote"
echo "      dan uncomment bagian 'HTTP Only Server Block'"
echo "   3. Untuk setup SSL dengan Let's Encrypt, jalankan:"
echo "      sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "📖 Log Files:"
echo "   - Access: /var/log/nginx/evote-access.log"
echo "   - Error:  /var/log/nginx/evote-error.log"
echo ""
echo "🔧 Perintah berguna:"
echo "   - Test config:    sudo nginx -t"
echo "   - Reload Nginx:   sudo systemctl reload nginx"
echo "   - Restart Nginx:  sudo systemctl restart nginx"
echo "   - Status Nginx:   sudo systemctl status nginx"
echo "   - View logs:      sudo tail -f /var/log/nginx/evote-error.log"
echo ""
