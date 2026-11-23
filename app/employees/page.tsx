import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getEmployees, getPodsWithMembers } from "@/lib/queries";
import { EmployeesManager } from "@/components/master-data/employees-manager";

export const metadata = {
  title: "Employee Directory | Smart Roster Management",
};

export default async function EmployeesPage() {
  const [employees, pods] = await Promise.all([getEmployees(), getPodsWithMembers()]);

  return (
    <AppShell>
      <AppHeader
        title="Employees"
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {pods.map((pod) => (
              <span
                key={pod.id}
                className="text-xs text-neutral-600 font-medium bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-md"
              >
                {pod.name} — {pod.employees.length} members
              </span>
            ))}
          </div>
          <span className="text-xs text-neutral-500 font-mono tabular-nums self-end sm:self-auto">
            {employees.length} employees
          </span>
        </div>

        <EmployeesManager
          rows={employees}
          pods={pods.map((pod) => ({ id: pod.id, name: pod.name }))}
        />
      </div>
    </AppShell>
  );
}
