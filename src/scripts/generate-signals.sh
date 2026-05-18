#!/bin/bash
# ChainPulse Alpha — Generate Signals via API
# Standalone script to trigger signal generation by curling the refresh endpoint.
# Can be run manually or from a cron job.
#
# Usage:
#   ./generate-signals.sh                    # uses AUTH_SECRET from environment
#   ./generate-signals.sh "my-secret"        # explicit secret
#   ./generate-signals.sh "" 10              # generate only 10 signals
#
# Response is logged to stdout.

set -euo pipefail

BASE_URL="${BASE_URL:-https://chainpulsealpha.com}"
AUTH_SECRET="${1:-${AUTH_SECRET:-}}"
COUNT="${2:-50}"

if [ -z "$AUTH_SECRET" ]; then
  echo "ERROR: AUTH_SECRET not set. Provide as first argument or set AUTH_SECRET env var." >&2
  exit 1
fi

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Generating ${COUNT} signals via ${BASE_URL}/api/signals/refresh ..."

curl -s -X POST "${BASE_URL}/api/signals/refresh" \
  -H "Content-Type: application/json" \
  -H "x-auth-secret: ${AUTH_SECRET}" \
  -d "{\"count\": ${COUNT}}"

echo
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Done."
