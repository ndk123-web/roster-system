"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClockIcon, CheckIcon } from "@/components/ui/icons";
import { SEED_LEAVES, SEED_COMPOFFS, SEED_EMPLOYEES } from "@/data/seed-data";

export default function AvailabilityPage() {
  const leaves = SEED_LEAVES;
  const compOffs = SEED_COMPOFFS;

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="error">Approved (Unavailable)</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending Review</Badge>;
      case "REJECTED":
        return <Badge variant="secondary">Rejected (Active)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppShell>
      <AppHeader
        title="Availability, Leaves &amp; Comp-Offs"
        subtitle="Manage employee time-off, approved leaves, compensatory off records, and coverage availability"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Planned Leaves Section */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-neutral-700" />
                <span>Planned Leaves &amp; Time-Off Records</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Approved leaves automatically mark employees as unavailable and trigger re-validation of affected brand processes.
              </p>
            </div>
            <Button variant="outline" size="sm">
              <span>+ Log Leave</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Reason &amp; Coverage Impact</th>
                  <th className="px-4 py-3 text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leaves.map((l) => {
                  const emp = SEED_EMPLOYEES.find((e) => e.id === l.employeeId);
                  return (
                    <tr key={l.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        <div>{emp?.name || l.employeeId}</div>
                        <div className="text-[11px] text-neutral-400 font-mono font-normal">
                          {emp?.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-neutral-700">
                        {l.type}
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-600 tabular-nums">
                        {l.startDate}
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-600 tabular-nums">
                        {l.endDate}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 max-w-xs">
                        <span className="truncate block">{l.reason}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {getLeaveStatusBadge(l.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compensatory Offs (Comp-Offs) */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-neutral-700" />
                <span>Compensatory Off Records (Comp-Offs)</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Earned compensatory days off for working prior national holidays or extra shifts.
              </p>
            </div>
            <Button variant="outline" size="sm">
              <span>+ Record Comp-Off</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Scheduled Comp-Off Date</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {compOffs.map((co) => {
                  const emp = SEED_EMPLOYEES.find((e) => e.id === co.employeeId);
                  return (
                    <tr key={co.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        <div>{emp?.name || co.employeeId}</div>
                        <div className="text-[11px] text-neutral-400 font-mono font-normal">
                          {emp?.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-800 font-medium tabular-nums">
                        {co.date}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {co.reason}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="warning">
                          <span>Comp-Off Scheduled</span>
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
