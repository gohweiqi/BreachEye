// src/app/dashboard/components/BreachHistory.tsx
"use client";

import React from "react";

const BreachHistorySection: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7 mt-2">
      <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
        Breach History
      </h2>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-3 text-xs uppercase tracking-wide text-gray-400 border-b border-gray-700/60 pb-2 mb-4">
        <span>Title</span>
        <span className="text-center">Date Occurred</span>
        <span className="text-right">Compromised Data</span>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-10 text-center">
        {/* Real icon instead of text placeholder */}
        <div className="h-16 w-16 rounded-full border border-[#D4AF37]/50 bg-[#111111] flex items-center justify-center mb-3 shadow-[0_0_18px_rgba(212,175,55,0.25)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-8 w-8 text-[#D4AF37]"
          >
            {/* shield outline */}
            <path
              d="M12 3.25l6 2.25v6.1c0 4.02-2.55 7.64-6 8.9-3.45-1.26-6-4.88-6-8.9v-6.1l6-2.25z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* check mark */}
            <path
              d="M9.25 12.25l1.9 1.9 3.6-3.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-sm md:text-base text-gray-400">
          No exposures have been detected from this email.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your breach history will appear here if this address is ever found in
          a known data breach.
        </p>
      </div>
    </div>
  );
};

export default BreachHistorySection;
