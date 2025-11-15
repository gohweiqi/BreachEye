"use client";

import Navbar from "../../../components/Navbar";
import EmailCheckSection from "../../app/landingPage/components/EmailCheckSection";
import StatisticsSection from "../../app/landingPage/components/StatisticsSection";
import AboutUsSection from "../../app/landingPage/components/AboutUsSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 flex flex-col items-center justify-start px-6 py-10">
      <div className="w-full max-w-5xl mb-10">
        <Navbar />
      </div>

      <EmailCheckSection />

      <StatisticsSection />

      <AboutUsSection />
    </main>
  );
}
