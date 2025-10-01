module.exports = {
  apps: [
    {
      name: 'e-vote',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/e-vote',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/e-vote/logs/err.log',
      out_file: '/var/www/e-vote/logs/out.log',
      log_file: '/var/www/e-vote/logs/combined.log',
      time: true
    }
  ]
};