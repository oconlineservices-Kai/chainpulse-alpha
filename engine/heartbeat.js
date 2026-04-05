// Engine Heartbeat
// Health check and status reporting

const fs = require('fs')

const HEARTBEAT_FILE = '/var/log/chainpulse/heartbeat.log'

function logHeartbeat() {
  const timestamp = new Date().toISOString()
  const status = {
    timestamp,
    status: 'healthy',
    pid: process.pid,
    uptime: process.uptime(),
  }
  
  fs.appendFileSync(HEARTBEAT_FILE, JSON.stringify(status) + '\n')
  console.log('Heartbeat:', timestamp)
}

// Log heartbeat every 30 seconds
setInterval(logHeartbeat, 30000)
logHeartbeat()

module.exports = { logHeartbeat }
