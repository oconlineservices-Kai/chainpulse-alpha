# CHAINPULSE ALPHA — PROJECT ROADMAP & SECURITY PLAN

## 📋 EXECUTIVE SUMMARY

**Product:** ChainPulse Alpha — Web3 Intelligence SaaS  
**Architecture:** Hybrid (Vercel Frontend + Contabo VPS Engine + Neon DB)  
**Timeline:** 14 days to MVP  
**Revenue Model:** $49/mo Premium + $1 Pay-Per-Alpha  
**Payment Gateways:** Razorpay + PayPal (NO Stripe)

---

## 🗓️ PHASED DEVELOPMENT ROADMAP

### PHASE 1: FOUNDATION (Days 1-3)
**Objective:** Infrastructure, Security, Database

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 1 | VPS Security Hardening | Sonnet | UFW, fail2ban, SSH lockdown |
| 1 | Neon DB Setup | Sonnet | Tables, indexes, connections |
| 1 | GitHub Repo Init | Sonnet | Next.js 14 + TypeScript |
| 2 | Environment Config | Sonnet | .env, secrets management |
| 2 | Vercel Deployment | Sonnet | Live staging URL |
| 3 | Auth System | Sonnet | NextAuth + JWT |
| 3 | Security Audit | Nova | Approval checkpoint |

**Checkpoint:** Infrastructure secure and live

---

### PHASE 2: FINANCIAL ENGINE (Days 4-6)
**Objective:** Payments, Webhooks, Credits System

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 4 | Razorpay Integration | Sonnet | SDK, checkout flow |
| 4 | PayPal Integration | Sonnet | SDK, checkout flow |
| 5 | Webhook Handlers | Sonnet | Razorpay + PayPal endpoints |
| 5 | Credit System | Sonnet | Purchase, consume, balance |
| 6 | Transaction Logging | Sonnet | Neon DB records |
| 6 | Financial Dashboard | Sonnet | Admin revenue view |

**Checkpoint:** Payment flow tested, webhooks verified

---

### PHASE 3: INTELLIGENCE ENGINE (Days 7-10)
**Objective:** Data Pipeline, AI Analysis, Signal Generation

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 7 | Twitter Scraper | Sonnet | API integration, rate limiting |
| 7 | On-Chain Monitor | Sonnet | Whale wallet tracker |
| 8 | Data Pipeline | Sonnet | 30-min heartbeat job |
| 8 | DeepSeek Integration | Sonnet | Sentiment analysis |
| 9 | Correlation Engine | Sonnet | Score calculator (0-100) |
| 9 | Signal Generator | Sonnet | Diamond Signal logic |
| 10 | Telegram Bot | Sonnet | Premium alerts |

**Checkpoint:** Signals generating, alerts working

---

### PHASE 4: USER EXPERIENCE (Days 11-13)
**Objective:** Dashboards, UX Polish, Marketing

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 11 | User Dashboard | Sonnet | Alpha Feed, Whale Pulse |
| 11 | Signal Cards | Sonnet | UI for free/premium/locked |
| 12 | Admin Dashboard | Sonnet | Health, users, revenue |
| 12 | Pay-Per-Alpha Flow | Sonnet | Unlock mechanism |
| 13 | Twitter Marketing | Nova | Teaser posts, link strategy |
| 13 | Landing Page | Sonnet | Vercel marketing page |

**Checkpoint:** User journey complete, ready for traffic

---

### PHASE 5: LAUNCH (Day 14)
**Objective:** Soft Launch, Monitoring, Iteration

| Task | Owner | Deliverable |
|------|-------|-------------|
| Final Security Audit | Nova | Go/No-Go decision |
| Deploy Production | Sonnet | Live at chainpulse.alpha |
| Monitor Heartbeat | Nova | 24h uptime check |
| Gather Feedback | Nova | User interviews |
| Iteration Plan | Nova | V2 features list |

---

## 🔒 SECURITY PLAN (VPS HARDENING)

### 1. UFW (Uncomplicated Firewall) Setup

```bash
# Install UFW
sudo apt-get install ufw

# Default deny all incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow specific ports
sudo ufw allow 22/tcp    # SSH (or custom port)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Deny all other ports
sudo ufw deny 3306       # MySQL (if not used externally)
sudo ufw deny 5432       # PostgreSQL (Neon is external)
sudo ufw deny 6379       # Redis

# Enable and check status
sudo ufw enable
sudo ufw status verbose
```

**Expected Output:**
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

---

### 2. SSH Hardening

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Changes to make:
Port 2222                           # Change from default 22
PermitRootLogin no                # Disable root login
PasswordAuthentication no         # Key-based auth only
PubkeyAuthentication yes          # Enable keys
MaxAuthTries 3                    # Limit attempts
ClientAliveInterval 300           # Timeout inactive
ClientAliveCountMax 2

# Restart SSH
sudo systemctl restart sshd
```

**Backup Access:** VNC/Console via Contabo panel (emergency only)

---

### 3. Fail2Ban (Brute Force Protection)

```bash
# Install fail2ban
sudo apt-get install fail2ban

