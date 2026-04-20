#!/bin/bash
# ChainPulse Alpha - Quick Deploy Script
# Run on VPS: cd /opt/chainpulse/app && bash deploy-update.sh

set -e

echo "🚀 ChainPulse Alpha - Deploying dashboard overhaul..."
echo "=================================================="

# 1. Pull latest code from GitHub
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install dependencies (skip devDeps for production)
echo "📦 Installing dependencies..."
npm ci --omit=dev

# 3. Regenerate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# 4. Build application
echo "🔨 Building Next.js application..."
npm run build

# 5. Restart with PM2
echo "♻️  Restarting application..."
pm2 restart chainpulse-alpha || pm2 start ecosystem.config.js

# 6. Save PM2 state
pm2 save

echo ""
echo "✅ Deployment complete!"
echo "🌐 Live at: https://chainpulsealpha.com"
echo ""
pm2 status chainpulse-alpha
