#!/bin/bash
set -a
source /opt/chainpulse/app/.env 2>/dev/null
set +a
exec "$@"
