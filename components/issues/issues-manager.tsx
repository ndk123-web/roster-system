"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertIcon, CheckIcon, RefreshCwIcon } from "@/components/ui/icons";
import type { RosterViewData } from "@/modules/roster/view-types";
import { generateRoster, revalidateRosters } from "@/app/roster/actions";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function IssuesManager({
  view,
  month,
  year,
}: {
  view: RosterViewData;
  month: number;
  year: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | "ERROR" | "WARNING">("ALL");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<"generate" | "revalidate" | null>(null);

  const issues = view.result.issues;
  const errors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.filter((issue) => issue.severity === "WARNING").length;

  const visibleIssues = useMemo(
    () =>
      issues.filter((issue) => {
        if (acknowledged.has(issue.id)) return false;
        if (filter === "ALL") return true;
        return issue.severity === filter;
      }),
    [issues, filter, acknowledged],
  );

  function changePeriod(nextMonth: number, nextYear: number) {
    startTransition(() => {
      router.push(`/issues?month=${nextMonth}&year=${nextYear}`);
    });
  }

  return (
    <AppShell>
      <AppHeader title="Issues" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5">
              <label htmlFor="issues-month" className="sr-only">
                Month
              </label>
              <select
                id="issues-month"
                value={month}
                disabled={isPending}
                onChange={(event) => changePeriod(Number(event.target.value), year)}
                className="bg-transparent text-xs font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <label htmlFor="issues-year" className="sr-only">
                Year
              </label>
              <select
                id="issues-year"
                value={year}
                disabled={isPending}
                onChange={(event) => changePeriod(month, Number(event.target.value))}
                className="bg-transparent text-xs font-semibold text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
              >
                {Array.from({ length: 7 }, (_, index) => year - 2 + index).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <Badge variant={view.meta ? (errors > 0 ? "error" : "secondary") : "secondary"}>
              {!view.meta
                ? "Not Generated"
                : view.meta.status === "PUBLISHED"
                  ? "Published"
                  : errors > 0
                    ? "Issues Found"
                    : "Draft"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("revalidate")}
              disabled={!view.meta || view.meta.status === "PUBLISHED"}
            >
              <RefreshCwIcon className="w-3.5 h-3.5 mr-1" />
              Revalidate
            </Button>
            <Button variant="primary" size="sm" onClick={() => setDialog("generate")}>
              {view.meta ? "Regenerate" : "Generate Roster"}
            </Button>
            <Link
              href={`/roster?month=${month}&year=${year}`}
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              View Roster
            </Link>
          </div>
        </div>

        {!view.meta ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center shadow-xs">
            <AlertIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h2 className="text-sm font-semibold text-neutral-900">No validation results yet</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Generate a roster for the selected month to record coverage gaps and warnings.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total", value: issues.length },
                { label: "Gaps", value: errors },
                { label: "Warnings", value: warnings },
                { label: "Coverage", value: `${view.result.summary.coverageHealthPercentage}%` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs">
                  <div className="text-[11px] text-neutral-500 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["ALL", `All (${issues.length})`],
                    ["ERROR", `Gaps (${errors})`],
                    ["WARNING", `Warnings (${warnings})`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      filter === value
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-neutral-500">
                Publish:{" "}
                <span className="font-semibold text-neutral-800">
                  {errors > 0 ? "Blocked" : "Ready"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {visibleIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={issue.severity === "ERROR" ? "error" : "warning"}>
                        <AlertIcon className="w-3 h-3" />
                        {issue.severity === "ERROR" ? "Gap" : "Warning"}
                      </Badge>
                      {issue.brandName && (
                        <span className="text-xs font-semibold text-neutral-900" translate="no">
                          {issue.brandName}
                        </span>
                      )}
                      {issue.processName && (
                        <span className="text-xs text-neutral-600 font-medium">
                          {issue.processName}
                        </span>
                      )}
                      {issue.employeeName && (
                        <span className="text-xs text-neutral-600 font-medium">
                          {issue.employeeName}
                        </span>
                      )}
                      <span className="text-xs font-mono text-neutral-500 tabular-nums">
                        {issue.date}
                      </span>
                      {issue.requiredStaffing !== undefined && (
                        <span className="text-[11px] font-mono text-neutral-500">
                          {issue.allocatedStaffing ?? 0}/{issue.requiredStaffing} staffed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                      {issue.message}
                    </p>
                    {issue.suggestion && (
                      <div className="text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-700">Fix:</span>{" "}
                        {issue.suggestion}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAcknowledged((current) => new Set([...current, issue.id]))
                    }
                    aria-label={`Acknowledge issue ${issue.id}`}
                  >
                    <CheckIcon className="w-3.5 h-3.5 text-neutral-700 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              ))}

              {visibleIssues.length === 0 && (
                <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center shadow-xs">
                  <CheckIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {issues.length === 0 ? "No issues" : "All issues acknowledged"}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {issues.length === 0
                      ? "All coverage requirements are satisfied."
                      : "Change the filter to review the remaining issues."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={dialog === "generate"}
        onClose={() => setDialog(null)}
        title={view.meta ? "Regenerate monthly roster?" : "Generate monthly roster?"}
        description="This replaces the current draft for the selected month."
        confirmLabel="Generate"
        action={generateRoster}
        id=""
        extraFields={{ month: String(month), year: String(year) }}
        tone="primary"
      />
      <ConfirmDialog
        open={dialog === "revalidate"}
        onClose={() => setDialog(null)}
        title="Revalidate draft rosters?"
        description="Recalculates drafts using current data. Published rosters are unchanged."
        confirmLabel="Revalidate"
        action={revalidateRosters}
        id=""
        extraFields={{ month: String(month), year: String(year) }}
        tone="primary"
      />
    </AppShell>
  );
}
