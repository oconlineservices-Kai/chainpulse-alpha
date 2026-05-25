import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient singleton with auto-retry for PgBouncer connection drops.
 *
 * Connection pool is configured via the DATABASE URL query params:
 *   connection_limit=10&pool_timeout=30&pgbouncer=true
 *
 * pgbouncer=true is REQUIRED when using PgBouncer (port 5433) because
 * Prisma's prepared statements are incompatible with PgBouncer's
 * transaction mode. Without this flag, idle connections get killed
 * by Fly Proxy with "Server has closed the connection" errors.
 *
 * This module uses Prisma $extends (Prisma 5.x) to add a global
 * auto-retry layer on ALL model queries. When a query fails with
 * a PgBouncer connection error, it disconnects, reconnects, and
 * retries once. This protects login, dashboard, signals, and
 * purchase flows — not just alpha-purchase.
 *
 * Graceful shutdown is in src/lib/prisma-shutdown.ts (separate file
 * to avoid Edge Runtime conflicts — middleware imports prisma via
 * auth.ts and process.on cannot exist in edge-runtime files).
 */

function isPgBouncerConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes('closed the connection') ||
    msg.includes('connection terminated') ||
    msg.includes('connection pool exhausted') ||
    msg.includes('timeout') ||
    msg.includes("can't reach database server") ||
    (msg.includes('pool') && msg.includes('error'))
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

  const client = new PrismaClient({
    log: isDev ? ['query', 'warn', 'error'] : ['error', 'warn'],
  })

  // Warm up the connection pool eagerly
  client.$connect().catch(() => {
    // Silent — let the first real query handle failures
  })

  /**
   * Add global auto-retry via $extends query middleware.
   * Wraps ALL model queries with retry-once-on-connection-error.
   */
  return client.$extends({
    query: {
      async $allOperations({ args, query, operation, model }) {
        if (!model) return query(args)

        try {
          return await query(args)
        } catch (error: unknown) {
          if (!isPgBouncerConnectionError(error)) throw error

          try {
            await client.$disconnect()
            await new Promise(r => setTimeout(r, 100))
            await client.$connect()
            return await query(args)
          } catch {
            throw error
          }
        }
      },
    },
  })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

export { prisma, isPgBouncerConnectionError }
