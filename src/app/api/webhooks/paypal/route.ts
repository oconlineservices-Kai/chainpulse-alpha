import { NextRequest, NextResponse } from 'next/server';

// Temporary simplified PayPal webhook handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log the webhook for now
    console.log('PayPal webhook received:', body);
    
    // Return success to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
