"use client";

export default function AboutUsSection() {
  return (
    <section
      id="about-us"
      className="w-full max-w-6xl mt-10 mb-24 mx-auto rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-8 sm:p-12 text-gray-200"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.25em] text-[#bfa76f] uppercase">
          About the Project
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold">
          <span className="bg-gradient-to-r from-[#D4AF37] to-[#f5d77f] bg-clip-text text-transparent">
            Empowering Email Security Awareness
          </span>
        </h2>
        <p className="mt-4 text-gray-300 max-w-3xl mx-auto leading-relaxed">
          This web-based system enables users to monitor multiple email
          addresses, visualize breach statistics, and receive real-time alerts —
          helping them stay informed and take action before threats escalate.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<span className="text-2xl">🔒</span>}
          title="Privacy-Oriented Design"
          desc="Email lookups use anonymized queries so no sensitive data is stored or exposed during scans."
        />
        <FeatureCard
          icon={<span className="text-2xl">⚡</span>}
          title="Instant Breach Alerts"
          desc="Users are notified when their monitored email appears in a new breach, enabling quick responses."
        />
        <FeatureCard
          icon={<span className="text-2xl">📈</span>}
          title="Insightful Visualization"
          desc="Interactive dashboards turn breach numbers into clear charts for better risk awareness."
        />
      </div>

      {/* Workflow */}
      <div className="mt-12 rounded-2xl border border-[#D4AF37]/20 p-6 sm:p-8 bg-[#0a0a0a]/50">
        <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">
          How It Works
        </h3>
        <div className="grid sm:grid-cols-4 gap-6">
          <Step
            number={1}
            title="Enter Email"
            desc="Add one or more emails for monitoring."
          />
          <Step
            number={2}
            title="Check Breaches"
            desc="The system queries trusted breach databases securely."
          />
          <Step
            number={3}
            title="View Insights"
            desc="Charts and trends show your exposure over time."
          />
          <Step
            number={4}
            title="Act Fast"
            desc="Receive alerts and follow recommended security actions."
          />
        </div>
      </div>

      {/* Project Info Badges */}
      <div className="mt-10 grid sm:grid-cols-3 gap-5 text-center">
        <Badge label="Focus" value="Data privacy & user awareness" />
        <Badge
          label="Developer"
          value="Final Year Cybersecurity student (APU)"
        />
        <Badge label="Goal" value="Help users react faster to email breaches" />
      </div>

      {/* Footer */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400 max-w-2xl">
          This system is developed as part of a Final Year Project to make email
          breach information more visible, understandable, and actionable for
          everyday users.
        </p>
        <a
          href="#statistics"
          className="px-5 py-2 rounded-xl border border-[#D4AF37]/60 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition"
        >
          Explore More →
        </a>
      </div>
    </section>
  );
}

/* ---------- Subcomponents ---------- */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-5 hover:border-[#D4AF37]/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 grid place-items-center rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
          {icon}
        </div>
        <h3 className="font-medium text-[#f5d77f]">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({
  number,
  title,
  desc,
}: {
  number: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-[#D4AF37]/20 p-4 bg-[#0b0b0b]/60">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 grid place-items-center text-[#f5d77f] text-sm font-medium">
          {number}
        </div>
        <p className="font-medium text-[#f5d77f]">{title}</p>
      </div>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-[#bfa76f]">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-200">{value}</p>
    </div>
  );
}
