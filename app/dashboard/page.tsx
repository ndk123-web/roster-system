import { AppHeader } from "@/components/layout/app-header";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { UrgentConflictsPanel } from "@/components/dashboard/urgent-conflicts-panel";
import { CoverageHealth } from "@/components/dashboard/coverage-health";
import { DistributionSummary } from "@/components/dashboard/distribution-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getCurrentRosterIssues, getDashboardStats } from "@/lib/queries";

export const metadata = {
  title: "Operations Dashboard | Smart Roster Management",
  description: "Workforce allocation, brand coverage, and conflict telemetry for D2C operations.",
};

export default async function DashboardPage() {
  const [stats, issues] = await Promise.all([getDashboardStats(), getCurrentRosterIssues()]);

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="Dashboard"
      />

      <div className="p-6 space-y-6 max-w-7xl">
        {/* Top Operational Metrics */}
        <StatsOverview
          totalEmployees={stats.totalEmployees}
          activeEmployees={stats.activeEmployees}
          totalBrands={stats.activeBrands}
          totalProcesses={stats.totalProcesses}
          singleResourceBrandsCount={stats.singleResourceBrandsCount}
          multiResourceBrandsCount={stats.multiResourceBrandsCount}
          pendingLeaves={stats.pendingLeaves}
        />

        {/* Primary Action Shortcuts */}
        <QuickActions />

        {/* Real-time Constraint Telemetry & Conflict Flagging */}
        <UrgentConflictsPanel issues={issues} />

        {/* Operational Pod Health & Staffing Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CoverageHealth pods={stats.pods} totalEmployees={stats.activeEmployees} />
          <DistributionSummary
            singleResource={stats.singleResourceBrandsCount}
            multiResource={stats.multiResourceBrandsCount}
            totalBrands={stats.activeBrands}
            totalEmployees={stats.activeEmployees}
          />
        </div>
      </div>
    </div>
  );
}
