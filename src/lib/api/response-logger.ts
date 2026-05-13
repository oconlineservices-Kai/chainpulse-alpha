/**
 * API response logger — logs all request/response pairs with metadata.
 *
 * Attach to routes by wrapping the handler or calling logApiResponse at each exit point.
 *
 * Log format (JSON line):
 *   { timestamp, method, path, statusCode, userId?, email?, durationMs, error? }
 *
 * Logs to stdout (captured by Fly.io / PM2) for ingestion into log aggregators.
 * Does NOT log PII beyond email (which is already in the user DB).
 * Does NOT log request bodies or sensitive data.
 */

type LogLevel = 'info' | 'warn' | 'error'

interface ApiLogEntry {
  timestamp: string
  level: LogLevel
  method: string
  path: string
  statusCode: number
  userId?: string
  email?: string
  durationMs: number
  error?: string
}

/**
 * Log an API response.
 * Call at every return point inside route handlers.
 */
export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  options?: {
    userId?: string
    email?: string
    durationMs?: number
    error?: string
    extras?: Record<string, unknown>
  },
): void {
  const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'

  const entry: ApiLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    method,
    path,
    statusCode,
    userId: options?.userId?.slice(0, 8) || undefined,
    email: options?.email || undefined,
    durationMs: options?.durationMs ?? 0,
    error: options?.error || undefined,
  }

  const line = JSON.stringify(entry)

  if (level === 'error') {
    console.error(`[api] ${line}`)
  } else if (level === 'warn') {
    console.warn(`[api] ${line}`)
  } else {
    console.log(`[api] ${line}`)
  }
}

/**
 * Quick-start helper: call at start of handler, returns a function to call at each exit.
 *
 * Usage:
 *   const done = startApiLog(req)
 *   ...
 *   done(200, { userId: ... })
 */
export function startApiLog(req: Request): (
  statusCode: number,
  options?: { userId?: string; email?: string; error?: string; extras?: Record<string, unknown> }
) => void {
  const start = Date.now()
  const url = new URL(req.url)
  const method = req.method
  const path = url.pathname

  return (statusCode, options) => {
    logApiResponse(method, path, statusCode, {
      ...options,
      durationMs: Date.now() - start,
    })
  }
}
