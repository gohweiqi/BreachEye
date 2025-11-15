"use client";

import { useState } from "react";

interface EmailCheckSectionProps {
  onResult?: (result: string) => void;
}

export default function EmailCheckSection({ onResult }: EmailCheckSectionProps) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
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
    setLoading(true);
    setResult("");

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    const resultMessage = `No breaches found for ${email}`;
    setResult(resultMessage);
    setLoading(false);
    
    if (onResult) {
      onResult(resultMessage);
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

      {/* Result Display */}
      {result && (
        <div className="mt-6 text-gray-300 min-h-[2rem] text-lg">
          {result}
        </div>
      )}
    </section>
  );
}

