import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PodIcon, ShieldCheckIcon, AlertIcon } from "@/components/ui/icons";
import type { PodSummary } from "@/lib/queries";

interface CoverageHealthProps {
  pods: PodSummary[];
  totalEmployees: number;
}

export function CoverageHealth({ pods, totalEmployees }: CoverageHealthProps) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs flex flex-col">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <PodIcon className="w-4 h-4 text-neutral-700" />
            <span>Pods</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {pods.length} pods across{" "}
            <span className="tabular-nums font-medium">{totalEmployees}</span> employees
          </p>
        </div>

        <Link
          href="/pods"
          className="text-xs font-medium text-neutral-700 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          Manage Pods
        </Link>
      </div>

      <div className="p-5 space-y-4">
        {pods.map((pod) => {
          // Coverage rate: 100% base — we don't have engine data yet, show staffing
          const memberCount = pod.memberCount;
          const hasLead = !!pod.leadName;

          return (
            <div
              key={pod.id}
              className="p-3.5 rounded-md border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {pod.name}
                    </span>
                    <Badge variant={hasLead ? "success" : "warning"}>
                      {hasLead ? (
                        <>
                          <ShieldCheckIcon className="w-3 h-3" />
                          <span>Lead Assigned</span>
                        </>
                      ) : (
                        <>
                          <AlertIcon className="w-3 h-3" />
                          <span>No Lead</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {pod.leadName ? (
                      <>
                        Lead:{" "}
                        <span className="font-medium text-neutral-700">{pod.leadName}</span> •{" "}
                      </>
                    ) : null}
                    <span className="tabular-nums">{memberCount}</span> Members
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                    {memberCount}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Members</span>
                </div>
              </div>

              {/* Relative size bar */}
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-neutral-800 transition-all duration-300"
                  style={{ width: `${Math.min(100, (memberCount / (totalEmployees || 1)) * 100 * pods.length)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto px-5 py-3 bg-neutral-50/70 border-t border-neutral-100 rounded-b-lg flex items-center justify-between text-xs text-neutral-500">
        <span>Target: full coverage</span>
        <span className="font-mono text-neutral-700 tabular-nums">
          Employees: {totalEmployees}
        </span>
      </div>
    </div>
  );
}
