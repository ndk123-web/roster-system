import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { getLeaves, getCompOffs } from "@/lib/queries";
import { ClockIcon } from "@/components/ui/icons";
import { format, parseISO } from "date-fns";

export const metadata = {
  title: "Availability & Leave | Smart Roster Management",
};

function LeaveStatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="error">Approved (Unavailable)</Badge>;
  if (status === "PENDING") return <Badge variant="warning">Pending Review</Badge>;
  return <Badge variant="secondary">Rejected</Badge>;
}

export default async function AvailabilityPage() {
  const [leaves, compOffs] = await Promise.all([getLeaves(), getCompOffs()]);

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;

  return (
    <AppShell>
      <AppHeader
        title="Availability & Leave Management"
        subtitle="Track approved leaves, comp-offs, and pending requests that affect roster coverage"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Leave Requests", value: leaves.length, variant: "secondary" as const },
            { label: "Approved Leaves", value: approvedCount, variant: "error" as const },
            { label: "Pending Review", value: pendingCount, variant: "warning" as const },
            { label: "Comp-Off Days", value: compOffs.length, variant: "default" as const },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs"
            >
              <div className="text-[11px] text-neutral-500 mb-1">{s.label}</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Leave Requests */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Leave Requests</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Approved leaves create hard constraints during roster generation
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              {leaves.length} records
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No leave records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Leave Period</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{leave.employeeName}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{leave.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono text-neutral-700">
                          <ClockIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>
                            {format(parseISO(leave.startDate), "MMM d")}
                            {leave.startDate !== leave.endDate
                              ? ` – ${format(parseISO(leave.endDate), "MMM d, yyyy")}`
                              : `, ${format(parseISO(leave.startDate), "yyyy")}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{leave.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 italic max-w-xs truncate">
                        {leave.reason ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <LeaveStatusBadge status={leave.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comp-Off Days */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Compensatory Off Days</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Comp-offs are treated as absence days during scheduling
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              {compOffs.length} records
            </span>
          </div>

          {compOffs.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No comp-off records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {compOffs.map((co) => (
                    <tr key={co.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{co.employeeName}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{co.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-700">
                        {format(parseISO(co.date), "EEEE, MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 italic">{co.reason ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={co.status === "APPROVED" ? "warning" : "secondary"}>
                          {co.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
