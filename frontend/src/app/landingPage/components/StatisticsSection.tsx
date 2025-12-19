"use client";
import { useEffect, useState } from "react";
import AnimatedCounter from "./AnimatedCounter";
import BreachChart from "./BreachChart";
import { getGlobalStatistics, GlobalStatistics } from "@/lib/api/statisticsApi";

export default function StatisticsSection() {
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await getGlobalStatistics();
        if (response.success && response.data) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <section className="w-full max-w-6xl mb-10 mt-16">
      {/* Dynamic Header Text */}
      <h2 className="text-center text-2xl md:text-3xl font-semibold text-gray-200 mb-4">
        Over 17 Billion accounts compromised — are yours secure?
      </h2>
      <p className="text-center text-base md:text-lg text-gray-400 mb-10">
        Visualize the unseen. Understand your digital exposure.
      </p>
      {/* Two Separate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Compromised Websites Card */}
        <div
          className="bg-gradient-to-b from-[#1a0f0a] via-[#2d1a0f] to-[#0a0503] rounded-2xl p-8 shadow-lg border border-[#D4AF37]/40 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            animation: "fadeInUp 0.8s ease forwards",
          }}
        >
          <p className="text-sm uppercase tracking-widest text-[#E5C97E] mb-3 text-center">
            Compromised Websites
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-2 text-center">
            {isLoading ? (
              <span className="text-4xl">...</span>
            ) : (
              <AnimatedCounter
                value={statistics?.compromisedWebsites || 600}
              />
            )}
          </h2>
          <p className="text-xs text-[#D4AF37]/70 mt-2 text-center">
            Tracked globally
          </p>
        </div>
        {/* Breached Accounts Card */}
        <div
          className="bg-gradient-to-b from-[#1a0f0a] via-[#2d1a0f] to-[#0a0503] rounded-2xl p-8 shadow-lg border border-[#D4AF37]/40 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            animation: "fadeInUp 0.8s ease 0.2s forwards",
          }}
        >
          <p className="text-sm uppercase tracking-widest text-[#E5C97E] mb-3 text-center">
            Breached Accounts
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-2 text-center">
            {isLoading ? (
              <span className="text-4xl">...</span>
            ) : (
              <AnimatedCounter
                value={statistics?.breachedAccounts || 11000000000}
              />
            )}
          </h2>
          <p className="text-xs text-[#D4AF37]/70 mt-2 text-center">
            Detected since 2013
          </p>
        </div>
      </div>
      {/* Chart Section */}
      <div className="mt-10 border border-[#D4AF37]/30 rounded-2xl bg-black/40 p-6 md:p-8">
        <h3 className="text-xl font-semibold text-[#D4AF37] mb-6 text-center">
          Data Breaches by Year
        </h3>
        <BreachChart
          breachesByYear={statistics?.breachesByYear}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
