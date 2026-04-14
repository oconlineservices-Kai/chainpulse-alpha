module.exports = {
  apps: [{
    name: 'chainpulse-alpha',
    script: '.next/standalone/server.js',
    cwd: '/opt/chainpulse/app',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
      NEXTAUTH_SECRET: 'chainpulse-secret-key-2026-04-13-secure-random-string-12345',
      NEXTAUTH_URL: 'https://chainpulsealpha.com',
      NEON_DATABASE_URL: 'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse',
      DATABASE_URL: 'postgresql://chainpulse:chainpulse123@localhost:5432/chainpulse',
      RAZORPAY_KEY_ID: 'rzp_live_SaiJxhR7vCrekL',
      RAZORPAY_KEY_SECRET: 'your-razorpay-secret-here',
      ADMIN_EMAIL: 'admin@chainpulsealpha.com',
      ADMIN_PASSWORD: 'admin123-change-me-immediately'
    },
    max_memory_restart: '512M',
    restart_delay: 3000
  }]
}
