"use client";

import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

interface Props {
  onValid: (address: string) => void;
  onPay: () => void;
}

export default function AddressInput({ onValid, onPay }: Props) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback((raw: string) => {
    const trimmed = raw.trim();

    if (!trimmed) {
      return { valid: false, error: "Paste your Solana address" };
    }

    // Must be base58 (alphanumeric, no 0/O/I/l)
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
      return { valid: false, error: "Invalid characters. Solana addresses are base58." };
    }

    // Length: base58 encoded ed25519 pubkey = 32 bytes → 44 chars
    if (trimmed.length < 32 || trimmed.length > 44) {
      return {
        valid: false,
        error: `Too ${trimmed.length < 32 ? "short" : "long"}. Solana addresses are 32-44 characters.`,
      };
    }

    // Try parsing as a real PublicKey (catches checksum errors)
    try {
      new PublicKey(trimmed);
    } catch {
      return { valid: false, error: "Not a valid Solana address (checksum failed)" };
    }

    return { valid: true, error: null };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    setAddress(raw);
    if (touched) {
      const result = validate(raw);
      setError(result.error);
      if (result.valid) {
        onValid(raw.trim());
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const result = validate(address);
    setError(result.error);
    if (result.valid) {
      onValid(address.trim());
    }
  };

  const result = touched ? validate(address) : { valid: false, error: null };
  const isValid = result.valid;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="solana-address"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Your Solana wallet address
        </label>
        <textarea
          id="solana-address"
          rows={2}
          placeholder="Paste your Solana address here..."
          value={address}
          onChange={handleChange}
          onBlur={handleBlur}
          spellCheck={false}
          className={`w-full bg-slate-900 border rounded-xl px-4 py-3 font-mono text-sm
            placeholder:text-slate-600 resize-none outline-none transition-colors
            ${
              touched && error
                ? "border-red-500/50 focus:border-red-400"
                : isValid && touched
                ? "border-green-500/50 focus:border-green-400"
                : "border-surface-border focus:border-brand-500"
            }`}
        />

        {/* Live validation feedback */}
        {touched && (
          <div className="mt-2 min-h-[20px]">
            {error ? (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9.75 17H2.25L12 3z" />
                </svg>
                {error}
              </p>
            ) : isValid ? (
              <p className="text-green-400 text-xs flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valid Solana address
              </p>
            ) : null}
          </div>
        )}
      </div>

      <button
        onClick={onPay}
        disabled={!isValid}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Pay $1.50 — Get $0.50 SOL
      </button>

      <p className="text-xs text-slate-600 text-center">
        We never store your address. No account needed.
      </p>
    </div>
  );
}
