"use client";

import { useState } from "react";

interface Props {
  solanaAddress: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function PaymentWidget({ solanaAddress, onComplete, onBack }: Props) {
  const [status, setStatus] = useState<"ready" | "simulating">("ready");

  const handleSimulatePayment = () => {
    setStatus("simulating");

    // In production: this initializes the Stripe/Transak widget.
    // The provider's onSuccess callback fires → onComplete().
    // For now: simulate a 2-second payment flow.
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-semibold text-white">Complete Payment</h2>
          <p className="text-xs text-slate-500 font-mono truncate max-w-[280px]">{solanaAddress}</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-slate-900 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>SOL delivered</span>
          <span className="text-white font-mono">0.02 SOL (~$2.50)</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Network fee</span>
          <span className="font-mono">$0.01</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Processing (2.9% + $0.30)</span>
          <span className="font-mono">$0.34</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Service fee</span>
          <span className="font-mono">$1.15</span>
        </div>
        <div className="border-t border-surface-border pt-2 flex justify-between font-semibold text-white">
          <span>Total</span>
          <span>$1.50</span>
        </div>
      </div>

      {/* Embedded payment widget placeholder */}
      <div className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center">
        {status === "ready" && (
          <div className="space-y-3">
            <svg className="w-10 h-10 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-slate-500 text-sm">Payment widget loads here</p>
            <p className="text-slate-600 text-xs">
              Stripe / Transak onramp — handles card, fraud, KYC
            </p>
          </div>
        )}

        {status === "simulating" && (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-brand-400 text-sm font-medium">Processing payment...</p>
            <p className="text-slate-600 text-xs">Card networks typically take 2-5 seconds</p>
          </div>
        )}
      </div>

      {/* Simulate button (remove in production) */}
      <button
        onClick={handleSimulatePayment}
        disabled={status === "simulating"}
        className="btn-primary w-full"
      >
        {status === "simulating" ? "Processing..." : "Simulate Payment"}
      </button>

      <p className="text-xs text-slate-600 text-center">
        Payments processed securely. We never see your card details.
      </p>
    </div>
  );
}
