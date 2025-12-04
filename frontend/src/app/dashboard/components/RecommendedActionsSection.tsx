// src/app/dashboard/components/RecommendedActionsSection.tsx
"use client";

import React from "react";

interface RecommendedActionsSectionProps {
  isBreached: boolean;
  totalBreaches: number;
}

const RecommendedActionsSection: React.FC<RecommendedActionsSectionProps> = ({
  isBreached,
  totalBreaches,
}) => {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7 mt-2">
      <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
        Recommended Actions
      </h2>

      {isBreached ? (
        <>
          {/* Breach detected - urgent actions */}
          <p className="text-sm md:text-base leading-relaxed max-w-2xl mb-6 italic text-[#fb7185]">
            Your email has been found in {totalBreaches}{" "}
            {totalBreaches === 1 ? "data breach" : "data breaches"}. Take
            immediate action to secure your accounts.
          </p>

          <ul className="text-gray-400 text-sm md:text-base space-y-3 pl-6 list-disc">
            <li>
              <span className="font-semibold text-[#fb7185]">Change your password immediately</span>{" "}
              for the affected service(s) and any accounts using the same password.
            </li>
            <li>
              <span className="font-semibold text-[#fbbf24]">Enable multi-factor authentication (2FA)</span>{" "}
              on all your important accounts, especially those related to the breached services.
            </li>
            <li>
              <span className="font-semibold text-[#fbbf24]">Review your account activity</span>{" "}
              for any suspicious login attempts or unauthorized access.
            </li>
            <li>
              <span className="font-semibold text-gray-300">Use a password manager</span>{" "}
              to generate and store unique, strong passwords for each account.
            </li>
            <li>
              <span className="font-semibold text-gray-300">Monitor your financial accounts</span>{" "}
              for any unauthorized transactions if payment information was exposed.
            </li>
            <li>
              Consider using a{" "}
              <span className="font-semibold text-gray-300">credit monitoring service</span>{" "}
              if sensitive personal information was compromised.
            </li>
          </ul>
        </>
      ) : (
        <>
          {/* No breaches - preventive actions */}
          <p className="text-sm md:text-base leading-relaxed max-w-2xl mb-6 italic">
            No exposures found for your monitored email — no fixes needed at the
            moment. However, we suggest following these best practices to keep your
            account protected.
          </p>

          <ul className="text-gray-400 text-sm md:text-base space-y-3 pl-6 list-disc">
            <li>Enable multi-factor authentication for your account.</li>
            <li>Use a unique, strong password (avoid reuse across sites).</li>
            <li>Regularly review account activity and login alerts.</li>
            <li>Keep your software and applications up to date.</li>
            <li>Be cautious of phishing emails and suspicious links.</li>
          </ul>
        </>
      )}
    </div>
  );
};

export default RecommendedActionsSection;
