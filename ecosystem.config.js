module.exports = {
  apps: [
  // Signal generator — calls the server API every 6 hours
  // Uses curl to POST /api/signals/refresh (the authoritative generator)
  // replacing the legacy standalone engine/signal-generator.js
  {
    name: 'signal-generator',
    script: '/bin/sh',
    args: '-c "curl -sf -X POST http://localhost:3000/api/signals/refresh -H \"x-auth-secret: ${AUTH_SECRET}\" >> /var/log/chainpulse/signals.log 2>&1"',
    cron_restart: '0 */6 * * *',
    autorestart: false,
    watch: false,
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw',
    },
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
      AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw',
      AUTH_URL: 'https://chainpulsealpha.com',
      NEXTAUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw',
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
