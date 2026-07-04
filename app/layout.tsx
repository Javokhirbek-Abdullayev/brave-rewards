import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brave Rewards Refueler — Activate Your Brave Wallet",
  description:
    "Get just enough SOL to activate Brave Rewards. No signup. No KYC. $1.50 flat fee via card. Instant delivery.",
  openGraph: {
    title: "Brave Rewards Refueler",
    description:
      "One-click SOL activation for Brave Rewards. Paste your address, pay $1.50, receive $0.50 of SOL instantly.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
