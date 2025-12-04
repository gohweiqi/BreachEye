"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../dashboard/components/Sidebar";
import { useSession, signOut } from "next-auth/react";
import {
  getUserAccountData,
  deleteUserAccount,
  UserAccountData,
} from "@/lib/api/userApi";

const ManageAccountPage: React.FC = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accountData, setAccountData] = useState<UserAccountData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user account data
  useEffect(() => {
    const loadAccountData = async () => {
      if (status === "loading" || status === "unauthenticated") {
        setIsLoading(false);
        return;
      }

      const userEmail = session?.user?.email;
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserAccountData(userEmail);
        setAccountData(data);
      } catch (err) {
        console.error("Error loading account data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load account data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, [session, status]);

  const handleDeleteAccount = async () => {
    if (!session?.user?.email) {
      return;
    }

    setIsDeleting(true);
    try {
      const userId = session.user.email;
      await deleteUserAccount(userId);
      
      // Account deleted successfully, sign out and navigate to landing page
      await signOut({ callbackUrl: "/?accountDeleted=true" });
    } catch (err) {
      console.error("Error deleting account:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete account. Please try again."
      );
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
      {/* Navbar Section */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <Navbar />
      </div>

      {/* Account Management Section */}
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Sidebar + Content */}
        <div className="mt-8 flex gap-6 items-stretch">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6">
            {/* Profile Information Section */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-6">
                Profile Information
              </h2>

              <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                Manage your account profile and personal information.
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
                    <p className="mt-4 text-gray-400">Loading account data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-red-400">Error: {error}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please try refreshing the page.
                  </p>
                </div>
              ) : accountData ? (
                <div className="space-y-6">
                  {/* Profile Picture and Basic Info */}
                  <div className="flex items-center gap-6 p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                    <div className="flex-shrink-0">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/50"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/50 bg-[#0a0a0a] flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#D4AF37]">
                            {user?.name?.charAt(0).toUpperCase() ||
                              user?.email?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-50 mb-1">
                        {user?.name || "User Name"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {user?.email || "user@example.com"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Google Account</p>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Joined Date
                      </p>
                      <p className="text-base font-medium text-gray-50">
                        {new Date(accountData.joinedDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Monitored Emails
                      </p>
                      <p className="text-base font-medium text-gray-50">
                        {accountData.monitoredEmails} address
                        {accountData.monitoredEmails !== 1 ? "es" : ""}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Account Status
                      </p>
                      <p className="text-base font-medium text-green-400">
                        {accountData.accountStatus}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Total Breaches
                      </p>
                      <p
                        className={`text-base font-medium ${
                          accountData.totalBreaches > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {accountData.totalBreaches}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Data Management Section */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-6">
                Data Management
              </h2>

              <div className="space-y-4">
                {/* Delete Account */}
                <div className="flex items-start justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5 hover:border-red-500/50 transition-all">
                  <div className="flex-1 mr-4">
                    <h3 className="text-base font-semibold text-red-400 mb-1">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-400">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="px-6 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition border border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-b from-[#050505] to-[#020202] border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Delete Account
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete your account? This will
              permanently remove all your data, including monitored emails and
              breach history. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageAccountPage;
