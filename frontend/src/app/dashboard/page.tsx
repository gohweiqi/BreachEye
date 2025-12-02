// src/app/dashboard/page.tsx
"use client";

import React from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../app/dashboard/components/Sidebar";
import BreachSummarySection from "./components/BreachSummarySection";
import EmailBreachInsightsSection from "./components/EmailBreachInsightsSection";
import BreachHistorySection from "./components/BreachHistorySection";
import RecommendedActionsSection from "./components/RecommendedActionsSection";

const DashboardPage: React.FC = () => {
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
            <BreachSummarySection />
            <EmailBreachInsightsSection />
            <BreachHistorySection />
            <RecommendedActionsSection />
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
