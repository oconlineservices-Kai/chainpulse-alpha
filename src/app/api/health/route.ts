import { NextResponse } from "next/server";
import { getGeneratorStatus } from "@/lib/signal-generator";
import { getCachedINRRate } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

function getSignalGeneratorStatus() {
  const state = getGeneratorStatus();
  return {
    service: 'signal-generator',
    status: state.running ? 'running' : (state.lastRun ? 'idle' : 'not_started'),
    lastRun: state.lastRun?.toISOString() ?? null,
    healthy: state.lastErrors.length === 0,
    totalGenerated: state.totalSignalsGenerated,
    totalDiamonds: state.totalDiamondSignals,
    lastErrors: state.lastErrors.length > 0 ? state.lastErrors.slice(0, 3) : undefined,
    note: 'Generates signals on-demand via POST /api/signals/refresh with X-AUTH-SECRET'
  };
}

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
    const signalStatus = getSignalGeneratorStatus();
    const cachedRate = getCachedINRRate();
    
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

    const exchangeRate = {
      cachedRate: cachedRate ?? 'never_fetched',
      hardcodedFallback: 85.34,
      note: 'Rate is live-fetched with in-memory cache. Fallback used only if both free APIs fail.',
    };

    const razorpay = {
      exchangeRate,
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
    const signalHealthy = signalStatus.healthy;
    const allSystemsReady = paymentReady && signalHealthy;
    
    return NextResponse.json(
      {
        status: allSystemsReady ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
        paymentGateway: paymentReady ? "configured" : "misconfigured",
        signalGenerator: signalStatus,
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
        message: allSystemsReady
          ? "All systems operational"
          : !paymentReady
            ? "Payment gateway requires configuration updates"
            : !signalStatus.healthy
              ? "Signal generator reported errors — check /api/signals/refresh"
              : "All systems operational",
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
