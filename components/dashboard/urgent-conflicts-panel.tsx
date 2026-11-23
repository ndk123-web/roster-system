import { Fragment } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertIcon, ChevronRightIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { DashboardIssue } from "@/lib/queries";

export function UrgentConflictsPanel({ issues }: { issues: DashboardIssue[] }) {
  const errors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.filter((issue) => issue.severity === "WARNING").length;
  const visibleIssues = issues.slice(0, 5);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-neutral-900">
              Open Issues
            </h2>
            {errors > 0 ? (
              <Badge variant="error" className="tabular-nums">
                {errors} Error{errors === 1 ? "" : "s"}
              </Badge>
            ) : null}
            {warnings > 0 ? (
              <Badge variant="warning" className="tabular-nums">
                {warnings} Warning{warnings === 1 ? "" : "s"}
              </Badge>
            ) : null}
            {issues.length === 0 ? <Badge variant="success">No open issues</Badge> : null}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Resolve errors before publishing.
          </p>
        </div>

        <Link
          href="/issues"
          className="text-xs font-medium text-neutral-700 hover:text-neutral-950 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded shrink-0"
        >
          <span>
            View All {issues.length} Issue{issues.length === 1 ? "" : "s"}
          </span>
          <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
        </Link>
      </div>

      <div className="divide-y divide-neutral-100">
        {visibleIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No unresolved coverage or rule issues for the current month.
          </div>
        ) : (
          visibleIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={issue.severity === "ERROR" ? "error" : "warning"}>
                    <AlertIcon className="w-3 h-3 shrink-0" />
                    <span>{issue.severity === "ERROR" ? "Gap" : "Rule Warning"}</span>
                  </Badge>
                  {[
                    issue.brandName,
                    issue.processName,
                    issue.employeeName,
                    issue.date,
                  ]
                    .filter((part): part is string => Boolean(part))
                    .map((part, index) => (
                      <Fragment key={`${issue.id}-${index}`}>
                        {index > 0 ? <span className="text-neutral-300">•</span> : null}
                        <span
                          className={
                            index === 0
                              ? "text-xs font-semibold text-neutral-900"
                              : "text-xs text-neutral-600 font-medium tabular-nums"
                          }
                          translate="no"
                        >
                          {part}
                        </span>
                      </Fragment>
                    ))}
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed">{issue.message}</p>

                {issue.suggestion ? (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span className="font-medium text-neutral-700">Recommended fix:</span>
                    <span className="italic">{issue.suggestion}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                {issue.requiredStaffing !== undefined ? (
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-[11px] text-neutral-500">Staffing Level</div>
                    <div className="text-xs font-mono font-semibold tabular-nums text-red-600">
                      {issue.allocatedStaffing ?? 0} / {issue.requiredStaffing} Assigned
                    </div>
                  </div>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  href="/roster"
                  aria-label={`Resolve issue ${issue.id}`}
                >
                  <span>Resolve Gap</span>
                  <ArrowRightIcon className="w-3 h-3 text-neutral-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
