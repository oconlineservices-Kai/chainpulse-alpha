import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient singleton.
 *
 * Connection pool is configured via the DATABASE URL query params:
 *   connection_limit=10&pool_timeout=5&pgbouncer=true
 *
 * pgbouncer=true is REQUIRED when using PgBouncer (port 5433) because
 * Prisma's prepared statements are incompatible with PgBouncer's
 * transaction mode. Without this flag, idle connections get killed
 * by the proxy with "Server has closed the connection" errors.
 *
 * Graceful shutdown is registered in src/lib/prisma-shutdown.ts
 * to avoid Edge Runtime conflicts (middleware imports prisma via auth.ts).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ['query', 'warn', 'error'] : ['error', 'warn'],
  })

if (!isDev && typeof globalForPrisma.prisma === 'undefined') {
  globalForPrisma.prisma = prisma
}
