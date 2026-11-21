import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, CheckIcon } from "@/components/ui/icons";
import { SEED_ASSIGNMENTS, SEED_EMPLOYEES, SEED_BRANDS, SEED_PROCESSES, SEED_PODS } from "@/data/seed-data";

export default function AssignmentsPage() {
  return (
    <AppShell>
      <AppHeader
        title="Resource Assignments &amp; Allocations"
        subtitle="Manage employee eligibility across client brands and operational processes"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-neutral-900">
              Active Resource Mappings
            </h2>
            <p className="text-xs text-neutral-500">
              Single-resource brands have 1 dedicated employee handling all processes; multi-resource brands feature shared/specialized assignments.
            </p>
          </div>
          <Badge variant="secondary">
            {SEED_ASSIGNMENTS.length} Active Mappings
          </Badge>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Assigned Pod</th>
                  <th className="px-4 py-3">Client Brand</th>
                  <th className="px-4 py-3">Process Assignment</th>
                  <th className="px-4 py-3">Allocation Type</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {SEED_ASSIGNMENTS.map((asgn) => {
                  const emp = SEED_EMPLOYEES.find((e) => e.id === asgn.employeeId);
                  const brand = SEED_BRANDS.find((b) => b.id === asgn.brandId);
                  const proc = SEED_PROCESSES.find((p) => p.id === asgn.processId);
                  const pod = SEED_PODS.find((p) => p.id === emp?.podId);

                  return (
                    <tr
                      key={asgn.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        <div>{emp?.name || asgn.employeeId}</div>
                        <div className="text-[11px] text-neutral-400 font-mono font-normal">
                          {emp?.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {pod?.name.split(" ")[0]}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900" translate="no">
                        <div className="flex items-center gap-1.5">
                          <BuildingIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>{brand?.name || asgn.brandId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 border border-neutral-200 font-medium">
                          {proc?.name} ({proc?.code})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={asgn.isPrimary ? "default" : "outline"}>
                          {asgn.isPrimary ? "Primary Dedicated" : "Shared / Backup"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="success">
                          <CheckIcon className="w-3 h-3" />
                          <span>Active</span>
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
