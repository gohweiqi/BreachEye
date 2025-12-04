// src/app/dashboard/components/BreachHistory.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BreachAnalyticsResponse } from "@/lib/api/breachApi";

interface BreachHistorySectionProps {
  breaches: BreachAnalyticsResponse["breaches"];
}

const BreachHistorySection: React.FC<BreachHistorySectionProps> = ({
  breaches,
}) => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const hasBreaches = breaches && breaches.length > 0;

  // Show only 5 breaches initially
  const displayedBreaches = showAll ? breaches : breaches?.slice(0, 5) || [];
  const hasMore = breaches && breaches.length > 5;

  // Extract date from description if date field is missing
  const extractDateFromDescription = (description?: string): string | null => {
    if (!description) return null;

    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    // Pattern 1: "in October 2025" or "on October 2025"
    const monthYearPattern = /(?:in|on|during)\s+([A-Za-z]+)\s+(\d{4})/i;
    const monthYearMatch = description.match(monthYearPattern);
    if (monthYearMatch) {
      const monthName = monthYearMatch[1].toLowerCase();
      const year = parseInt(monthYearMatch[2]);
      const monthIndex = monthNames.findIndex((m) => m === monthName);
      if (monthIndex !== -1 && year >= 2000 && year <= 2100) {
        try {
          const date = new Date(year, monthIndex, 1);
          return date.toISOString();
        } catch {}
      }
    }

    // Pattern 2: ISO date format "2024-02-01"
    const isoDatePattern = /(\d{4}-\d{2}-\d{2})/;
    const isoDateMatch = description.match(isoDatePattern);
    if (isoDateMatch) {
      try {
        const date = new Date(isoDateMatch[1]);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch {}
    }

    // Pattern 3: Just year "in 2025"
    const yearPattern = /(?:in|on|during)\s+(\d{4})\b/;
    const yearMatch = description.match(yearPattern);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 2000 && year <= 2100) {
        try {
          const date = new Date(year, 0, 1);
          return date.toISOString();
        } catch {}
      }
    }

    return null;
  };

  // Format date for display
  const formatDate = (dateString?: string, description?: string): string => {
    // First try to use the provided date
    if (dateString && dateString.trim() !== "" && dateString !== "Unknown") {
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      } catch {
        // Fall through to description extraction
      }
    }

    // If date is not available, try to extract from description
    const extractedDate = extractDateFromDescription(description);
    if (extractedDate) {
      try {
        const date = new Date(extractedDate);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      } catch {}
    }

    return "Date not available";
  };

  // Format exposed data types
  const formatExposedData = (exposedData?: string[]): string => {
    if (!exposedData || exposedData.length === 0) {
      return "Data types not specified";
    }
    // Filter out empty strings and format
    const validData = exposedData.filter((d) => d && d.trim() !== "");
    if (validData.length === 0) {
      return "Data types not specified";
    }
    return validData.join(", ");
  };

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7 mt-2">
      <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
        Breach History
      </h2>

      {hasBreaches ? (
        <>
          {/* Table header - simple style without borders */}
          <div className="hidden md:grid grid-cols-3 text-xs uppercase tracking-wide text-gray-400 pb-2 mb-2">
            <span className="text-left">Title</span>
            <span className="text-left">Date Occurred</span>
            <span className="text-left">Compromised Data</span>
          </div>

          {/* Breach list - simple table style without borders */}
          <div className="space-y-0">
            {displayedBreaches.map(
              (
                breach: BreachAnalyticsResponse["breaches"][0],
                index: number
              ) => (
                <button
                  key={index}
                  onClick={() => {
                    // Store the currently selected email before navigating
                    // This will be restored when user comes back to dashboard
                    const currentSelectedEmail =
                      sessionStorage.getItem("selectedEmail");
                    if (currentSelectedEmail) {
                      // Keep the existing selected email
                    } else {
                      // Store the email from the breach data if available
                      const breachEmail = (breach as any).email;
                      if (breachEmail) {
                        sessionStorage.setItem("selectedEmail", breachEmail);
                      }
                    }

                    // Navigate to breach details page
                    // Store breach data in sessionStorage for details page
                    sessionStorage.setItem(
                      "selectedBreach",
                      JSON.stringify(breach)
                    );
                    router.push(
                      `/dashboard/breach-details?breach=${encodeURIComponent(
                        breach.name || "unknown"
                      )}`
                    );
                  }}
                  className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 py-3 hover:bg-[#0b0b0b]/40 transition cursor-pointer text-left border-b border-gray-800/30 last:border-b-0"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-100 mb-1">
                      {breach.name || "Unknown Breach"}
                    </p>
                    {breach.domain && (
                      <p className="text-xs text-gray-500">{breach.domain}</p>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-300">
                      {formatDate(breach.date, breach.description)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-300">
                      {formatExposedData(breach.exposedData)}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>

          {/* See More button */}
          {hasMore && !showAll && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#f3d46f] transition"
              >
                See More ({breaches.length - 5} more)
              </button>
            </div>
          )}

          {/* Show Less button */}
          {hasMore && showAll && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(false)}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
              >
                Show Less
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
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
            Your breach history will appear here if this address is ever found
            in a known data breach.
          </p>
        </div>
      )}
    </div>
  );
};

export default BreachHistorySection;
