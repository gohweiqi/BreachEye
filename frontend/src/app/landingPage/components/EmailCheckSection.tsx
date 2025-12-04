"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BreachService from "@/lib/api/breachService";

interface EmailCheckSectionProps {
  onResult?: (result: string) => void;
}

interface BreachResult {
  breached: boolean;
  breachCount?: number;
  breaches?: string[];
  riskScore?: number;
  latestIncident?: string;
  message?: string;
}

export default function EmailCheckSection({
  onResult,
}: EmailCheckSectionProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<BreachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear errors when user starts typing
    if (emailError) {
      setEmailError("");
    }
    if (apiError) {
      setApiError("");
    }
    if (result) {
      setResult(null);
    }
  };

  async function handleCheck() {
    // Frontend validation
    if (!email.trim()) {
      setEmailError("Please enter an email address.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    setApiError("");
    setLoading(true);
    setResult(null);

    try {
      // Call backend API
      const response = await BreachService.checkEmail(email.trim());

      if (response.success) {
        const breachResult: BreachResult = {
          breached: response.breached,
          breachCount: response.breachCount || response.breaches?.length || 0,
          breaches: response.breaches,
          riskScore: response.riskScore,
          latestIncident: response.latestIncident,
          message: response.message,
        };

        setResult(breachResult);

        // Call callback if provided
        if (onResult) {
          const resultMessage = response.breached
            ? `⚠️ ${
                response.breachCount || response.breaches?.length || 0
              } breach${
                (response.breachCount || response.breaches?.length || 0) > 1
                  ? "es"
                  : ""
              } found for ${email}`
            : `✓ No breaches found for ${email}`;
          onResult(resultMessage);
        }
      } else {
        throw new Error(response.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to check email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-4xl text-center mb-16 mt-20">
      {/* Main Title */}
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight">
        <span
          className="bg-gradient-to-r from-[#E5C97E] via-[#D4AF37] via-[#B99332] to-[#E5C97E] bg-clip-text text-transparent bg-[length:200%_auto]"
          style={{
            backgroundPosition: "0% 50%",
            animation: "gradient-shift 3s ease infinite",
          }}
        >
          BreachEye
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-gray-400 mb-12">
        Check if your email address is safe
      </p>

      {/* Email Input and Check Button */}
      <div className="flex flex-col gap-3 max-w-2xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-start">
          <div className="flex-1 w-full">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCheck();
                }
              }}
              className={`w-full px-6 py-4 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 text-lg ${
                emailError
                  ? "focus:ring-red-500 border-2 border-red-500"
                  : "focus:ring-[#D4AF37]"
              }`}
            />
            {emailError && (
              <p className="mt-2 text-red-400 text-sm text-left">
                {emailError}
              </p>
            )}
          </div>
          <button
            onClick={handleCheck}
            disabled={loading}
            className="px-8 py-4 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-[#E5C97E] transition-all text-lg min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {apiError && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 min-h-[2rem]">
          <p className="font-semibold mb-2 text-lg">⚠️ Error</p>
          <div className="text-sm whitespace-pre-line space-y-1">
            {apiError.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Result Display Summary Section */}
      {result && !apiError && (
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="border-2 border-[#D4AF37]/30 rounded-xl bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-hidden shadow-xl">
            {/* Header Section */}
            <div className="px-8 py-6 border-b border-[#D4AF37]/10">
              <h2 className="text-2xl font-bold text-gray-100 mb-1">
                Summary of Email Breach
              </h2>
            </div>

            {/* Main Content */}
            <div className="px-8 py-8">
              {result.breached ? (
                // Breached Section
                <div className="text-center">
                  {/* Breach Count - Large Display */}
                  <div className="mb-6">
                    <div className="text-7xl md:text-8xl font-bold text-red-400 mb-2">
                      {result.breachCount || 0}
                    </div>
                    <p className="text-xl text-gray-300 font-semibold">
                      Data Breaches
                    </p>
                  </div>

                  {/* Status Message */}
                  <div className="mb-6">
                    <p className="text-gray-300 text-lg">
                      Your email address{" "}
                      <span className="font-semibold text-[#D4AF37]">
                        {email}
                      </span>{" "}
                      has been found in{" "}
                      <span className="font-bold text-red-400">
                        {result.breachCount || 0} data breach
                        {(result.breachCount || 0) !== 1 ? "es" : ""}
                      </span>
                      . Review the details below to see where your data was
                      exposed.
                    </p>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-black/40 rounded-lg p-6 mb-6 text-left border border-[#D4AF37]/10">
                    <div className="space-y-4">
                      {/* Risk Score */}
                      {result.riskScore !== undefined && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400 uppercase tracking-wide">
                              Risk Score
                            </span>
                            <span className="text-lg font-bold text-gray-200">
                              {result.riskScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                result.riskScore >= 75
                                  ? "bg-red-500"
                                  : result.riskScore >= 45
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${result.riskScore}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Latest Incident */}
                      {result.latestIncident && (
                        <div>
                          <span className="text-sm text-gray-400 uppercase tracking-wide">
                            Latest Incident
                          </span>
                          <p className="text-gray-200 font-medium mt-1">
                            {result.latestIncident}
                          </p>
                        </div>
                      )}

                      {/* Affected Services Preview */}
                      {result.breaches && result.breaches.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-400 uppercase tracking-wide">
                            Affected Services
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {result.breaches
                              .slice(0, 6)
                              .map((breach, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1.5 rounded-md bg-red-500/20 text-red-300 text-sm border border-red-500/30 font-medium"
                                >
                                  {breach}
                                </span>
                              ))}
                            {result.breaches.length > 6 && (
                              <span className="px-3 py-1.5 rounded-md bg-gray-700/50 text-gray-400 text-sm">
                                +{result.breaches.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-400 flex-1 text-left">
                      Stay protected. Get notified when your email appears in
                      future data breaches.
                    </p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E5C97E] text-black font-semibold hover:from-[#E5C97E] hover:to-[#D4AF37] transition-all shadow-lg hover:shadow-[#D4AF37]/30 text-lg whitespace-nowrap"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ) : (
                // No Breaches Section
                <div className="text-center">
                  {/* Breach Count - Large Display */}
                  <div className="mb-6">
                    <div className="text-7xl md:text-8xl font-bold text-green-400 mb-2">
                      0
                    </div>
                    <p className="text-xl text-gray-300 font-semibold">
                      Data Breaches
                    </p>
                  </div>

                  {/* Status Message */}
                  <div className="mb-6">
                    <p className="text-2xl font-bold text-green-400 mb-2">
                      Good news! No breach found!
                    </p>
                    <p className="text-gray-300 text-lg">
                      Your email address{" "}
                      <span className="font-semibold text-[#D4AF37]">
                        {email}
                      </span>{" "}
                      wasn't found in any of the data breaches loaded into our
                      database.
                    </p>
                  </div>

                  {/* Summary Details - Risk Score Only */}
                  {result.riskScore !== undefined && (
                    <div className="bg-black/40 rounded-lg p-6 mb-6 text-left border border-[#D4AF37]/10">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400 uppercase tracking-wide">
                              Risk Score
                            </span>
                            <span className="text-lg font-bold text-gray-200">
                              {result.riskScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                result.riskScore >= 75
                                  ? "bg-red-500"
                                  : result.riskScore >= 45
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${result.riskScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Call to Action */}
                  <div className="pt-4 flex items-left justify-between gap-4">
                    <p className="text-sm text-gray-400 flex-1 text-left">
                      Stay protected. Monitor your email for future data
                      breaches and get instant alerts.
                    </p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E5C97E] text-black font-semibold hover:from-[#E5C97E] hover:to-[#D4AF37] transition-all shadow-lg hover:shadow-[#D4AF37]/30 text-lg whitespace-nowrap"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
