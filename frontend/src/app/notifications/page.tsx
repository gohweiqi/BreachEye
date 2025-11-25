"use client";

import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../app/dashboard/components/Sidebar";

interface Notification {
  id: number;
  type: "breach" | "summary" | "security" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationsListPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "breach",
      title: "New breach detected",
      message: "Your email was found in the 'CompanyXYZ' data breach",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "security",
      title: "Security recommendation",
      message:
        "We suggest enabling two-factor authentication for better protection.",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      type: "summary",
      title: "Weekly summary",
      message: "All monitored emails are secure this week",
      time: "3 days ago",
      read: true,
    },
    {
      id: 4,
      type: "security",
      title: "Security recommendation",
      message: "Consider enabling two-factor authentication",
      time: "1 week ago",
      read: true,
    },
    {
      id: 6,
      type: "summary",
      title: "Monitoring update",
      message: "Your email was re-scanned with the latest breach database.",
      time: "2 weeks ago",
      read: true,
    },
    {
      id: 7,
      type: "system",
      title: "BreachEye engine updated",
      message: "We improved our scanning engine. Detection accuracy increased.",
      time: "12 hours ago",
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
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
            {/* Notification History Dashboard */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#050505] to-[#020202] px-6 py-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-3xl font-bold uppercase text-[#bfa76f] tracking-[0.12em]">
                  Notifications
                </h2>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#D4AF37] hover:text-[#f3d46f] transition mt-4"
                >
                  Mark all as read
                </button>
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      notification.read
                        ? "border-[#D4AF37]/20 bg-[#0a0a0a]/30"
                        : "border-[#D4AF37]/40 bg-[#0a0a0a]/50 shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base font-semibold mb-1 ${
                            notification.read ? "text-gray-300" : "text-gray-50"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.time}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State (if no notifications) */}
              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-2">No notifications yet</p>
                  <p className="text-sm text-gray-500">
                    You'll see breach alerts and updates here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotificationsListPage;
