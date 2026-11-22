import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import {
  getActiveBrandOptions,
  getActiveEmployeeOptions,
  getActiveProcessOptions,
  getAssignments,
} from "@/lib/queries";
import { AssignmentsManager } from "@/components/master-data/assignments-manager";

export const metadata = {
  title: "Resource Assignments | Smart Roster Management",
};

export default async function AssignmentsPage() {
  const [assignments, employees, brands, processes] = await Promise.all([
    getAssignments(),
    getActiveEmployeeOptions(),
    getActiveBrandOptions(),
    getActiveProcessOptions(),
  ]);

  return (
    <AppShell>
      <AppHeader
        title="Resource Assignments & Allocations"
        subtitle="Manage employee eligibility across client brands and operational processes"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <AssignmentsManager
          rows={assignments}
          employees={employees}
          brands={brands}
          processes={processes}
        />
      </div>
    </AppShell>
  );
}
