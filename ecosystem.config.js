module.exports = {
  apps: [
    {
      name: 'noura-api',
      script: 'server/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 8000,
      },
      autorestart: true,
      restart_delay: 2000,
      max_restarts: 10,
      watch: false,
      instances: 1,
      error_file: './logs/noura-api-error.log',
      out_file: './logs/noura-api-out.log',
      combine_logs: true,
    },
  ],
};
