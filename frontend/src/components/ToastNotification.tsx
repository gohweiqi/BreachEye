"use client";

import React, { useEffect, useState } from "react";
import { Notification } from "@/lib/api/notificationApi";

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case "breach":
        return {
          borderColor: "border-red-500/50",
          bgColor: "bg-red-900/20",
          icon: "🔒",
          iconColor: "text-red-400",
        };
      case "security":
        return {
          borderColor: "border-yellow-500/50",
          bgColor: "bg-yellow-900/20",
          icon: "⚠️",
          iconColor: "text-yellow-400",
        };
      case "summary":
        return {
          borderColor: "border-blue-500/50",
          bgColor: "bg-blue-900/20",
          icon: "📊",
          iconColor: "text-blue-400",
        };
      case "system":
        return {
          borderColor: "border-[#D4AF37]/50",
          bgColor: "bg-[#D4AF37]/10",
          icon: "ℹ️",
          iconColor: "text-[#D4AF37]",
        };
      default:
        return {
          borderColor: "border-gray-500/50",
          bgColor: "bg-gray-900/20",
          icon: "📢",
          iconColor: "text-gray-400",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
      `}
    >
      <div
        className={`
          rounded-lg border ${styles.borderColor} ${styles.bgColor}
          bg-gradient-to-b from-[#0a0a0a] to-[#020202]
          p-4 shadow-2xl backdrop-blur-sm
          cursor-pointer hover:scale-[1.02] transition-transform
        `}
        onClick={handleClose}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`text-2xl flex-shrink-0 ${styles.iconColor}`}>
            {styles.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-50 mb-1">
              {notification.title}
            </h3>
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500">{notification.time}</p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
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

          {/* Unread indicator */}
          {!notification.read && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D4AF37]"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
