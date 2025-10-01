#!/bin/bash

# FrankenPHP installation script for e-vote
# Run as: ./install-frankenphp.sh

set -e

echo "🚀 FrankenPHP Installation Script for E-Vote"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Get domain configuration
echo ""
read -p "Do you have a domain name? (y/n): " has_domain
if [ "$has_domain" = "y" ]; then
    read -p "Enter your domain name: " DOMAIN_NAME
    read -p "Enter your email for SSL certificate: " SSL_EMAIL
fi

# Download and install FrankenPHP
print_status "Downloading FrankenPHP..."
FRANKENPHP_VERSION=$(curl -s https://api.github.com/repos/dunglas/frankenphp/releases/latest | grep '"tag_name":' | cut -d'"' -f4)
sudo curl -L "https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-linux-x86_64" -o /usr/local/bin/frankenphp
sudo chmod +x /usr/local/bin/frankenphp

print_status "FrankenPHP $FRANKENPHP_VERSION installed successfully"

# Create frankenphp user
print_status "Creating frankenphp user..."
if ! id "frankenphp" &>/dev/null; then
    sudo useradd --system --create-home --shell /bin/bash frankenphp
else
    print_warning "User frankenphp already exists"
fi

# Create directories
print_status "Creating directories..."
sudo mkdir -p /etc/frankenphp
sudo mkdir -p /var/log/frankenphp
sudo mkdir -p /var/lib/frankenphp

# Set permissions
sudo chown frankenphp:frankenphp /var/log/frankenphp
sudo chown frankenphp:frankenphp /var/lib/frankenphp

# Create Caddyfile
print_status "Creating Caddyfile configuration..."
if [ "$has_domain" = "y" ] && [ ! -z "$DOMAIN_NAME" ]; then
    # Domain configuration with SSL
    sudo tee /etc/frankenphp/Caddyfile > /dev/null <<EOF
$DOMAIN_NAME, www.$DOMAIN_NAME {
    tls {
        email $SSL_EMAIL
    }
    
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up Host {host}
    }
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
        -Server
    }
    
    request_body {
        max_size 10MB
    }
    
    encode gzip zstd
    
    log {
        output file /var/log/frankenphp/e-vote-access.log
        format json
    }
}
EOF
    print_status "Domain configuration created for $DOMAIN_NAME"
else
    # IP-based configuration
    sudo tee /etc/frankenphp/Caddyfile > /dev/null <<EOF
:80 {
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up Host {host}
    }
    
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
        -Server
    }
    
    request_body {
        max_size 10MB
    }
    
    encode gzip zstd
    
    log {
        output file /var/log/frankenphp/e-vote-access.log
        format json
    }
}
EOF
    print_status "IP-based configuration created"
fi

# Set Caddyfile permissions
sudo chown frankenphp:frankenphp /etc/frankenphp/Caddyfile
sudo chmod 644 /etc/frankenphp/Caddyfile

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/frankenphp.service > /dev/null <<EOF
[Unit]
Description=FrankenPHP HTTP Server for E-Vote
Documentation=https://frankenphp.dev/
After=network.target

[Service]
Type=notify
ExecStart=/usr/local/bin/frankenphp run --config /etc/frankenphp/Caddyfile
ExecReload=/bin/kill -USR1 \$MAINPID
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
EOF

# Reload systemd and start service
print_status "Starting FrankenPHP service..."
sudo systemctl daemon-reload
sudo systemctl enable frankenphp
sudo systemctl start frankenphp

# Check status
if sudo systemctl is-active --quiet frankenphp; then
    print_status "FrankenPHP service started successfully"
else
    print_error "Failed to start FrankenPHP service"
    sudo systemctl status frankenphp
    exit 1
fi

# Setup firewall if UFW is available
if command -v ufw &> /dev/null; then
    read -p "Setup UFW firewall? (y/n): " setup_firewall
    if [ "$setup_firewall" = "y" ]; then
        print_status "Setting up UFW firewall..."
        sudo ufw allow ssh
        sudo ufw allow 80
        sudo ufw allow 443
        sudo ufw --force enable
    fi
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "🎉 FrankenPHP installation completed successfully!"
echo "=================================================="
echo ""
print_status "FrankenPHP is running and serving your e-vote application"
echo ""
print_status "Access your application at:"
if [ "$has_domain" = "y" ] && [ ! -z "$DOMAIN_NAME" ]; then
    echo "🌐 https://$DOMAIN_NAME (SSL will be auto-configured)"
    echo "🌐 https://www.$DOMAIN_NAME"
else
    echo "🌐 http://$SERVER_IP"
fi
echo ""
print_status "Admin panel:"
if [ "$has_domain" = "y" ] && [ ! -z "$DOMAIN_NAME" ]; then
    echo "👤 https://$DOMAIN_NAME/admin"
else
    echo "👤 http://$SERVER_IP/admin"
fi
echo ""
print_status "Useful commands:"
echo "• Check status: sudo systemctl status frankenphp"
echo "• View logs: sudo journalctl -u frankenphp -f"
echo "• Reload config: sudo systemctl reload frankenphp"
echo "• Restart service: sudo systemctl restart frankenphp"
echo ""
print_warning "Next steps:"
echo "1. Make sure your e-vote app is running on port 3000"
echo "2. Test the application functionality"
if [ "$has_domain" = "y" ]; then
    echo "3. SSL certificate will be automatically obtained on first access"
fi