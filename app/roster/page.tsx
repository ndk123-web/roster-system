"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  CheckIcon,
  UsersIcon,
  BuildingIcon,
  ProcessIcon,
  PodIcon,
  ClockIcon,
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(SEED_EMPLOYEES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [published, setPublished] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [inspectedDay, setInspectedDay] = useState<{
    employeeName: string;
    day: ComputedEmployeeDay;
  } | null>(null);

  // Run deterministic scheduling engine powered by date-fns
  const rosterData: GenerationResult = useMemo(() => {
    return generateNovember2026Roster();
  }, []);

  const { calendarDates, employeeSchedules, coverageMatrix, dailyHealth } = rosterData;

  // Filtered employees for Company / Pod / Employee views
  const filteredEmployees = useMemo(() => {
    if (viewMode === "employee") {
      return SEED_EMPLOYEES.filter((e) => e.id === selectedEmployeeId);
    }

    return SEED_EMPLOYEES.filter((emp) => {
      if (
        searchQuery &&
        !emp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !emp.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (viewMode === "pod" && selectedPodId !== "all" && emp.podId !== selectedPodId) {
        return false;
      }

      if (selectedPodId !== "all" && emp.podId !== selectedPodId) {
        return false;
      }

      return true;
    });
  }, [viewMode, selectedPodId, selectedEmployeeId, searchQuery]);

  const handlePublish = () => {
    if (rosterData.summary.mandatoryErrors > 0) {
      setPublishMessage(
        "Publication Blocked: Unresolved mandatory coverage gaps exist. Resolve all critical gaps before publishing (PRD Section 5 FR-15)."
      );
      setTimeout(() => setPublishMessage(null), 6000);
      return;
    }
    setPublished(true);
    setPublishMessage("November 2026 Roster successfully published.");
  };

  const getStatusBadge = (day: ComputedEmployeeDay, empName: string) => {
    switch (day.status) {
      case "WORKING":
        return (
          <button
            onClick={() => setInspectedDay({ employeeName: empName, day })}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
            title={`${day.date}: ${day.detail || "Working"}`}
            aria-label={`${empName} working on ${day.date}`}
          >
            W
          </button>
        );
      case "WEEKLY_OFF":
        return (
          <button
            onClick={() => setInspectedDay({ employeeName: empName, day })}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-medium bg-neutral-100 text-neutral-500 rounded border border-neutral-200/60 hover:bg-neutral-200/60 cursor-pointer"
            title={`${day.date}: Scheduled Weekly Off`}
            aria-label={`${empName} weekly off on ${day.date}`}
          >
            WO
          </button>
        );
      case "LEAVE":
        return (
          <button
            onClick={() => setInspectedDay({ employeeName: empName, day })}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-bold bg-red-100 text-red-700 rounded border border-red-200 hover:bg-red-200 cursor-pointer"
            title={`${day.date}: ${day.detail}`}
            aria-label={`${empName} on approved leave on ${day.date}`}
          >
            L
          </button>
        );
      case "COMP_OFF":
        return (
          <button
            onClick={() => setInspectedDay({ employeeName: empName, day })}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-semibold bg-amber-100 text-amber-800 rounded border border-amber-200 hover:bg-amber-200 cursor-pointer"
            title={`${day.date}: Compensatory Off`}
            aria-label={`${empName} comp-off on ${day.date}`}
          >
            CO
          </button>
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
          <span className="w-full h-7 flex items-center justify-center font-mono text-[11px] text-neutral-300">
            -
          </span>
        );
    }
  };

  return (
    <AppShell>
      <AppHeader
        title="Monthly Roster Matrix"
        subtitle="Operational Gantt matrix, 5 stakeholder perspectives, and daily coverage SLA tracking"
      />

      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Top Control Bar: Month, View Tabs & Publishing Gate */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Badge */}
            <div className="px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50 flex items-center gap-2 text-xs font-semibold text-neutral-900">
              <ClockIcon className="w-4 h-4 text-neutral-600" />
              <span>November 2026</span>
              <span className="text-neutral-400 font-normal">({calendarDates.length} Days)</span>
            </div>

            {/* 5 Views Selector (PRD Section 5 FR-11) */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200/60">
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
          </div>

          {/* Publication Gate Button */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-neutral-500">Validation Status</div>
              <div className="text-xs font-semibold font-mono">
                {rosterData.summary.mandatoryErrors > 0 ? (
                  <span className="text-red-600">
                    {rosterData.summary.mandatoryErrors} Blocking Gaps
                  </span>
                ) : (
                  <span className="text-emerald-600">Ready to Publish</span>
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
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600 mr-1" />
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

        {/* View-Specific Filters Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {viewMode !== "brand" && viewMode !== "process" && (
              <input
                type="search"
                placeholder="Search employee code or name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs w-52 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                aria-label="Search employees"
              />
            )}

            {/* Pod Selector */}
            {(viewMode === "company" || viewMode === "pod") && (
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
            )}

            {/* Employee Selector for Employee-wise View */}
            {viewMode === "employee" && (
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Employee:</span>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  aria-label="Select individual employee"
                >
                  {SEED_EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.code})
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

        {/* 1. Main Matrix Grid (Company / Pod / Employee Views) */}
        {(viewMode === "company" || viewMode === "pod" || viewMode === "employee") && (
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/90 border-b border-neutral-200">
                    <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[210px] border-r border-neutral-200">
                      Personnel &amp; Pod
                    </th>
                    {calendarDates.map((d) => (
                      <th
                        key={d.dateStr}
                        className={`px-1 py-2 text-center min-w-[34px] border-r border-neutral-100 ${
                          d.dayOfWeek === 0 ? "bg-neutral-100/70 font-semibold" : "font-medium"
                        }`}
                      >
                        <div className="text-[10px] text-neutral-400 uppercase tracking-tighter">
                          {d.dayLabel}
                        </div>
                        <div className="text-xs text-neutral-800 tabular-nums font-mono">
                          {d.dayOfMonth}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {filteredEmployees.map((emp) => {
                    const schedule = employeeSchedules[emp.id] || [];
                    const pod = SEED_PODS.find((p) => p.id === emp.podId);
                    const isLead = pod?.leadId === emp.id;

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-neutral-50/50 transition-colors group"
                      >
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50/95 px-4 py-2 border-r border-neutral-200 shadow-xs min-w-[210px]">
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

                        {schedule.map((day) => (
                          <td
                            key={day.date}
                            className={`p-1 text-center border-r border-neutral-100 ${
                              day.dayOfWeek === 0 ? "bg-neutral-50/40" : ""
                            }`}
                          >
                            {getStatusBadge(day, emp.name)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>

                {/* Bottom Sticky Daily Coverage SLA Row */}
                <tfoot>
                  <tr className="bg-neutral-100/90 border-t-2 border-neutral-300 font-mono text-[10px]">
                    <td className="sticky left-0 z-10 bg-neutral-100 px-4 py-2.5 font-bold text-neutral-900 border-r border-neutral-300">
                      DAILY COVERAGE STATUS
                    </td>
                    {dailyHealth.map((dh) => (
                      <td
                        key={dh.date}
                        className={`p-1 text-center border-r border-neutral-200 font-semibold ${
                          dh.hasGap
                            ? "bg-red-100 text-red-800"
                            : dh.isHoliday
                            ? "bg-neutral-200 text-neutral-700"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                        title={`${dh.date}: ${
                          dh.hasGap
                            ? `${dh.gapCount} Coverage Gap(s) Flagged!`
                            : dh.isHoliday
                            ? `Holiday (${dh.holidayName})`
                            : "100% Satisfied"
                        }`}
                      >
                        {dh.hasGap ? "GAP" : "OK"}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. Brand-Wise View Matrix (PRD Section 5 FR-11) */}
        {viewMode === "brand" && (
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span>Brand-Wise Operating Requirements &amp; Daily Staffing</span>
              <span className="text-[11px] text-neutral-500 font-normal">
                Shows whether each brand&apos;s active processes have adequate staff each day
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/90 border-b border-neutral-200">
                    <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[220px] border-r border-neutral-200">
                      Brand &amp; Process
                    </th>
                    {calendarDates.map((d) => (
                      <th
                        key={d.dateStr}
                        className="px-1 py-2 text-center min-w-[34px] border-r border-neutral-100"
                      >
                        <div className="text-[10px] text-neutral-400 uppercase">
                          {d.dayLabel}
                        </div>
                        <div className="text-xs text-neutral-800 tabular-nums font-mono">
                          {d.dayOfMonth}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {SEED_BRANDS.map((brand) => {
                    const brandDays = coverageMatrix.filter((c) => c.brandId === brand.id);
                    return (
                      <tr key={brand.id} className="hover:bg-neutral-50/50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-900 min-w-[220px]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold truncate">{brand.name}</span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              {brand.code}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {brand.isSingleResource ? "Single-Resource (~80%)" : "Multi-Resource (~20%)"}
                          </div>
                        </td>
                        {calendarDates.map((d) => {
                          const records = brandDays.filter((b) => b.date === d.dateStr);
                          if (records.length === 0) {
                            return (
                              <td key={d.dateStr} className="p-1 text-center border-r border-neutral-100 text-neutral-300">
                                -
                              </td>
                            );
                          }
                          const hasGap = records.some((r) => r.isOperating && !r.isMet);
                          const isOperating = records.some((r) => r.isOperating);

                          return (
                            <td
                              key={d.dateStr}
                              className={`p-1 text-center border-r border-neutral-100 font-mono text-[10px] font-semibold ${
                                !isOperating
                                  ? "bg-neutral-100/60 text-neutral-400"
                                  : hasGap
                                  ? "bg-red-100 text-red-800 font-bold"
                                  : "bg-emerald-50 text-emerald-800"
                              }`}
                              title={`${brand.name} on ${d.dateStr}: ${
                                !isOperating ? "Closed" : hasGap ? "COVERAGE GAP" : "Covered"
                              }`}
                            >
                              {!isOperating ? "OFF" : hasGap ? "0" : "1"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Process-Wise View Matrix (PRD Section 5 FR-11) */}
        {viewMode === "process" && (
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span>Process-Wise Operational Headcount Across Days</span>
              <span className="text-[11px] text-neutral-500 font-normal">
                Shows aggregated workforce allocation per core operational workflow
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/90 border-b border-neutral-200">
                    <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[220px] border-r border-neutral-200">
                      Process Category
                    </th>
                    {calendarDates.map((d) => (
                      <th
                        key={d.dateStr}
                        className="px-1 py-2 text-center min-w-[34px] border-r border-neutral-100"
                      >
                        <div className="text-[10px] text-neutral-400 uppercase">
                          {d.dayLabel}
                        </div>
                        <div className="text-xs text-neutral-800 tabular-nums font-mono">
                          {d.dayOfMonth}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {SEED_PROCESSES.map((proc) => {
                    const procDays = coverageMatrix.filter((c) => c.processId === proc.id);
                    return (
                      <tr key={proc.id} className="hover:bg-neutral-50/50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-900 min-w-[220px]">
                          <div className="font-semibold text-neutral-900">{proc.name}</div>
                          <div className="text-[10px] font-mono text-neutral-500">{proc.code} Workflow</div>
                        </td>
                        {calendarDates.map((d) => {
                          const records = procDays.filter((p) => p.date === d.dateStr && p.isOperating);
                          const totalAssigned = records.reduce((acc, r) => acc + r.assignedEmployees.length, 0);
                          const totalRequired = records.reduce((acc, r) => acc + r.requiredStaffing, 0);
                          const hasGap = totalAssigned < totalRequired;

                          return (
                            <td
                              key={d.dateStr}
                              className={`p-1 text-center border-r border-neutral-100 font-mono text-[10px] ${
                                hasGap
                                  ? "bg-red-50 text-red-700 font-bold"
                                  : "text-neutral-800 font-medium"
                              }`}
                            >
                              {totalAssigned}/{totalRequired}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cell Inspector Drawer / Modal */}
        {inspectedDay && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-lg max-w-md w-full p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Shift Details: {inspectedDay.employeeName}
                  </h3>
                  <span className="text-xs text-neutral-500 font-mono">
                    {format(new Date(`${inspectedDay.day.date}T12:00:00Z`), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <button
                  onClick={() => setInspectedDay(null)}
                  className="text-neutral-400 hover:text-neutral-900 text-sm font-bold p-1"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-500 block mb-1">Roster Entry Status:</span>
                  <Badge
                    variant={
                      inspectedDay.day.status === "WORKING"
                        ? "default"
                        : inspectedDay.day.status === "LEAVE"
                        ? "error"
                        : inspectedDay.day.status === "COMP_OFF"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {inspectedDay.day.status}
                  </Badge>
                </div>

                <div>
                  <span className="text-neutral-500 block mb-1">Activity Detail:</span>
                  <p className="font-medium text-neutral-900">
                    {inspectedDay.day.detail || "No additional shift notes"}
                  </p>
                </div>

                {inspectedDay.day.allocations.length > 0 && (
                  <div>
                    <span className="text-neutral-500 block mb-1">Allocated Brands &amp; Tasks:</span>
                    <div className="space-y-1">
                      {inspectedDay.day.allocations.map((a, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-neutral-50 border border-neutral-200 flex justify-between"
                        >
                          <span className="font-semibold text-neutral-800">{a.brandName}</span>
                          <span className="font-mono text-neutral-600">{a.processName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setInspectedDay(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
