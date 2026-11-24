module.exports = {
  apps: [
    {
      name: 'Chocobot',
      script: './src/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