# Create custom config
sudo tee /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[chainpulse-api]
enabled = true
port = 80,443
filter = chainpulse-api
logpath = /var/log/chainpulse/api.log
maxretry = 100
findtime = 60
bantime = 24h
EOF

# Create filter for API rate limiting
sudo tee /etc/fail2ban/filter.d/chainpulse-api.conf <<EOF
[Definition]
failregex = ^.*429 Too Many Requests.*client <HOST>.*$
            ^.*403 Forbidden.*client <HOST>.*$
ignoreregex = ^.*200 OK.*$
EOF

# Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status
```

---

### 4. Node.js Process Security

```javascript
// Process manager: PM2
// Install: npm install -g pm2

// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'chainpulse-engine',
    script: './dist/heartbeat.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    // Security
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Logging
    log_file: '/var/log/chainpulse/combined.log',
    out_file: '/var/log/chainpulse/out.log',
    error_file: '/var/log/chainpulse/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Auto-restart
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
```

---

### 5. API Rate Limiting (Application Layer)

```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit');

// Public endpoints (strict)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook endpoints (generous but monitored)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Razorpay/PayPal can send bursts
  message: 'Webhook rate limit exceeded',
});

// Premium API (authenticated)
const premiumLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 5 req/sec for premium users
  keyGenerator: (req) => req.user.id,
});

// Apply middleware
app.use('/api/public/', publicLimiter);
app.use('/api/webhooks/', webhookLimiter);
app.use('/api/premium/', authenticate, premiumLimiter);
```

---

### 6. Secrets Management

```bash
# NEVER commit .env
# .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.pem" >> .gitignore

# VPS Environment File
sudo mkdir -p /etc/chainpulse
sudo tee /etc/chainpulse/environment <<EOF
NODE_ENV=production
NEON_DATABASE_URL=postgresql://...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
TELEGRAM_BOT_TOKEN=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
EOF

# Restrict access
sudo chmod 600 /etc/chainpulse/environment
sudo chown root:root /etc/chainpulse/environment

# PM2 loads from here
pm2 start ecosystem.config.js --env production
```

---

### 7. Monitoring & Alerting

```bash
# Install logrotate for log management
sudo apt-get install logrotate

# Create logrotate config
sudo tee /etc/logrotate.d/chainpulse <<EOF
/var/log/chainpulse/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Setup basic monitoring script
cat > /opt/chainpulse/monitor.sh <<EOF
#!/bin/bash
# Check if heartbeat is running
if ! pgrep -f "heartbeat.js" > /dev/null; then
    echo "$(date): Heartbeat process not running!" >> /var/log/chainpulse/alerts.log
    pm2 restart chainpulse-engine
    # Send alert via Telegram
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$ADMIN_CHAT_ID" \
        -d "text=🚨 ChainPulse Heartbeat DOWN - Auto-restarting"
fi
EOF

chmod +x /opt/chainpulse/monitor.sh

# Cron every 5 minutes
echo "*/5 * * * * root /opt/chainpulse/monitor.sh" | sudo tee -a /etc/crontab
```

---

## 🛡️ SECURITY CHECKLIST (Pre-Launch)

- [ ] UFW enabled, only ports 22/80/443 open
- [ ] SSH on non-default port, root login disabled
- [ ] fail2ban active, SSH brute-force protected
- [ ] All secrets in `/etc/chainpulse/environment` (600 permissions)
- [ ] No hardcoded credentials in code
- [ ] API rate limiting implemented
- [ ] HTTPS enforced (Let's Encrypt)
- [ ] Webhook signature verification active
- [ ] Database connections encrypted (SSL)
- [ ] Log rotation configured
- [ ] Process monitoring (PM2) with auto-restart
- [ ] Backup strategy (Neon daily snapshots)

---

## 📊 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Uptime** | 99.9% | UptimeRobot |
| **Heartbeat Latency** | <5 min | Internal logging |
| **Security Incidents** | 0 | Fail2ban logs |
| **Payment Success Rate** | >95% | Transaction logs |
| **Signal Generation** | Every 30 min | Heartbeat logs |

---

## 🚀 GO/NO-GO CRITERIA

**GO Decision Requires:**
1. All security checklist items complete
2. Payment webhooks tested (test transactions)
3. Signal pipeline generating >1 signal/hour
4. Telegram bot sending alerts
5. Dashboard loading <3 seconds
6. Zero critical vulnerabilities in audit

**If NO-GO:**
- Document blockers
- Revise timeline
- Re-approve before proceeding

---

## 📞 ESCALATION PATH

| Issue | First Response | Escalation |
|-------|---------------|------------|
| Security breach | Nova immediate lockdown | Commander notification |
| Payment failure | Sonnet debug | Razorpay/PayPal support |
| VPS downtime | Auto-restart (PM2) | Contabo support |
| Data loss | Neon snapshot restore | Commander decision |

---

_Document Version: 1.0_  
_Status: Ready for Commander Approval_  
_Next Step: Call Sonnet for GitHub commit upon approval_
