import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().email(),
});

// In-memory storage for waitlist (replace with database later)
const waitlist: string[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = waitlistSchema.parse(body);

    // Check if email already exists
    if (waitlist.includes(email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Add to waitlist
    waitlist.push(email);

    return NextResponse.json(
      { message: 'Successfully joined waitlist', email },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
