"use client";

import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../dashboard/components/Sidebar";
import { useSession, signOut } from "next-auth/react";

const ManageAccountPage: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mock account data - in production, this would come from your backend
  const accountData = {
    joinedDate: "January 15, 2024",
    accountStatus: "Active",
    lastLogin: "2 hours ago",
    totalBreaches: 3,
    monitoredEmails: 5,
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setShowDeleteConfirm(false);

    // Sign out and navigate to landing page with success flag
    await signOut({ callbackUrl: "/?accountDeleted=true" });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsExporting(false);
    setShowExportConfirm(false);
    // In production, trigger data export download
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
                      {accountData.joinedDate}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Monitored Emails
                    </p>
                    <p className="text-base font-medium text-gray-50">
                      {accountData.monitoredEmails} addresses
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-6">
                Data Management
              </h2>

              <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                Export your data or permanently delete your account.
              </p>

              <div className="space-y-4">
                {/* Export Data */}
                <div className="flex items-start justify-between p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50 hover:border-[#D4AF37]/40 transition-all">
                  <div className="flex-1 mr-4">
                    <h3 className="text-base font-semibold text-gray-50 mb-1">
                      Export Your Data
                    </h3>
                    <p className="text-sm text-gray-400">
                      Download a copy of all your account data, including
                      monitored emails and breach history.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setShowExportConfirm(true)}
                      disabled={isExporting}
                      className="px-8 py-2 rounded-lg text-sm font-medium bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition border border-[#D4AF37]/40 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isExporting ? "Exporting..." : "Export Data"}
                    </button>
                  </div>
                </div>

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

      {/* Export Data Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-b from-[#050505] to-[#020202] border border-[#D4AF37]/50 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-2">
              Export Your Data
            </h3>
            <p className="text-gray-400 mb-6">
              We'll prepare a downloadable file containing all your account
              data. This may take a few minutes. You'll receive an email when
              your export is ready.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExportConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#f3d46f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? "Preparing..." : "Start Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageAccountPage;
