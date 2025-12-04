"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Sidebar from "../components/Sidebar";
import { BreachAnalyticsResponse } from "@/lib/api/breachApi";

interface BreachDetail {
  name?: string;
  domain?: string;
  date?: string;
  exposedData?: string[];
  exposedRecords?: number;
  description?: string;
  industry?: string;
  passwordRisk?: string;
  verified?: boolean;
  logo?: string;
  referenceURL?: string;
  searchable?: boolean;
  sensitive?: boolean;
}

const BreachDetailsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [breach, setBreach] = useState<BreachDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get breach data from sessionStorage
    const storedBreach = sessionStorage.getItem("selectedBreach");
    if (storedBreach) {
      try {
        const breachData = JSON.parse(storedBreach);
        setBreach(breachData);
      } catch (error) {
        console.error("Error parsing breach data:", error);
      }
    }
    setIsLoading(false);
  }, []);

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

    // Pattern 2: "in early/mid/late October 2015"
    const earlyMonthYearPattern =
      /(?:in|on|during)\s+(early|mid|late)\s+([A-Za-z]+)\s+(\d{4})/i;
    const earlyMonthYearMatch = description.match(earlyMonthYearPattern);
    if (earlyMonthYearMatch) {
      const monthName = earlyMonthYearMatch[2].toLowerCase();
      const year = parseInt(earlyMonthYearMatch[3]);
      const monthIndex = monthNames.findIndex((m) => m === monthName);
      if (monthIndex !== -1 && year >= 2000 && year <= 2100) {
        try {
          const day =
            earlyMonthYearMatch[1].toLowerCase() === "early"
              ? 1
              : earlyMonthYearMatch[1].toLowerCase() === "mid"
              ? 15
              : 28;
          const date = new Date(year, monthIndex, day);
          return date.toISOString();
        } catch {}
      }
    }

    // Pattern 3: ISO date format "2024-02-01"
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

    // Pattern 4: "October 1, 2025" or "October 1 2025"
    const fullDatePattern = /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i;
    const fullDateMatch = description.match(fullDatePattern);
    if (fullDateMatch) {
      const monthName = fullDateMatch[1].toLowerCase();
      const day = parseInt(fullDateMatch[2]);
      const year = parseInt(fullDateMatch[3]);
      const monthIndex = monthNames.findIndex((m) => m === monthName);
      if (
        monthIndex !== -1 &&
        day >= 1 &&
        day <= 31 &&
        year >= 2000 &&
        year <= 2100
      ) {
        try {
          const date = new Date(year, monthIndex, day);
          return date.toISOString();
        } catch {}
      }
    }

    // Pattern 5: Just year "in 2025"
    const yearPattern = /(?:in|on|during)\s+(\d{4})\b/;
    const yearMatch = description.match(yearPattern);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 2000 && year <= 2100) {
        try {
          const date = new Date(year, 0, 1); // January 1st of that year
          return date.toISOString();
        } catch {}
      }
    }

    return null;
  };

  const formatDate = (dateString?: string, description?: string): string => {
    // First try to use the provided date
    if (dateString && dateString.trim() !== "") {
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

  const formatExposedData = (exposedData?: string[]): string[] => {
    if (!exposedData || exposedData.length === 0) return [];
    return exposedData.filter((d) => d && d.trim() !== "");
  };

  const formatPasswordRisk = (risk?: string): string => {
    if (!risk) return "Unknown";
    const riskMap: Record<string, string> = {
      plaintext: "Plain Text",
      easytocrack: "Easy to Crack",
      stronghash: "Strong Hash",
      unknown: "Unknown",
    };
    return riskMap[risk.toLowerCase()] || risk;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
        <div className="w-full max-w-5xl mx-auto mb-10">
          <Navbar />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading breach details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!breach) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
        <div className="w-full max-w-5xl mx-auto mb-10">
          <Navbar />
        </div>
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="mt-8 flex gap-6 items-stretch">
            <Sidebar />
            <div className="flex-1 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <p className="text-red-400">Breach details not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#f3d46f] transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
      {/* Navbar Section */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <Navbar />
      </div>

      {/* Content Section */}
      <div className="w-full max-w-screen-xl mx-auto">
        <div className="mt-8 flex gap-6 items-stretch">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6">
            {/* Back Button */}
            <button
              onClick={() => {
                // Preserve the selected email when going back
                // The selected email should already be in sessionStorage from EmailBreachInsightsSection
                router.push("/dashboard");
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors self-start"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            {/* Breach Details Card */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              {/* Header with Logo and Title */}
              <div className="flex items-start gap-4 mb-6">
                {breach.logo && (
                  <img
                    src={breach.logo}
                    alt={`${breach.name} logo`}
                    className="w-16 h-16 rounded-lg object-contain border border-[#D4AF37]/20 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-2">
                    {breach.name || "Unknown Breach"}
                  </h1>
                  {breach.verified !== undefined && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        breach.verified
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                      }`}
                    >
                      {breach.verified ? "✓ Verified" : "Unverified"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Description - What Happened */}
                {breach.description && (
                  <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-5">
                    <p className="text-sm uppercase tracking-wide text-[#bfa76f] mb-3 font-semibold">
                      What Happened
                    </p>
                    <p className="text-base text-gray-300 leading-relaxed">
                      {breach.description}
                    </p>
                  </div>
                )}

                {/* Key Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Occurred */}
                  <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Date Occurred
                    </p>
                    <p className="text-lg font-semibold text-gray-100">
                      {formatDate(breach.date, breach.description)}
                    </p>
                  </div>

                  {/* Domain */}
                  {breach.domain && (
                    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Affected Domain
                      </p>
                      <p className="text-lg font-semibold text-gray-100">
                        {breach.domain}
                      </p>
                    </div>
                  )}

                  {/* Affected Accounts (Number of Records) */}
                  {breach.exposedRecords && (
                    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Affected Accounts
                      </p>
                      <p className="text-lg font-semibold text-red-400">
                        {breach.exposedRecords.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Industry */}
                  {breach.industry && (
                    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Industry
                      </p>
                      <p className="text-lg font-semibold text-gray-100">
                        {breach.industry}
                      </p>
                    </div>
                  )}
                </div>

                {/* Data Types Exposed */}
                {breach.exposedData && breach.exposedData.length > 0 && (
                  <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-5">
                    <p className="text-sm uppercase tracking-wide text-[#bfa76f] mb-4 font-semibold">
                      Data Types Exposed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formatExposedData(breach.exposedData).map(
                        (dataType, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/40"
                          >
                            {dataType}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password Risk */}
                  {breach.passwordRisk && (
                    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Password/Hash Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          breach.passwordRisk.toLowerCase() === "plaintext" ||
                          breach.passwordRisk.toLowerCase() === "easytocrack"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : breach.passwordRisk.toLowerCase() === "stronghash"
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        }`}
                      >
                        {formatPasswordRisk(breach.passwordRisk)}
                      </span>
                    </div>
                  )}

                  {/* Searchable Status */}
                  {breach.searchable !== undefined && (
                    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Searchable
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          breach.searchable
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                        }`}
                      >
                        {breach.searchable ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reference Links */}
                {breach.referenceURL && (
                  <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-3 font-semibold">
                      Reference link(s):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {breach.searchable && (
                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/40">
                          Searchable
                        </span>
                      )}
                      {breach.verified && (
                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/40">
                          Verified
                        </span>
                      )}
                      <span className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/40">
                        Data Breach
                      </span>
                    </div>
                    <a
                      href={breach.referenceURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#f3d46f] transition underline"
                    >
                      <span>{breach.referenceURL}</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BreachDetailsPage;
