/**
 * POST /api/user/change-password — Change authenticated user's password
 *
 * Requires current password + new password (min 8 chars).
 * Uses bcrypt to hash the new password.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
})

export const POST = auth(async (req) => {
  const email = req.auth?.user?.email

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = changePasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({
        error: (result.error as any).errors?.[0]?.message || 'Invalid input',
      }, { status: 400 })
    }

    const { currentPassword, newPassword } = result.data

    // Fetch user with hashed password
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password || '')
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('[change-password] Error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
})
