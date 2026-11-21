import { AppHeader } from "@/components/layout/app-header";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { UrgentConflictsPanel } from "@/components/dashboard/urgent-conflicts-panel";
import { CoverageHealth } from "@/components/dashboard/coverage-health";
import { DistributionSummary } from "@/components/dashboard/distribution-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata = {
  title: "Operations Dashboard | Smart Roster Management",
  description: "Workforce allocation, brand coverage, and conflict telemetry for D2C operations.",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="Operations Dashboard"
        subtitle="Workforce allocation, client brand coverage, and conflict telemetry"
      />

      <div className="p-6 space-y-6 max-w-7xl">
        {/* Top Operational Metrics */}
        <StatsOverview />

        {/* Primary Action Shortcuts */}
        <QuickActions />

        {/* Real-time Constraint Telemetry & Conflict Flagging */}
        <UrgentConflictsPanel />

        {/* Operational Pod Health & Staffing Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CoverageHealth />
          <DistributionSummary />
        </div>
      </div>
    </div>
  );
}
