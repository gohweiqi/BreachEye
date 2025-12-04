"use client";

import { useRouter } from "next/navigation";
import { CircleChevronLeft } from "lucide-react";
import Navbar from "../../../components/Navbar";

export default function AboutUsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200">
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        <Navbar />

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mt-6 mb-4 flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 group"
          aria-label="Go back to previous page"
        >
          <CircleChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mt-8 mb-12">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.25em] text-[#bfa76f] uppercase mb-4">
              About Us
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#E5C97E] to-[#D4AF37] bg-clip-text text-transparent">
                Protecting Your Digital Identity
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              BreachEye is dedicated to helping individuals and organizations
              stay informed about email security breaches and take proactive
              measures to protect their digital assets.
            </p>
          </div>

          {/* Mission Section */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-8 mb-8">
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-4">
              Our Mission
            </h2>
            <p className="text-gray-300 leading-relaxed">
              In an era where data breaches are increasingly common, BreachEye
              empowers users with real-time breach detection and comprehensive
              security insights. We believe that awareness is the first step
              toward protection, and our platform makes it easy for anyone to
              monitor their email security status.
            </p>
          </div>

          {/* What We Do */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-6 hover:border-[#D4AF37]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-[#f5d77f]">
                  Breach Detection
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Continuously monitor trusted breach databases to identify if
                your email has been compromised in known data breaches.
              </p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-6 hover:border-[#D4AF37]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-[#f5d77f]">
                  Risk Analysis
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Provide detailed risk assessments and visual analytics to help
                you understand your exposure level and take appropriate action.
              </p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-6 hover:border-[#D4AF37]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  <span className="text-xl">🔔</span>
                </div>
                <h3 className="text-xl font-semibold text-[#f5d77f]">
                  Real-Time Alerts
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Get instant notifications when your monitored email addresses
                appear in new data breaches, enabling quick response.
              </p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-6 hover:border-[#D4AF37]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  <span className="text-xl">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-[#f5d77f]">
                  Privacy First
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your privacy matters. We use secure, anonymized methods to check
                breaches without storing or exposing sensitive information.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="rounded-2xl border border-[#D4AF37]/20 p-8 bg-[#0a0a0a]/50 mb-8">
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-6 text-center">
              Our Values
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <ValueCard
                title="Transparency"
                description="Clear, honest communication about security risks and breach information."
              />
              <ValueCard
                title="Accessibility"
                description="Making cybersecurity awareness available to everyone, regardless of technical expertise."
              />
              <ValueCard
                title="Reliability"
                description="Consistent, accurate breach data from trusted sources to keep you informed."
              />
            </div>
          </div>

          {/* About the Developer Section */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0b0b0b] to-[#000000] p-8 mb-8">
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-4">
              About the Developer
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              BreachEye is built by a cybersecurity student who is passionate
              about turning complex security concepts into simple, useful tools.
              After spending time in CTFs, hackathons, and security labs, it
              became clear that many people still don't know when or how their
              data has been exposed.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This project is part of a Final Year Project, but it's also a
              personal experiment in blending defensive security, UX design and
              real-world threat awareness into one web application.
            </p>
          </div>

          {/* Contact/Info Section */}
          <div className="rounded-xl border border-[#D4AF37]/20 bg-[#0b0b0b]/60 p-6 text-center">
            <p className="text-gray-300 mb-2">
              <span className="text-[#D4AF37] font-semibold">BreachEye</span> is
              developed as part of a Final Year Project focused on cybersecurity
              and user awareness.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              For questions or feedback, please contact us through the platform.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-[#f5d77f] mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
