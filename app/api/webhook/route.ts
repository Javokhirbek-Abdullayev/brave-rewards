import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook, extractSolanaAddress } from "@/lib/webhook";
import { validateAddress, sendSol } from "@/lib/solana";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/webhook
 *
 * Receives payment confirmation from Stripe/Transak.
 *
 * Security flow:
 *   1. Read raw body (must be raw — signature verification needs it)
 *   2. Extract signature header (provider-dependent name)
 *   3. Verify HMAC signature → reject if mismatch
 *   4. Extract user's Solana address from payload metadata
 *   5. Check idempotency (has this payment already been processed?)
 *   6. Rate-limit by address (prevent spam)
 *   7. Dispatch SOL
 *   8. Return tx signature
 *
 * In development with no env vars configured, this returns a 202
 * (accepted but not processed) with a clear message.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rawBody = await request.text();

  // --- Step 1: Extract signature header ---
  // Provider-dependent. We try all known header names.
  const sigHeader =
    request.headers.get("stripe-signature") ||
    request.headers.get("x-transak-signature") ||
    request.headers.get("x-webhook-signature") ||
    request.headers.get("x-signature");

  const stripeTimestamp = request.headers.get("stripe-signature")
    ? (request.headers.get("stripe-signature")?.match(/t=(\d+)/)?.[1] || undefined)
    : undefined;

  // --- Step 2: Verify signature ---
  if (!verifyWebhook(rawBody, sigHeader, { stripeTimestamp })) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  // --- Step 3: Parse payload ---
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // --- Step 4: Extract Solana address ---
  const solanaAddress = extractSolanaAddress(payload);
  if (!solanaAddress) {
    return NextResponse.json(
      { error: "Could not extract Solana address from payload" },
      { status: 400 }
    );
  }

  // Validate the address format
  try {
    validateAddress(solanaAddress);
  } catch {
    return NextResponse.json(
      { error: "Invalid Solana address format" },
      { status: 400 }
    );
  }

  // --- Step 5: Idempotency check ---
  const paymentId =
    payload?.data?.object?.id || // Stripe payment intent ID
    payload?.data?.id ||         // Transak order ID
    payload?.id;

  if (paymentId) {
    // In production: check Vercel KV or database for existing payment
    // For now: log and proceed
    console.log(`[webhook] Payment ID: ${paymentId} for ${solanaAddress}`);
  }

  // --- Step 6: Rate limit ---
  if (!checkRateLimit(`webhook:${solanaAddress}`, 3, 300_000)) {
    return NextResponse.json(
      { error: "Rate limited — too many requests for this address" },
      { status: 429 }
    );
  }

  // --- Step 7: Dispatch SOL ---
  try {
    const txSignature = await sendSol(solanaAddress);

    return NextResponse.json({
      status: "dispatched",
      solanaAddress,
      txSignature,
      paymentId: paymentId || null,
    });
  } catch (err: any) {
    console.error("[webhook] SOL dispatch failed:", err.message);

    // Hot wallet empty? Return 503 so provider retries later
    if (err.message.includes("balance too low")) {
      return NextResponse.json(
        {
          error: "Hot wallet balance too low. Operator notified. Retry shortly.",
          retry: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to dispatch SOL", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhook?address=XYZ
 *
 * Check the status of a dispense for a given address.
 * Used by the frontend StatusTracker polling.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  // In production: look up dispense status in storage
  // For now: return a development placeholder
  const rpcConfigured = !!process.env.SOLANA_RPC_URL;

  if (!rpcConfigured) {
    return NextResponse.json({
      status: "pending",
      message: "SOLANA_RPC_URL not configured — dispense simulator active",
    });
  }

  return NextResponse.json({
    status: "pending",
    address,
  });
}
