import { RosterEntryStatus } from "@prisma/client";
import { format, getDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  calendarDate,
  generateMonthlyRoster,
  isRuleActive,
  isRuleOperating,
  type ComputedEmployeeDay,
  type ComputedIssue,
  type DayCoverageStatus,
  type EngineBrand,
  type EngineEmployee,
  type EngineProcess,
  type GenerationInput,
  type GenerationResult,
} from "@/modules/roster/engine";
import type {
  RosterEmployeeOption,
  RosterPodOption,
  RosterViewData,
} from "@/modules/roster/view-types";

const MONTH_PATHS = ["/roster", "/issues", "/dashboard"];

function monthRange(month: number, year: number) {
  return {
    start: new Date(year, month - 1, 1, 12),
    end: new Date(year, month, 0, 12),
  };
}

function formatDate(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

function labelForStatus(status: string) {
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

export interface UpdateRosterEntryInput {
  month: number;
  year: number;
  employeeId: string;
  date: Date;
  operation: "STATUS" | "ADD_ALLOCATION" | "REMOVE_ALLOCATION";
  status?: string;
  brandId?: string | null;
  processId?: string | null;
}

export interface RosterValidationSummary {
  errors: number;
  warnings: number;
}

function dateWithinRange(dateStr: string, startStr: string, endStr: string): boolean {
  return dateStr >= startStr && dateStr <= endStr;
}

export async function loadGenerationInput(
  month: number,
  year: number,
): Promise<GenerationInput> {
  const { start, end } = monthRange(month, year);

  const [employees, brands, processes, rules, assignments, holidays, leaves, compOffs] =
    await Promise.all([
      prisma.employee.findMany({
        where: { active: true },
        include: {
          weeklyOffs: {
            select: { dayOfWeek: true, effectiveFrom: true, effectiveTo: true },
          },
        },
        orderBy: { code: "asc" },
      }),
      prisma.brand.findMany({
        orderBy: { code: "asc" },
      }),
      prisma.process.findMany({
        orderBy: { code: "asc" },
      }),
      prisma.brandProcessRule.findMany({
        include: {
          customStaffingRules: {
            select: { dayOfWeek: true, specificDate: true, requiredStaffing: true },
          },
        },
        orderBy: { id: "asc" },
      }),
      prisma.employeeAssignment.findMany({
        where: {
          active: true,
          effectiveFrom: { lte: end },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: start } }],
        },
        orderBy: { id: "asc" },
      }),
      prisma.publicHoliday.findMany({
        where: { date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
      }),
      prisma.leave.findMany({
        where: {
          startDate: { lte: end },
          endDate: { gte: start },
        },
        orderBy: { startDate: "asc" },
      }),
      prisma.compOff.findMany({
        where: { date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
      }),
    ]);

  const brandEmployees = new Map<string, Set<string>>();
  for (const assignment of assignments) {
    const set = brandEmployees.get(assignment.brandId) ?? new Set<string>();
    set.add(assignment.employeeId);
    brandEmployees.set(assignment.brandId, set);
  }

  const brandById = new Map(brands.map((brand) => [brand.id, brand]));

  const mappedBrands: EngineBrand[] = brands.map((brand) => ({
    id: brand.id,
    code: brand.code,
    name: brand.name,
    active: brand.active,
    isSingleResource: (brandEmployees.get(brand.id)?.size ?? 0) <= 1,
  }));

  const mappedProcesses: EngineProcess[] = processes.map((process) => ({
    id: process.id,
    code: process.code,
    name: process.name,
    active: process.active,
  }));

  const mappedEmployees: EngineEmployee[] = employees.map((employee) => ({
    id: employee.id,
    code: employee.code,
    name: employee.name,
    active: employee.active,
    weeklyOffs: employee.weeklyOffs.map((off) => ({
      dayOfWeek: off.dayOfWeek,
      effectiveFrom: formatDate(off.effectiveFrom),
      effectiveTo: off.effectiveTo ? formatDate(off.effectiveTo) : null,
    })),
  }));

  return {
    month,
    year,
    employees: mappedEmployees,
    brands: mappedBrands,
    processes: mappedProcesses,
    rules: rules.map((rule) => ({
      id: rule.id,
      brandId: rule.brandId,
      processId: rule.processId,
      operatingPattern: rule.operatingPattern,
      customDaysOfWeek: [...rule.customDaysOfWeek].sort((left, right) => left - right),
      operatesOnHolidays: rule.operatesOnHolidays,
      defaultMinStaffing: rule.defaultMinStaffing,
      startDate: (rule.startDate ?? brandById.get(rule.brandId)?.startDate)
        ? formatDate((rule.startDate ?? brandById.get(rule.brandId)?.startDate)!)
        : null,
      customStaffingRules: rule.customStaffingRules.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        specificDate: item.specificDate ? formatDate(item.specificDate) : null,
        requiredStaffing: item.requiredStaffing,
      })),
    })),
    assignments: assignments.map((assignment) => ({
      id: assignment.id,
      employeeId: assignment.employeeId,
      brandId: assignment.brandId,
      processId: assignment.processId,
      active: assignment.active,
      isPrimary: assignment.isPrimary,
      effectiveFrom: formatDate(assignment.effectiveFrom),
      effectiveTo: assignment.effectiveTo ? formatDate(assignment.effectiveTo) : null,
    })),
    holidays: holidays.map((holiday) => ({
      date: formatDate(holiday.date),
      name: holiday.name,
      affectsAllProcesses: holiday.affectsAllProcesses,
    })),
    leaves: leaves.map((leave) => ({
      id: leave.id,
      employeeId: leave.employeeId,
      startDate: formatDate(leave.startDate),
      endDate: formatDate(leave.endDate),
      type: leave.type,
      status: leave.status,
      reason: leave.reason,
    })),
    compOffs: compOffs.map((compOff) => ({
      id: compOff.id,
      employeeId: compOff.employeeId,
      date: formatDate(compOff.date),
      status: compOff.status,
      reason: compOff.reason,
    })),
  };
}

