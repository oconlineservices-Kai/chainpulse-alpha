/**
 * /api/signals/status — Signal Generator Health Endpoint
 *
 * Returns the current status of the signal-generator PM2 process:
 * - Running/stopped state
 * - Last execution time
 * - Error count and recent errors
 * - Uptime and restart count
 *
 * Access: Admin only (for internal monitoring) or unrestricted health check
 */

import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface SignalStatus {
  service: string
  status: 'running' | 'stopped' | 'errored' | 'unknown'
  pid: number | null
  uptime: number | null
  restarts: number
  lastRun: string | null
  errorCount: number
  recentErrors: string[]
  logPath: string
  errorLogPath: string
  checkedAt: string
}

async function getPm2Status(): Promise<SignalStatus> {
  const defaultStatus: SignalStatus = {
    service: 'signal-generator',
    status: 'unknown',
    pid: null,
    uptime: null,
    restarts: 0,
    lastRun: null,
    errorCount: 0,
    recentErrors: [],
    logPath: '/var/log/chainpulse/signals.log',
    errorLogPath: '/var/log/chainpulse/signals-error.log',
    checkedAt: new Date().toISOString(),
  }

  try {
    // Query PM2 for JSON-formatted process list
    const { stdout } = await execAsync('pm2 jlist 2>/dev/null', {
      timeout: 5000,
    })

    const processes = JSON.parse(stdout)
    const signalProc = processes.find(
      (p: any) => p.name === 'signal-generator'
    )

    if (!signalProc) {
      return { ...defaultStatus, status: 'unknown' }
    }

    const pm2Status = signalProc.pm2_env?.status ?? 'unknown'
    const status: SignalStatus['status'] =
      pm2Status === 'online'
        ? 'running'
        : pm2Status === 'stopped'
        ? 'stopped'
        : pm2Status === 'errored'
        ? 'errored'
        : 'unknown'

    const pm2UptimeMs = signalProc.pm2_env?.pm_uptime
    const nowMs = Date.now()

    return {
      ...defaultStatus,
      status,
      pid: signalProc.pid ?? null,
      uptime: pm2UptimeMs ? Math.floor((nowMs - pm2UptimeMs) / 1000) : null,
      restarts: signalProc.pm2_env?.restart_time ?? 0,
      lastRun: pm2UptimeMs
        ? new Date(pm2UptimeMs).toISOString()
        : null,
    }
  } catch {
    return { ...defaultStatus, status: 'unknown' }
  }
}

async function getErrorCount(errorLogPath: string): Promise<{ count: number; recent: string[] }> {
  if (!existsSync(errorLogPath)) {
    return { count: 0, recent: [] }
  }

  try {
    const content = await readFile(errorLogPath, 'utf-8')
    const lines = content.split('\n').filter(Boolean)

    // Count error lines (last 24h)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const recent = lines
      .filter((line) => {
        // Try to extract timestamp from log line
        const match = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        if (match) {
          return new Date(match[0]).getTime() > cutoff
        }
        return false
      })
      .slice(-5) // Last 5 error lines

    return {
      count: recent.length,
      recent: recent.slice(-3), // Return last 3 for API response
    }
  } catch {
    return { count: 0, recent: [] }
  }
}

async function getLastRunFromLog(logPath: string): Promise<string | null> {
  if (!existsSync(logPath)) return null

  try {
    // Read last 200 bytes to find last log entry timestamp
    const { stdout } = await execAsync(
      `tail -n 5 "${logPath}" 2>/dev/null`,
      { timeout: 2000 }
    )

    const lines = stdout.split('\n').filter(Boolean)
    for (const line of lines.reverse()) {
      const match = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      if (match) return new Date(match[0]).toISOString()
    }
    return null
  } catch {
    return null
  }
}

export async function GET() {
  const [pm2Status, errorInfo, lastRunFromLog] = await Promise.all([
    getPm2Status(),
    getErrorCount('/var/log/chainpulse/signals-error.log'),
    getLastRunFromLog('/var/log/chainpulse/signals.log'),
  ])

  // Prefer log-derived lastRun if pm2 uptime isn't set (e.g. process stopped)
  const lastRun = pm2Status.lastRun ?? lastRunFromLog

  const response = {
    success: true,
    data: {
      ...pm2Status,
      errorCount: errorInfo.count,
      recentErrors: errorInfo.recent,
      lastRun,
      healthy:
        pm2Status.status === 'running' && errorInfo.count === 0,
    },
  }

  const httpStatus =
    pm2Status.status === 'unknown' ? 503 : 200

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

// OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://chainpulsealpha.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
