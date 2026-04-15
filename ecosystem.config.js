module.exports = {
  apps: [{
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
