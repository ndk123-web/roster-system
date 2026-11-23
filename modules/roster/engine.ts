import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import type {
  OperatingPattern,
  RosterEntryStatus,
  Severity,
  IssueType,
} from "@/data/types";

export interface EngineWeeklyOff {
  dayOfWeek: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface EngineEmployee {
  id: string;
  code: string;
  name: string;
  active: boolean;
  weeklyOffs: EngineWeeklyOff[];
}

export interface EngineBrand {
  id: string;
  code: string;
  name: string;
  active: boolean;
  isSingleResource: boolean;
}

export interface EngineProcess {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface EngineCustomStaffingRule {
  dayOfWeek: number | null;
  specificDate: string | null;
  requiredStaffing: number;
}

export interface EngineRule {
  id: string;
  brandId: string;
  processId: string;
  operatingPattern: OperatingPattern;
  customDaysOfWeek: number[];
  operatesOnHolidays: boolean;
  defaultMinStaffing: number;
  startDate: string | null;
  customStaffingRules: EngineCustomStaffingRule[];
}

export interface EngineAssignment {
  id: string;
  employeeId: string;
  brandId: string;
  processId: string;
  active: boolean;
  isPrimary: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface EngineHoliday {
  date: string;
  name: string;
  affectsAllProcesses: boolean;
}

export interface EngineLeave {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string | null;
}

export interface EngineCompOff {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  reason: string | null;
}

export interface GenerationInput {
  month: number;
  year: number;
  employees: EngineEmployee[];
  brands: EngineBrand[];
  processes: EngineProcess[];
  rules: EngineRule[];
  assignments: EngineAssignment[];
  holidays: EngineHoliday[];
  leaves: EngineLeave[];
  compOffs: EngineCompOff[];
}

export interface DayCoverageStatus {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
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

export interface ComputedAllocation {
  brandId: string;
  brandCode: string;
  brandName: string;
  processId: string;
  processCode: string;
  processName: string;
}

export interface ComputedEmployeeDay {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  status: RosterEntryStatus;
  statusLabel: string;
  detail: string;
  allocations: ComputedAllocation[];
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

export interface ComputedIssue {
  id: string;
  date: string;
  severity: Severity;
  issueType: IssueType;
  brandId?: string;
  brandName?: string;
  processId?: string;
  processName?: string;
  employeeId?: string;
  employeeName?: string;
  requiredStaffing?: number;
  allocatedStaffing?: number;
  message: string;
  suggestion?: string;
}

export interface GenerationResult {
  month: number;
  year: number;
  daysCount: number;
  calendarDates: {
    date: Date;
    dateStr: string;
    dayOfMonth: number;
    dayOfWeek: number;
    dayLabel: string;
  }[];
  employeeSchedules: Record<string, ComputedEmployeeDay[]>;
  coverageMatrix: DayCoverageStatus[];
  dailyHealth: DailyHealthSummary[];
  issues: ComputedIssue[];
  status: "DRAFT" | "ISSUES_FOUND" | "PUBLISHED";
  summary: {
    totalShifts: number;
    mandatoryErrors: number;
    warnings: number;
    coverageHealthPercentage: number;
  };
}

function dateFromString(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

function inRange(value: string, start: string, end: string | null): boolean {
  return value >= start && (end === null || value <= end);
}

function statusLabel(status: RosterEntryStatus): string {
  switch (status) {
    case "WORKING":
      return "W";
    case "WEEKLY_OFF":
      return "WO";
    case "LEAVE":
      return "L";
    case "COMP_OFF":
      return "CO";
    case "PUBLIC_HOLIDAY":
      return "PH";
    default:
      return "UA";
  }
}

function getRequiredStaffing(
  rule: EngineRule,
  dateStr: string,
  dayOfWeek: number,
): number {
  const specific = rule.customStaffingRules.find(
    (item) => item.specificDate === dateStr,
  );
  if (specific) return Math.max(0, specific.requiredStaffing);

  const weekly = rule.customStaffingRules.filter(
    (item) => item.dayOfWeek === dayOfWeek,
  );
  if (weekly.length > 0) {
    return Math.max(...weekly.map((item) => item.requiredStaffing));
  }

  return Math.max(0, rule.defaultMinStaffing);
}

export function isRuleActive(rule: EngineRule, dateStr: string): boolean {
  return !rule.startDate || dateStr >= rule.startDate;
}

export function isRuleOperating(
  rule: EngineRule,
  dateStr: string,
  dayOfWeek: number,
  holiday: EngineHoliday | undefined,
): boolean {
  if (holiday && !rule.operatesOnHolidays) return false;
  if (rule.operatingPattern === "SUNDAYS_AND_HOLIDAYS_OFF") {
    return dayOfWeek !== 0 && !holiday;
  }
  if (rule.operatingPattern === "CUSTOM") {
    return rule.customDaysOfWeek.includes(dayOfWeek);
  }
  return true;
}

function isEmployeeWeeklyOff(employee: EngineEmployee, dateStr: string, dayOfWeek: number) {
  return employee.weeklyOffs.some(
    (off) => off.dayOfWeek === dayOfWeek && inRange(dateStr, off.effectiveFrom, off.effectiveTo),
  );
}

function isApprovedLeave(employeeId: string, dateStr: string, leaves: EngineLeave[]) {
  return leaves.find(
    (leave) =>
      leave.employeeId === employeeId &&
      leave.status === "APPROVED" &&
      inRange(dateStr, leave.startDate, leave.endDate),
  );
}

function isPendingLeave(employeeId: string, dateStr: string, leaves: EngineLeave[]) {
  return leaves.find(
    (leave) =>
      leave.employeeId === employeeId &&
      leave.status === "PENDING" &&
      inRange(dateStr, leave.startDate, leave.endDate),
  );
}

function isApprovedCompOff(employeeId: string, dateStr: string, compOffs: EngineCompOff[]) {
  return compOffs.find(
    (compOff) =>
      compOff.employeeId === employeeId &&
      compOff.status === "APPROVED" &&
      compOff.date === dateStr,
  );
}

export function generateMonthlyRoster(input: GenerationInput): GenerationResult {
  const baseDate = new Date(input.year, input.month - 1, 1);
  const intervalDays = eachDayOfInterval({
    start: startOfMonth(baseDate),
    end: endOfMonth(baseDate),
  });

  const calendarDates = intervalDays.map((day) => ({
    date: day,
    dateStr: format(day, "yyyy-MM-dd"),
    dayOfMonth: Number(format(day, "d")),
    dayOfWeek: getDay(day),
    dayLabel: format(day, "EEE"),
  }));

  const employeeMap = new Map(input.employees.map((employee) => [employee.id, employee]));
  const brandMap = new Map(input.brands.map((brand) => [brand.id, brand]));
  const processMap = new Map(input.processes.map((process) => [process.id, process]));
  const holidayMap = new Map(input.holidays.map((holiday) => [holiday.date, holiday]));

  const issues: ComputedIssue[] = [];
  const coverageMatrix: DayCoverageStatus[] = [];
  const dailyHealth: DailyHealthSummary[] = [];
  const employeeSchedules: Record<string, ComputedEmployeeDay[]> = {};
  const allocationCounts = new Map(input.employees.map((employee) => [employee.id, 0]));

  for (const employee of input.employees) {
    employeeSchedules[employee.id] = [];
  }

  let totalRequiredShifts = 0;
  let totalFilledShifts = 0;

  for (const { dateStr, dayOfMonth, dayOfWeek } of calendarDates) {
    const holiday = holidayMap.get(dateStr);
    const dayAllocations = new Map<string, ComputedAllocation[]>();
    let dayOperatingRules = 0;
    let daySatisfiedRules = 0;
    let dayGapCount = 0;

    const requirements = input.rules
      .map((rule) => {
        const brand = brandMap.get(rule.brandId);
        const process = processMap.get(rule.processId);
        if (!brand || !process || !brand.active || !process.active) return null;
        if (!isRuleActive(rule, dateStr)) return null;

        const operating = isRuleOperating(rule, dateStr, dayOfWeek, holiday);
        const requiredStaffing = operating
          ? getRequiredStaffing(rule, dateStr, dayOfWeek)
          : 0;

        if (!operating) {
          coverageMatrix.push({
            date: dateStr,
            dayOfMonth,
            dayOfWeek,
            brandId: brand.id,
            brandName: brand.name,
            brandCode: brand.code,
            processId: process.id,
            processName: process.name,
            processCode: process.code,
            isOperating: false,
            requiredStaffing: 0,
            assignedEmployees: [],
            isMet: true,
          });
          return null;
        }

        const eligible = input.assignments
          .filter(
            (assignment) =>
              assignment.active &&
              assignment.brandId === brand.id &&
              assignment.processId === process.id &&
              inRange(dateStr, assignment.effectiveFrom, assignment.effectiveTo),
          )
          .map((assignment) => employeeMap.get(assignment.employeeId))
          .filter((employee): employee is EngineEmployee => Boolean(employee))
          .filter((employee) => {
            if (!employee.active) return false;
            if (isApprovedLeave(employee.id, dateStr, input.leaves)) return false;
            if (isApprovedCompOff(employee.id, dateStr, input.compOffs)) return false;
            if (isEmployeeWeeklyOff(employee, dateStr, dayOfWeek)) return false;
            return true;
          });

        return {
          rule,
          brand,
          process,
          requiredStaffing,
          eligible,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((left, right) => left.eligible.length - right.eligible.length || left.rule.id.localeCompare(right.rule.id));

    for (const requirement of requirements) {
      const { rule, brand, process, requiredStaffing } = requirement;
      dayOperatingRules++;
      totalRequiredShifts += requiredStaffing;

      const eligible = [...requirement.eligible].sort((left, right) => {
        const leftPrimary = input.assignments.some(
          (assignment) =>
            assignment.employeeId === left.id &&
            assignment.brandId === brand.id &&
            assignment.processId === process.id &&
            assignment.isPrimary,
        );
        const rightPrimary = input.assignments.some(
          (assignment) =>
            assignment.employeeId === right.id &&
            assignment.brandId === brand.id &&
            assignment.processId === process.id &&
            assignment.isPrimary,
        );
        if (leftPrimary !== rightPrimary) return leftPrimary ? -1 : 1;
        return (
          (allocationCounts.get(left.id) ?? 0) - (allocationCounts.get(right.id) ?? 0) ||
          left.code.localeCompare(right.code)
        );
      });

      const assigned: ComputedAllocation[] = [];

      for (const employee of eligible) {
        if (assigned.length >= requiredStaffing) break;
        if ((dayAllocations.get(employee.id) ?? []).length > 0) continue;

        const allocation: ComputedAllocation = {
          brandId: brand.id,
          brandCode: brand.code,
          brandName: brand.name,
          processId: process.id,
          processCode: process.code,
          processName: process.name,
        };
        assigned.push(allocation);
        dayAllocations.set(employee.id, [
          ...(dayAllocations.get(employee.id) ?? []),
          allocation,
        ]);
        allocationCounts.set(employee.id, (allocationCounts.get(employee.id) ?? 0) + 1);
      }

      totalFilledShifts += assigned.length;
      const isMet = assigned.length >= requiredStaffing;
      if (isMet) daySatisfiedRules++;
      else dayGapCount++;

      if (!isMet) {
        const gap = requiredStaffing - assigned.length;
        issues.push({
          id: `coverage-${dateStr}-${rule.id}`,
          date: dateStr,
          severity: "ERROR",
          issueType: "COVERAGE_GAP",
          brandId: brand.id,
          brandName: brand.name,
          processId: process.id,
          processName: process.name,
          requiredStaffing,
          allocatedStaffing: assigned.length,
          message: brand.isSingleResource
            ? `Single-resource brand ${brand.name} has insufficient coverage for ${process.name} on ${dateStr} (${assigned.length}/${requiredStaffing}; deficit ${gap}).`
            : `Coverage deficit for ${brand.name} on ${process.name}: ${assigned.length}/${requiredStaffing} allocated.`,
          suggestion: brand.isSingleResource
            ? "Assign a certified backup or approve an exception before publishing."
            : "Adjust availability, weekly offs, or assignments for an eligible employee.",
        });
      }

      coverageMatrix.push({
        date: dateStr,
        dayOfMonth,
        dayOfWeek,
        brandId: brand.id,
        brandName: brand.name,
        brandCode: brand.code,
        processId: process.id,
        processName: process.name,
        processCode: process.code,
        isOperating: true,
        requiredStaffing,
        assignedEmployees: assigned.map((allocation) => {
          const employee = [...eligible, ...input.employees].find(
            (candidate) =>
              (dayAllocations.get(candidate.id) ?? []).some(
                (item) =>
                  item.brandId === allocation.brandId && item.processId === allocation.processId,
              ),
          );
          return { id: employee?.id ?? "", name: employee?.name ?? "Unknown" };
        }),
        isMet,
      });
    }

    dailyHealth.push({
      date: dateStr,
      dayOfMonth,
      dayOfWeek,
      isHoliday: Boolean(holiday),
      holidayName: holiday?.name,
      totalOperatingRules: dayOperatingRules,
      satisfiedRules: daySatisfiedRules,
      hasGap: dayGapCount > 0,
      gapCount: dayGapCount,
    });

    for (const employee of input.employees) {
      const approvedLeave = isApprovedLeave(employee.id, dateStr, input.leaves);
      const pendingLeave = isPendingLeave(employee.id, dateStr, input.leaves);
      const approvedCompOff = isApprovedCompOff(employee.id, dateStr, input.compOffs);
      const weeklyOff = isEmployeeWeeklyOff(employee, dateStr, dayOfWeek);
      const allocations = dayAllocations.get(employee.id) ?? [];
      const holidayApplies =
        holiday &&
        (holiday.affectsAllProcesses ||
          input.assignments.some(
            (assignment) =>
              assignment.employeeId === employee.id &&
              assignment.active &&
              inRange(dateStr, assignment.effectiveFrom, assignment.effectiveTo) &&
              input.rules.some(
                (rule) =>
                  rule.brandId === assignment.brandId &&
                  rule.processId === assignment.processId &&
                  isRuleActive(rule, dateStr) &&
                  !rule.operatesOnHolidays,
              ),
          ));

      let status: RosterEntryStatus = "UNASSIGNED";
      let detail = "Available / Unassigned";

      if (!employee.active) {
        status = "UNASSIGNED";
        detail = "Inactive employee";
      } else if (approvedLeave) {
        status = "LEAVE";
        detail = `${approvedLeave.type} Leave (Approved)${approvedLeave.reason ? ` — ${approvedLeave.reason}` : ""}`;
      } else if (approvedCompOff) {
        status = "COMP_OFF";
        detail = `Compensatory Off${approvedCompOff.reason ? ` — ${approvedCompOff.reason}` : ""}`;
      } else if (allocations.length > 0) {
        status = "WORKING";
        detail = allocations
          .map((allocation) => `${allocation.brandCode}:${allocation.processCode}`)
          .join(", ");
      } else if (weeklyOff) {
        status = "WEEKLY_OFF";
        detail = "Scheduled Weekly Off";
      } else if (holidayApplies) {
        status = "PUBLIC_HOLIDAY";
        detail = holiday.name;
      }

      if (pendingLeave && status === "WORKING") {
        issues.push({
          id: `pending-leave-${dateStr}-${employee.id}-${pendingLeave.id}`,
          date: dateStr,
          severity: "WARNING",
          issueType: "PREFERENCE_VIOLATION",
          employeeId: employee.id,
          employeeName: employee.name,
          message: `${employee.name} has a pending ${pendingLeave.type} leave request on ${dateStr} but is currently scheduled.`,
          suggestion: "Review and approve or reject the leave request from Availability & Leaves.",
        });
      }

      employeeSchedules[employee.id].push({
        date: dateStr,
        dayOfMonth,
        dayOfWeek,
        status,
        statusLabel: statusLabel(status),
        detail,
        allocations,
      });
    }
  }

  const mandatoryErrors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.filter((issue) => issue.severity === "WARNING").length;
  const coverageHealthPercentage =
    totalRequiredShifts > 0
      ? Math.round((totalFilledShifts / totalRequiredShifts) * 100)
      : 100;

  return {
    month: input.month,
    year: input.year,
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

export function calendarDate(dateStr: string): Date {
  return dateFromString(dateStr);
}
