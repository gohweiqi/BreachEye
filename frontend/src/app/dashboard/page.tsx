// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../app/dashboard/components/Sidebar";
import BreachSummarySection from "./components/BreachSummarySection";
import EmailBreachInsightsSection from "./components/EmailBreachInsightsSection";
import BreachHistorySection from "./components/BreachHistorySection";
import RecommendedActionsSection from "./components/RecommendedActionsSection";
import {
  getBreachAnalytics,
  BreachAnalyticsResponse,
} from "@/lib/api/breachApi";
import { getMonitoredEmails, MonitoredEmail } from "@/lib/api/emailApi";

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [breachData, setBreachData] = useState<BreachAnalyticsResponse | null>(
    null
  );
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [monitoredEmails, setMonitoredEmails] = useState<MonitoredEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all monitored emails to calculate total breaches
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadMonitoredEmails = async () => {
      if (status === "loading" || status === "unauthenticated") return;

      const userEmail = session?.user?.email;
      if (!userEmail) return;

      try {
        const emails = await getMonitoredEmails(userEmail);
        if (isMounted) {
          setMonitoredEmails(emails);
        }
      } catch (err) {
        console.error("Error loading monitored emails:", err);
        // Don't update state if component is unmounted
        if (isMounted && err instanceof Error && err.message.includes("429")) {
          // Retry after a delay for rate limit errors
          timeoutId = setTimeout(() => {
            if (isMounted) {
              loadMonitoredEmails();
            }
          }, 5000);
        }
      }
    };

    loadMonitoredEmails();

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
            loadMonitoredEmails();
          }
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
      if (visibilityTimeoutId) clearTimeout(visibilityTimeoutId);
    };
  }, [session, status]);

  // Fetch initial breach data for user's email
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchBreachData = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const userEmail = session?.user?.email;
      if (!userEmail) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }
        const data = await getBreachAnalytics(userEmail);
        if (isMounted) {
          setBreachData(data);
          setSelectedEmail(userEmail);
        }
      } catch (err) {
        console.error("Error fetching breach data:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch breach data"
          );
          // Retry after a delay for rate limit errors
          if (err instanceof Error && err.message.includes("429")) {
            timeoutId = setTimeout(() => {
              if (isMounted) {
                fetchBreachData();
              }
            }, 5000);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBreachData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session, status]);

  // Handle email selection change from EmailBreachInsightsSection
  const handleEmailChange = (
    email: string,
    data: BreachAnalyticsResponse | null
  ) => {
    setSelectedEmail(email);
    setBreachData(data);
  };

  // Calculate total exposures across ALL monitored emails
  const totalExposures = React.useMemo(() => {
    return monitoredEmails.reduce((total, email) => {
      return total + (email.breaches || 0);
    }, 0);
  }, [monitoredEmails]);

  const isBreached = totalExposures > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
      {/* Navbar Section*/}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <Navbar />
      </div>

      {/* Dashboard Section*/}
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Sidebar + Content */}
        <div className="mt-8 flex gap-6 items-stretch">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
                  <p className="mt-4 text-gray-400">Loading breach data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
                <p className="text-red-400">Error: {error}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please try refreshing the page or check your connection.
                </p>
              </div>
            ) : (
              <>
                <BreachSummarySection
                  totalExposures={totalExposures}
                  isBreached={isBreached}
                  userEmail={session?.user?.email || ""}
                  monitoredEmails={monitoredEmails}
                />
                <EmailBreachInsightsSection
                  breachData={breachData}
                  userEmail={session?.user?.email || ""}
                  onEmailChange={handleEmailChange}
                />
                <BreachHistorySection breaches={breachData?.breaches || []} />
                <RecommendedActionsSection
                  isBreached={isBreached}
                  totalBreaches={totalExposures}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
