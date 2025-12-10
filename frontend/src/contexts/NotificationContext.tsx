"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { getNotifications, Notification } from "@/lib/api/notificationApi";
import ToastNotification from "../components/ToastNotification";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showToast: (notification: Notification) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status: sessionStatus } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastQueue, setToastQueue] = useState<Notification[]>([]);
  const [currentToast, setCurrentToast] = useState<Notification | null>(null);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(
    new Set()
  );

  const loadNotifications = useCallback(async () => {
    if (sessionStatus === "loading" || !session?.user?.email) {
      return;
    }

    try {
      const userId = session.user.email;
      const fetchedNotifications = await getNotifications(userId);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [session, sessionStatus]);

  const showToast = useCallback((notification: Notification) => {
    setToastQueue((prev) => [...prev, notification]);
  }, []);

  const handleToastClose = useCallback(() => {
    setCurrentToast(null);
    // Show next toast in queue after a short delay
    setTimeout(() => {
      setToastQueue((prev) => {
        const next = prev[0];
        if (next) {
          setCurrentToast(next);
          return prev.slice(1);
        }
        return prev;
      });
    }, 300);
  }, []);

  // Process toast queue
  useEffect(() => {
    if (toastQueue.length > 0 && !currentToast) {
      setCurrentToast(toastQueue[0]);
      setToastQueue((prev) => prev.slice(1));
    }
  }, [toastQueue, currentToast]);

  // Poll for new notifications
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) {
      return;
    }

    // Initial load
    loadNotifications();

    // Poll every 30 seconds for new notifications
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [session, sessionStatus, loadNotifications]);

  // Detect new notifications and show toasts
  useEffect(() => {
    if (notifications.length === 0) return;

    // Get unread notifications that haven't been shown yet
    const unreadNotifications = notifications.filter(
      (n) => !n.read && !shownNotificationIds.has(n.id)
    );

    // Show toasts for unread notifications (only the newest ones)
    // Limit to showing toasts for notifications created in the last 5 minutes
    const recentUnread = unreadNotifications.filter((n) => {
      if (!n.createdAt) return false;
      const createdAt = new Date(n.createdAt);
      const now = new Date();
      const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
      return diffInSeconds < 300; // Only show if less than 5 minutes old
    });

    // Show toasts for recent unread notifications (one at a time via queue)
    recentUnread.forEach((notification) => {
      setShownNotificationIds((prev) => new Set(prev).add(notification.id));
      showToast(notification);
    });
  }, [notifications, showToast, shownNotificationIds]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!session?.user?.email) return;

      try {
        const { markNotificationAsRead } = await import(
          "@/lib/api/notificationApi"
        );
        await markNotificationAsRead(session.user.email, id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [session]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showToast,
        refreshNotifications: loadNotifications,
        markAsRead,
      }}
    >
      {children}
      {currentToast && (
        <ToastNotification
          key={currentToast.id}
          notification={currentToast}
          onClose={handleToastClose}
        />
      )}
    </NotificationContext.Provider>
  );
};
