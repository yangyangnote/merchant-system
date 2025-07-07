module.exports = {
  apps: [{
    name: 'merchant-system',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // 自动重启配置
    min_uptime: '10s',
    max_restarts: 10,
    // 崩溃重启延迟
    restart_delay: 4000
  }]
} 