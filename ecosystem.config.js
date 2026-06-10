module.exports = {
  apps: [
  // Signal generator — calls the server API every 6 hours
  // Uses curl to POST /api/signals/refresh (the authoritative generator)
  // replacing the legacy standalone engine/signal-generator.js
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
      AUTH_SECRET: '/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw',
      AUTH_URL: 'https://chainpulsealpha.com',
      NEXTAUTH_SECRET: '/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw',
      NEXTAUTH_URL: 'https://chainpulsealpha.com',
      NEON_DATABASE_URL: 'postgresql://neondb_owner:npg_Va8kFWCvJ3EG@ep-dark-mouse-amw770sl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      DATABASE_URL: 'postgresql://neondb_owner:npg_Va8kFWCvJ3EG@ep-dark-mouse-amw770sl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      RAZORPAY_KEY_ID: 'rzp_test_xxxxxxxxxxxx',  # REPLACE with actual test key from Razorpay dashboard
      RAZORPAY_KEY_SECRET: 'replace_with_your_secret',  # REPLACE with actual secret
      ADMIN_EMAIL: 'admin@chainpulsealpha.com',
      ADMIN_PASSWORD: 'CHANGE-ME'
    },
    max_memory_restart: '512M',
    restart_delay: 3000
  }]
}
