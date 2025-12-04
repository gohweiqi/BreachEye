// src/app/dashboard/components/BreachSummarySection.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { MonitoredEmail } from "@/lib/api/emailApi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface BreachSummarySectionProps {
  totalExposures: number;
  isBreached: boolean;
  userEmail: string;
  monitoredEmails: MonitoredEmail[];
}

const BreachSummarySection: React.FC<BreachSummarySectionProps> = ({
  totalExposures,
  isBreached,
  userEmail,
  monitoredEmails,
}) => {
  // Prepare data for pie chart - only emails with breaches
  const breachBreakdown = useMemo(() => {
    const emailsWithBreaches = monitoredEmails.filter(
      (email) => email.breaches > 0
    );

    if (emailsWithBreaches.length === 0) return null;

    const colors = [
      "#D4AF37",
      "#f6e39a",
      "#B99332",
      "#E5C97E",
      "#fbbf24",
      "#fde68a",
    ];

    return {
      labels: emailsWithBreaches.map((email) => {
        // Truncate long emails for display
        const displayEmail =
          email.email.length > 20
            ? email.email.substring(0, 17) + "..."
            : email.email;
        return `${displayEmail} (${email.breaches})`;
      }),
      data: emailsWithBreaches.map((email) => email.breaches),
      colors: emailsWithBreaches.map(
        (_, index) => colors[index % colors.length]
      ),
      emails: emailsWithBreaches.map((email) => email.email),
    };
  }, [monitoredEmails]);

  const pieChartData: ChartData<"pie"> | null = useMemo(() => {
    if (!breachBreakdown) return null;

    return {
      labels: breachBreakdown.labels,
      datasets: [
        {
          data: breachBreakdown.data,
          backgroundColor: breachBreakdown.colors.map((c) => `${c}80`),
          borderColor: breachBreakdown.colors,
          borderWidth: 2,
        },
      ],
    };
  }, [breachBreakdown]);
  return (
    <div className="relative rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7 overflow-hidden">
      {/* Animated wavy background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden">
        <div className="absolute inset-0">
          <svg
            className="breacheye-wave-layer wave-layer-one"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="breachWaveGradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#B99332" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <path
              fill="url(#breachWaveGradient1)"
              d="M0,192L80,181.3C160,171,320,149,480,133.3C640,117,800,107,960,128C1120,149,1280,203,1360,234.7L1440,266.7L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>

          <svg
            className="breacheye-wave-layer wave-layer-two"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="breachWaveGradient2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#f6e39a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#breachWaveGradient2)"
              d="M0,256L60,234.7C120,213,240,171,360,154.7C480,139,600,149,720,170.7C840,192,960,224,1080,229.3C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>

          <svg
            className="breacheye-wave-layer wave-layer-three"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="breachWaveGradient3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#fdf3c4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#E5C97E" stopOpacity="0.07" />
              </linearGradient>
            </defs>
            <path
              fill="url(#breachWaveGradient3)"
              d="M0,288L90,272C180,256,360,224,540,197.3C720,171,900,149,1080,144C1260,139,1440,149,1440,149L1440,320L1260,320C1080,320,900,320,720,320C540,320,360,320,180,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row items-center md:items-stretch gap-8 z-10">
        {/* Left: text summary */}
        <div className="flex-1">
          {/* BREACH SUMMARY — slightly tighter but not squeezed */}
          <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
            Breach Summary
          </h2>

          {/* Dynamic content based on breach status */}
          {isBreached ? (
            <>
              <p className="text-lg md:text-2xl font-semibold text-gray-50 mb-4 mt-6">
                {totalExposures}{" "}
                {totalExposures === 1 ? "exposure" : "exposures"} found
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                We found your monitored email addresses in {totalExposures}{" "}
                {totalExposures === 1
                  ? "known data breach"
                  : "known data breaches"}
                . Review the details below and take recommended actions to
                secure your account.
              </p>
              {breachBreakdown && breachBreakdown.emails.length > 1 && (
                <p className="text-xs text-gray-500 mt-2">
                  Breaches detected across {breachBreakdown.emails.length} email
                  {breachBreakdown.emails.length > 1 ? "s" : ""}. See breakdown
                  in chart.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-lg md:text-2xl font-semibold text-gray-50 mb-4 mt-6">
                No exposures found
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                Great news! We checked your monitored email address against
                known breach sources and found{" "}
                <span className="text-[#7ee27f] font-semibold">
                  no active leaks
                </span>
                . BreachEye will keep watching and alert you if your email
                appears in a future breach.
              </p>
            </>
          )}

          <Link
            href="/settings/manageEmailAccounts"
            className="mt-5 inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#f3d46f] transition"
          >
            Monitor more emails
          </Link>
        </div>

        {/* Right: donut visual or pie chart */}
        <div className="flex flex-col items-center justify-center w-full md:w-64">
          {pieChartData &&
          breachBreakdown &&
          breachBreakdown.emails.length > 1 ? (
            // Show pie chart if multiple emails have breaches
            <div className="w-full max-w-[200px]">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#a1a1aa",
                        font: { size: 10 },
                        padding: 8,
                      },
                    },
                    tooltip: {
                      backgroundColor: "#050505",
                      titleColor: "#f4f4f5",
                      bodyColor: "#d4d4d8",
                      borderColor: "rgba(212, 175, 55, 0.35)",
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => {
                          const label =
                            breachBreakdown.emails[context.dataIndex];
                          const value = context.parsed;
                          return `${label}: ${value} breach${
                            value !== 1 ? "es" : ""
                          }`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            // Show donut chart for single email or no breakdown
            <div className="relative h-40 w-40 md:h-48 md:w-48 flex items-center justify-center">
              {/* Outer gold ring */}
              <div
                className="h-full w-full rounded-full opacity-90 shadow-[0_0_24px_rgba(212,175,55,0.45)]"
                style={{
                  background:
                    "conic-gradient(from 140deg, #D4AF37, #f6e39a, #B99332, #D4AF37)",
                }}
              />

              {/* Inner circle */}
              <div className="absolute h-28 w-28 md:h-32 md:w-32 rounded-full bg-[#050505] border border-[#D4AF37]/40 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-gray-50">
                  {totalExposures}
                </span>
                <span className="text-xs uppercase tracking-wide text-gray-400 mt-1">
                  Exposures
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreachSummarySection;
