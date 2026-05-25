/**
 * ⚠ DUPLICATE Prisma client entry point.
 *
 * NOTE: This file exports the SAME global singleton as src/lib/prisma.ts
 * (they share globalThis.prisma under the hood).
 *
 * It exists because several route files accidentally import from '@/lib/db'
 * instead of '@/lib/prisma'. Rather than risk an import resolution regression,
 * we keep this file as an alias.
 *
 * BUG PREVENTION: New route handlers SHOULD import from '@/lib/prisma', NOT this file.
 * Files currently importing from '@/lib/db':
 *   - src/app/api/register/route.ts
 *   - src/app/api/user/reset-password/route.ts
 *   - src/app/api/user/forgot-password/route.ts
 *   - src/app/api/user/validate-reset-token/route.ts
 *   - src/app/api/webhooks/razorpay/route.ts
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
