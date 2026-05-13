import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logApiResponse } from '@/lib/api/response-logger';

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
      logApiResponse('POST', '/api/waitlist', 409, { email, error: 'Already registered' })
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Add to waitlist
    waitlist.push(email);
    logApiResponse('POST', '/api/waitlist', 201, { email })
    return NextResponse.json(
      { message: 'Successfully joined waitlist', email },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logApiResponse('POST', '/api/waitlist', 400, { error: 'Invalid email' })
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const msg = error instanceof Error ? error.message : 'Internal server error'
    logApiResponse('POST', '/api/waitlist', 500, { error: msg })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
