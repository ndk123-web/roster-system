// Deterministic Roster Generation & Constraint Engine
// Powered by date-fns for robust calendar expansion & date calculations
// Docs: docs/prd.md Section 6.3

import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  getDay,
  parseISO,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import type {
  Employee,
  Brand,
  Process,
  EmployeeAssignment,
  PublicHoliday,
  LeaveRecord,
  CompOffRecord,
  ValidationIssue,
  RosterEntryStatus,
} from "@/data/types";
import {
  SEED_EMPLOYEES,
  SEED_BRANDS,
  SEED_PROCESSES,
  SEED_RULES,
  SEED_ASSIGNMENTS,
  SEED_HOLIDAYS,
  SEED_LEAVES,
  SEED_COMPOFFS,
} from "@/data/seed-data";

export interface DayCoverageStatus {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  brandId: string;
  brandName: string;
  brandCode: string;
  processId: string;
  processName: string;
  processCode: string;
  isOperating: boolean;
  requiredStaffing: number;
  assignedEmployees: { id: string; name: string }[];
  isMet: boolean;
}

export interface ComputedEmployeeDay {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  status: RosterEntryStatus;
  statusLabel: string;
  allocations: {
    brandCode: string;
    processCode: string;
    brandName: string;
    processName: string;
  }[];
  detail?: string;
}

export interface DailyHealthSummary {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  isHoliday: boolean;
  holidayName?: string;
  totalOperatingRules: number;
  satisfiedRules: number;
  hasGap: boolean;
  gapCount: number;
}

export interface GenerationResult {
  month: number;
  year: number;
  daysCount: number;
  calendarDates: { date: Date; dateStr: string; dayOfMonth: number; dayOfWeek: number; dayLabel: string }[];
  employeeSchedules: Record<string, ComputedEmployeeDay[]>;
  coverageMatrix: DayCoverageStatus[];
  dailyHealth: DailyHealthSummary[];
  issues: ValidationIssue[];
  status: "DRAFT" | "ISSUES_FOUND" | "PUBLISHED";
  summary: {
    totalShifts: number;
    mandatoryErrors: number;
    warnings: number;
    coverageHealthPercentage: number;
  };
}

