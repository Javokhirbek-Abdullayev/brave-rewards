import { PublicKey, Connection, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC_URL = process.env.SOLANA_RPC_URL || "";
const PRIVATE_KEY = process.env.HOT_WALLET_PRIVATE_KEY || "";

/**
 * Validate a Solana base58 address.
 * Returns the normalized PublicKey or throws.
 */
export function validateAddress(raw: string): PublicKey {
  return new PublicKey(raw.trim());
}

/**
 * Send SOL from the hot wallet to the target address.
 * Returns the transaction signature.
 * 
 * In production, this is called ONLY after:
 *   1. Webhook signature is verified
 *   2. Payment is confirmed
 *   3. Address hasn't been served already (idempotency)
 */
export async function sendSol(toAddress: string, amountSol: number = 0.02): Promise<string> {
  if (!RPC_URL) {
    throw new Error("SOLANA_RPC_URL not configured");
  }
  if (!PRIVATE_KEY) {
    throw new Error("HOT_WALLET_PRIVATE_KEY not configured");
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const to = new PublicKey(toAddress.trim());

  // Decode base58 private key
  const secretKey = Uint8Array.from(
    JSON.parse(Buffer.from(PRIVATE_KEY, "base64").toString("utf-8"))
  );
  const from = Keypair.fromSecretKey(secretKey);

  // Check hot wallet balance before sending
  const balance = await connection.getBalance(from.publicKey);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  if (balance < lamports + 5000) {
    throw new Error(
      `Hot wallet balance too low: ${balance / LAMPORTS_PER_SOL} SOL. ` +
      `Need at least ${(lamports + 5000) / LAMPORTS_PER_SOL} SOL.`
    );
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports,
    })
  );

  const signature = await connection.sendTransaction(transaction, [from]);
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

/**
 * Check if a transaction has been confirmed on-chain.
 */
export async function getTransactionStatus(signature: string): Promise<"confirmed" | "pending" | "not_found"> {
  if (!RPC_URL) return "pending";

  const connection = new Connection(RPC_URL, "confirmed");
  const result = await connection.getSignatureStatus(signature);

  if (!result || result.value === null) return "not_found";

  const status = result.value;
  if (status.err) return "not_found";
  if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
    return "confirmed";
  }
  return "pending";
}
