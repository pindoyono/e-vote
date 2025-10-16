# Docker Deployment for E-Voting System

Alternatif deployment menggunakan Docker dan Docker Compose dengan Nginx.

## 🐳 Docker Deployment

### Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
```

### 1. Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose Configuration
```yaml
version: '3.8'

services:
  # Application
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: evote-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/production.db
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=your-super-secure-secret-key
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=secure_admin_password
      - COMMITTEE_USERNAME=committee
      - COMMITTEE_PASSWORD=secure_committee_password
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    networks:
      - evote-network
    depends_on:
      - db

  # Database (PostgreSQL option)
  db:
    image: postgres:15-alpine
    container_name: evote-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: evote_production
      POSTGRES_USER: evote_user
      POSTGRES_PASSWORD: secure_db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - evote-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: evote-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./uploads:/var/www/uploads:ro
    networks:
      - evote-network
    depends_on:
      - app

  # Redis for session storage (optional)
  redis:
    image: redis:7-alpine
    container_name: evote-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - evote-network

volumes:
  postgres_data:
  redis_data:

networks:
  evote-network:
    driver: bridge
```

### 3. Nginx Configuration for Docker
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream
    upstream app {
        server app:3000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # Modern configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        client_max_body_size 10M;

        # Static files
        location /_next/static/ {
            proxy_pass http://app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Uploads
        location /uploads/ {
            alias /var/www/uploads/;
            expires 1y;
            add_header Cache-Control "public";
        }

        # API routes with rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Security
        location ~ /\. {
            deny all;
        }
        
        location ~ \.(env|log)$ {
            deny all;
        }
    }
}
```

### 4. Docker Environment File
```env
# .env.docker
NODE_ENV=production
DATABASE_URL=postgresql://evote_user:secure_db_password@db:5432/evote_production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-secret-key-min-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_admin_password_2024
COMMITTEE_USERNAME=committee
COMMITTEE_PASSWORD=secure_committee_password_2024
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880
```

### 5. Deployment Commands

#### Initial Setup
```bash
# Clone repository
git clone https://github.com/pindoyono/e-vote.git
cd e-vote

# Copy environment file
cp .env.example .env.docker

# Edit environment variables
nano .env.docker

# Create necessary directories
mkdir -p data uploads ssl

# Build and start services
docker-compose up -d --build

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Check status
docker-compose ps
docker-compose logs -f
```

#### SSL Setup with Let's Encrypt
```bash
# Stop nginx temporarily
docker-compose stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Start nginx again
docker-compose start nginx
```

#### Management Commands
```bash
# View logs
docker-compose logs -f app
docker-compose logs -f nginx

# Restart services
docker-compose restart app
docker-compose restart nginx

# Update application
git pull origin main
docker-compose build app
docker-compose up -d app

# Backup database
docker-compose exec db pg_dump -U evote_user evote_production > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T db psql -U evote_user evote_production < backup.sql
```

### 6. Production Docker Compose with Monitoring
```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: evote-app
    restart: unless-stopped
    env_file: .env.docker
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    networks:
      - evote-network
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    container_name: evote-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: evote_production
      POSTGRES_USER: evote_user
      POSTGRES_PASSWORD: secure_db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - evote-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evote_user -d evote_production"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: evote-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - evote-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: evote-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./uploads:/var/www/uploads:ro
    networks:
      - evote-network
    depends_on:
      - app

  # Monitoring with Prometheus (optional)
  prometheus:
    image: prom/prometheus:latest
    container_name: evote-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - evote-network

  # Grafana for dashboards (optional)
  grafana:
    image: grafana/grafana:latest
    container_name: evote-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin_password
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - evote-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  evote-network:
    driver: bridge
```

### 7. Docker Backup Script
```bash
#!/bin/bash
# docker-backup.sh

BACKUP_DIR="/var/backups/evote-docker"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U evote_user evote_production > $BACKUP_DIR/database_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Backup environment
cp .env.docker $BACKUP_DIR/env_$DATE.backup

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.backup" -mtime +30 -delete

echo "Docker backup completed: $DATE"
```

## 🚀 Deployment Options Comparison

| Feature | Traditional Deploy | Docker Deploy |
|---------|-------------------|---------------|
| **Setup Complexity** | Medium | High |
| **Resource Usage** | Lower | Higher |
| **Isolation** | Limited | Excellent |
| **Scalability** | Manual | Easy |
| **Backup** | Simple | Complex |
| **Updates** | Simple | Medium |
| **Monitoring** | Manual | Integrated |
| **Security** | Manual | Containerized |

## 🎯 Recommendation

- **Small-Medium School (< 1000 voters)**: Traditional deployment
- **Large School (> 1000 voters)**: Docker deployment with monitoring
- **Development/Testing**: Docker for consistency
- **Production**: Either, based on team expertise

Choose the deployment method that best fits your infrastructure and team capabilities.