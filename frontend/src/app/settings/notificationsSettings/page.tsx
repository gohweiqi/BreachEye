"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../dashboard/components/Sidebar";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from "@/lib/api/notificationSettingsApi";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  key: keyof NotificationSettings;
}

const NotificationsPage: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();

  // Email Notification Settings (for breach found and monthly summary)
  const [emailSettings, setEmailSettings] = useState<NotificationSetting[]>([
    {
      id: "breach-email",
      label: "Breach Found",
      description:
        "Receive email notifications when a data breach is detected for your monitored email addresses",
      enabled: true,
      key: "emailNotifications",
    },
    {
      id: "monthly-summary-email",
      label: "Monthly Summary",
      description:
        "Receive monthly email summary of all monitored emails and their security status automatically",
      enabled: false,
      key: "monthlySummary",
    },
  ]);

  // Website Notification Settings
  const [websiteSettings, setWebsiteSettings] = useState<NotificationSetting[]>(
    [
      {
        id: "website-notifications",
        label: "Website Notifications",
        description:
          "Get notified on the website when breaches are detected for your monitored emails",
        enabled: true,
        key: "websiteNotifications",
      },
      {
        id: "security-updates",
        label: "Security Updates",
        description:
          "Stay informed about new security features and recommendations",
        enabled: true,
        key: "securityUpdates",
      },
    ]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      if (sessionStatus === "loading" || !session?.user?.email) {
        return;
      }

      try {
        setIsLoading(true);
        const userId = session.user.email;
        const fetchedSettings = await getNotificationSettings(userId);

        setEmailSettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            enabled: fetchedSettings[setting.key],
          }))
        );

        setWebsiteSettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            enabled: fetchedSettings[setting.key],
          }))
        );
      } catch (error) {
        console.error("Error loading notification settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [session, sessionStatus]);

  const toggleEmailSetting = (id: string) => {
    setEmailSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const toggleWebsiteSetting = (id: string) => {
    setWebsiteSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = async () => {
    if (!session?.user?.email) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);

      const userId = session.user.email;
      const settingsToSave: Partial<NotificationSettings> = {};

      [...emailSettings, ...websiteSettings].forEach((setting) => {
        settingsToSave[setting.key] = setting.enabled;
      });

      await updateNotificationSettings(userId, settingsToSave);

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Failed to save settings. Please try again."
      );
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
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

              {/* Email Notifications Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Choose which email notifications you want to receive.
                </p>
                <div className="space-y-4">
                  {emailSettings.map((setting) => (
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
                        onClick={() => toggleEmailSetting(setting.id)}
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
              </div>

              {/* Website Notifications Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">
                  Website Notifications
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Control notifications displayed on the website.
                </p>
                <div className="space-y-4">
                  {websiteSettings.map((setting) => (
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
                        onClick={() => toggleWebsiteSetting(setting.id)}
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
              </div>

              {/* Save Button - Right aligned */}
              <div className="mt-6 flex justify-end items-center gap-4">
                {saveMessage && (
                  <p
                    className={`text-sm ${
                      saveMessage.includes("successfully")
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {saveMessage}
                  </p>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#f3d46f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
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
