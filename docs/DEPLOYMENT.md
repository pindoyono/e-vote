# 🚀 Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables di Vercel**
   ```env
   DATABASE_URL="file:./prod.db"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-production-secret-key"
   ```

3. **Database Migration**
   - Vercel tidak support SQLite untuk production
   - Gunakan PostgreSQL atau MySQL
   
   **PostgreSQL Example:**
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```

4. **Deploy Command**
   ```bash
   vercel --prod
   ```

### Option 2: VPS/Server Manual

1. **Server Requirements**
   - Ubuntu 20.04+ / CentOS 8+
   - Node.js 18+
   - PM2 (Process Manager)
   - Nginx (Reverse Proxy)

2. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/pindoyono/e-vote.git
   cd e-vote
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Setup environment
   cp .env.example .env
   # Edit .env with production values
   
   # Run migrations
   npx prisma migrate deploy
   npx prisma generate
   
   # Start with PM2
   pm2 start npm --name "e-vote" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/e-vote
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/e-vote /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=file:./prod.db
         - NEXTAUTH_URL=http://localhost:3000
         - NEXTAUTH_SECRET=your-secret
       volumes:
         - ./data:/app/data
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

## Environment Variables

### Development
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
```

### Production
```env
DATABASE_URL="file:./prod.db"  # or PostgreSQL/MySQL URL
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="super-secure-production-secret-key"
```

## Database Migration for Production

### SQLite to PostgreSQL
```bash
# 1. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Create database
sudo -u postgres createdb evote_production

# 3. Update schema.prisma
# Change provider from "sqlite" to "postgresql"

# 4. Generate new migration
npx prisma migrate dev --name postgresql_migration

# 5. Deploy to production
npx prisma migrate deploy
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS
- [ ] Setup firewall (UFW)
- [ ] Regular database backups
- [ ] Monitor server logs
- [ ] Update dependencies regularly

## Backup Strategy

### Database Backup
```bash
# SQLite backup
cp prod.db backup_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL backup
pg_dump evote_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/home/backups/e-vote"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
cp /path/to/app/prod.db $BACKUP_DIR/db_$DATE.db

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/app

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

## Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs e-vote

# Monitor resources
pm2 monit

# Restart app
pm2 restart e-vote
```

### Health Check Endpoint
Create `/api/health` endpoint:
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  })
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo netstat -tlnp | grep :3000
   sudo kill -9 <PID>
   ```

2. **Database connection error**
   - Check DATABASE_URL format
   - Verify database exists
   - Check permissions

3. **File upload not working**
   ```bash
   # Check uploads directory permissions
   chmod 755 public/uploads
   ```

4. **Session not working**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches domain

## Performance Optimization

### Server Optimization
```bash
# Increase file limits
echo "fs.file-max = 65535" >> /etc/sysctl.conf

# PM2 cluster mode
pm2 start npm --name "e-vote" -i max -- start
```

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_voter_token ON Voter(voteToken);
CREATE INDEX idx_vote_candidate ON Vote(candidateId);
CREATE INDEX idx_vote_created ON Vote(createdAt);
```