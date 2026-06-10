#!/bin/bash
# Signal generation script — called by PM2 cron every 6 hours
# Calls the local Next.js API to generate live signals from CoinGecko
set -euo pipefail

AUTH_SECRET="/XbdkCfd8UvLHCdJEXswHnhjX0oPuwfvCULh0Th4XZ9zODg2bAtB/RyUdIG+KIYw"
LOG_FILE="/var/log/chainpulse/signals.log"
ERROR_LOG="/var/log/chainpulse/signals-error.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

mkdir -p /var/log/chainpulse

echo "[${TIMESTAMP}] Starting signal generation..." >> "${LOG_FILE}"

RESPONSE=$(curl -sf -X POST http://localhost:3000/api/signals/refresh \
  -H "x-auth-secret: ${AUTH_SECRET}" 2>> "${ERROR_LOG}") || {
  EXIT_CODE=$?
  echo "[${TIMESTAMP}] curl failed with exit code ${EXIT_CODE}" >> "${ERROR_LOG}"
  exit ${EXIT_CODE}
}

echo "[${TIMESTAMP}] Response: ${RESPONSE}" >> "${LOG_FILE}"
echo "[${TIMESTAMP}] Signal generation complete." >> "${LOG_FILE}"
