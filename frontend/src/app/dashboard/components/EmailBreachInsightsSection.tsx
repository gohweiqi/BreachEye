"use client";

import React, { useMemo, useState } from "react";
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

const emailProfiles: EmailProfile[] = [
  {
    id: "primary",
    label: "Personal",
    email: "user@example.com",
    riskScore: 18,
    totalBreaches: 0,
    history: [
      { year: 2016, count: 0 },
      { year: 2017, count: 0 },
      { year: 2018, count: 0 },
      { year: 2019, count: 0 },
      { year: 2020, count: 0 },
      { year: 2021, count: 0 },
      { year: 2022, count: 0 },
      { year: 2023, count: 0 },
      { year: 2024, count: 0 },
      { year: 2025, count: 0 },
    ],
  },
  {
    id: "work",
    label: "Work",
    email: "work@company.com",
    riskScore: 82,
    totalBreaches: 12,
    latestIncident: "Credential dump · Jan 2024",
    history: [
      { year: 2016, count: 4 },
      { year: 2017, count: 6 },
      { year: 2018, count: 15 },
      { year: 2019, count: 18 },
      { year: 2020, count: 9 },
      { year: 2021, count: 6 },
      { year: 2022, count: 3 },
      { year: 2023, count: 7 },
      { year: 2024, count: 12 },
      { year: 2025, count: 1 },
    ],
  },
  {
    id: "alt",
    label: "Personal",
    email: "personal@email.com",
    riskScore: 41,
    totalBreaches: 3,
    latestIncident: "Marketing leak · Oct 2022",
    history: [
      { year: 2016, count: 0 },
      { year: 2017, count: 1 },
      { year: 2018, count: 4 },
      { year: 2019, count: 2 },
      { year: 2020, count: 3 },
      { year: 2021, count: 4 },
      { year: 2022, count: 3 },
      { year: 2023, count: 2 },
      { year: 2024, count: 1 },
      { year: 2025, count: 0 },
    ],
  },
];

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

const EmailBreachInsightsSection: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<string>(
    emailProfiles[0].email
  );

  const selectedProfile =
    emailProfiles.find((profile) => profile.email === selectedEmail) ??
    emailProfiles[0];

  const chartData = useMemo<ChartData<"line">>(() => {
    return {
      labels: selectedProfile.history.map((point) => point.year.toString()),
      datasets: [
        {
          label: "Breaches detected",
          data: selectedProfile.history.map((point) => point.count),
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
  }, [selectedProfile]);

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

  const riskTone = getRiskAccent(selectedProfile.riskScore);
  const pointerRotation = -90 + (selectedProfile.riskScore / 100) * 180;

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
              onChange={(event) => setSelectedEmail(event.target.value)}
              className="appearance-none w-full rounded-xl border border-[#D4AF37]/40 bg-[#050505] pl-4 pr-12 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              {emailProfiles.map((profile) => (
                <option key={profile.id} value={profile.email}>
                  {profile.label} · {profile.email}
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
              <div className="relative h-40 w-40">
                <div
                  className="absolute inset-0 rounded-full border border-[#1f1f1f] bg-[radial-gradient(circle_at_top,#1b1b1b,transparent_55%)]"
                  style={{
                    boxShadow:
                      "0 0 30px rgba(212, 175, 55, 0.25), inset 0 0 20px rgba(0,0,0,0.6)",
                  }}
                >
                  <div className="absolute inset-3 rounded-full border border-[#0f0f0f] bg-[#050505]/90" />
                </div>

                <div
                  className="absolute left-1/2 top-1/2 h-16 w-1.5 rounded-full bg-gradient-to-b from-[#cbd5f5] to-[#60a5fa]"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${pointerRotation}deg)`,
                    transformOrigin: "center 100%",
                    boxShadow: "0 0 12px rgba(96, 165, 250, 0.5)",
                  }}
                />

                <div className="absolute inset-10 rounded-full border border-[#1f1f1f] bg-[#050505] flex flex-col items-center justify-center">
                  <span className="text-4xl font-semibold text-gray-50">
                    {selectedProfile.riskScore}
                  </span>
                  <span
                    className="text-xs uppercase tracking-wide mt-1"
                    style={{ color: riskTone.accent }}
                  >
                    {riskTone.label}
                  </span>
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
                {selectedProfile.totalBreaches}
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
                {selectedProfile.latestIncident ?? "No breach detected"}
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
