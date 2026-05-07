import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const GET = auth(async (req: any) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
  const search = searchParams.get('search') || ''

  try {
    const where = search
      ? { email: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          premiumStatus: true,
          credits: true,
          createdAt: true,
          updatedAt: true,
          premiumExpiresAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        premiumExpiresAt: u.premiumExpiresAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        isAdmin: u.premiumStatus === 'admin',
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})

export const PUT = auth(async (req: any) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, action, value } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'promoteAdmin':
        await prisma.user.update({
          where: { id: userId },
          data: { premiumStatus: 'admin' },
        })
        return NextResponse.json({ success: true, message: 'User promoted to admin' })

      case 'demoteAdmin':
        await prisma.user.update({
          where: { id: userId },
          data: { premiumStatus: value || 'free' },
        })
        return NextResponse.json({ success: true, message: 'Admin privileges removed' })

      case 'grantPremium':
        await prisma.user.update({
          where: { id: userId },
          data: {
            premiumStatus: 'premium',
            premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        })
        return NextResponse.json({ success: true, message: 'Premium granted for 1 year' })

      case 'removePremium':
        await prisma.user.update({
          where: { id: userId },
          data: { premiumStatus: 'free', premiumExpiresAt: null },
        })
        return NextResponse.json({ success: true, message: 'Premium removed' })

      case 'addCredits':
        const addAmount = parseInt(value) || 0
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: addAmount } },
        })
        return NextResponse.json({
          success: true,
          message: `${addAmount} credits added`,
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin users PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
})

export const DELETE = auth(async (req: any) => {
  if (!req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 } )
    }

    // Delete related records first
    await prisma.alphaPurchase.deleteMany({ where: { userId } })
    await prisma.transaction.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch (error) {
    console.error('Admin users DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
})
