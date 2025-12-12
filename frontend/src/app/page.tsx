import React, { Suspense } from "react";
import LandingPage from "./landingPage/landingPage";
import Dashboard from "./dashboard/page";
import NotificationsListPage from "./notifications/page";
import NotificationsSettings from "./settings/notificationsSettings/page";
import ManageAccountPage from "./settings/manageAccount/page";
import ManageEmailAccountsPage from "./settings/manageEmailAccounts/page";

export default function Page() {
  return (
    <>
      <Suspense
        fallback={
          <main className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </main>
        }
      >
        <LandingPage />
      </Suspense>
    </>
  );
}
