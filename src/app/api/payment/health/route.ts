import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isConfigured(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

function isPlaceholder(value?: string) {
  if (!value) return true;
  return value.trim().toLowerCase() === 'your-razorpay-secret-here';
}

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const configured = isConfigured(keyId) && isConfigured(keySecret) && !isPlaceholder(keySecret);

  return NextResponse.json(
    {
      status: configured ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'payment-gateway',
      provider: 'razorpay',
      checks: {
        endpointAccessible: true,
        keyIdConfigured: isConfigured(keyId),
        keySecretConfigured: isConfigured(keySecret),
        keySecretPlaceholder: isPlaceholder(keySecret),
      },
      message: configured
        ? 'Razorpay configuration looks healthy'
        : 'Razorpay configuration incomplete or using placeholder secret',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
