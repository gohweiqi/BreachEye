"use client";

import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../dashboard/components/Sidebar";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const NotificationsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "website-notifications",
      label: "Website Notifications",
      description:
        "Get notified on the website when breaches are detected for your monitored emails",
      enabled: true,
    },
    {
      id: "email-notifications",
      label: "Email Notifications",
      description:
        "Receive email notifications when a breach is detected for your monitored email addresses",
      enabled: true,
    },
    {
      id: "weekly-summary",
      label: "Weekly Summary",
      description:
        "Receive a weekly summary of all monitored emails and their status",
      enabled: false,
    },
    {
      id: "security-updates",
      label: "Security Updates",
      description:
        "Stay informed about new security features and recommendations",
      enabled: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-gray-200 px-6 py-10">
      {/* Navbar Section */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <Navbar />
      </div>

      {/* Notifications Section */}
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Sidebar + Content */}
        <div className="mt-8 flex gap-6 items-stretch">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6">
            {/* Notification Settings Section - Separate Card */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em] mb-6">
                Notification Settings
              </h2>

              <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                Manage how and when you receive notifications from BreachEye.
                Customize your preferences to stay informed about your digital
                security.
              </p>

              {/* Settings List */}
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-[#D4AF37]/20 bg-[#0a0a0a]/50 hover:border-[#D4AF37]/40 transition-all"
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="text-base font-semibold text-gray-50 mb-1">
                        {setting.label}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {setting.description}
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#050505] ${
                        setting.enabled ? "bg-[#D4AF37]" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Save Button - Right aligned */}
              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2.5 rounded-xl text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#f3d46f] transition">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;
