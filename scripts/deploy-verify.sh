#!/bin/bash
# Force kill all old Fly machines and restart fresh

echo "=== Listing ALL machines ==="
flyctl machine list --json 2>/dev/null || echo "No machines listed"

echo ""
echo "=== Force stopping all old machines ==="
# Get all machine IDs and stop them
MACHINES=$(flyctl machine list --json 2>/dev/null | python3 -c "
import json,sys
try:
    machines = json.load(sys.stdin)
    for m in machines:
        mid = m.get('id','')
        state = m.get('state','')
        if state in ('started', 'stopped'):
            print(mid)
except:
    pass
")

if [ -n "$MACHINES" ]; then
  for MID in $MACHINES; do
    echo "Stopping machine: $MID"
    flyctl machine stop "$MID" 2>&1
    sleep 3
    flyctl machine destroy "$MID" --force 2>&1
    sleep 2
  done
fi

echo ""
echo "=== Scaling to 1 ==="
flyctl scale count 1 --yes 2>&1 || echo "scale failed"

echo ""
echo "=== Waiting for new machine ==="
sleep 30

echo ""
echo "=== Final machine state ==="
flyctl machine list 2>&1

echo ""
echo "=== Checking API ==="
curl -s https://chainpulsealpha.com/api/signals | python3 -c "
import json,sys
d=json.load(sys.stdin)
sigs = d['data']['signals']
for s in sigs:
    w = s.get('whaleWallets', [])
    first = w[0][:15] if w else 'STRIPPED'
    print(f'  {s.get(\"tokenSymbol\",\"?\")}: {len(w)} wallets first={first}... delayHours={s.get(\"delayHours\",\"?\")}')
" 2>&1

echo "DONE"
