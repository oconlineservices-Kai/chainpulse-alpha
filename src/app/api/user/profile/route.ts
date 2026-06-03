import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.auth.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        premiumStatus: true,
        premiumExpiresAt: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load profile' },
      { status: 500 }
    );
  }
});

export const PUT = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    // Validate name
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Name too long (max 100 characters)' }, { status: 400 });
      }
    }

    // Nothing to update
    if (name === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: req.auth.user.email },
      data: { name: name.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        premiumStatus: true,
        premiumExpiresAt: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
