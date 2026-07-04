import { createHmac, timingSafeEqual } from "crypto";

type Provider = "stripe" | "transak" | "none";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const PROVIDER = (process.env.PAYMENT_PROVIDER || "none") as Provider;

/**
 * Verify a webhook payload's cryptographic signature.
 *
 * Stripe:   HMAC-SHA256 of `${timestamp}.${rawBody}` vs `stripe-signature` header
 * Transak:  HMAC-SHA256 of raw body vs `x-transak-signature` header
 *
 * Returns true if the signature matches, false otherwise.
 * In production, NEVER proceed without a verified signature.
 */
export function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null,
  opts?: { stripeTimestamp?: string }
): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("⚠ WEBHOOK_SECRET not configured — skipping signature verification");
    return true; // Development mode: allow unverified
  }

  if (!signatureHeader) {
    console.error("❌ Missing signature header — rejecting webhook");
    return false;
  }

  switch (PROVIDER) {
    case "stripe": {
      // Stripe format: signature = HMAC(timestamp.payload, secret)
      // Header: "t=...,v1=..."
      const timestamp = opts?.stripeTimestamp;
      if (!timestamp) {
        console.error("❌ Stripe: missing timestamp for signature verification");
        return false;
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const expected = createHmac("sha256", WEBHOOK_SECRET)
        .update(signedPayload)
        .digest("hex");

      // Extract v1 signature from header
      const match = signatureHeader.match(/v1=([a-f0-9]+)/);
      if (!match) {
        console.error("❌ Stripe: invalid signature header format");
        return false;
      }

      const received = match[1];
      try {
        const expectedBuf = Buffer.from(expected, "hex");
        const receivedBuf = Buffer.from(received, "hex");
        return timingSafeEqual(expectedBuf, receivedBuf);
      } catch {
        return false;
      }
    }

    case "transak": {
      // Transak: HMAC-SHA256 of raw body
      const expected = createHmac("sha256", WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      try {
        const expectedBuf = Buffer.from(expected, "hex");
        const receivedBuf = Buffer.from(signatureHeader, "hex");
        return timingSafeEqual(expectedBuf, receivedBuf);
      } catch {
        return false;
      }
    }

    case "none":
    default:
      console.warn("⚠ No payment provider configured — accepting webhook");
      return true;
  }
}

/**
 * Extract the user's Solana address from the webhook payload.
 *
 * Different providers embed metadata differently:
 * - Stripe: `data.object.metadata.solana_address`
 * - Transak: `data.walletAddress`
 *
 * Returns null if the address cannot be extracted.
 */
export function extractSolanaAddress(payload: Record<string, any>): string | null {
  switch (PROVIDER) {
    case "stripe":
      return payload?.data?.object?.metadata?.solana_address || null;
    case "transak":
      return payload?.data?.walletAddress || null;
    default:
      // Try common patterns
      return (
        payload?.solana_address ||
        payload?.address ||
        payload?.walletAddress ||
        payload?.data?.object?.metadata?.solana_address ||
        null
      );
  }
}
