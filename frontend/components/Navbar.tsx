// frontend/components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

const Navbar: React.FC = () => {
  const { status } = useSession();
  const pathname = usePathname();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Determine if we're on landing page or dashboard pages (ignore query params)
  const normalizedPath = pathname?.split("?")[0] ?? "/";
  const isLandingPage = normalizedPath === "/";
  const isDashboardPage =
    normalizedPath.startsWith("/dashboard") ||
    normalizedPath.startsWith("/notifications") ||
    normalizedPath.startsWith("/settings") ||
    normalizedPath.startsWith("/monthlySummary");
  const isAboutUsPage = normalizedPath === "/aboutUs";
  const isNewsPage = normalizedPath === "/news";

  // Show button on ALL pages - always show sign in/log out button
  const shouldShowButton = true;

  const buttonLabel = isLoading
    ? "Loading..."
    : isAuthenticated
    ? "Log Out"
    : "Sign In";

  const handleAuthAction = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      // After logout, go back to landing page
      signOut({ callbackUrl: "/" });
    } else {
      // After login, go to dashboard
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  return (
    <nav className="w-full flex items-center justify-between p-4 border border-gray-600/50 rounded-2xl">
      {/* Left Side: BreachEye Logo */}
      <Link href="/" className="flex items-center group cursor-pointer">
        {/* Logo Text */}
        <span className="flex items-center">
          <span
            className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#E5C97E] via-[#B99332] to-[#D4AF37] bg-clip-text text-transparent tracking-tight bg-[length:200%_auto] group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-all duration-300"
            style={{
              backgroundPosition: "0% 50%",
              animation: "gradient-shift 3s ease infinite",
              filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.3))",
            }}
          >
            BreachEy
          </span>
          {/* Blinking Eye Icon */}
          <span className="inline-flex items-center justify-center ml-1">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: "24px",
                height: "16px",
                animation: "blink 3s ease-in-out infinite",
              }}
            >
              {/* Eye shape - almond/oval */}
              <div
                className="relative border-2 flex items-center justify-center overflow-hidden"
                style={{
                  width: "24px",
                  height: "16px",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  borderColor: "#D4AF37",
                  background:
                    "linear-gradient(to bottom, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))",
                }}
              >
                {/* Iris - golden circle */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "12px",
                    height: "12px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background:
                      "linear-gradient(135deg, #D4AF37, #E5C97E, #B99332)",
                  }}
                >
                  {/* Iris highlight - lighter gold */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: "6px",
                      height: "6px",
                      top: "1px",
                      right: "1px",
                      clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                      background: "#E5C97E",
                    }}
                  ></div>

                  {/* Pupil - darker gold circle */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: "6px",
                      height: "6px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "#B99332",
                    }}
                  >
                    {/* Pupil highlight - white dot */}
                    <div
                      className="absolute rounded-full bg-white"
                      style={{
                        width: "2px",
                        height: "2px",
                        top: "1px",
                        left: "1px",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </span>
        </span>
      </Link>

      {/* Right Side: Navigation Items */}
      <div className="flex items-center gap-6">
        {/* Latest News */}
        <Link
          href="/news"
          className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer"
        >
          Latest News
        </Link>

        {/* About Us */}
        <Link
          href="/aboutUs"
          className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer"
        >
          About Us
        </Link>

        {/* Sign In / Log Out Button */}
        {shouldShowButton && (
          <button
            className="px-6 py-2 rounded-md text-white bg-[#B99332] hover:bg-[#D4AF37] transition-all font-medium ml-4 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleAuthAction}
            disabled={isLoading}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
