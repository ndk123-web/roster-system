import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { PodIcon, CheckIcon, ClockIcon } from "@/components/ui/icons";
import { getEmployees, getPodsWithMembers } from "@/lib/queries";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const metadata = {
  title: "Employee Directory | Smart Roster Management",
};

export const instant = false

export default async function EmployeesPage() {
  const [employees, pods] = await Promise.all([getEmployees(), getPodsWithMembers()]);

  return (
    <AppShell>
      <AppHeader
        title="Employee Workforce Directory"
        subtitle="Manage personnel profiles, pod assignments, weekly off configurations, and process certifications"
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        {/* Summary Bar */}
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
            {employees.length} Personnel in DB
          </span>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Operational Pod</th>
                  <th className="px-4 py-3">Weekly Off</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-neutral-500 text-[11px] font-semibold">
                      {emp.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900 flex items-center gap-2">
                        <span>{emp.name}</span>
                        {emp.isLead && (
                          <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] rounded font-mono">
                            POD LEAD
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      <div className="flex items-center gap-1.5">
                        <PodIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{emp.podName ?? "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <ClockIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {emp.weeklyOffDays.map((d) => WEEKDAY_NAMES[d]).join(", ") || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={emp.active ? "success" : "secondary"}>
                        <CheckIcon className="w-3 h-3" />
                        <span>{emp.active ? "Active" : "Inactive"}</span>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
