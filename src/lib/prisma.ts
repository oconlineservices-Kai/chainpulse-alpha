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
    // 🔑 Neon closes idle connections after ~5 minutes.
    // connection_limit + pool_timeout guard against pool exhaustion.
    // Uses environment variable if set, otherwise Prisma's default (4).
    ...(process.env.PRISMA_CONNECTION_LIMIT
      ? { connection_limit: parseInt(process.env.PRISMA_CONNECTION_LIMIT, 10) }
      : {}),
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
