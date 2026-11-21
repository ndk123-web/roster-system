import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100/60 flex">
      {/* Skip link for keyboard accessibility */}
      <a
        href="#dashboard-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
      >
        Skip to main content
      </a>

      {/* Persistent Left Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main id="dashboard-main-content" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
