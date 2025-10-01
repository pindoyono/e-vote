# 🚀 Quick Deploy Guide

## One-Line Installation

```bash
curl -sSL https://raw.githubusercontent.com/username/e-vote/main/install.sh | bash
```

## Manual Installation

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Quick Commands

### Start Application
```bash
cd /var/www/e-vote
pm2 start ecosystem.config.js --env production
```

### Deploy Updates
```bash
cd /var/www/e-vote
./deploy.sh
```

### Backup Database
```bash
cd /var/www/e-vote
./backup.sh
```

### Check Status
```bash
pm2 status
pm2 logs e-vote
```

## Default Credentials

- **Admin**: admin@admin.com / password123
- **Committee**: committee@committee.com / password123

## Support

For issues, check:
1. `pm2 logs e-vote`
2. `sudo tail -f /var/log/nginx/error.log`
3. `sudo systemctl status nginx`