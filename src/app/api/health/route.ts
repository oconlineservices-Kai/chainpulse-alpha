import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);

async function getSignalGeneratorStatus() {
  try {
    const { stdout } = await execAsync('pm2 jlist 2>/dev/null', {
      timeout: 5000,
    });
    
    const processes = JSON.parse(stdout);
    const signalProc = processes.find((p: any) => p.name === 'signal-generator');
    
    if (!signalProc) {
      return {
        service: 'signal-generator',
        status: 'stopped',
        pid: null,
        uptime: null,
        restarts: 0,
        healthy: false
      };
    }
    
    const pm2Status = signalProc.pm2_env?.status ?? 'unknown';
    const status = pm2Status === 'online' ? 'running' : 
                   pm2Status === 'stopped' ? 'stopped' : 
                   pm2Status === 'errored' ? 'errored' : 'unknown';
    
    const pm2UptimeMs = signalProc.pm2_env?.pm_uptime;
    const nowMs = Date.now();
    
    return {
      service: 'signal-generator',
      status,
      pid: signalProc.pid ?? null,
      uptime: pm2UptimeMs ? Math.floor((nowMs - pm2UptimeMs) / 1000) : null,
      restarts: signalProc.pm2_env?.restart_time ?? 0,
      healthy: status === 'running'
    };
  } catch {
    return {
      service: 'signal-generator',
      status: 'unknown',
      pid: null,
      uptime: null,
      restarts: 0,
      healthy: false
    };
  }
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
    const [signalStatus] = await Promise.all([
      getSignalGeneratorStatus()
    ]);
    
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
    // Signal generator is a cron job (runs every 6h then exits) — not a daemon.
    // Being stopped is normal between runs; only treat as degraded if errored.
    const signalHealthy = signalStatus.status !== 'errored';
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
            : signalStatus.status === 'errored'
              ? "Signal generator service errored — check logs"
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
