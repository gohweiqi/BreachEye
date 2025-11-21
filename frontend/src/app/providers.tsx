"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
