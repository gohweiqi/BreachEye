"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../dashboard/components/Sidebar";
import { getMonthlySummary, MonthlySummary } from "@/lib/api/monthlySummaryApi";
import {
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

const MonthlySummaryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month/Year selection state
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  // Generate available months (past 12 months)
  const getAvailableMonths = () => {
    const months: Array<{ year: number; month: number; label: string }> = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Generate past 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      months.push({ year, month, label: monthName });
    }

    return months;
  };

  const availableMonths = getAvailableMonths();

  useEffect(() => {
    const loadSummary = async () => {
      if (status === "loading" || !session?.user?.email) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getMonthlySummary(
          session.user.email,
          selectedYear,
          selectedMonth
        );
        setSummary(response.summary);
      } catch (err) {
        console.error("Error loading monthly summary:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load monthly summary"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [session, status, selectedYear, selectedMonth]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getSelectedMonthLabel = () => {
    const selected = availableMonths.find(
      (m) => m.year === selectedYear && m.month === selectedMonth
    );
    return (
      selected?.label ||
      `${new Date(selectedYear, selectedMonth - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`
    );
  };

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const isNewUser = summary?.totalEmails === 0 && !isLoading;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
      {/* Navbar Section */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <Navbar />
      </div>

      {/* Monthly Summary Section */}
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Sidebar + Content */}
        <div className="mt-8 flex gap-6 items-stretch">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6">
            {/* Header with Month Selector */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
                    Monthly Summary
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base mt-1">
                    Overview of your email security status
                  </p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-400 whitespace-nowrap">
                    Select Month:
                  </label>
                  <div className="relative">
                    <select
                      value={`${selectedYear}-${selectedMonth}`}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="appearance-none bg-[#0b0b0b] border border-[#D4AF37]/30 rounded-lg px-4 py-2 pr-10 text-gray-200 focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
                    >
                      {availableMonths.map((m) => (
                        <option
                          key={`${m.year}-${m.month}`}
                          value={`${m.year}-${m.month}`}
                        >
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-12">
                <div className="flex items-center justify-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
                  <p className="ml-4 text-gray-400">Loading summary...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-7">
                <p className="text-red-400">Error: {error}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please try refreshing the page.
                </p>
              </div>
            )}

            {/* New User / No Data State */}
            {isNewUser && !isLoading && (
              <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-12">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-200 mb-2">
                    No Data Available
                  </h2>
                  <p className="text-gray-400 mb-4 max-w-md mx-auto">
                    You don't have any monitored emails yet, or there's no data
                    for {getSelectedMonthLabel()}.
                  </p>
                  <p className="text-sm text-gray-500">
                    Start monitoring emails to see your monthly security summary
                    here.
                  </p>
                </div>
              </div>
            )}

            {/* Summary Content */}
            {summary && !isLoading && summary.totalEmails > 0 && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Emails */}
                  <div className="rounded-xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-[#D4AF37]" />
                      <h3 className="text-sm text-gray-400 uppercase tracking-wide">
                        Total Emails
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-[#D4AF37]">
                      {summary.totalEmails}
                    </p>
                  </div>

                  {/* Safe Emails */}
                  <div className="rounded-xl border border-green-500/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <h3 className="text-sm text-gray-400 uppercase tracking-wide">
                        Safe Emails
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                      {summary.safeEmails}
                    </p>
                  </div>

                  {/* Breached Emails */}
                  <div className="rounded-xl border border-red-500/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <h3 className="text-sm text-gray-400 uppercase tracking-wide">
                        Breached Emails
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-red-400">
                      {summary.breachedEmails}
                    </p>
                  </div>

                  {/* Total Breaches */}
                  <div className="rounded-xl border border-orange-500/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-orange-400" />
                      <h3 className="text-sm text-gray-400 uppercase tracking-wide">
                        Total Breaches
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-400">
                      {summary.totalBreaches}
                    </p>
                  </div>
                </div>

                {/* Email Details Table */}
                <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
                  <h2 className="text-xl font-semibold text-[#D4AF37] mb-4">
                    Email Details - {getSelectedMonthLabel()}
                  </h2>

                  {summary.emails.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No email data available for {getSelectedMonthLabel()}.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#D4AF37]/20">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                              Email Address
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                              Breaches
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                              Last Checked
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.emails.map((email, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-700/30 hover:bg-[#0a0a0a]/50 transition-colors"
                            >
                              <td className="py-3 px-4 text-gray-200">
                                {email.email}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    email.status === "safe"
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {email.status === "safe" ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Safe
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Breached
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-gray-200 font-medium">
                                  {email.breaches}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 text-sm">
                                {formatDate(email.lastChecked)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MonthlySummaryPage;
