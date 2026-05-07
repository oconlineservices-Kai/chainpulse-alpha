import { NextResponse } from 'next/server'
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

  try {
    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          tokenSymbol: true,
          tokenName: true,
          sentimentScore: true,
          whaleConfidence: true,
          correlationScore: true,
          isDiamondSignal: true,
          priceChangePct: true,
          performanceStatus: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.signal.count(),
    ])

    return NextResponse.json({
      signals: signals.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt?.toISOString() ?? null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Admin signals API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
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
    const { signalId, action } = body

    if (!signalId || !action) {
      return NextResponse.json(
        { error: 'signalId and action are required' },
        { status: 400 }
      )
    }

    const signal = await prisma.signal.findUnique({ where: { id: signalId } })
    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    switch (action) {
      case 'toggleDiamond':
        await prisma.signal.update({
          where: { id: signalId },
          data: { isDiamondSignal: !signal.isDiamondSignal },
        })
        return NextResponse.json({
          success: true,
          message: `Diamond signal ${signal.isDiamondSignal ? 'removed' : 'applied'}`,
        })

      case 'delete':
        await prisma.signal.delete({ where: { id: signalId } })
        return NextResponse.json({ success: true, message: 'Signal deleted' })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin signals PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    )
  }
})
