import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * PrismaClient singleton with explicit connection pooling configuration.
 *
 * 🔑 CRITICAL: Neon direct connections close idle connections after ~5 minutes.
 * The connection_limit + pool_timeout options prevent:
 *   - "Server has closed the connection" errors
 *   - Connection pool starvation during concurrent requests
 *
 * 🛠 If you still see connection errors:
 *   1. Use the Neon **pooled** connection string:
 *      postgresql://user:pass@ep-xxxx-pooler.us-east-2.aws.neon.tech/db?sslmode=require
 *      (the "-pooler" suffix keeps connections alive via PgBouncer)
 *   2. Or increase connection_limit for higher traffic
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error', 'warn'],
    // 🔑 The connection goes through Fly Proxy (port 5432), which closes
    //    idle connections after ~30 seconds. When the alpha-purchase flow
    //    makes external HTTP calls (Razorpay, exchange rates) between Prisma
    //    queries, the connection sits idle long enough for the proxy to kill it.
    //
    //    Fix: use PgBouncer port 5433 instead, OR keep port 5432 with:
    //    - pool_timeout: don't wait forever for a pool connection
    //    - connection_limit: set from env var (default 4)
    ...(process.env.PRISMA_CONNECTION_LIMIT
      ? { connection_limit: parseInt(process.env.PRISMA_CONNECTION_LIMIT, 10) }
      : {}),
    // Pool timeout: if all connections are busy, fail fast instead of hanging
    ...(process.env.PRISMA_POOL_TIMEOUT
      ? { pool_timeout: parseInt(process.env.PRISMA_POOL_TIMEOUT, 10) }
      : { pool_timeout: 10 }),  // default 10 seconds
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Graceful shutdown: disconnect Prisma when the process receives termination signals.
 * This prevents hanging connections during Fly.io scale-to-zero / deploys.
 */
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
})
