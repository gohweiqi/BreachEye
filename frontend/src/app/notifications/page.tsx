"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../app/dashboard/components/Sidebar";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/api/notificationApi";
import { useNotifications } from "@/contexts/NotificationContext";

const NotificationsListPage: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    markAsRead: markAsReadContext,
    refreshNotifications: refreshContextNotifications,
  } = useNotifications();

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (sessionStatus === "loading" || !session?.user?.email) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userId = session.user.email;
      const fetchedNotifications = await getNotifications(userId);
      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications. Please try again later."
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    loadNotifications();

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, sessionStatus, loadNotifications]);

  const markAllAsRead = async () => {
    if (!session?.user?.email) return;

    try {
      const userId = session.user.email;
      await markAllNotificationsAsRead(userId);
      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      // Refresh context to update sidebar dot
      await refreshContextNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
      // Reload notifications on error
      loadNotifications();
    }
  };

  const markAsRead = async (id: string) => {
    if (!session?.user?.email) return;

    try {
      const userId = session.user.email;
      await markNotificationAsRead(userId, id);
      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      // Update context to update sidebar dot immediately
      await markAsReadContext(id);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Reload notifications on error
      loadNotifications();
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

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading notifications...</p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-2">{error}</p>
                  <button
                    onClick={loadNotifications}
                    className="text-sm text-[#D4AF37] hover:text-[#f3d46f] transition"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Notifications List */}
              {!isLoading && !error && (
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
                              notification.read
                                ? "text-gray-300"
                                : "text-gray-50"
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
              )}

              {/* Empty State (if no notifications) */}
              {!isLoading && !error && notifications.length === 0 && (
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