export async function generateAndSaveRoster(
  month: number,
  year: number,
): Promise<GenerationResult> {
  const input = await loadGenerationInput(month, year);
  const result = generateMonthlyRoster(input);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.roster.findUnique({
      where: { month_year: { month, year } },
      select: { id: true, status: true },
    });

    if (existing?.status === "PUBLISHED") {
      throw new Error("Published rosters cannot be regenerated.");
    }

    if (existing) {
      await tx.roster.delete({ where: { id: existing.id } });
    }

    const roster = await tx.roster.create({
      data: {
        month,
        year,
        status: result.status,
      },
      select: { id: true },
    });

    const entryRows = Object.entries(result.employeeSchedules).flatMap(([employeeId, days]) =>
      days.map((day) => ({
        employeeId,
        date: calendarDate(day.date),
        status: day.status,
        notes: day.detail,
      })),
    );

    await tx.rosterEntry.createMany({
      data: entryRows.map((entry) => ({ ...entry, rosterId: roster.id })),
    });

    const storedEntries = await tx.rosterEntry.findMany({
      where: { rosterId: roster.id },
      select: { id: true, employeeId: true, date: true },
    });
    const entryIdByKey = new Map(
      storedEntries.map((entry) => [`${entry.employeeId}|${entry.date.getTime()}`, entry.id]),
    );

    const allocationRows = Object.entries(result.employeeSchedules).flatMap(
      ([employeeId, days]) =>
        days.flatMap((day) => {
          const entryId = entryIdByKey.get(
            `${employeeId}|${calendarDate(day.date).getTime()}`,
          );
          if (!entryId) return [];
          return day.allocations.map((allocation) => ({
            rosterEntryId: entryId,
            brandId: allocation.brandId,
            processId: allocation.processId,
          }));
        }),
    );

    if (allocationRows.length > 0) {
      await tx.rosterAllocation.createMany({ data: allocationRows });
    }

    if (result.issues.length > 0) {
      await tx.validationIssue.createMany({
        data: result.issues.map((issue) => ({
          rosterId: roster.id,
          date: calendarDate(issue.date),
          severity: issue.severity,
          issueType: issue.issueType,
          brandId: issue.brandId ?? null,
          processId: issue.processId ?? null,
          employeeId: issue.employeeId ?? null,
          requiredStaffing: issue.requiredStaffing ?? null,
          allocatedStaffing: issue.allocatedStaffing ?? null,
          message: issue.message,
          suggestion: issue.suggestion ?? null,
        })),
      });
    }

    await tx.auditLog.create({
      data: {
        action: "ROSTER_GENERATED",
        entity: "Roster",
        entityId: roster.id,
        details: `${result.summary.totalShifts} shifts, ${result.summary.mandatoryErrors} errors, ${result.summary.warnings} warnings`,
      },
    });
  }, { timeout: 60000, maxWait: 10000 });

  return result;
}

