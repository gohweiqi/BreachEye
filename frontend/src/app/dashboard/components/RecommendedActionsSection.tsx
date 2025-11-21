// src/app/dashboard/components/RecommendedActionsSection.tsx
"use client";

import React from "react";

const RecommendedActionsSection: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7 mt-2">
      <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
        Recommended Actions
      </h2>

      {/* Small note paragraph */}
      <p className="text-sm md:text-base leading-relaxed max-w-2xl mb-6 italic">
        No exposures found for your monitored email — no fixes needed at the
        moment. However, we suggest following these best practices to keep your
        account protected.
      </p>

      {/* Bullet list */}
      <ul className="text-gray-400 text-sm md:text-base space-y-3 pl-6 list-disc">
        <li>Enable multi-factor authentication for your account.</li>
        <li>Use a unique, strong password (avoid reuse across sites).</li>
        <li>Regularly review account activity and login alerts.</li>
      </ul>
    </div>
  );
};

export default RecommendedActionsSection;
