import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getEmployees, getPodsWithMembers } from "@/lib/queries";
import { PodsManager } from "@/components/master-data/pods-manager";

export const metadata = {
  title: "Operational Pods | Smart Roster Management",
};

export const instant = false;

export default async function PodsPage() {
  const [pods, employees] = await Promise.all([getPodsWithMembers(), getEmployees()]);

  return (
    <AppShell>
      <AppHeader
        title="Operational Pods & Pod Leads"
        subtitle="Team supervisory units, pod lead assignments, and department coverage tracking"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <PodsManager
          rows={pods}
          employees={employees.map((employee) => ({
            id: employee.id,
            name: employee.name,
            code: employee.code,
            active: employee.active,
            podName: employee.podName,
            leadsPodName: employee.leadsPodName,
          }))}
        />
      </div>
    </AppShell>
  );
}
