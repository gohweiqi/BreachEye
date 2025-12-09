"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { NotificationProvider } from "@/contexts/NotificationContext";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </SessionProvider>
  );
};

export default Providers;
