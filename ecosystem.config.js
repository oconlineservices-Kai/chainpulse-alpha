module.exports = {
  apps: [
  // Signal generator — runs every 6 hours, exits after each run (cron_restart)
  {
    name: 'signal-generator',
    script: 'engine/signal-generator.js',
    cwd: '/opt/chainpulse/app',
    cron_restart: '0 */6 * * *',
    autorestart: false,
    watch: false,
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse',
      NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || 'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse',
    },
    error_file: '/var/log/chainpulse/signals-error.log',
    out_file: '/var/log/chainpulse/signals.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '256M',
  },
  {
    name: 'chainpulse-alpha',
    script: '.next/standalone/server.js',
    cwd: '/opt/chainpulse/app',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'CHANGE-ME-IN-PRODUCTION',
      NEXTAUTH_URL: 'https://chainpulsealpha.com',
      NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || 'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@chainpulsealpha.com',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'CHANGE-ME'
    },
    max_memory_restart: '512M',
    restart_delay: 3000
  }]
}
