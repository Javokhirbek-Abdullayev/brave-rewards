export default function TrustFooter() {
  return (
    <footer className="w-full border-t border-surface-border mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        {/* Fee breakdown */}
        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">
            Why $1.50 for $0.50 of SOL?
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
            <span>💳 Card min 2.9% + $0.30</span>
            <span>⛽ Solana gas ~$0.0001</span>
            <span>🏦 Exchange min $10–$15</span>
            <span>🔒 No KYC / No account</span>
          </div>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            No logs. No tracking.
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant delivery
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Open source
          </span>
        </div>

        <p className="text-xs text-slate-700 text-center">
          top-up-brave-rewards.wallet-warden.one · Not a Money Services Business · No custody of funds
        </p>
      </div>
    </footer>
  );
}