export function generateNovember2026Roster(
  customLeaves: LeaveRecord[] = SEED_LEAVES,
  customCompOffs: CompOffRecord[] = SEED_COMPOFFS,
  customAssignments: EmployeeAssignment[] = SEED_ASSIGNMENTS
): GenerationResult {
  const year = 2026;
  const month = 11; // November 2026
  const baseDate = new Date(year, month - 1, 1);

  // Generate all month dates using date-fns
  const intervalDays = eachDayOfInterval({
    start: startOfMonth(baseDate),
    end: endOfMonth(baseDate),
  });

  const calendarDates = intervalDays.map((d) => ({
    date: d,
    dateStr: format(d, "yyyy-MM-dd"),
    dayOfMonth: parseInt(format(d, "d"), 10),
    dayOfWeek: getDay(d),
    dayLabel: format(d, "EEE"), // "Sun", "Mon", ...
  }));

  const holidaysMap = new Map<string, PublicHoliday>();
  for (const h of SEED_HOLIDAYS) {
    holidaysMap.set(h.date, h);
  }

  // Pre-index employees, brands, processes
  const employeeMap = new Map<string, Employee>();
  for (const e of SEED_EMPLOYEES) employeeMap.set(e.id, e);

  const brandMap = new Map<string, Brand>();
  for (const b of SEED_BRANDS) brandMap.set(b.id, b);

  const processMap = new Map<string, Process>();
  for (const p of SEED_PROCESSES) processMap.set(p.id, p);

  const issues: ValidationIssue[] = [];
  const coverageMatrix: DayCoverageStatus[] = [];
  const dailyHealth: DailyHealthSummary[] = [];
  const employeeSchedules: Record<string, ComputedEmployeeDay[]> = {};

  for (const emp of SEED_EMPLOYEES) {
    employeeSchedules[emp.id] = [];
  }

  let totalRequiredShifts = 0;
  let totalFilledShifts = 0;

  // Track daily allocations to detect double-booking
  const dailyEmployeeAllocations = new Map<
    string,
    Map<string, { brandId: string; processId: string }[]>
  >();

  for (const { date: currentDate, dateStr, dayOfMonth, dayOfWeek } of calendarDates) {
    const isHoliday = holidaysMap.has(dateStr);
    const dayAllocations = new Map<string, { brandId: string; processId: string }[]>();
    dailyEmployeeAllocations.set(dateStr, dayAllocations);

    let dayOperatingRules = 0;
    let daySatisfiedRules = 0;
    let dayGapCount = 0;

    // 1. Evaluate coverage rules
    for (const rule of SEED_RULES) {
      const brand = brandMap.get(rule.brandId);
      const proc = processMap.get(rule.processId);
      if (!brand || !proc) continue;

      let isOperating = true;
      if (rule.operatingPattern === "ALL_365") {
        isOperating = true;
      } else if (rule.operatingPattern === "DAILY_EXCEPT_HOLIDAYS") {
        isOperating = !isHoliday;
      } else if (rule.operatingPattern === "SUNDAYS_AND_HOLIDAYS_OFF") {
        isOperating = dayOfWeek !== 0 && !isHoliday;
      }

      if (!isOperating) {
        coverageMatrix.push({
          date: dateStr,
          dayOfMonth,
          dayOfWeek,
          brandId: brand.id,
          brandName: brand.name,
          brandCode: brand.code,
          processId: proc.id,
          processName: proc.name,
          processCode: proc.code,
          isOperating: false,
          requiredStaffing: 0,
          assignedEmployees: [],
          isMet: true,
        });
        continue;
      }

      dayOperatingRules++;
      const requiredStaff = rule.minStaffing;
      totalRequiredShifts += requiredStaff;

      const eligibleAssignments = customAssignments.filter(
        (a) => a.active && a.brandId === brand.id && a.processId === proc.id
      );

      const assignedList: { id: string; name: string }[] = [];

      for (const asgn of eligibleAssignments) {
        const emp = employeeMap.get(asgn.employeeId);
        if (!emp || !emp.active) continue;

        // Check approved leave using date-fns isWithinInterval
        const onLeave = customLeaves.some((l) => {
          if (l.employeeId !== emp.id || l.status !== "APPROVED") return false;
          const start = parseISO(l.startDate);
          const end = parseISO(l.endDate);
          return isWithinInterval(currentDate, { start, end });
        });

        // Check approved comp-off using date-fns isSameDay
        const onCompOff = customCompOffs.some((co) => {
          if (co.employeeId !== emp.id || co.status !== "APPROVED") return false;
          return isSameDay(currentDate, parseISO(co.date));
        });

        // Weekly off check
        const isWeeklyOff = emp.weeklyOffDay === dayOfWeek;

        if (!onLeave && !onCompOff && !isWeeklyOff) {
          const existing = dayAllocations.get(emp.id) || [];
          if (existing.length > 0) {
            issues.push({
              id: `overlap-${dateStr}-${emp.id}-${brand.id}-${proc.id}`,
              date: dateStr,
              severity: "WARNING",
              issueType: "OVERLAPPING_ASSIGNMENT",
              employeeId: emp.id,
              employeeName: emp.name,
              brandId: brand.id,
              brandName: brand.name,
              processId: proc.id,
              processName: proc.name,
              message: `${emp.name} is scheduled for ${brand.name} (${proc.name}) but also assigned to another shift on ${dateStr}.`,
              suggestion: "Ensure shift hours do not overlap or allocate another qualified team member.",
            });
          }

          existing.push({ brandId: brand.id, processId: proc.id });
          dayAllocations.set(emp.id, existing);
          assignedList.push({ id: emp.id, name: emp.name });

          if (assignedList.length >= requiredStaff) {
            break;
          }
        }
      }

      totalFilledShifts += assignedList.length;
      const isMet = assignedList.length >= requiredStaff;

      if (isMet) {
        daySatisfiedRules++;
      } else {
        dayGapCount++;
        const gap = requiredStaff - assignedList.length;
        const isSingleResourceBrand = brand.isSingleResource;

        issues.push({
          id: `gap-${dateStr}-${brand.id}-${proc.id}`,
          date: dateStr,
          severity: "ERROR",
          issueType: "COVERAGE_GAP",
          brandId: brand.id,
          brandName: brand.name,
          processId: proc.id,
          processName: proc.name,
          requiredStaffing: requiredStaff,
          allocatedStaffing: assignedList.length,
          message: isSingleResourceBrand
            ? `Single-resource brand ${brand.name} has 0 coverage for ${proc.name} on ${dateStr} (Deficit: ${gap}).`
            : `Coverage deficit for ${brand.name} on ${proc.name}: ${assignedList.length}/${requiredStaff} allocated.`,
          suggestion: isSingleResourceBrand
            ? "Reassign certified backup specialist from Pod pool immediately."
            : "Adjust employee weekly off or allocate secondary team member.",
        });
      }

      coverageMatrix.push({
        date: dateStr,
        dayOfMonth,
        dayOfWeek,
        brandId: brand.id,
        brandName: brand.name,
        brandCode: brand.code,
        processId: proc.id,
        processName: proc.name,
        processCode: proc.code,
        isOperating: true,
        requiredStaffing: requiredStaff,
        assignedEmployees: assignedList,
        isMet,
      });
    }

    dailyHealth.push({
      date: dateStr,
      dayOfMonth,
      dayOfWeek,
      isHoliday,
      holidayName: holidaysMap.get(dateStr)?.name,
      totalOperatingRules: dayOperatingRules,
      satisfiedRules: daySatisfiedRules,
      hasGap: dayGapCount > 0,
      gapCount: dayGapCount,
    });

    // 2. Individual Employee Schedule for the Day
    for (const emp of SEED_EMPLOYEES) {
      const onLeave = customLeaves.find((l) => {
        if (l.employeeId !== emp.id || l.status !== "APPROVED") return false;
        return isWithinInterval(currentDate, {
          start: parseISO(l.startDate),
          end: parseISO(l.endDate),
        });
      });

      const onPendingLeave = customLeaves.find((l) => {
        if (l.employeeId !== emp.id || l.status !== "PENDING") return false;
        return isWithinInterval(currentDate, {
          start: parseISO(l.startDate),
          end: parseISO(l.endDate),
        });
      });

      const onCompOff = customCompOffs.find((co) => {
        if (co.employeeId !== emp.id || co.status !== "APPROVED") return false;
        return isSameDay(currentDate, parseISO(co.date));
      });

      const isWeeklyOff = emp.weeklyOffDay === dayOfWeek;
      const allocations = dayAllocations.get(emp.id) || [];

      let status: RosterEntryStatus = "UNASSIGNED";
      let statusLabel = "UA";
      let detail = "";

      if (onLeave) {
        status = "LEAVE";
        statusLabel = "L";
        detail = `${onLeave.type} Leave (Approved)`;
      } else if (onCompOff) {
        status = "COMP_OFF";
        statusLabel = "CO";
        detail = "Compensatory Off";
      } else if (allocations.length > 0) {
        status = "WORKING";
        statusLabel = "W";
        detail = allocations
          .map((a) => {
            const b = brandMap.get(a.brandId);
            const p = processMap.get(a.processId);
            return `${b?.code || "BRD"}:${p?.code || "PROC"}`;
          })
          .join(", ");
      } else if (isWeeklyOff) {
        status = "WEEKLY_OFF";
        statusLabel = "WO";
        detail = "Scheduled Weekly Off";
      } else if (isHoliday) {
        status = "PUBLIC_HOLIDAY";
        statusLabel = "PH";
        detail = holidaysMap.get(dateStr)?.name || "Public Holiday";
      } else {
        status = "UNASSIGNED";
        statusLabel = "UA";
        detail = "Available / Unassigned";
      }

      if (onPendingLeave && status === "WORKING") {
        issues.push({
          id: `pending-leave-${dateStr}-${emp.id}`,
          date: dateStr,
          severity: "WARNING",
          issueType: "PREFERENCE_VIOLATION",
          employeeId: emp.id,
          employeeName: emp.name,
          message: `${emp.name} has a pending leave request on ${dateStr} but is currently scheduled.`,
          suggestion: "Review and approve/reject leave request in Availability management.",
        });
      }

      const formattedAllocations = allocations.map((a) => {
        const b = brandMap.get(a.brandId);
        const p = processMap.get(a.processId);
        return {
          brandCode: b?.code || "BRD",
          processCode: p?.code || "PRC",
          brandName: b?.name || "Brand",
          processName: p?.name || "Process",
        };
      });

      employeeSchedules[emp.id].push({
        date: dateStr,
        dayOfMonth,
        dayOfWeek,
        status,
        statusLabel,
        allocations: formattedAllocations,
        detail,
      });
    }
  }

  const mandatoryErrors = issues.filter((i) => i.severity === "ERROR").length;
  const warnings = issues.filter((i) => i.severity === "WARNING").length;
  const coverageHealthPercentage =
    totalRequiredShifts > 0
      ? Math.round((totalFilledShifts / totalRequiredShifts) * 100)
      : 100;

  return {
    month,
    year,
    daysCount: calendarDates.length,
    calendarDates,
    employeeSchedules,
    coverageMatrix,
    dailyHealth,
    issues,
    status: mandatoryErrors > 0 ? "ISSUES_FOUND" : "DRAFT",
    summary: {
      totalShifts: totalFilledShifts,
      mandatoryErrors,
      warnings,
      coverageHealthPercentage,
    },
  };
}
