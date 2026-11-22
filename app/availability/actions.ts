"use server";

import { LeaveStatus, LeaveType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  errorState,
  successStateWithRevalidation,
  type ActionState,
} from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import { syncAvailabilityToRostersQuietly } from "@/modules/roster/db-service";
import {
  hasErrors,
  readDate,
  readEnumValue,
  readOptionalString,
  readRequiredId,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = ["/availability", "/dashboard", "/employees", "/roster", "/issues"];

const LEAVE_TYPES = Object.values(LeaveType);
const LEAVE_STATUSES = Object.values(LeaveStatus);

interface AvailabilityChange {
  employeeId: string;
  dates: Date[];
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function datesBetween(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12);
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function uniqueDates(dates: Date[]): Date[] {
  const byKey = new Map<string, Date>();
  for (const date of dates) byKey.set(dateKey(date), date);
  return [...byKey.values()].sort((left, right) => left.getTime() - right.getTime());
}

async function syncAvailability(changes: AvailabilityChange[]): Promise<string | null> {
  const grouped = new Map<string, AvailabilityChange>();
  for (const change of changes) {
    const group = grouped.get(change.employeeId) ?? { employeeId: change.employeeId, dates: [] };
    group.dates.push(...change.dates);
    grouped.set(change.employeeId, group);
  }

  const failures: string[] = [];
  for (const group of grouped.values()) {
    const dates = uniqueDates(group.dates);
    if (dates.length === 0) continue;
    const error = await syncAvailabilityToRostersQuietly({
      employeeId: group.employeeId,
      dates,
    });
    if (error) failures.push(error);
  }
  return failures.length > 0 ? failures.join("; ") : null;
}

async function requireActiveEmployee(
  employeeId: string,
  errors: FieldErrors,
): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { active: true },
  });
  if (!employee?.active) errors.employeeId = "Select an active employee.";
}

