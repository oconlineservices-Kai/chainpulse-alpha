#!/bin/bash
# ChainPulse Alpha — App Restart Script
#
# Loads .env into environment, then restarts the PM2 process.
# Run this instead of bare `pm2 restart` to ensure env vars are set.
#
# Usage: bash scripts/restart-app.sh
#        bash scripts/restart-app.sh --build   # build + restart

set -euo pipefail
cd /opt/chainpulse/app

# Load .env
if [ -f ".env" ]; then
  echo "[restart] Loading .env..."
  set -a
  source .env
  set +a
fi

# Optionally build
if [ "${1:-}" = "--build" ]; then
  echo "[restart] Building Next.js..."
  npm run build
fi

# Restart PM2 — env vars from .env are passed via the sourced shell
echo "[restart] Restarting PM2 processes..."
exec pm2 restart ecosystem.config.js --update-env
