import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { getAssignments } from "@/lib/queries";
import { BuildingIcon, CheckIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Resource Assignments | Smart Roster Management",
};

export default async function AssignmentsPage() {
  const assignments = await getAssignments();

  const activeCount = assignments.filter((a) => a.active).length;
  const primaryCount = assignments.filter((a) => a.isPrimary).length;

  return (
    <AppShell>
      <AppHeader
        title="Resource Assignments & Allocations"
        subtitle="Manage employee eligibility across client brands and operational processes"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Summary Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-neutral-900">Active Resource Mappings</h2>
            <p className="text-xs text-neutral-500">
              Each row defines a certified employee–brand–process combination eligible for roster allocation.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>
              <span className="font-mono font-bold text-neutral-900 tabular-nums">{activeCount}</span> Active
            </span>
            <span>
              <span className="font-mono font-bold text-neutral-900 tabular-nums">{primaryCount}</span> Primary
            </span>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Process</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">{a.employeeName}</div>
                      <div className="text-[10px] font-mono text-neutral-500">{a.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <BuildingIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <div>
                          <div className="font-medium text-neutral-800">{a.brandName}</div>
                          <div className="text-[10px] font-mono text-neutral-500">{a.brandCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">
                        {a.processCode}
                      </span>
                      <span className="ml-1.5 text-neutral-600">{a.processName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.isPrimary ? "default" : "outline"}>
                        {a.isPrimary ? "Primary" : "Secondary"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={a.active ? "success" : "secondary"}>
                        <CheckIcon className="w-3 h-3" />
                        <span>{a.active ? "Active" : "Inactive"}</span>
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
