/**
 * Graceful shutdown for Prisma — disconnected from the main prisma.ts module
 * to avoid Edge Runtime conflicts (middleware imports prisma via auth.ts).
 *
 * This module is imported only in server-side API routes and server components,
 * NEVER in the middleware import chain.
 */
import { prisma } from './prisma'

export function registerGracefulShutdown() {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
  })

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
  })
}
