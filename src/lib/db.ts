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

/**
 * Alias to src/lib/prisma.ts.
 *
 * Kept for back-compat — routes that accidentally import from
 * '@/lib/db' get the same singleton with auto-retry middleware.
 */
export { prisma } from '@/lib/prisma'
