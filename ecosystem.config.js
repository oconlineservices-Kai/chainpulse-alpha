module.exports = {
  apps: [
  // Signal generator — calls the server API every 6 hours
  // Uses curl to POST /api/signals/refresh (the authoritative generator)
  {
    name: 'signal-generator',
    script: '/opt/chainpulse/app/scripts/generate-signals.sh',
    cron_restart: '0 */6 * * *',
    autorestart: false,
    watch: false,
    interpreter: '/bin/bash',
    error_file: '/var/log/chainpulse/signals-error.log',
    out_file: '/var/log/chainpulse/signals.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '64M',
  },
  {
    name: 'chainpulse-alpha',
    script: '.next/standalone/server.js',
    cwd: '/opt/chainpulse/app',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
      // ──────────────────────────────────────────────────────────────
      // CRITICAL: DO NOT HARDCODE CREDENTIALS IN THIS FILE.
      // This config is in the public GitHub repo.
      // Secrets are loaded from /opt/chainpulse/app/.env at PM2 start
      // via the wrapper: source .env && pm2 start ecosystem.config.js
      // ──────────────────────────────────────────────────────────────
    },
    max_memory_restart: '512M',
    restart_delay: 3000,
  }]
}
