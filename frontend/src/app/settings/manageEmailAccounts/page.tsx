"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../dashboard/components/Sidebar";
import { useSession } from "next-auth/react";
import {
  getMonitoredEmails,
  addMonitoredEmail,
  deleteMonitoredEmail,
  MonitoredEmail,
} from "@/lib/api/emailApi";

const ManageEmailAccountsPage: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [emails, setEmails] = useState<MonitoredEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  // Load emails function
  const loadEmails = async () => {
    if (!session?.user?.email) {
      console.log("No session or email found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userId = session.user.email; // Using email as userId
      console.log("Fetching emails for user:", userId);
      const fetchedEmails = await getMonitoredEmails(userId);
      console.log("Fetched emails:", fetchedEmails);
      setEmails(fetchedEmails);
    } catch (error) {
      console.error("Error loading emails:", error);
      // Silently handle errors - don't show error banner
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load emails from API on mount and when session changes
  useEffect(() => {
    // Wait for session to be loaded
    if (sessionStatus === "loading") {
      return;
    }

    // Only load if session is available
    if (session?.user?.email) {
      loadEmails();
    } else {
      setIsLoading(false);
    }
  }, [session, sessionStatus]);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = async () => {
    // Frontend validation
    if (!newEmail.trim()) {
      setEmailError("Please enter an email address.");
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Check if email already exists
    if (emails.some((e) => e.email.toLowerCase() === newEmail.toLowerCase())) {
      setEmailError("This email is already being monitored.");
      return;
    }

    if (!session?.user?.email) {
      setEmailError("Please sign in to add emails.");
      return;
    }

    setEmailError("");
    setIsAdding(true);

    try {
      const userId = session.user.email; // Using email as userId
      const emailToAdd = newEmail.trim();

      // Call backend API to add email (backend will check for breaches)
      const newEmailEntry = await addMonitoredEmail(userId, emailToAdd);

      // Update state
      setEmails([...emails, newEmailEntry]);
      setNewEmail("");

      // Show success notification
      setSuccessEmail(newEmailEntry.email);
      setShowSuccessNotification(true);

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding email:", error);
      setEmailError(
        error instanceof Error
          ? error.message
          : "Failed to add email. Please try again."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!session?.user?.email) {
      return;
    }

    // Find the email to be deleted
    const emailToDelete = emails.find((e) => e.id === id);

    // Prevent deletion of the signed-in Google account
    if (
      emailToDelete &&
      emailToDelete.email.toLowerCase() === session.user.email.toLowerCase()
    ) {
      alert(
        "Cannot remove your signed-in Google account. This is your primary account."
      );
      setShowDeleteConfirm(null);
      return;
    }

    setIsDeleting(true);
    try {
      const userId = session.user.email; // Using email as userId
      // Remove from API
      await deleteMonitoredEmail(userId, id);
      // Update state
      setEmails(emails.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting email:", error);
      // Silently handle errors - don't show error banner
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const getStatusBadge = (status: MonitoredEmail["status"]) => {
    switch (status) {
      case "safe":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/40">
            Safe
          </span>
        );
      case "breached":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/40">
            Breached
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
      {/* Navbar Section */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <Navbar />
      </div>

      {/* Email Management Section */}
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Sidebar + Content */}
        <div className="mt-8 flex gap-6 items-stretch">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6">
            {/* Add Email Section */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-6">
                Add Email Address
              </h2>

              <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                Add email addresses to monitor for data breaches. We'll
                continuously check these addresses against our breach database
                and notify you if any exposures are found.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter email address to monitor"
                    value={newEmail}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddEmail();
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      emailError
                        ? "border-red-500/50 focus:ring-red-500"
                        : "border-[#D4AF37]/30 focus:ring-[#D4AF37] focus:border-[#D4AF37]/60"
                    }`}
                  />
                  {emailError && (
                    <p className="mt-2 text-red-400 text-sm">{emailError}</p>
                  )}
                </div>
                <button
                  onClick={handleAddEmail}
                  disabled={isAdding}
                  className="px-6 py-3 rounded-lg bg-[#D4AF37] text-black font-medium hover:bg-[#f3d46f] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isAdding ? "Adding..." : "Add Email"}
                </button>
              </div>
            </div>

            {/* Monitored Emails List Section */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <div className="mb-6">
                <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em]">
                  Monitored Email Addresses
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  {emails.length} email{emails.length !== 1 ? "s" : ""} being
                  monitored
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
                  <p className="mt-4 text-gray-400">Loading emails...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-2">
                    No emails being monitored
                  </p>
                  <p className="text-sm text-gray-500">
                    Add an email address above to start monitoring
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emails.map((email) => {
                    const isPrimaryEmail =
                      session?.user?.email &&
                      email.email.toLowerCase() ===
                        session.user.email.toLowerCase();

                    return (
                      <div
                        key={email.id}
                        className="p-5 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50 hover:border-[#D4AF37]/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Email Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-50 truncate">
                                {email.email}
                              </h3>
                              {isPrimaryEmail && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                                  Primary Account
                                </span>
                              )}
                              {getStatusBadge(email.status)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                  Breaches Found
                                </p>
                                <p
                                  className={`text-base font-medium ${
                                    email.breaches > 0
                                      ? "text-red-400"
                                      : "text-green-400"
                                  }`}
                                >
                                  {email.breaches}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                  Added Date
                                </p>
                                <p className="text-sm text-gray-300">
                                  {new Date(email.addedDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {isPrimaryEmail ? (
                              <button
                                disabled
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/30 text-gray-500 border border-gray-700/50 cursor-not-allowed"
                                title="Cannot remove your signed-in Google account"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowDeleteConfirm(email.id)}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition border border-red-500/40"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Information Section */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <h2 className="text-2xl md:text-2xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-4">
                How Email Monitoring Works
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                  <h3 className="text-base font-semibold text-gray-50 mb-2">
                    Continuous Monitoring
                  </h3>
                  <p className="text-sm text-gray-400">
                    Once you add an email address, we continuously monitor it
                    against our comprehensive breach database. We check for new
                    breaches regularly and notify you immediately if your email
                    is found in any data breach.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                  <h3 className="text-base font-semibold text-gray-50 mb-2">
                    Privacy & Security
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your email addresses are stored securely and are only used
                    for breach detection. We never share your information with
                    third parties, and you can remove any email from monitoring
                    at any time.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                  <h3 className="text-base font-semibold text-gray-50 mb-2">
                    Status Indicators
                  </h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/40">
                        Safe
                      </span>
                      <span>No breaches detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/40">
                        Breached
                      </span>
                      <span>Email found in one or more breaches</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-b from-[#050505] to-[#020202] border border-green-500/50 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-50">
                  Email successfully added!
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {successEmail} is now being monitored
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-b from-[#050505] to-[#020202] border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Remove Email
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to stop monitoring this email address? You
              will no longer receive breach notifications for this email.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmail(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Removing..." : "Remove Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageEmailAccountsPage;
