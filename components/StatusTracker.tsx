"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  solanaAddress: string;
  onTxComplete: (signature: string) => void;
  txSignature: string | null;
}

type TrackingStep = "pending" | "dispatching" | "complete" | "failed";

export default function StatusTracker({ solanaAddress, onTxComplete, txSignature }: Props) {
  const [step, setStep] = useState<TrackingStep>("pending");

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/status?address=${solanaAddress}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === "dispatching") {
        setStep("dispatching");
      } else if (data.status === "complete" && data.txSignature) {
        setStep("complete");
        onTxComplete(data.txSignature);
      } else if (data.status === "failed") {
        setStep("failed");
      }
    } catch {
      // API not deployed yet — expected in dev
    }
  }, [solanaAddress, onTxComplete]);

  useEffect(() => {
    if (txSignature) {
      setStep("complete");
      return;
    }

    // Start polling immediately, then every 3 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [pollStatus, txSignature]);

  const steps: { key: TrackingStep; label: string; icon: string }[] = [
    { key: "pending", label: "Payment confirmed", icon: "✓" },
    { key: "dispatching", label: "Sending SOL", icon: "→" },
    { key: "complete", label: "SOL delivered", icon: "✓" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">
          {step === "complete" ? "SOL Delivered!" : "Processing..."}
        </h2>
        <p className="text-xs text-slate-500 font-mono truncate max-w-[280px] mx-auto">
          {solanaAddress}
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3">
        {steps.map((s) => {
          const isActive =
            step === s.key ||
            (s.key === "pending" && (step === "dispatching" || step === "complete")) ||
            (s.key === "dispatching" && step === "complete");

          const isCurrent = step === s.key || (s.key === "dispatching" && step === "complete" && !txSignature);
          const isPast = (s.key === "pending" && (step === "dispatching" || step === "complete")) ||
                         (s.key === "dispatching" && step === "complete");

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isPast
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-brand-500 text-white animate-pulse"
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                {isPast ? "✓" : isCurrent ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  s.icon
                )}
              </div>
              <span
                className={`text-sm ${isActive ? "text-slate-200" : "text-slate-600"}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Transaction signature */}
      {txSignature && (
        <div className="bg-slate-900 rounded-xl p-4 text-center space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Transaction</p>
          <p className="font-mono text-sm text-brand-400 break-all">{txSignature}</p>
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors"
          >
            View on Solscan
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {step === "failed" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm">Transaction failed. Your payment will be refunded.</p>
        </div>
      )}
    </div>
  );
}
