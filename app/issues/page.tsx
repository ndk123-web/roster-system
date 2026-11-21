"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  CheckIcon,
  RefreshCwIcon,
} from "@/components/ui/icons";
import { generateNovember2026Roster } from "@/modules/roster/engine";
import { SEED_LEAVES, SEED_COMPOFFS, SEED_ASSIGNMENTS } from "@/data/seed-data";
import type { LeaveRecord } from "@/data/types";

export default function IssuesPage() {
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "ERROR" | "WARNING">("ALL");
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [resolvedIssueIds, setResolvedIssueIds] = useState<Set<string>>(new Set());

  // Dynamically inject simulated post-generation leave change if toggled
  const activeLeaves = useMemo(() => {
    if (!isSimulated) return SEED_LEAVES;
    // Add simulated unplanned leave for Varun Chopra (AuraLifestyle CS)
    const simulatedLeave: LeaveRecord = {
      id: "sim-leave-01",
      employeeId: "emp-018", // Varun Chopra
      startDate: "2026-11-18",
      endDate: "2026-11-19",
      type: "CASUAL",
      status: "APPROVED",
      reason: "Post-generation leave approved by Operations Manager",
    };
    return [...SEED_LEAVES, simulatedLeave];
  }, [isSimulated]);

  const rosterResult = useMemo(() => {
    return generateNovember2026Roster(activeLeaves, SEED_COMPOFFS, SEED_ASSIGNMENTS);
  }, [activeLeaves]);

  const displayedIssues = useMemo(() => {
    return rosterResult.issues.filter((issue) => {
      if (resolvedIssueIds.has(issue.id)) return false;
      if (filterSeverity === "ERROR") return issue.severity === "ERROR";
      if (filterSeverity === "WARNING") return issue.severity === "WARNING";
      return true;
    });
  }, [rosterResult.issues, filterSeverity, resolvedIssueIds]);

  const handleQuickResolve = (issueId: string) => {
    setResolvedIssueIds((prev) => new Set([...prev, issueId]));
  };

  return (
    <AppShell>
      <AppHeader
        title="Coverage Diagnostics &amp; Constraint Telemetry"
        subtitle="Automated conflict detection, hard constraint gating, and post-generation change analysis"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Simulation Banner (Demonstrating PRD Section 3.F & FR-14) */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                PRD Section 3.F Demo Feature
              </span>
              <Badge variant="secondary">Change Handling Engine</Badge>
            </div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Test Post-Generation Availability Changes
            </h2>
            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
              Demonstrate what occurs when an employee takes leave after a roster is generated. The system recalculates constraints in real time without manually recreating the whole roster.
            </p>
          </div>

          <Button
            variant={isSimulated ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsSimulated(!isSimulated)}
            aria-label="Simulate unplanned leave after roster generation"
          >
            <RefreshCwIcon className="w-3.5 h-3.5 mr-1" />
            <span>{isSimulated ? "Reset Baseline" : "Simulate Post-Gen Leave"}</span>
          </Button>
        </div>

        {/* Filters and Diagnostics Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSeverity("ALL")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filterSeverity === "ALL"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              All Telemetry ({displayedIssues.length})
            </button>
            <button
              onClick={() => setFilterSeverity("ERROR")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterSeverity === "ERROR"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Mandatory Gaps</span>
            </button>
            <button
              onClick={() => setFilterSeverity("WARNING")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterSeverity === "WARNING"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Warnings</span>
            </button>
          </div>

          <div className="text-xs text-neutral-500">
            Publish status:{" "}
            <span className="font-semibold text-neutral-800">
              {displayedIssues.some((i) => i.severity === "ERROR")
                ? "Publication Blocked (Resolve Mandatory Gaps)"
                : "Ready to Publish"}
            </span>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {displayedIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={issue.severity === "ERROR" ? "error" : "warning"}>
                    <AlertIcon className="w-3 h-3" />
                    <span>{issue.severity === "ERROR" ? "Mandatory Gap" : "Rule Warning"}</span>
                  </Badge>

                  {issue.brandName && (
                    <span className="text-xs font-semibold text-neutral-900" translate="no">
                      {issue.brandName}
                    </span>
                  )}

                  {issue.processName && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs text-neutral-600 font-medium">
                        {issue.processName}
                      </span>
                    </>
                  )}

                  <span className="text-neutral-300">•</span>
                  <span className="text-xs font-mono text-neutral-500 tabular-nums">
                    {issue.date}
                  </span>
                </div>

                <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                  {issue.message}
                </p>

                {issue.suggestion && (
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-700">Recommendation:</span>
                    <span>{issue.suggestion}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickResolve(issue.id)}
                  aria-label={`Resolve issue ${issue.id}`}
                >
                  <CheckIcon className="w-3.5 h-3.5 text-neutral-700 mr-1" />
                  <span>Assign Resolution</span>
                </Button>
              </div>
            </div>
          ))}

          {displayedIssues.length === 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center shadow-xs">
              <CheckIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Zero Detected Conflicts
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                All operating calendars, staffing thresholds, and employee availability rules are fully satisfied.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
