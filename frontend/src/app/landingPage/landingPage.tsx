"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import EmailCheckSection from "../../app/landingPage/components/EmailCheckSection";
import StatisticsSection from "../../app/landingPage/components/StatisticsSection";
import AboutUsSection from "../../app/landingPage/components/AboutUsSection";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAccountDeleted, setShowAccountDeleted] = useState(false);

  useEffect(() => {
    const deleted = searchParams.get("accountDeleted");
    if (deleted === "true") {
      setShowAccountDeleted(true);
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 flex flex-col items-center justify-start px-6 py-10">
      {showAccountDeleted && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-b from-[#050505] to-[#020202] border border-green-500/50 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-50">
                  Account deleted successfully!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Thanks for using Email Breach Detection System. All your data
                  has been removed from our system.
                </p>
              </div>
              <button
                onClick={() => setShowAccountDeleted(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mb-10">
        <Navbar />
      </div>

      <EmailCheckSection />

      <StatisticsSection />

      <AboutUsSection />
    </main>
  );
}
