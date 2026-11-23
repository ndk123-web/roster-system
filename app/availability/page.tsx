import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getActiveEmployeeOptions, getCompOffs, getLeaves } from "@/lib/queries";
import { LeaveManager } from "@/components/availability/leave-manager";
import { CompOffManager } from "@/components/availability/comp-off-manager";

export const metadata = {
  title: "Availability & Leave | Smart Roster Management",
};

export default async function AvailabilityPage() {
  const [leaves, compOffs, employees] = await Promise.all([
    getLeaves(),
    getCompOffs(),
    getActiveEmployeeOptions(),
  ]);

  const pendingCount = leaves.filter((leave) => leave.status === "PENDING").length;
  const approvedCount = leaves.filter((leave) => leave.status === "APPROVED").length;
  const approvedCompOffs = compOffs.filter((compOff) => compOff.status === "APPROVED").length;

  return (
    <AppShell>
      <AppHeader
        title="Availability"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Leave Requests", value: leaves.length },
            { label: "Approved", value: approvedCount },
            { label: "Pending", value: pendingCount },
            { label: "Comp-Offs", value: approvedCompOffs },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs"
            >
              <div className="text-[11px] text-neutral-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <LeaveManager rows={leaves} employees={employees} />
        <CompOffManager rows={compOffs} employees={employees} />
      </div>
    </AppShell>
  );
}
