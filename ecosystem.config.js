module.exports = {
  apps: [{
    name: 'e-vote-production',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/e-vote2',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '/var/www/e-vote2/.env.production',
    error_file: '/var/log/pm2/e-vote-error.log',
    out_file: '/var/log/pm2/e-vote-out.log',
    log_file: '/var/log/pm2/e-vote-combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
