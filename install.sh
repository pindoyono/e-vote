#!/bin/bash

# Auto-install script untuk e-vote production setup
# Run as: curl -sSL https://raw.githubusercontent.com/username/e-vote/main/install.sh | bash

set -e

echo "🚀 E-Vote Production Setup Script"
echo "================================="

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

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_warning "Node.js is already installed"
fi

# Choose web server
echo ""
echo "Choose your web server:"
echo "1) Nginx (Traditional & Stable)"
echo "2) FrankenPHP (Modern & Auto-SSL)"
read -p "Enter your choice (1 or 2): " SERVER_CHOICE

if [ "$SERVER_CHOICE" = "1" ]; then
    # Install Nginx
    print_status "Installing Nginx..."
    if ! command -v nginx &> /dev/null; then
        sudo apt install nginx -y
        sudo systemctl start nginx
        sudo systemctl enable nginx
    else
        print_warning "Nginx is already installed"
    fi
    WEB_SERVER="nginx"
elif [ "$SERVER_CHOICE" = "2" ]; then
    # Install FrankenPHP
    print_status "Installing FrankenPHP..."
    if ! command -v frankenphp &> /dev/null; then
        FRANKENPHP_VERSION=$(curl -s https://api.github.com/repos/dunglas/frankenphp/releases/latest | grep '"tag_name":' | cut -d'"' -f4)
        sudo curl -L "https://github.com/dunglas/frankenphp/releases/latest/download/frankenphp-linux-x86_64" -o /usr/local/bin/frankenphp
        sudo chmod +x /usr/local/bin/frankenphp
        
        # Create frankenphp user
        if ! id "frankenphp" &>/dev/null; then
            sudo useradd --system --create-home --shell /bin/bash frankenphp
        fi
        
        # Create directories
        sudo mkdir -p /etc/frankenphp
        sudo mkdir -p /var/log/frankenphp
        sudo mkdir -p /var/lib/frankenphp
        sudo chown frankenphp:frankenphp /var/log/frankenphp
        sudo chown frankenphp:frankenphp /var/lib/frankenphp
    else
        print_warning "FrankenPHP is already installed"
    fi
    WEB_SERVER="frankenphp"
else
    print_error "Invalid choice. Please run the script again."
    exit 1
fi

# Install PM2
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    print_warning "PM2 is already installed"
fi

# Install Git
print_status "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
else
    print_warning "Git is already installed"
fi

# Get repository URL from user
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/e-vote.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_error "Repository URL is required"
    exit 1
fi

# Clone repository
print_status "Cloning repository..."
sudo mkdir -p /var/www
cd /var/www

if [ -d "e-vote" ]; then
    print_warning "Directory e-vote already exists. Removing..."
    sudo rm -rf e-vote
fi

sudo git clone $REPO_URL e-vote
sudo chown -R $USER:$USER /var/www/e-vote
cd e-vote

# Install dependencies
print_status "Installing project dependencies..."
npm install

# Setup environment
print_status "Setting up environment..."
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    print_warning "Please edit .env.production file with your configuration"
fi

# Setup database
print_status "Setting up database..."
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# Build application
print_status "Building application..."
npm run build

# Make scripts executable
chmod +x deploy.sh
chmod +x backup.sh

# Create logs directory
mkdir -p logs
mkdir -p backups

# Start with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup web server based on choice
if [ "$WEB_SERVER" = "nginx" ]; then
    print_status "Setting up Nginx..."
    sudo cp nginx/e-vote-basic.conf /etc/nginx/sites-available/e-vote

    # Remove default site
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        sudo rm /etc/nginx/sites-enabled/default
    fi

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/e-vote /etc/nginx/sites-enabled/

    # Test Nginx configuration
    if sudo nginx -t; then
        sudo systemctl restart nginx
        print_status "Nginx configured successfully"
    else
        print_error "Nginx configuration failed"
        exit 1
    fi
elif [ "$WEB_SERVER" = "frankenphp" ]; then
    print_status "Setting up FrankenPHP..."
    
    # Setup Caddyfile based on domain
    read -p "Do you have a domain name for SSL? (y/n): " has_domain_fp
    if [ "$has_domain_fp" = "y" ]; then
        read -p "Enter your domain name: " DOMAIN_NAME_FP
        read -p "Enter your email for SSL: " SSL_EMAIL_FP
        sudo cp frankenphp/e-vote-ssl.conf /etc/frankenphp/Caddyfile
        sudo sed -i "s/yourdomain.com/$DOMAIN_NAME_FP/g" /etc/frankenphp/Caddyfile
        sudo sed -i "s/your-email@example.com/$SSL_EMAIL_FP/g" /etc/frankenphp/Caddyfile
    else
        sudo cp frankenphp/e-vote-basic.conf /etc/frankenphp/Caddyfile
    fi
    
    # Set permissions
    sudo chown frankenphp:frankenphp /etc/frankenphp/Caddyfile
    sudo chmod 644 /etc/frankenphp/Caddyfile
    
    # Create systemd service
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
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/log/frankenphp /var/lib/frankenphp
Environment=HOME=/home/frankenphp

[Install]
WantedBy=multi-user.target
EOF
    
    # Start FrankenPHP service
    sudo systemctl daemon-reload
    sudo systemctl enable frankenphp
    sudo systemctl start frankenphp
    
    if sudo systemctl is-active --quiet frankenphp; then
        print_status "FrankenPHP configured successfully"
    else
        print_error "FrankenPHP configuration failed"
        sudo systemctl status frankenphp
        exit 1
    fi
fi

# Setup UFW firewall (optional)
read -p "Do you want to setup UFW firewall? (y/n): " setup_firewall
if [ "$setup_firewall" = "y" ]; then
    print_status "Setting up UFW firewall..."
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
fi

# Setup SSL (if domain provided and using Nginx)
if [ "$WEB_SERVER" = "nginx" ]; then
    read -p "Do you have a domain name for SSL setup? (y/n): " has_domain
    if [ "$has_domain" = "y" ]; then
        read -p "Enter your domain name: " DOMAIN_NAME
        
        if [ ! -z "$DOMAIN_NAME" ]; then
            print_status "Setting up SSL with Let's Encrypt..."
            
            # Install Certbot
            sudo apt install snapd -y
            sudo snap install --classic certbot
            sudo ln -sf /snap/bin/certbot /usr/bin/certbot
            
            # Get SSL certificate
            sudo certbot --nginx -d $DOMAIN_NAME
            
            print_status "SSL setup completed"
        fi
    fi
fi

# Final status check
print_status "Checking application status..."
pm2 status

if [ "$WEB_SERVER" = "frankenphp" ]; then
    print_status "Checking FrankenPHP status..."
    sudo systemctl status frankenphp --no-pager
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "🎉 Installation completed successfully!"
echo "======================================"
echo ""
print_status "Application is running at:"
if [ "$WEB_SERVER" = "frankenphp" ] && [ "$has_domain_fp" = "y" ] && [ ! -z "$DOMAIN_NAME_FP" ]; then
    echo "🌐 https://$DOMAIN_NAME_FP (SSL auto-configured)"
    echo "🌐 https://www.$DOMAIN_NAME_FP"
elif [ "$WEB_SERVER" = "nginx" ] && [ "$has_domain" = "y" ] && [ ! -z "$DOMAIN_NAME" ]; then
    echo "🌐 https://$DOMAIN_NAME"
else
    echo "🌐 http://$SERVER_IP"
fi
echo ""
print_status "Admin panel:"
if [ "$WEB_SERVER" = "frankenphp" ] && [ "$has_domain_fp" = "y" ] && [ ! -z "$DOMAIN_NAME_FP" ]; then
    echo "👤 https://$DOMAIN_NAME_FP/admin"
elif [ "$WEB_SERVER" = "nginx" ] && [ "$has_domain" = "y" ] && [ ! -z "$DOMAIN_NAME" ]; then
    echo "👤 https://$DOMAIN_NAME/admin"
else
    echo "👤 http://$SERVER_IP/admin"
fi
echo ""
print_status "Default login credentials:"
echo "📧 Email: admin@admin.com"
echo "🔑 Password: password123"
echo ""
print_warning "Don't forget to:"
echo "1. Edit /var/www/e-vote/.env.production"
echo "2. Change default admin password"
echo "3. Setup database backups with cron"
echo ""
print_status "Useful commands:"
echo "• Check app status: pm2 status"
echo "• View app logs: pm2 logs e-vote"
echo "• Deploy updates: cd /var/www/e-vote && ./deploy.sh"
echo "• Backup database: cd /var/www/e-vote && ./backup.sh"
if [ "$WEB_SERVER" = "nginx" ]; then
    echo "• Check Nginx: sudo systemctl status nginx"
    echo "• Nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo "• Reload Nginx: sudo systemctl reload nginx"
elif [ "$WEB_SERVER" = "frankenphp" ]; then
    echo "• Check FrankenPHP: sudo systemctl status frankenphp"
    echo "• FrankenPHP logs: sudo journalctl -u frankenphp -f"
    echo "• Reload config: sudo systemctl reload frankenphp"
fi