import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * PrismaClient singleton with safe connection pool defaults.
 *
 * 🔑 Prisma 5.x connection pooling is configured via the DATABASE URL,
 *    not typed constructor options. Set these query params in the URL:
 *      - pgbouncer=true  (transaction pooling via PgBouncer)
 *      - pool_timeout=N  (seconds to wait for pool connection, default 10)
 *      - connection_limit=N (max connections in pool, default per engine)
 *
 *    Example: postgres://user:pass@host:5432/db?pgbouncer=true&connection_limit=10&pool_timeout=5
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Graceful shutdown: disconnect Prisma when the process receives termination signals.
 * This prevents hanging connections during Fly.io scale-to-zero / deploys.
 *
 * ⚠ Guarded: middleware runs in Edge Runtime where process.on() is NOT available.
 *    Next.js will skip Edge Runtime files that reference Node.js APIs at runtime,
 *    but the TYPE CHECKER still flags them during build. Guard prevents runtime errors.
 */
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
  })

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
  })
}
