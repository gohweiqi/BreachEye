"use client";

import React from "react";
import { useSession } from "next-auth/react";

type SidebarItemProps = {
  label: string;
  active?: boolean;
};

const SidebarItem: React.FC<SidebarItemProps> = ({ label, active }) => {
  const base =
    "w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all border";
  const activeClasses =
    "bg-[#111111] border-[#D4AF37]/70 text-gray-50 shadow-[0_0_16px_rgba(212,175,55,0.25)] font-medium";
  const inactiveClasses =
    "bg-transparent border-transparent text-gray-300 hover:bg-[#101010] hover:border-[#D4AF37]/40";

  return (
    <button className={`${base} ${active ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

const Sidebar: React.FC = () => {
  const { data } = useSession();
  const email = data?.user?.email ?? "user@example.com";

  return (
    <aside className="h-full rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#050505] to-[#020202] p-4 flex flex-col">
      {/* User info */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-100 truncate">{email}</p>
        <p className="text-[11px] text-gray-500">Secure account</p>
      </div>

      <div className="space-y-4">
        {/* Overview */}
        <SidebarItem label="Overview" active />

        {/* Divider moved down */}
        <div className="border-t border-gray-700/70 my-2 mt-6" />

        {/* SETTINGS moved down */}
        <p className="text-[11px] tracking-[0.18em] text-gray-500 uppercase mt-4">
          Settings
        </p>

        <div className="space-y-2">
          <SidebarItem label="Notifications" />
          <SidebarItem label="Manage Email Address" />
          <SidebarItem label="Manage Account" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
