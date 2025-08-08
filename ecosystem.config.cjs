module.exports = {
  apps: [
    {
      name: 'comparee-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/comparee',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      time: true,
      restart_delay: 5000,
      max_restarts: 20,
      min_uptime: '15s',
      error_file: '/var/log/comparee/nextjs-error.log',
      out_file: '/var/log/comparee/nextjs-out.log',
      merge_logs: true,
    },
  ],
};


