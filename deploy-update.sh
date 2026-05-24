#!/bin/bash
# ChainPulse Alpha - Quick Deploy Script
# Run on VPS: cd /opt/chainpulse/app && bash deploy-update.sh

set -e

echo "🚀 ChainPulse Alpha - Deploying dashboard overhaul..."
echo "=================================================="

# 1. Pull latest code from GitHub
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install dependencies (include devDeps temporarily for prisma CLI)
echo "📦 Installing ALL dependencies (prisma CLI is a devDep)..."
npm ci

# 3. Apply pending Prisma migrations BEFORE building
#    This ensures the DB schema matches the Prisma schema BEFORE the app tries to use it.
#    Without this, a new column referenced in the code won't exist yet in the DB.
echo "🗄️  Applying pending Prisma migrations..."
npx prisma migrate deploy

# 4. Regenerate Prisma client (must happen after migrate deploy)
echo "🗄️  Regenerating Prisma client..."
npx prisma generate

# 5. Build application
echo "🔨 Building Next.js application..."
npm run build

# 6. Copy Prisma client files to standalone output
#    Next.js standalone mode does NOT automatically include .prisma/client/ files.
#    Without this, the deployed server may use a stale engine or have no engine at all.
echo "📋 Copying Prisma client to standalone output..."
STANDALONE_NM=".next/standalone/node_modules"
mkdir -p "$STANDALONE_NM/.prisma"
# Remove old copy if present to avoid stale files
rm -rf "$STANDALONE_NM/.prisma/client" 2>/dev/null
# Copy the freshly generated client (includes engine binary and schema)
cp -r node_modules/.prisma/client "$STANDALONE_NM/.prisma/client"
# Also copy @prisma/client runtime
rm -rf "$STANDALONE_NM/@prisma/client" 2>/dev/null
cp -r node_modules/@prisma/client "$STANDALONE_NM/@prisma/client"
echo "   ✅ Prisma client copied (engine: $(ls -1 "$STANDALONE_NM/.prisma/client/libquery_engine-*.so.node" 2>/dev/null | head -1 | xargs basename))"

# 7. Restart with PM2
echo "♻️  Restarting application..."
pm2 restart chainpulse-alpha || pm2 start ecosystem.config.js

# 8. Save PM2 state
pm2 save

echo ""
echo "✅ Deployment complete!"
echo "🌐 Live at: https://chainpulsealpha.com"
echo ""
pm2 status chainpulse-alpha
