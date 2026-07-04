/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    HOT_WALLET_PRIVATE_KEY: process.env.HOT_WALLET_PRIVATE_KEY,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  },
};

module.exports = nextConfig;
