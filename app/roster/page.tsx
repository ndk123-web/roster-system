"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  CheckIcon,
  UsersIcon,
  BuildingIcon,
  ProcessIcon,
  PodIcon,
} from "@/components/ui/icons";
import {
  generateNovember2026Roster,
  type GenerationResult,
  type ComputedEmployeeDay,
} from "@/modules/roster/engine";
import {
  SEED_EMPLOYEES,
  SEED_PODS,
  SEED_BRANDS,
  SEED_PROCESSES,
} from "@/data/seed-data";

type RosterViewMode = "company" | "pod" | "brand" | "process" | "employee";

export default function RosterPage() {
  const [viewMode, setViewMode] = useState<RosterViewMode>("company");
  const [selectedPodId, setSelectedPodId] = useState<string>("all");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");
  const [selectedProcessId, setSelectedProcessId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [published, setPublished] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  // Generate roster data
  const rosterData: GenerationResult = useMemo(() => {
    return generateNovember2026Roster();
  }, []);

  const daysHeader = useMemo(() => {
    const days = [];
    const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    for (let d = 1; d <= 30; d++) {
      // 2026-11-01 was Sunday (0)
      const dt = new Date(`2026-11-${d < 10 ? "0" + d : d}T12:00:00Z`);
      const dayOfWeek = dt.getUTCDay();
      days.push({
        dayNum: d,
        weekday: weekdayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0,
      });
    }
    return days;
  }, []);

  // Filter employees according to current view
  const filteredEmployees = useMemo(() => {
    return SEED_EMPLOYEES.filter((emp) => {
      // Filter by search
      if (
        searchQuery &&
        !emp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !emp.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Pod-wise view filter
      if (viewMode === "pod" && selectedPodId !== "all") {
        if (emp.podId !== selectedPodId) return false;
      }

      // If user selected pod filter in general
      if (selectedPodId !== "all" && emp.podId !== selectedPodId) {
        return false;
      }

      return true;
    });
  }, [viewMode, selectedPodId, searchQuery]);

  const handlePublish = () => {
    if (rosterData.summary.mandatoryErrors > 0) {
      setPublishMessage(
        "Cannot publish: 2 mandatory coverage gaps must be resolved first (PRD Section 5 FR-15)."
      );
      setTimeout(() => setPublishMessage(null), 5000);
      return;
    }
    setPublished(true);
    setPublishMessage("Roster successfully published for November 2026.");
  };

  const getStatusBadge = (day: ComputedEmployeeDay) => {
    switch (day.status) {
      case "WORKING":
        return (
          <span
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-semibold bg-neutral-900 text-white rounded cursor-pointer hover:bg-neutral-800 transition-colors"
            title={`${day.date}: ${day.detail || "Working"}`}
          >
            W
          </span>
        );
      case "WEEKLY_OFF":
        return (
          <span
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-medium bg-neutral-100 text-neutral-500 rounded border border-neutral-200/60"
            title={`${day.date}: Scheduled Weekly Off`}
          >
            WO
          </span>
        );
      case "LEAVE":
        return (
          <span
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-bold bg-red-100 text-red-700 rounded border border-red-200"
            title={`${day.date}: ${day.detail}`}
          >
            L
          </span>
        );
      case "COMP_OFF":
        return (
          <span
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-semibold bg-amber-100 text-amber-800 rounded border border-amber-200"
            title={`${day.date}: Compensatory Off`}
          >
            CO
          </span>
        );
      case "PUBLIC_HOLIDAY":
        return (
          <span
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-medium bg-neutral-200 text-neutral-700 rounded"
            title={`${day.date}: Public Holiday`}
          >
            PH
          </span>
        );
      default:
        return (
          <span
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] text-neutral-300"
            title={`${day.date}: Unassigned`}
          >
            -
          </span>
        );
    }
  };

  return (
    <AppShell>
      <AppHeader
        title="Monthly Roster Matrix"
        subtitle="Operational scheduling, 5 stakeholder perspectives, and constraint validation"
      />

      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Top Control Bar: 5 Views & Publishing Status */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* View Mode Tabs (PRD Section 5 FR-11) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-lg border border-neutral-200/60">
            <button
              onClick={() => setViewMode("company")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "company"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Company View
            </button>
            <button
              onClick={() => setViewMode("pod")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "pod"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <PodIcon className="w-3.5 h-3.5" />
              <span>Pod-Wise</span>
            </button>
            <button
              onClick={() => setViewMode("brand")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "brand"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <BuildingIcon className="w-3.5 h-3.5" />
              <span>Brand-Wise</span>
            </button>
            <button
              onClick={() => setViewMode("process")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "process"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <ProcessIcon className="w-3.5 h-3.5" />
              <span>Process-Wise</span>
            </button>
            <button
              onClick={() => setViewMode("employee")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "employee"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Employee-Wise</span>
            </button>
          </div>

          {/* Roster Lifecycle & Publish Gate */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-neutral-500">Validation Status</div>
              <div className="text-xs font-semibold text-neutral-900">
                {rosterData.summary.mandatoryErrors > 0 ? (
                  <span className="text-red-600 font-mono">
                    {rosterData.summary.mandatoryErrors} Blocking Gaps
                  </span>
                ) : (
                  <span className="text-emerald-600">Passed Mandatory Rules</span>
                )}
              </div>
            </div>

            <Button
              variant={published ? "secondary" : "primary"}
              size="sm"
              onClick={handlePublish}
              disabled={published}
              aria-label="Publish November 2026 Roster"
            >
              {published ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Published (Nov 2026)</span>
                </>
              ) : (
                <span>Publish Roster</span>
              )}
            </Button>
          </div>
        </div>

        {/* Banner Alert for Feedback */}
        {publishMessage && (
          <div
            className={`p-3 rounded-md border text-xs flex items-center justify-between ${
              rosterData.summary.mandatoryErrors > 0
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertIcon className="w-4 h-4 shrink-0" />
              <span>{publishMessage}</span>
            </div>
            <button
              onClick={() => setPublishMessage(null)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Secondary Filters Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <input
              type="search"
              placeholder="Search employee code or name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs w-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              aria-label="Search employee by name or code"
            />

            {/* Pod Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 font-medium">Pod:</span>
              <select
                value={selectedPodId}
                onChange={(e) => setSelectedPodId(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                aria-label="Filter by operational pod"
              >
                <option value="all">All 4 Pods</option>
                {SEED_PODS.map((pod) => (
                  <option key={pod.id} value={pod.id}>
                    {pod.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            {viewMode === "brand" && (
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Brand:</span>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  <option value="all">All Brands</option>
                  {SEED_BRANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.isSingleResource ? "Single" : "Multi"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Process Filter */}
            {viewMode === "process" && (
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Process:</span>
                <select
                  value={selectedProcessId}
                  onChange={(e) => setSelectedProcessId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  <option value="all">All Processes</option>
                  {SEED_PROCESSES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-600 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                W
              </span>
              <span>Working</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-neutral-100 border border-neutral-300 text-neutral-600 flex items-center justify-center text-[10px]">
                WO
              </span>
              <span>Weekly Off</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-100 border border-red-300 text-red-700 flex items-center justify-center text-[10px]">
                L
              </span>
              <span>Leave</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-[10px]">
                CO
              </span>
              <span>Comp-Off</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px]">
                PH
              </span>
              <span>Holiday</span>
            </span>
          </div>
        </div>

        {/* Main Roster Matrix Grid */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200">
                  <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[200px] border-r border-neutral-200">
                    Personnel &amp; Pod
                  </th>
                  {daysHeader.map((d) => (
                    <th
                      key={d.dayNum}
                      className={`px-1 py-2 text-center min-w-[34px] border-r border-neutral-100 ${
                        d.isWeekend ? "bg-neutral-100/70 font-semibold" : "font-medium"
                      }`}
                    >
                      <div className="text-[10px] text-neutral-400 uppercase tracking-tighter">
                        {d.weekday}
                      </div>
                      <div className="text-xs text-neutral-800 tabular-nums font-mono">
                        {d.dayNum}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredEmployees.map((emp) => {
                  const schedule = rosterData.employeeSchedules[emp.id] || [];
                  const pod = SEED_PODS.find((p) => p.id === emp.podId);
                  const isLead = pod?.leadId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-neutral-50/50 transition-colors group"
                    >
                      {/* Fixed Left Column for Employee Information */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50/95 px-4 py-2 border-r border-neutral-200 shadow-xs min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 truncate">
                            {emp.name}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {emp.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span className="truncate">{pod?.name.split(" ")[0]}</span>
                          {isLead && (
                            <span className="px-1 py-0.2 bg-neutral-900 text-white text-[9px] rounded font-mono">
                              LEAD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 30 Calendar Days Columns */}
                      {schedule.map((day) => (
                        <td
                          key={day.date}
                          className={`p-1 text-center border-r border-neutral-100 ${
                            day.dayOfWeek === 0 ? "bg-neutral-50/40" : ""
                          }`}
                        >
                          {getStatusBadge(day)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Coverage & Summary */}
          <div className="p-4 bg-neutral-50/80 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
            <div className="flex items-center gap-4">
              <span>Showing {filteredEmployees.length} of 32 Employees</span>
              <span>•</span>
              <span className="font-mono font-medium text-neutral-800">
                Staffing Health: {rosterData.summary.coverageHealthPercentage}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">
                Clicking any cell opens the supervisor assignment editor
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
