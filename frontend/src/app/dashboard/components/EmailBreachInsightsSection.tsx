"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { getMonitoredEmails, MonitoredEmail } from "@/lib/api/emailApi";
import {
  getBreachAnalytics,
  BreachAnalyticsResponse,
} from "@/lib/api/breachApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

type BreachPoint = {
  year: number;
  count: number;
};

type EmailProfile = {
  id: string;
  label: string;
  email: string;
  riskScore: number;
  totalBreaches: number;
  latestIncident?: string;
  history: BreachPoint[];
};

interface EmailBreachInsightsSectionProps {
  breachData: BreachAnalyticsResponse | null;
  userEmail: string;
  onEmailChange?: (
    email: string,
    breachData: BreachAnalyticsResponse | null
  ) => void;
}

// Helper function to format latest incident
const formatLatestIncident = (
  breaches: BreachAnalyticsResponse["breaches"]
): string | undefined => {
  if (!breaches || breaches.length === 0) return undefined;

  const sortedBreaches = [...breaches].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const latest = sortedBreaches[0];
  if (!latest.date) return latest.name;

  const date = new Date(latest.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return `${latest.name} · ${formattedDate}`;
};

// Helper function to build year history from breach data
const buildYearHistory = (
  yearHistory: BreachAnalyticsResponse["yearHistory"] | undefined
): BreachPoint[] => {
  if (!yearHistory || yearHistory.length === 0) {
    // Return empty history for all years if no data
    const currentYear = new Date().getFullYear();
    const years: BreachPoint[] = [];
    for (let year = 2016; year <= currentYear; year++) {
      years.push({ year, count: 0 });
    }
    return years;
  }

  // Fill in missing years
  const currentYear = new Date().getFullYear();
  const yearMap = new Map(yearHistory.map((h) => [h.year, h.count]));
  const fullHistory: BreachPoint[] = [];

  for (let year = 2016; year <= currentYear; year++) {
    fullHistory.push({
      year,
      count: yearMap.get(year) || 0,
    });
  }

  return fullHistory;
};

const getRiskAccent = (score: number) => {
  if (score >= 75) {
    return {
      label: "High risk",
      accent: "#fb7185",
      subtle: "rgba(251, 113, 133, 0.2)",
    };
  }

  if (score >= 45) {
    return {
      label: "Elevated",
      accent: "#fbbf24",
      subtle: "rgba(251, 191, 36, 0.22)",
    };
  }

  return {
    label: "Stable",
    accent: "#34d399",
    subtle: "rgba(52, 211, 153, 0.2)",
  };
};

const EmailBreachInsightsSection: React.FC<EmailBreachInsightsSectionProps> = ({
  breachData,
  userEmail,
  onEmailChange,
}) => {
  const { data: session } = useSession();
  const [monitoredEmails, setMonitoredEmails] = useState<MonitoredEmail[]>([]);
  // Initialize selected email from sessionStorage if available, otherwise use userEmail
  const [selectedEmail, setSelectedEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedEmail = sessionStorage.getItem("selectedEmail");
      if (savedEmail) {
        return savedEmail;
      }
    }
    return userEmail;
  });
  const [selectedBreachData, setSelectedBreachData] =
    useState<BreachAnalyticsResponse | null>(breachData);
  const [isLoading, setIsLoading] = useState(false);

  // Load monitored emails from API
  useEffect(() => {
    let isMounted = true;

    const loadEmails = async () => {
      if (!session?.user?.email) return;

      try {
        const userId = session.user.email;
        const emails = await getMonitoredEmails(userId);
        if (isMounted) {
          setMonitoredEmails(emails);
        }

        // Restore selected email from sessionStorage if available (when coming back from details page)
        const savedSelectedEmail = sessionStorage.getItem("selectedEmail");

        // Set selected email - prioritize saved email, then user email, then first in list
        setSelectedEmail((currentSelected) => {
          // Check if current selected email still exists in the monitored emails list
          const currentEmailExists = currentSelected
            ? emails.find(
                (e) => e.email.toLowerCase() === currentSelected.toLowerCase()
              )
            : null;

          // If current selected email doesn't exist anymore (was deleted), reset it
          if (currentSelected && !currentEmailExists) {
            // Clear stale breach data
            setSelectedBreachData(null);
            onEmailChange?.(userEmail, null);
            // Clear sessionStorage for deleted email
            sessionStorage.removeItem("selectedEmail");
          }

          // If we have a saved email and it exists in the monitored emails, use it
          if (savedSelectedEmail) {
            const savedEmailExists = emails.find(
              (e) => e.email.toLowerCase() === savedSelectedEmail.toLowerCase()
            );
            if (savedEmailExists) {
              return savedEmailExists.email;
            }
          }

          // If current selected email exists, keep it
          if (currentEmailExists) {
            return currentEmailExists.email;
          }

          // Default to user email or first in list
          if (emails.length > 0) {
            const userEmailExists = emails.find(
              (e) => e.email.toLowerCase() === userEmail.toLowerCase()
            );
            return userEmailExists ? userEmailExists.email : emails[0].email;
          }
          return userEmail;
        });
      } catch (error) {
        console.error("Error loading monitored emails:", error);
        // Don't update state if component is unmounted
      }
    };

    loadEmails();

    // Refresh when page becomes visible (user comes back from manage emails page)
    // Debounce to prevent rapid successive calls
    let visibilityTimeoutId: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Clear any pending timeout
        if (visibilityTimeoutId) {
          clearTimeout(visibilityTimeoutId);
        }
        // Debounce the reload by 1 second
        visibilityTimeoutId = setTimeout(() => {
          if (isMounted) {
            loadEmails();
          }
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibilityTimeoutId) clearTimeout(visibilityTimeoutId);
    };
  }, [session, userEmail, onEmailChange]);

  // Store selected email in sessionStorage when it changes
  useEffect(() => {
    if (selectedEmail) {
      sessionStorage.setItem("selectedEmail", selectedEmail);
    }
  }, [selectedEmail]);

  // Fetch breach data when email is selected
  useEffect(() => {
    const fetchBreachData = async () => {
      if (!selectedEmail) return;

      // Verify that the selected email still exists in monitored emails
      const emailData = monitoredEmails.find(
        (e) => e.email.toLowerCase() === selectedEmail.toLowerCase()
      );

      // If email doesn't exist in monitored list, clear data and return
      if (!emailData) {
        setSelectedBreachData(null);
        onEmailChange?.(selectedEmail, null);
        return;
      }

      // First check if we have cached data from monitored emails
      if (emailData?.breachData) {
        setSelectedBreachData(emailData.breachData);
        // Notify parent component
        onEmailChange?.(selectedEmail, emailData.breachData);
        return;
      }

      // If no cached data, fetch from API
      setIsLoading(true);
      try {
        const data = await getBreachAnalytics(selectedEmail);
        setSelectedBreachData(data);
        // Notify parent component of the change
        onEmailChange?.(selectedEmail, data);
      } catch (error) {
        console.error("Error fetching breach data for email:", error);
        // Set empty data on error
        const emptyData = {
          success: true,
          email: selectedEmail,
          riskScore: 0,
          breachCount: 0,
          breaches: [],
          yearHistory: [],
        };
        setSelectedBreachData(emptyData);
        // Notify parent component even on error
        onEmailChange?.(selectedEmail, emptyData);

        // For 429 errors, the retry logic in fetchWithRetry will handle it
        // But we can log a helpful message
        if (error instanceof Error && error.message.includes("429")) {
          console.warn(
            "Rate limit hit. Retry logic will handle this automatically."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have monitored emails loaded or if it's a manual selection
    if (monitoredEmails.length > 0 || selectedEmail) {
      fetchBreachData();
    }
  }, [selectedEmail, monitoredEmails, onEmailChange]);

  // Build email profiles from monitored emails
  const emailProfiles: EmailProfile[] = React.useMemo(() => {
    if (monitoredEmails.length === 0) {
      return [
        {
          id: userEmail,
          label: "",
          email: userEmail,
          riskScore: 0,
          totalBreaches: 0,
          history: buildYearHistory([]),
        },
      ];
    }

    return monitoredEmails.map((email) => {
      const breachData = email.breachData;
      if (!breachData) {
        return {
          id: email.id,
          label: "",
          email: email.email,
          riskScore: 0,
          totalBreaches: 0,
          history: buildYearHistory([]),
        };
      }

      const history = buildYearHistory(breachData.yearHistory);
      const latestIncident = formatLatestIncident(breachData.breaches);

      return {
        id: email.id,
        label: "",
        email: email.email,
        riskScore: breachData.riskScore || 0,
        totalBreaches: breachData.breachCount || 0,
        latestIncident,
        history,
      };
    });
  }, [monitoredEmails, userEmail]);

  // Find selected profile
  const selectedProfile =
    emailProfiles.find((profile) => profile.email === selectedEmail) ??
    emailProfiles[0];

  // Update selected profile based on selectedBreachData
  const currentProfile: EmailProfile = React.useMemo(() => {
    if (!selectedBreachData) {
      return {
        id: selectedEmail,
        label: "",
        email: selectedEmail,
        riskScore: 0,
        totalBreaches: 0,
        history: buildYearHistory([]),
      };
    }

    const history = buildYearHistory(selectedBreachData.yearHistory);
    const latestIncident = formatLatestIncident(selectedBreachData.breaches);

    return {
      id: selectedEmail,
      label: "",
      email: selectedBreachData.email || selectedEmail,
      riskScore: selectedBreachData.riskScore || 0,
      totalBreaches: selectedBreachData.breachCount || 0,
      latestIncident,
      history,
    };
  }, [selectedBreachData, selectedEmail]);

  const chartData = useMemo<ChartData<"line">>(() => {
    return {
      labels: currentProfile.history.map((point) => point.year.toString()),
      datasets: [
        {
          label: "Breaches detected",
          data: currentProfile.history.map((point) => point.count),
          borderColor: "#fbbf24",
          backgroundColor: "rgba(251, 191, 36, 0.08)",
          borderWidth: 3,
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointBorderWidth: 2,
          pointBackgroundColor: "#fde68a",
          pointBorderColor: "#1c1917",
        },
      ],
    };
  }, [currentProfile]);

  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#050505",
          titleColor: "#f4f4f5",
          bodyColor: "#d4d4d8",
          borderColor: "rgba(212, 175, 55, 0.35)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#a1a1aa",
          },
          grid: {
            color: "rgba(161, 161, 170, 0.15)",
          },
        },
        y: {
          ticks: {
            color: "#a1a1aa",
            callback: (value) => `${value}`,
          },
          grid: {
            color: "rgba(161, 161, 170, 0.12)",
          },
          beginAtZero: true,
          suggestedMax: 20,
        },
      },
    }),
    []
  );

  const riskTone = getRiskAccent(currentProfile.riskScore);

  return (
    <section className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#060606] to-[#020202] px-6 py-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
            Exposure intelligence
          </h2>
          <p className="text-lg md:text-2xl font-semibold text-gray-50">
            Email breach insights
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Switch between monitored inboxes to understand exposure trends and
            live risk scoring.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-[#bfa76f]/70">
            Monitored email
          </label>
          <div className="relative">
            <select
              value={selectedEmail}
              onChange={(event) => {
                const newEmail = event.target.value;
                // Verify the email exists in monitored emails before setting
                const emailData = monitoredEmails.find(
                  (e) => e.email.toLowerCase() === newEmail.toLowerCase()
                );

                if (emailData) {
                  setSelectedEmail(newEmail);
                  // Immediately notify parent of selection change if we have cached data
                  if (emailData.breachData) {
                    onEmailChange?.(newEmail, emailData.breachData);
                  } else {
                    // Clear data if email exists but has no breach data yet
                    onEmailChange?.(newEmail, null);
                  }
                } else {
                  // If email doesn't exist, reset to a valid email
                  const validEmail =
                    monitoredEmails.length > 0
                      ? monitoredEmails[0].email
                      : userEmail;
                  setSelectedEmail(validEmail);
                  onEmailChange?.(validEmail, null);
                }
              }}
              className="appearance-none w-full rounded-xl border border-[#D4AF37]/40 bg-[#050505] pl-4 pr-12 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              {emailProfiles.map((profile) => (
                <option key={profile.id} value={profile.email}>
                  {profile.email}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bfa76f]" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-[#D4AF37]/15 bg-gradient-to-b from-[#080808] to-[#020202] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
              Yearly volume
            </p>
            <span className="text-xs text-gray-500">
              10-year exposure snapshot
            </span>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/15 bg-gradient-to-b from-[#080808] to-[#030303] p-5 flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
              Risk score
            </p>
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="relative h-48 w-48">
                {/* Outer ring with animated progress */}
                <svg
                  className="absolute inset-0 transform -rotate-90"
                  viewBox="0 0 200 200"
                >
                  {/* Background ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.1)"
                    strokeWidth="8"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={riskTone.accent}
                    strokeWidth="8"
                    strokeDasharray={`${
                      (currentProfile.riskScore / 100) * 565.48
                    } 565.48`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 8px ${riskTone.accent}40)`,
                    }}
                  />
                </svg>

                {/* Inner background circle */}
                <div
                  className="absolute inset-4 rounded-full border border-[#1f1f1f] bg-gradient-to-br from-[#0a0a0a] to-[#050505]"
                  style={{
                    boxShadow:
                      "inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.1)",
                  }}
                >
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-5xl font-bold transition-colors duration-300"
                      style={{ color: riskTone.accent }}
                    >
                      {currentProfile.riskScore}
                    </span>
                    <span
                      className="text-xs uppercase tracking-wider mt-2 font-semibold px-3 py-1 rounded-full"
                      style={{
                        color: riskTone.accent,
                        backgroundColor: `${riskTone.accent}15`,
                        border: `1px solid ${riskTone.accent}30`,
                      }}
                    >
                      {riskTone.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#ffffff0d] bg-[#050505]/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Known exposures
              </p>
              <p className="text-3xl font-semibold text-gray-50 mt-2">
                {currentProfile.totalBreaches}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Updated hourly across trusted sources.
              </p>
            </div>
            <div className="rounded-xl border border-[#ffffff0d] bg-[#050505]/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Latest signal
              </p>
              <p className="text-sm text-gray-300 mt-2">
                {currentProfile.latestIncident ?? "No breach detected"}
              </p>
              <div
                className="mt-3 h-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${riskTone.subtle}, rgba(255,255,255,0.08))`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailBreachInsightsSection;