async function hasOverlappingLeave(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
): Promise<boolean> {
  const overlap = await prisma.leave.findFirst({
    where: {
      employeeId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: { id: true },
  });
  return overlap !== null;
}

export async function createLeave(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const employeeId = readRequiredId(formData, "employeeId");
  const startDate = readDate(formData, "startDate", "Start date", errors);
  const endDate = readDate(formData, "endDate", "End date", errors);
  const type = readEnumValue(formData, "type", "Leave type", errors, LEAVE_TYPES, LeaveType.PLANNED);
  const status = readEnumValue(
    formData,
    "status",
    "Leave status",
    errors,
    LEAVE_STATUSES,
    LeaveStatus.PENDING,
  );
  const reason = readOptionalString(formData, "reason", "Reason", errors);

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (startDate && endDate && endDate < startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    await requireActiveEmployee(employeeId!, errors);
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);
    if (await hasOverlappingLeave(employeeId!, startDate!, endDate!)) {
      errors.form = "Leave dates overlap an existing leave record for this employee.";
      return errorState(errors.form, errors);
    }

    await prisma.leave.create({
      data: {
        employeeId: employeeId!,
        startDate: startDate!,
        endDate: endDate!,
        type: type!,
        status: status!,
        reason,
      },
    });
  } catch (error) {
    if (applyUniqueError(error, { employeeId: "employeeId" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create leave record.");
  }

  const revalidationError = await syncAvailability([
    { employeeId: employeeId!, dates: datesBetween(startDate!, endDate!) },
  ]);
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Leave record created.", revalidationError);
}

export async function updateLeave(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing leave id.");

  const errors: FieldErrors = {};
  const employeeId = readRequiredId(formData, "employeeId");
  const startDate = readDate(formData, "startDate", "Start date", errors);
  const endDate = readDate(formData, "endDate", "End date", errors);
  const type = readEnumValue(formData, "type", "Leave type", errors, LEAVE_TYPES, LeaveType.PLANNED);
  const status = readEnumValue(
    formData,
    "status",
    "Leave status",
    errors,
    LEAVE_STATUSES,
    LeaveStatus.PENDING,
  );
  const reason = readOptionalString(formData, "reason", "Reason", errors);

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (startDate && endDate && endDate < startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  let affected: AvailabilityChange[] = [];

  try {
    await requireActiveEmployee(employeeId!, errors);
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);
    if (await hasOverlappingLeave(employeeId!, startDate!, endDate!, id)) {
      errors.form = "Leave dates overlap an existing leave record for this employee.";
      return errorState(errors.form, errors);
    }

    const existing = await prisma.leave.findUnique({
      where: { id },
      select: { employeeId: true, startDate: true, endDate: true },
    });
    if (!existing) return errorState("Leave record not found.");

    await prisma.leave.update({
      where: { id },
      data: {
        employeeId: employeeId!,
        startDate: startDate!,
        endDate: endDate!,
        type: type!,
        status: status!,
        reason,
      },
    });

    affected = [
      {
        employeeId: existing.employeeId,
        dates: datesBetween(existing.startDate, existing.endDate),
      },
      { employeeId: employeeId!, dates: datesBetween(startDate!, endDate!) },
    ];
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Leave record not found.");
    if (applyUniqueError(error, { employeeId: "employeeId" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update leave record.");
  }

  const revalidationError = await syncAvailability(affected);
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Leave record updated.", revalidationError);
}

export async function setLeaveStatus(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing leave id.");
  const errors: FieldErrors = {};
  const status = readEnumValue(formData, "status", "Leave status", errors, LEAVE_STATUSES);
  if (!status) return errorState("Fix the highlighted fields.", errors);

  let affected: AvailabilityChange[] = [];

  try {
    const existing = await prisma.leave.findUnique({
      where: { id },
      select: { employeeId: true, startDate: true, endDate: true },
    });
    if (!existing) return errorState("Leave record not found.");
    await prisma.leave.update({ where: { id }, data: { status } });
    affected = [
      {
        employeeId: existing.employeeId,
        dates: datesBetween(existing.startDate, existing.endDate),
      },
    ];
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Leave record not found.");
    return errorState("Could not update leave status.");
  }

  const revalidationError = await syncAvailability(affected);
  revalidatePaths(PATHS);
  return successStateWithRevalidation(`Leave marked ${status.toLowerCase()}.`, revalidationError);
}

export async function deleteLeave(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing leave id.");

  let affected: AvailabilityChange[] = [];

  try {
    const existing = await prisma.leave.findUnique({
      where: { id },
      select: { employeeId: true, startDate: true, endDate: true },
    });
    if (!existing) return errorState("Leave record not found.");
    await prisma.leave.delete({ where: { id } });
    affected = [
      {
        employeeId: existing.employeeId,
        dates: datesBetween(existing.startDate, existing.endDate),
      },
    ];
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Leave record not found.");
    return errorState("Could not delete leave record.");
  }

  const revalidationError = await syncAvailability(affected);
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Leave record deleted.", revalidationError);
}

export async function createCompOff(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const employeeId = readRequiredId(formData, "employeeId");
  const date = readDate(formData, "date", "Comp-off date", errors);
  const status = readEnumValue(
    formData,
    "status",
    "Comp-off status",
    errors,
    LEAVE_STATUSES,
    LeaveStatus.APPROVED,
  );
  const reason = readOptionalString(formData, "reason", "Reason", errors);

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    await requireActiveEmployee(employeeId!, errors);
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);
    await prisma.compOff.create({
      data: { employeeId: employeeId!, date: date!, status: status!, reason },
    });
  } catch (error) {
    if (applyUniqueError(error, { employeeId_date: "date" }, errors)) {
      if (errors.date) errors.date = "This employee already has a comp-off on that date.";
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create comp-off record.");
  }

  const revalidationError = await syncAvailability([
    { employeeId: employeeId!, dates: [date!] },
  ]);
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Comp-off record created.", revalidationError);
}

export async function updateCompOff(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing comp-off id.");

  const errors: FieldErrors = {};
  const employeeId = readRequiredId(formData, "employeeId");
  const date = readDate(formData, "date", "Comp-off date", errors);
  const status = readEnumValue(
    formData,
    "status",
    "Comp-off status",
    errors,
    LEAVE_STATUSES,
    LeaveStatus.APPROVED,
  );
  const reason = readOptionalString(formData, "reason", "Reason", errors);

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  let affected: AvailabilityChange[] = [];

  try {
    await requireActiveEmployee(employeeId!, errors);
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);
    const existing = await prisma.compOff.findUnique({
      where: { id },
      select: { employeeId: true, date: true },
    });
    if (!existing) return errorState("Comp-off record not found.");
    await prisma.compOff.update({
      where: { id },
      data: { employeeId: employeeId!, date: date!, status: status!, reason },
    });
    affected = [
      { employeeId: existing.employeeId, dates: [existing.date] },
      { employeeId: employeeId!, dates: [date!] },
    ];
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Comp-off record not found.");
    if (applyUniqueError(error, { employeeId_date: "date" }, errors)) {
      if (errors.date) errors.date = "This employee already has a comp-off on that date.";
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update comp-off record.");
  }

  const revalidationError = await syncAvailability(affected);
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Comp-off record updated.", revalidationError);
}

export async function setCompOffStatus(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing comp-off id.");
  const errors: FieldErrors = {};
  const status = readEnumValue(formData, "status", "Comp-off status", errors, LEAVE_STATUSES);
  if (!status) return errorState("Fix the highlighted fields.", errors);

  let affected: AvailabilityChange[] = [];

  try {
    const existing = await prisma.compOff.findUnique({
      where: { id },
      select: { employeeId: true, date: true },
    });
    if (!existing) return errorState("Comp-off record not found.");
    await prisma.compOff.update({ where: { id }, data: { status } });
    affected = [{ employeeId: existing.employeeId, dates: [existing.date] }];
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Comp-off record not found.");
    return errorState("Could not update comp-off status.");
  }

  const revalidationError = await syncAvailability(affected);
  revalidatePaths(PATHS);
  return successStateWithRevalidation(
    `Comp-off marked ${status.toLowerCase()}.`,
    revalidationError,
  );
}

export async function deleteCompOff(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing comp-off id.");

  let affected: AvailabilityChange[] = [];

  try {
    const existing = await prisma.compOff.findUnique({
      where: { id },
      select: { employeeId: true, date: true },
    });
    if (!existing) return errorState("Comp-off record not found.");
    await prisma.compOff.delete({ where: { id } });
    affected = [{ employeeId: existing.employeeId, dates: [existing.date] }];
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Comp-off record not found.");
    return errorState("Could not delete comp-off record.");
  }

  const revalidationError = await syncAvailability(affected);
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Comp-off record deleted.", revalidationError);
}