export async function validateAndSaveRoster(
  month: number,
  year: number,
): Promise<RosterValidationSummary> {
  const [input, roster, allEmployees] = await Promise.all([
    loadGenerationInput(month, year),
    prisma.roster.findUnique({
      where: { month_year: { month, year } },
      select: { id: true, status: true },
    }),
    prisma.employee.findMany({ select: { id: true, name: true } }),
  ]);

  if (!roster) return { errors: 0, warnings: 0 };

  const [baseline, entries] = await Promise.all([
    Promise.resolve(generateMonthlyRoster(input)),
    prisma.rosterEntry.findMany({
      where: { rosterId: roster.id },
      include: { allocations: true },
    }),
  ]);

  const employeeMap = new Map(input.employees.map((employee) => [employee.id, employee]));
  const employeeNames = new Map(allEmployees.map((employee) => [employee.id, employee.name]));
  const brandMap = new Map(input.brands.map((brand) => [brand.id, brand]));
  const processMap = new Map(input.processes.map((process) => [process.id, process]));
  const issues: ComputedIssue[] = [];

  for (const entry of entries) {
    const dateStr = formatDate(entry.date);
    const dayOfWeek = getDay(entry.date);
    const employee = employeeMap.get(entry.employeeId);
    const employeeName = employee?.name ?? "Employee";

    if (!employee?.active) {
      issues.push({
        id: `inactive-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "INACTIVE_EMPLOYEE_SCHEDULED",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} is inactive but remains in the roster.`,
        suggestion: "Remove or replace this employee before publishing.",
      });
    }

    if (entry.status === "WORKING" && entry.allocations.length === 0) {
      issues.push({
        id: `working-without-allocation-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "PREFERENCE_VIOLATION",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} is marked working without a brand-process allocation.`,
        suggestion: "Assign an eligible brand and process or change the status.",
      });
    }

    if (entry.status !== "WORKING" && entry.allocations.length > 0) {
      issues.push({
        id: `non-working-allocation-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "PREFERENCE_VIOLATION",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} has allocations on a ${entry.status.toLowerCase()} day.`,
        suggestion: "Change the status to working or remove the allocations.",
      });
    }

    const pendingLeave = input.leaves.find(
      (leave) =>
        leave.employeeId === entry.employeeId &&
        leave.status === "PENDING" &&
        dateWithinRange(dateStr, leave.startDate, leave.endDate),
    );
    if (entry.status === "WORKING" && pendingLeave) {
      issues.push({
        id: `pending-leave-${entry.id}`,
        date: dateStr,
        severity: "WARNING",
        issueType: "PREFERENCE_VIOLATION",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} has a pending leave request for this date.`,
        suggestion: "Review the request before publishing.",
      });
    }

    if (entry.status !== "WORKING") continue;

    const approvedLeave = input.leaves.find(
      (leave) =>
        leave.employeeId === entry.employeeId &&
        leave.status === "APPROVED" &&
        dateWithinRange(dateStr, leave.startDate, leave.endDate),
    );
    if (approvedLeave) {
      issues.push({
        id: `leave-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "LEAVE_CONFLICT",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} is scheduled on an approved leave day.`,
        suggestion: "Change the status to leave or assign another employee.",
      });
    }

    const approvedCompOff = input.compOffs.find(
      (compOff) =>
        compOff.employeeId === entry.employeeId &&
        compOff.status === "APPROVED" &&
        compOff.date === dateStr,
    );
    if (approvedCompOff) {
      issues.push({
        id: `comp-off-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "LEAVE_CONFLICT",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} is scheduled on an approved comp-off day.`,
        suggestion: "Change the status to comp-off or assign another employee.",
      });
    }

    const weeklyOff = employee?.weeklyOffs.some(
      (off) =>
        off.dayOfWeek === dayOfWeek &&
        dateWithinRange(dateStr, off.effectiveFrom, off.effectiveTo ?? "9999-12-31"),
    );
    if (weeklyOff) {
      issues.push({
        id: `weekly-off-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "WEEKLY_OFF_CONFLICT",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} is scheduled on a configured weekly off.`,
        suggestion: "Respect the weekly off or update it in employee master data.",
      });
    }

    if (entry.allocations.length > 1) {
      issues.push({
        id: `overlap-${entry.id}`,
        date: dateStr,
        severity: "ERROR",
        issueType: "OVERLAPPING_ASSIGNMENT",
        employeeId: entry.employeeId,
        employeeName,
        message: `${employeeName} has more than one allocation on this date.`,
        suggestion: "Keep a single allocation per employee per day.",
      });
    }

    for (const allocation of entry.allocations) {
      const brand = brandMap.get(allocation.brandId);
      const process = processMap.get(allocation.processId);
      const rule = input.rules.find(
        (item) => item.brandId === allocation.brandId && item.processId === allocation.processId,
      );
      const holiday = input.holidays.find((item) => item.date === dateStr);
      const operating = rule
        ? isRuleActive(rule, dateStr) && isRuleOperating(rule, dateStr, dayOfWeek, holiday)
        : false;
      if (!operating) {
        issues.push({
          id: `non-operating-${entry.id}-${allocation.brandId}-${allocation.processId}`,
          date: dateStr,
          severity: "ERROR",
          issueType: "PREFERENCE_VIOLATION",
          brandId: allocation.brandId,
          brandName: brand?.name,
          processId: allocation.processId,
          processName: process?.name,
          employeeId: entry.employeeId,
          employeeName,
          message: `${brand?.name ?? "This brand"} / ${process?.name ?? "this process"} does not operate on ${dateStr}.`,
          suggestion: "Remove the allocation or update the brand-process operating rule.",
        });
      }

      const eligible = input.assignments.some(
        (assignment) =>
          assignment.employeeId === entry.employeeId &&
          assignment.brandId === allocation.brandId &&
          assignment.processId === allocation.processId &&
          dateWithinRange(
            dateStr,
            assignment.effectiveFrom,
            assignment.effectiveTo ?? "9999-12-31",
          ),
      );
      if (!brand?.active || !process?.active || !eligible) {
        issues.push({
          id: `ineligible-${entry.id}-${allocation.brandId}-${allocation.processId}`,
          date: dateStr,
          severity: "ERROR",
          issueType: "PREFERENCE_VIOLATION",
          brandId: allocation.brandId,
          brandName: brand?.name,
          processId: allocation.processId,
          processName: process?.name,
          employeeId: entry.employeeId,
          employeeName,
          message: `${employeeName} is not eligible for ${brand?.name ?? "this brand"} / ${process?.name ?? "this process"}.`,
          suggestion: "Use an active assignment that covers this date.",
        });
      }
    }
  }

  const coverageMatrix = applyPersistedCoverage(
    baseline,
    entries.map((entry) => ({
      employeeId: entry.employeeId,
      date: entry.date,
      allocations: entry.allocations.map((allocation) => ({
        brandId: allocation.brandId,
        processId: allocation.processId,
      })),
    })),
    employeeNames,
  );

  for (const row of coverageMatrix) {
    if (!row.isOperating || row.isMet) continue;
    issues.push({
      id: `coverage-${row.date}-${row.brandId}-${row.processId}`,
      date: row.date,
      severity: "ERROR",
      issueType: "COVERAGE_GAP",
      brandId: row.brandId,
      brandName: row.brandName,
      processId: row.processId,
      processName: row.processName,
      requiredStaffing: row.requiredStaffing,
      allocatedStaffing: row.assignedEmployees.length,
      message: `${row.brandName} / ${row.processName} needs ${row.requiredStaffing} employee(s) on ${row.date}.`,
      suggestion: "Assign an eligible employee or change the roster status.",
    });
  }

  const errors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.length - errors;

  await prisma.$transaction(
    async (tx) => {
      await tx.validationIssue.deleteMany({ where: { rosterId: roster.id } });
      if (issues.length > 0) {
        await tx.validationIssue.createMany({
          data: issues.map((issue) => ({
            rosterId: roster.id,
            date: calendarDate(issue.date),
            severity: issue.severity,
            issueType: issue.issueType,
            brandId: issue.brandId ?? null,
            processId: issue.processId ?? null,
            employeeId: issue.employeeId ?? null,
            requiredStaffing: issue.requiredStaffing ?? null,
            allocatedStaffing: issue.allocatedStaffing ?? null,
            message: issue.message,
            suggestion: issue.suggestion ?? null,
          })),
        });
      }
      if (roster.status !== "PUBLISHED") {
        await tx.roster.update({
          where: { id: roster.id },
          data: { status: errors > 0 ? "ISSUES_FOUND" : "DRAFT" },
        });
      }
      await tx.auditLog.create({
        data: {
          action: roster.status === "PUBLISHED" ? "PUBLISHED_ROSTER_REVALIDATED" : "ROSTER_REVALIDATED",
          entity: "Roster",
          entityId: roster.id,
          details: `${errors} errors, ${warnings} warnings`,
        },
      });
    },
    { timeout: 60000, maxWait: 10000 },
  );

  return { errors, warnings };
}

export async function updateRosterEntry(
  input: UpdateRosterEntryInput,
): Promise<RosterValidationSummary> {
  const { month, year, employeeId, date, operation } = input;
  const dateStr = formatDate(date);
  const { start, end } = monthRange(month, year);

  if (date < start || date > end) {
    throw new Error("Selected date is outside the roster month.");
  }

  const [roster, employee] = await Promise.all([
    prisma.roster.findUnique({
      where: { month_year: { month, year } },
      select: { id: true, status: true },
    }),
    prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        weeklyOffs: {
          select: { dayOfWeek: true, effectiveFrom: true, effectiveTo: true },
        },
      },
    }),
  ]);

  if (!roster) throw new Error("Generate a roster before editing entries.");
  if (roster.status === "PUBLISHED") throw new Error("Published rosters cannot be edited.");
  if (!employee?.active) throw new Error("Select an active employee.");

  if (operation === "ADD_ALLOCATION" || operation === "REMOVE_ALLOCATION") {
    const brandId = input.brandId;
    const processId = input.processId;
    if (!brandId || !processId) throw new Error("Select a brand and process.");

    const [brand, process] = await Promise.all([
      prisma.brand.findUnique({ where: { id: brandId }, select: { active: true } }),
      prisma.process.findUnique({ where: { id: processId }, select: { active: true } }),
    ]);
    if (!brand?.active || !process?.active) {
      throw new Error("Select an active brand and process.");
    }

    if (operation === "ADD_ALLOCATION") {
      const config = await loadGenerationInput(month, year);
      const rule = config.rules.find(
        (item) => item.brandId === brandId && item.processId === processId,
      );
      const holiday = config.holidays.find((item) => item.date === dateStr);
      if (
        !rule ||
        !isRuleActive(rule, dateStr) ||
        !isRuleOperating(rule, dateStr, date.getDay(), holiday)
      ) {
        throw new Error("Selected brand-process does not operate on the chosen date.");
      }

      const eligible = await prisma.employeeAssignment.findFirst({
        where: {
          employeeId,
          brandId,
          processId,
          active: true,
          effectiveFrom: { lte: date },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
        },
        select: { id: true },
      });
      if (!eligible) {
        throw new Error("Employee is not eligible for this brand and process on the selected date.");
      }

      const weeklyOff = employee.weeklyOffs.find(
        (off) =>
          off.dayOfWeek === date.getDay() &&
          date >= off.effectiveFrom &&
          (!off.effectiveTo || date <= off.effectiveTo),
      );
      if (weeklyOff) throw new Error("Employee has a weekly off on the selected date.");

      const [leave, compOff] = await Promise.all([
        prisma.leave.findFirst({
          where: {
            employeeId,
            status: "APPROVED",
            startDate: { lte: date },
            endDate: { gte: date },
          },
          select: { id: true },
        }),
        prisma.compOff.findFirst({
          where: { employeeId, status: "APPROVED", date },
          select: { id: true },
        }),
      ]);
      if (leave || compOff) {
        throw new Error("Employee is on approved leave or comp-off on the selected date.");
      }
    }
  }

  await prisma.$transaction(
    async (tx) => {
      const entry = await tx.rosterEntry.findUnique({
        where: { rosterId_employeeId_date: { rosterId: roster.id, employeeId, date } },
        include: { allocations: true },
      });

      if (operation === "ADD_ALLOCATION") {
        if (!entry) {
          const created = await tx.rosterEntry.create({
            data: {
              rosterId: roster.id,
              employeeId,
              date,
              status: "WORKING",
              notes: "Manually added",
            },
            select: { id: true },
          });
          await tx.rosterAllocation.create({
            data: {
              rosterEntryId: created.id,
              brandId: input.brandId!,
              processId: input.processId!,
            },
          });
        } else {
          await tx.rosterEntry.update({
            where: { id: entry.id },
            data: { status: "WORKING", notes: "Manually updated" },
          });
          await tx.rosterAllocation.deleteMany({ where: { rosterEntryId: entry.id } });
          await tx.rosterAllocation.create({
            data: {
              rosterEntryId: entry.id,
              brandId: input.brandId!,
              processId: input.processId!,
            },
          });
        }
      } else {
        if (!entry) throw new Error("No roster entry exists for this employee and date.");

        if (operation === "STATUS") {
          const status = (input.status ?? "WORKING") as RosterEntryStatus;
          if (status === "WORKING" && entry.allocations.length === 0) {
            throw new Error("Add an allocation before marking this employee as working.");
          }
          await tx.rosterEntry.update({
            where: { id: entry.id },
            data: {
              status,
              notes: status === "WORKING" ? "Manually updated" : "Manually changed status",
            },
          });
          if (status !== "WORKING" && entry.allocations.length > 0) {
            await tx.rosterAllocation.deleteMany({ where: { rosterEntryId: entry.id } });
          }
        } else {
          const deleted = await tx.rosterAllocation.deleteMany({
            where: {
              rosterEntryId: entry.id,
              brandId: input.brandId!,
              processId: input.processId!,
            },
          });
          if (deleted.count === 0) throw new Error("Selected allocation does not exist.");
        }
      }

      await tx.auditLog.create({
        data: {
          action: "MANUAL_OVERRIDE",
          entity: "RosterEntry",
          entityId: entry?.id ?? employeeId,
          details: `${operation} ${employeeId} ${dateStr}${input.brandId ? ` ${input.brandId}/${input.processId}` : ""}`,
        },
      });
    },
    { timeout: 60000, maxWait: 10000 },
  );

  return validateAndSaveRoster(month, year);
}

function mapIssue(
  issue: {
    id: string;
    date: Date;
    severity: "ERROR" | "WARNING";
    issueType: string;
    brandId: string | null;
    processId: string | null;
    employeeId: string | null;
    requiredStaffing: number | null;
    allocatedStaffing: number | null;
    message: string;
    suggestion: string | null;
    brand: { name: string } | null;
    process: { name: string } | null;
    employee: { name: string } | null;
  },
): ComputedIssue {
  return {
    id: issue.id,
    date: formatDate(issue.date),
    severity: issue.severity,
    issueType: issue.issueType as ComputedIssue["issueType"],
    brandId: issue.brandId ?? undefined,
    brandName: issue.brand?.name,
    processId: issue.processId ?? undefined,
    processName: issue.process?.name,
    employeeId: issue.employeeId ?? undefined,
    employeeName: issue.employee?.name,
    requiredStaffing: issue.requiredStaffing ?? undefined,
    allocatedStaffing: issue.allocatedStaffing ?? undefined,
    message: issue.message,
    suggestion: issue.suggestion ?? undefined,
  };
}

function applyPersistedEntries(
  baseline: GenerationResult,
  entries: {
    employeeId: string;
    date: Date;
    status: string;
    notes: string | null;
    allocations: {
      brandId: string;
      processId: string;
      brand: { id: string; code: string; name: string };
      process: { id: string; code: string; name: string };
    }[];
  }[],
  input: GenerationInput,
): Record<string, ComputedEmployeeDay[]> {
  const schedules: Record<string, ComputedEmployeeDay[]> = {};
  for (const [employeeId, days] of Object.entries(baseline.employeeSchedules)) {
    schedules[employeeId] = days.map((day) => ({ ...day, allocations: [...day.allocations] }));
  }

  for (const entry of entries) {
    const dateStr = formatDate(entry.date);
    const schedule = schedules[entry.employeeId];
    if (!schedule) continue;

    const day = schedule.find((item) => item.date === dateStr);
    if (!day) continue;

    day.status = entry.status as ComputedEmployeeDay["status"];
    day.statusLabel = labelForStatus(entry.status);
    day.detail = entry.notes ?? "";
    day.allocations = entry.allocations.map((allocation) => ({
      brandId: allocation.brandId,
      brandCode: allocation.brand.code,
      brandName: allocation.brand.name,
      processId: allocation.processId,
      processCode: allocation.process.code,
      processName: allocation.process.name,
    }));
  }

  for (const employee of input.employees) {
    if (!schedules[employee.id]) {
      schedules[employee.id] = baseline.calendarDates.map((day) => ({
        date: day.dateStr,
        dayOfMonth: day.dayOfMonth,
        dayOfWeek: day.dayOfWeek,
        status: "UNASSIGNED",
        statusLabel: "UA",
        detail: "Not included in persisted roster",
        allocations: [],
      }));
    }
  }

  return schedules;
}

function applyPersistedCoverage(
  baseline: GenerationResult,
  entries: {
    employeeId: string;
    date: Date;
    allocations: { brandId: string; processId: string }[];
  }[],
  employeeNames: Map<string, string>,
): DayCoverageStatus[] {
  const allocationsByDate = new Map<string, Map<string, { id: string; name: string }[]>>();

  for (const entry of entries) {
    const dateStr = formatDate(entry.date);
    const byRule = allocationsByDate.get(dateStr) ?? new Map<string, { id: string; name: string }[]>();

    for (const allocation of entry.allocations) {
      const key = `${allocation.brandId}|${allocation.processId}`;
      byRule.set(key, [
        ...(byRule.get(key) ?? []),
        { id: entry.employeeId, name: employeeNames.get(entry.employeeId) ?? "Unknown" },
      ]);
    }

    allocationsByDate.set(dateStr, byRule);
  }

  return baseline.coverageMatrix.map((row) => {
    if (!row.isOperating) return row;
    const assigned = allocationsByDate
      .get(row.date)
      ?.get(`${row.brandId}|${row.processId}`) ?? [];
    return {
      ...row,
      assignedEmployees: assigned,
      isMet: assigned.length >= row.requiredStaffing,
    };
  });
}

export async function getRosterView(month: number, year: number): Promise<RosterViewData> {
  const [input, roster, allEmployees, pods] = await Promise.all([
    loadGenerationInput(month, year),
    prisma.roster.findUnique({
      where: { month_year: { month, year } },
      select: { id: true, month: true, year: true, status: true, generatedAt: true, publishedAt: true },
    }),
    prisma.employee.findMany({
      select: { id: true, code: true, name: true, podId: true },
      orderBy: { code: "asc" },
    }),
    prisma.pod.findMany({
      select: { id: true, name: true, leadId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const baseline = generateMonthlyRoster(input);

  const employeeOptions: RosterEmployeeOption[] = allEmployees
    .filter((employee) => employee.podId === null || pods.some((pod) => pod.id === employee.podId))
    .map((employee) => ({
      id: employee.id,
      code: employee.code,
      name: employee.name,
      podId: employee.podId,
    }));

  const podOptions: RosterPodOption[] = pods.map((pod) => ({
    id: pod.id,
    name: pod.name,
    leadId: pod.leadId,
  }));

  if (!roster) {
    return {
      meta: null,
      result: baseline,
      employees: employeeOptions,
      pods: podOptions,
      brands: input.brands,
      processes: input.processes,
    };
  }

  const [entries, dbIssues] = await Promise.all([
    prisma.rosterEntry.findMany({
      where: { rosterId: roster.id },
      include: {
        allocations: {
          include: {
            brand: { select: { id: true, code: true, name: true } },
            process: { select: { id: true, code: true, name: true } },
          },
        },
      },
      orderBy: [{ date: "asc" }, { employee: { code: "asc" } }],
    }),
    prisma.validationIssue.findMany({
      where: { rosterId: roster.id },
      include: {
        brand: { select: { name: true } },
        process: { select: { name: true } },
        employee: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { severity: "asc" }],
    }),
  ]);

  const employeeNames = new Map(allEmployees.map((employee) => [employee.id, employee.name]));
  const issues = dbIssues.map(mapIssue);
  const coverageMatrix = applyPersistedCoverage(
    baseline,
    entries.map((entry) => ({
      employeeId: entry.employeeId,
      date: entry.date,
      allocations: entry.allocations.map((allocation) => ({
        brandId: allocation.brandId,
        processId: allocation.processId,
      })),
    })),
    employeeNames,
  );

  const dailyHealth = baseline.dailyHealth.map((day) => {
    const gapCount = coverageMatrix.filter(
      (row) => row.date === day.date && row.isOperating && !row.isMet,
    ).length;
    return {
      ...day,
      hasGap: gapCount > 0,
      gapCount,
    };
  });

  const totalShifts = entries.reduce(
    (sum, entry) => sum + (entry.status === "WORKING" ? entry.allocations.length : 0),
    0,
  );
  const mandatoryErrors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.filter((issue) => issue.severity === "WARNING").length;
  const totalRequired = coverageMatrix.reduce(
    (sum, row) => sum + (row.isOperating ? row.requiredStaffing : 0),
    0,
  );

  const result: GenerationResult = {
    ...baseline,
    employeeSchedules: applyPersistedEntries(
      baseline,
      entries.map((entry) => ({
        employeeId: entry.employeeId,
        date: entry.date,
        status: entry.status,
        notes: entry.notes,
        allocations: entry.allocations,
      })),
      input,
    ),
    coverageMatrix,
    dailyHealth,
    issues,
    status: roster.status,
    summary: {
      totalShifts,
      mandatoryErrors,
      warnings,
      coverageHealthPercentage:
        totalRequired > 0 ? Math.round((totalShifts / totalRequired) * 100) : 100,
    },
  };

  return {
    meta: {
      id: roster.id,
      month: roster.month,
      year: roster.year,
      status: roster.status,
      generatedAt: roster.generatedAt.toISOString(),
      publishedAt: roster.publishedAt ? roster.publishedAt.toISOString() : null,
    },
    result,
    employees: employeeOptions,
    pods: podOptions,
    brands: input.brands,
    processes: input.processes,
  };
}

export async function publishRoster(month: number, year: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const roster = await tx.roster.findUnique({
      where: { month_year: { month, year } },
      select: { id: true, status: true },
    });

    if (!roster) throw new Error("Generate a roster before publishing.");
    if (roster.status === "PUBLISHED") return;

    const errors = await tx.validationIssue.count({
      where: { rosterId: roster.id, severity: "ERROR" },
    });
    if (errors > 0) {
      throw new Error(`Resolve ${errors} mandatory coverage gap${errors === 1 ? "" : "s"} before publishing.`);
    }

    await tx.roster.update({
      where: { id: roster.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        action: "ROSTER_PUBLISHED",
        entity: "Roster",
        entityId: roster.id,
      },
    });
  });
}

export interface AvailabilitySyncInput {
  employeeId: string;
  dates: Date[];
}

async function syncAvailabilityToRosters({
  employeeId,
  dates,
}: AvailabilitySyncInput): Promise<void> {
  if (dates.length === 0) return;

  const grouped = new Map<string, { month: number; year: number; dates: Date[] }>();
  for (const date of dates) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    const group = grouped.get(key) ?? { month, year, dates: [] };
    group.dates.push(date);
    grouped.set(key, group);
  }

  for (const group of grouped.values()) {
    const [roster, input] = await Promise.all([
      prisma.roster.findUnique({
        where: { month_year: { month: group.month, year: group.year } },
        select: { id: true, status: true },
      }),
      loadGenerationInput(group.month, group.year),
    ]);

    if (!roster) continue;

    if (roster.status !== "PUBLISHED") {
      const baseline = generateMonthlyRoster(input);
      const dateKeys = new Set(group.dates.map((date) => formatDate(date)));
      const dateValues = [...dateKeys].map((date) => calendarDate(date));
      const employeeIds = Object.keys(baseline.employeeSchedules);
      const entryRows = Object.entries(baseline.employeeSchedules).flatMap(([id, days]) =>
        days
          .filter((day) => dateKeys.has(day.date))
          .map((day) => ({
            employeeId: id,
            date: calendarDate(day.date),
            status: day.status,
            notes: day.detail,
          })),
      );

      await prisma.$transaction(
        async (tx) => {
          if (entryRows.length > 0) {
            await tx.rosterEntry.deleteMany({
              where: {
                rosterId: roster.id,
                date: { in: dateValues },
                employeeId: { in: employeeIds },
              },
            });
            await tx.rosterEntry.createMany({
              data: entryRows.map((entry) => ({ ...entry, rosterId: roster.id })),
            });

            const storedEntries = await tx.rosterEntry.findMany({
              where: { rosterId: roster.id, date: { in: dateValues } },
              select: { id: true, employeeId: true, date: true },
            });
            const entryIdByKey = new Map(
              storedEntries.map((entry) => [
                `${entry.employeeId}|${formatDate(entry.date)}`,
                entry.id,
              ]),
            );

            const allocationRows = Object.entries(baseline.employeeSchedules).flatMap(
              ([id, days]) =>
                days
                  .filter((day) => dateKeys.has(day.date))
                  .flatMap((day) =>
                    day.allocations.flatMap((allocation) => {
                      const rosterEntryId = entryIdByKey.get(`${id}|${day.date}`);
                      if (!rosterEntryId) return [];
                      return [
                        {
                          rosterEntryId,
                          brandId: allocation.brandId,
                          processId: allocation.processId,
                        },
                      ];
                    }),
                  ),
            );

            if (allocationRows.length > 0) {
              await tx.rosterAllocation.createMany({ data: allocationRows });
            }
          }

          await tx.auditLog.create({
            data: {
              action: "AVAILABILITY_SYNC",
              entity: "Roster",
              entityId: roster.id,
              details: `${employeeId} synced ${dateKeys.size} day(s) from availability changes`,
            },
          });
        },
        { timeout: 60000, maxWait: 10000 },
      );
    }

    await validateAndSaveRoster(group.month, group.year);
  }
}

export async function syncAvailabilityToRostersQuietly(
  input: AvailabilitySyncInput,
): Promise<string | null> {
  try {
    await syncAvailabilityToRosters(input);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Could not sync rosters with availability.";
  }
}

export async function revalidateRosters(): Promise<void> {
  const rosters = await prisma.roster.findMany({
    select: { month: true, year: true },
  });
  const failures: string[] = [];

  for (const roster of rosters) {
    try {
      await validateAndSaveRoster(roster.month, roster.year);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      failures.push(`${roster.month}/${roster.year}: ${message}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join("; "));
  }
}

export async function revalidateRostersQuietly(): Promise<string | null> {
  try {
    await revalidateRosters();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Could not revalidate rosters.";
  }
}

export function rosterPaths(): string[] {
  return MONTH_PATHS;
}
