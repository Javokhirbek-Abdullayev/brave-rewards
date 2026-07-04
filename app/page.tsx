"use client";

import { useState } from "react";
import AddressInput from "@/components/AddressInput";
import PaymentWidget from "@/components/PaymentWidget";
import StatusTracker from "@/components/StatusTracker";
import TrustFooter from "@/components/TrustFooter";

type Step = "input" | "pay" | "tracking";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [solanaAddress, setSolanaAddress] = useState("");
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleAddressValid = (address: string) => {
    setSolanaAddress(address);
  };

  const handlePay = () => {
    setStep("pay");
  };

  const handlePaymentComplete = () => {
    setStep("tracking");
  };

  const handleTxComplete = (sig: string) => {
    setTxSignature(sig);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="font-semibold text-white text-lg">
              Brave Refueler
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            wallet-warden.one
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Hero copy */}
          {step === "input" && (
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">
                Activate Brave Rewards
                <br />
                <span className="text-brand-500">in under 60 seconds</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                Brave needs ~$0.005 of SOL to activate wallet sub-accounts.
                Exchanges want $15 minimums and KYC. We send you $0.50 of SOL
                for a flat $1.50 — no account, no signup, no waiting.
              </p>
            </div>
          )}

          {/* Step 1: Address input */}
          {step === "input" && (
            <div className="glass-card p-6">
              <AddressInput
                onValid={handleAddressValid}
                onPay={handlePay}
              />
            </div>
          )}

          {/* Step 2: Payment widget */}
          {step === "pay" && (
            <div className="glass-card p-6">
              <PaymentWidget
                solanaAddress={solanaAddress}
                onComplete={handlePaymentComplete}
                onBack={() => setStep("input")}
              />
            </div>
          )}

          {/* Step 3: Tracking */}
          {step === "tracking" && (
            <div className="glass-card p-6">
              <StatusTracker
                solanaAddress={solanaAddress}
                onTxComplete={handleTxComplete}
                txSignature={txSignature}
              />
            </div>
          )}
        </div>
      </main>

      <TrustFooter />
    </div>
  );
}
