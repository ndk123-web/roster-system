"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EntityFormDialog } from "@/components/master-data/entity-form-dialog";
import {
  CheckIcon,
  UsersIcon,
  BuildingIcon,
  ProcessIcon,
  PodIcon,
  ClockIcon,
  RefreshCwIcon,
} from "@/components/ui/icons";
import type { ComputedEmployeeDay } from "@/modules/roster/engine";
import type { RosterViewData } from "@/modules/roster/view-types";
import {
  generateRoster,
  publishMonthlyRoster,
  revalidateRosters,
  updateRosterEntryAction,
} from "@/app/roster/actions";

type RosterViewMode = "company" | "pod" | "brand" | "process" | "employee";

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

export function RosterWorkbench({
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
  const [viewMode, setViewMode] = useState<RosterViewMode>("company");
  const [selectedPodId, setSelectedPodId] = useState<string>("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    view.employees[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dialog, setDialog] = useState<"generate" | "publish" | "revalidate" | null>(null);
  const [inspectedDay, setInspectedDay] = useState<{
    employeeId: string;
    employeeName: string;
    day: ComputedEmployeeDay;
  } | null>(null);
  const [editingDay, setEditingDay] = useState<{
    employeeId: string;
    employeeName: string;
    day: ComputedEmployeeDay;
  } | null>(null);

  const { calendarDates, employeeSchedules, coverageMatrix, dailyHealth } = view.result;
  const published = view.meta?.status === "PUBLISHED";
  const hasErrors = view.result.summary.mandatoryErrors > 0;
  const hiddenPeriod = { month: String(month), year: String(year) };

  const selectedEmployee = useMemo(
    () =>
      view.employees.find((employee) => employee.id === selectedEmployeeId) ??
      view.employees[0],
    [selectedEmployeeId, view.employees],
  );

  const filteredEmployees = useMemo(() => {
    if (viewMode === "employee") {
      return selectedEmployee ? [selectedEmployee] : [];
    }

    return view.employees.filter((employee) => {
      if (
        searchQuery &&
        !employee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !employee.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (selectedPodId !== "all" && employee.podId !== selectedPodId) {
        return false;
      }

      return true;
    });
  }, [view.employees, viewMode, selectedEmployee, selectedPodId, searchQuery]);

  function changePeriod(nextMonth: number, nextYear: number) {
    startTransition(() => {
      router.push(`/roster?month=${nextMonth}&year=${nextYear}`);
    });
  }

  function getStatusBadge(
    day: ComputedEmployeeDay,
    employeeName: string,
    employeeId: string,
  ) {
    const open = () => setInspectedDay({ employeeId, employeeName, day });

    switch (day.status) {
      case "WORKING":
        return (
          <button
            type="button"
            onClick={open}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
            title={`${day.date}: ${day.detail || "Working"}`}
            aria-label={`${employeeName} working on ${day.date}`}
          >
            W
          </button>
        );
      case "WEEKLY_OFF":
        return (
          <button
            type="button"
            onClick={open}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-medium bg-neutral-100 text-neutral-500 rounded border border-neutral-200/60 hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
            title={`${day.date}: Scheduled Weekly Off`}
            aria-label={`${employeeName} weekly off on ${day.date}`}
          >
            WO
          </button>
        );
      case "LEAVE":
        return (
          <button
            type="button"
            onClick={open}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-bold bg-red-100 text-red-700 rounded border border-red-200 hover:bg-red-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700"
            title={`${day.date}: ${day.detail}`}
            aria-label={`${employeeName} on approved leave on ${day.date}`}
          >
            L
          </button>
        );
      case "COMP_OFF":
        return (
          <button
            type="button"
            onClick={open}
            className="w-full h-7 flex items-center justify-center font-mono text-[11px] font-semibold bg-amber-100 text-amber-800 rounded border border-amber-200 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-800"
            title={`${day.date}: Compensatory Off`}
            aria-label={`${employeeName} comp-off on ${day.date}`}
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
  }

  return (
    <AppShell>
      <AppHeader
        title="Roster"
      />

      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5">
              <label htmlFor="roster-month" className="sr-only">
                Month
              </label>
              <select
                id="roster-month"
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
              <label htmlFor="roster-year" className="sr-only">
                Year
              </label>
              <select
                id="roster-year"
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
              <ClockIcon className="w-4 h-4 text-neutral-600" />
              <span className="text-xs text-neutral-400 font-normal">
                ({calendarDates.length} days)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog("revalidate")}
                disabled={!view.meta}
              >
                <RefreshCwIcon className="w-3.5 h-3.5 mr-1" />
                Revalidate
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setDialog("generate")}
                disabled={published}
              >
                {view.meta ? "Regenerate" : "Generate Roster"}
              </Button>
              <Button
                variant={published ? "secondary" : "primary"}
                size="sm"
                onClick={() => setDialog("publish")}
                disabled={!view.meta || published || hasErrors}
              >
                {published ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    Published
                  </>
                ) : (
                  "Publish Roster"
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <div className="text-[11px] text-neutral-500">Status</div>
              <div className="font-semibold text-neutral-900">
                {!view.meta
                  ? "Not Generated"
                  : published
                    ? "Published"
                    : hasErrors
                      ? "Issues Found"
                      : "Draft"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">Gaps</div>
              <div className={`font-semibold font-mono ${hasErrors ? "text-red-600" : "text-emerald-600"}`}>
                {view.result.summary.mandatoryErrors}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">Coverage</div>
              <div className="font-semibold font-mono text-neutral-900">
                {view.result.summary.coverageHealthPercentage}%
              </div>
            </div>
          </div>
        </div>

        {!view.meta ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center shadow-xs">
            <ClockIcon className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-neutral-900">
              No roster exists for {MONTHS[month - 1]} {year}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Generate a draft to calculate assignments and coverage.
            </p>
            <Button variant="primary" size="sm" onClick={() => setDialog("generate")}>
              Generate Roster
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200/60 w-fit">
              {(
                [
                  ["company", "Company", UsersIcon],
                  ["pod", "Pod", PodIcon],
                  ["brand", "Brand", BuildingIcon],
                  ["process", "Process", ProcessIcon],
                  ["employee", "Employee", UsersIcon],
                ] as const
              ).map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    viewMode === mode
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {viewMode !== "brand" && viewMode !== "process" && (
                  <input
                    type="search"
                    placeholder="Search employee code or name…"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs w-52 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    aria-label="Search employees"
                  />
                )}

                {(viewMode === "company" || viewMode === "pod") && (
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="roster-pod" className="text-neutral-500 font-medium">
                      Pod:
                    </label>
                    <select
                      id="roster-pod"
                      value={selectedPodId}
                      onChange={(event) => setSelectedPodId(event.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    >
                      <option value="all">All Pods</option>
                      {view.pods.map((pod) => (
                        <option key={pod.id} value={pod.id}>
                          {pod.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {viewMode === "employee" && (
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="roster-employee" className="text-neutral-500 font-medium">
                      Employee:
                    </label>
                    <select
                      id="roster-employee"
                      value={selectedEmployee?.id ?? ""}
                      onChange={(event) => setSelectedEmployeeId(event.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    >
                      {view.employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-600 flex-wrap">
                {[
                  ["W", "Working"],
                  ["WO", "Weekly Off"],
                  ["L", "Leave"],
                  ["CO", "Comp-Off"],
                  ["PH", "Holiday"],
                ].map(([code, label]) => (
                  <span key={code} className="flex items-center gap-1">
                    <span className="w-5 h-4 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-center text-[9px]">
                      {code}
                    </span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {(viewMode === "company" || viewMode === "pod" || viewMode === "employee") && (
              <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/90 border-b border-neutral-200">
                        <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[210px] border-r border-neutral-200">
                          Employee
                        </th>
                        {calendarDates.map((day) => (
                          <th
                            key={day.dateStr}
                            className={`px-1 py-2 text-center min-w-[34px] border-r border-neutral-100 ${
                              day.dayOfWeek === 0 ? "bg-neutral-100/70 font-semibold" : "font-medium"
                            }`}
                          >
                            <div className="text-[10px] text-neutral-400 uppercase tracking-tighter">
                              {day.dayLabel}
                            </div>
                            <div className="text-xs text-neutral-800 tabular-nums font-mono">
                              {day.dayOfMonth}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredEmployees.map((employee) => {
                        const schedule = employeeSchedules[employee.id] ?? [];
                        const pod = view.pods.find((item) => item.id === employee.podId);
                        const isLead = pod?.leadId === employee.id;

                        return (
                          <tr key={employee.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-neutral-200 min-w-[210px]">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-neutral-900 truncate">
                                  {employee.name}
                                </span>
                                <span className="font-mono text-[10px] text-neutral-400">
                                  {employee.code}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                                <span className="truncate">
                                  {pod?.name ?? "Unassigned"}
                                </span>
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
                                {getStatusBadge(day, employee.name, employee.id)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td
                            colSpan={calendarDates.length + 1}
                            className="px-4 py-10 text-center text-xs text-neutral-500"
                          >
                            No employees match the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-neutral-100/90 border-t-2 border-neutral-300 font-mono text-[10px]">
                        <td className="sticky left-0 z-10 bg-neutral-100 px-4 py-2.5 font-bold text-neutral-900 border-r border-neutral-300">
                          COVERAGE
                        </td>
                        {dailyHealth.map((day) => (
                          <td
                            key={day.date}
                            className={`p-1 text-center border-r border-neutral-200 font-semibold ${
                              day.hasGap
                                ? "bg-red-100 text-red-800"
                                : day.isHoliday
                                  ? "bg-neutral-200 text-neutral-700"
                                  : "bg-emerald-50 text-emerald-800"
                            }`}
                            title={`${day.date}: ${
                              day.hasGap
                                ? `${day.gapCount} gap(s)`
                                : day.isHoliday
                                  ? day.holidayName
                                  : "Coverage satisfied"
                            }`}
                          >
                            {day.hasGap ? "GAP" : "OK"}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {viewMode === "brand" && (
              <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-900">
                  Brand Coverage
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/90 border-b border-neutral-200">
                        <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[220px] border-r border-neutral-200">
                          Brand
                        </th>
                        {calendarDates.map((day) => (
                          <th key={day.dateStr} className="px-1 py-2 text-center min-w-[34px] border-r border-neutral-100">
                            <div className="text-[10px] text-neutral-400 uppercase">{day.dayLabel}</div>
                            <div className="text-xs text-neutral-800 tabular-nums font-mono">
                              {day.dayOfMonth}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {view.brands.map((brand) => {
                        const brandDays = coverageMatrix.filter((row) => row.brandId === brand.id);
                        return (
                          <tr key={brand.id} className="hover:bg-neutral-50/50">
                            <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-900 min-w-[220px]">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold truncate">{brand.name}</span>
                                <span className="font-mono text-[10px] text-neutral-400">{brand.code}</span>
                              </div>
                              <div className="text-[10px] text-neutral-500">
                                {brand.isSingleResource ? "Single-resource" : "Multi-resource"}
                              </div>
                            </td>
                            {calendarDates.map((day) => {
                              const records = brandDays.filter((row) => row.date === day.dateStr);
                              if (records.length === 0) {
                                return (
                                  <td key={day.dateStr} className="p-1 text-center border-r border-neutral-100 text-neutral-300">
                                    -
                                  </td>
                                );
                              }
                              const operating = records.filter((row) => row.isOperating);
                              const hasGap = operating.some((row) => !row.isMet);
                              return (
                                <td
                                  key={day.dateStr}
                                  className={`p-1 text-center border-r border-neutral-100 font-mono text-[10px] font-semibold ${
                                    operating.length === 0
                                      ? "bg-neutral-100/60 text-neutral-400"
                                      : hasGap
                                        ? "bg-red-100 text-red-800"
                                        : "bg-emerald-50 text-emerald-800"
                                  }`}
                                  title={`${brand.name} on ${day.dateStr}: ${
                                    operating.length === 0 ? "Closed" : hasGap ? "Coverage gap" : "Covered"
                                  }`}
                                >
                                  {operating.length === 0 ? "OFF" : hasGap ? "GAP" : "OK"}
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

            {viewMode === "process" && (
              <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-900">
                  Process Staffing
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/90 border-b border-neutral-200">
                        <th className="sticky left-0 z-10 bg-neutral-50/95 px-4 py-3 font-semibold text-neutral-900 min-w-[220px] border-r border-neutral-200">
                          Process
                        </th>
                        {calendarDates.map((day) => (
                          <th key={day.dateStr} className="px-1 py-2 text-center min-w-[34px] border-r border-neutral-100">
                            <div className="text-[10px] text-neutral-400 uppercase">{day.dayLabel}</div>
                            <div className="text-xs text-neutral-800 tabular-nums font-mono">
                              {day.dayOfMonth}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {view.processes.map((process) => {
                        const processDays = coverageMatrix.filter((row) => row.processId === process.id);
                        return (
                          <tr key={process.id} className="hover:bg-neutral-50/50">
                            <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-900 min-w-[220px]">
                              <div className="font-semibold">{process.name}</div>
                              <div className="text-[10px] font-mono text-neutral-500">{process.code}</div>
                            </td>
                            {calendarDates.map((day) => {
                              const records = processDays.filter(
                                (row) => row.date === day.dateStr && row.isOperating,
                              );
                              const assigned = records.reduce(
                                (sum, row) => sum + row.assignedEmployees.length,
                                0,
                              );
                              const required = records.reduce(
                                (sum, row) => sum + row.requiredStaffing,
                                0,
                              );
                              return (
                                <td
                                  key={day.dateStr}
                                  className={`p-1 text-center border-r border-neutral-100 font-mono text-[10px] ${
                                    assigned < required
                                      ? "bg-red-50 text-red-700 font-bold"
                                      : "text-neutral-800 font-medium"
                                  }`}
                                >
                                  {assigned}/{required}
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
        extraFields={hiddenPeriod}
        tone="primary"
      />
      <ConfirmDialog
        open={dialog === "publish"}
        onClose={() => setDialog(null)}
        title={`Publish ${MONTHS[month - 1]} ${year} roster?`}
        description="Publishing locks this roster. Resolve all gaps first."
        confirmLabel="Publish"
        action={publishMonthlyRoster}
        id=""
        extraFields={hiddenPeriod}
        tone="primary"
      />
      <ConfirmDialog
        open={dialog === "revalidate"}
        onClose={() => setDialog(null)}
        title="Revalidate all rosters?"
        description="Recalculates drafts using current data. Published rosters are unchanged."
        confirmLabel="Revalidate"
        action={revalidateRosters}
        id=""
        extraFields={hiddenPeriod}
        tone="primary"
      />

      {inspectedDay && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {inspectedDay.employeeName}
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {format(new Date(`${inspectedDay.day.date}T12:00:00`), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedDay(null)}
                className="text-neutral-400 hover:text-neutral-900 text-sm font-bold p-1"
                aria-label="Close shift details"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Status</span>
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
                <span className="text-neutral-500 block mb-1">Detail</span>
                <p className="font-medium text-neutral-900">
                  {inspectedDay.day.detail || "-"}
                </p>
              </div>
              {inspectedDay.day.allocations.length > 0 && (
                <div>
                  <span className="text-neutral-500 block mb-1">Allocations</span>
                  <div className="space-y-1">
                    {inspectedDay.day.allocations.map((allocation) => (
                      <div
                        key={`${allocation.brandId}-${allocation.processId}`}
                        className="p-2 rounded bg-neutral-50 border border-neutral-200 flex justify-between"
                      >
                        <span className="font-semibold text-neutral-800">{allocation.brandName}</span>
                        <span className="font-mono text-neutral-600">{allocation.processName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
              {!published && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingDay({
                      employeeId: inspectedDay.employeeId,
                      employeeName: inspectedDay.employeeName,
                      day: inspectedDay.day,
                    });
                    setInspectedDay(null);
                  }}
                >
                  Edit entry
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setInspectedDay(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingDay && (
        <EntityFormDialog
          key={`${editingDay.employeeId}-${editingDay.day.date}`}
          open
          onClose={() => {
            setEditingDay(null);
            setInspectedDay(null);
          }}
          title={`Edit roster entry: ${editingDay.employeeName}`}
          description={format(new Date(`${editingDay.day.date}T12:00:00`), "EEEE, MMMM d, yyyy")}
          submitLabel="Save entry"
          action={updateRosterEntryAction}
          hiddenFields={{
            month: String(month),
            year: String(year),
            employeeId: editingDay.employeeId,
            date: editingDay.day.date,
          }}
          values={{
            operation: "STATUS",
            status: editingDay.day.status,
            brandId: editingDay.day.allocations[0]?.brandId ?? "",
            processId: editingDay.day.allocations[0]?.processId ?? "",
          }}
          fields={[
            {
              name: "operation",
              label: "Change type",
              type: "select",
              required: true,
              options: [
                { value: "STATUS", label: "Change entry status" },
                { value: "ADD_ALLOCATION", label: "Assign brand and process" },
                { value: "REMOVE_ALLOCATION", label: "Remove brand and process" },
              ],
            },
            {
              name: "status",
              label: "Roster status",
              type: "select",
              required: true,
              options: [
                { value: "WORKING", label: "Working" },
                { value: "WEEKLY_OFF", label: "Weekly off" },
                { value: "LEAVE", label: "Leave" },
                { value: "COMP_OFF", label: "Comp-off" },
                { value: "PUBLIC_HOLIDAY", label: "Public holiday" },
                { value: "UNASSIGNED", label: "Unassigned" },
              ],
            },
            {
              name: "brandId",
              label: "Brand",
              type: "select",
              options: view.brands
                .filter((brand) => brand.active)
                .map((brand) => ({ value: brand.id, label: `${brand.code} — ${brand.name}` })),
            },
            {
              name: "processId",
              label: "Process",
              type: "select",
              options: view.processes
                .filter((process) => process.active)
                .map((process) => ({ value: process.id, label: `${process.code} — ${process.name}` })),
            },
          ]}
        />
      )}
    </AppShell>
  );
}
