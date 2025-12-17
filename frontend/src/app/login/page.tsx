"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { 
        callbackUrl: "/",
        prompt: "select_account"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-md border border-gray-700 rounded-3xl bg-black/60 p-10 text-center space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
            Welcome to
          </p>
          <div className="flex items-center justify-center gap-1 text-4xl font-bold">
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#E5C97E] via-[#B99332] to-[#D4AF37] bg-clip-text text-transparent tracking-tight">
              BreachEy
            </span>
            <span className="inline-flex items-center justify-center">
              <div
                className="relative flex items-center justify-center"
                style={{ width: "30px", height: "20px" }}
              >
                <div
                  className="relative border-2 flex items-center justify-center overflow-hidden"
                  style={{
                    width: "30px",
                    height: "20px",
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    borderColor: "#D4AF37",
                  }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: "14px",
                      height: "14px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background:
                        "linear-gradient(135deg, #D4AF37, #E5C97E, #B99332)",
                    }}
                  ></div>
                </div>
              </div>
            </span>
          </div>
        </div>

        <p className="text-gray-400 leading-relaxed">
          Sign in with Google to access your dashboard and stay up to date with
          the latest breach alerts.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-[#D4AF37]/60 text-white font-medium bg-gradient-to-r from-[#B99332] to-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Connecting..." : "Continue with Google"}
        </button>
      </section>
    </main>
  );
};

export default LoginPage;
