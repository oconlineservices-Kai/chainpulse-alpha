import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isConfigured(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

function isPlaceholder(value?: string) {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();
  return [
    "your-razorpay-secret-here",
    "your-secret-here",
    "placeholder",
    "changeme",
    "test",
  ].includes(normalized);
}

export async function GET() {
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

    const razorpay = {
      keyIdConfigured: isConfigured(razorpayKeyId),
      keySecretConfigured: isConfigured(razorpayKeySecret),
      keySecretPlaceholder: isPlaceholder(razorpayKeySecret),
      webhookSecretConfigured: isConfigured(razorpayWebhookSecret),
      mode: razorpayKeyId?.startsWith("rzp_live_") ? "live" : razorpayKeyId?.startsWith("rzp_test_") ? "test" : "unknown",
    };

    const paypal = {
      clientIdConfigured: isConfigured(paypalClientId),
      clientSecretConfigured: isConfigured(paypalClientSecret),
    };

    const razorpayReady =
      razorpay.keyIdConfigured &&
      razorpay.keySecretConfigured &&
      !razorpay.keySecretPlaceholder;

    const paypalReady = paypal.clientIdConfigured && paypal.clientSecretConfigured;
    const paymentReady = razorpayReady || paypalReady;

    return NextResponse.json(
      {
        status: paymentReady ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
        paymentGateway: paymentReady ? "configured" : "misconfigured",
        payment: {
          status: paymentReady ? "ready" : "action_required",
          primaryProvider: "razorpay",
          razorpay,
          paypal,
          issues: [
            ...(!razorpay.keyIdConfigured ? ["RAZORPAY_KEY_ID missing"] : []),
            ...(!razorpay.keySecretConfigured ? ["RAZORPAY_KEY_SECRET missing"] : []),
            ...(razorpay.keySecretPlaceholder ? ["RAZORPAY_KEY_SECRET is placeholder"] : []),
          ],
        },
        message: paymentReady
          ? "All systems operational"
          : "Payment gateway requires configuration updates",
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        paymentGateway: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
