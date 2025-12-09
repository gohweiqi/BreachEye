"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";

type SidebarItemProps = {
  label: string;
  href: string;
  active?: boolean;
};

const SidebarItem: React.FC<SidebarItemProps> = ({ label, href, active }) => {
  const base =
    "w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all border";
  const activeClasses =
    "bg-[#111111] border-[#D4AF37]/70 text-gray-50 shadow-[0_0_16px_rgba(212,175,55,0.25)] font-medium";
  const inactiveClasses =
    "bg-transparent border-transparent text-gray-300 hover:bg-[#101010] hover:border-[#D4AF37]/40";

  return (
    <Link
      href={href}
      className={`${base} ${active ? activeClasses : inactiveClasses}`}
    >
      {label}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { data } = useSession();
  const pathname = usePathname();
  const email = data?.user?.email ?? "user@example.com";

  // Get unread count from notification context
  // Note: This will throw an error if NotificationProvider is not in the component tree
  // Make sure all pages using Sidebar have NotificationProvider in providers.tsx
  const { unreadCount } = useNotifications();

  return (
    <aside className="w-64 flex-shrink-0 self-stretch rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#050505] to-[#020202] p-4 flex flex-col">
      {/* User info */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-100 truncate">{email}</p>
        <p className="text-[11px] text-gray-500">Secure account</p>
      </div>

      <div className="space-y-4">
        {/* Overview and Notifications - closer spacing */}
        <div className="space-y-2">
          <SidebarItem
            label="Overview"
            href="/dashboard"
            active={pathname === "/dashboard"}
          />
          <div className="relative">
            <SidebarItem
              label="Notifications"
              href="/notifications"
              active={pathname === "/notifications"}
            />
            {unreadCount > 0 && (
              <div className="absolute top-1/2 -translate-y-1/2 right-3 flex-shrink-0 w-2 h-2 rounded-full bg-[#D4AF37]"></div>
            )}
          </div>
          <SidebarItem
            label="Monthly Summary"
            href="/monthlySummary"
            active={pathname === "/monthlySummary"}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700/70 my-2 mt-6" />

        {/* SETTINGS */}
        <p className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mt-4">
          Settings
        </p>

        <div className="space-y-2">
          <SidebarItem
            label="Notification Settings"
            href="/settings/notificationsSettings"
            active={pathname === "/settings/notificationsSettings"}
          />
          <SidebarItem
            label="Manage Email Address"
            href="/settings/manageEmailAccounts"
            active={pathname === "/settings/manageEmailAccounts"}
          />
          <SidebarItem
            label="Manage Account"
            href="/settings/manageAccount"
            active={pathname === "/settings/manageAccount"}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
