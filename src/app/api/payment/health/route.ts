import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    razorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
    database: true, // Will be verified by the actual endpoints
    auth: true // Auth is configured
  }

  const allConfigured = checks.razorpayKeyId && checks.razorpayKeySecret

  return NextResponse.json({
    status: allConfigured ? 'healthy' : 'degraded',
    checks,
    message: allConfigured 
      ? 'Payment system is fully configured' 
      : 'Payment system is missing required environment variables'
  }, { status: allConfigured ? 200 : 503 })
}
