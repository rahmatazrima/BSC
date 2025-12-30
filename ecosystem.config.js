module.exports = {
  apps: [{
    name: 'bsc-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/gufriends/apps/BSC',
    env: {
      NODE_ENV: 'production',
      PORT: 3017
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/gufriends/.pm2/logs/bsc-app-error.log',
    out_file: '/home/gufriends/.pm2/logs/bsc-app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
