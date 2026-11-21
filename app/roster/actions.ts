"use server";

import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import {
  hasErrors,
  readDate,
  readEnumValue,
  readInteger,
  readOptionalId,
  readRequiredId,
  type FieldErrors,
} from "@/lib/mutations/validate";
import {
  generateAndSaveRoster,
  publishRoster,
  revalidateDraftRosters,
  rosterPaths,
  updateRosterEntry,
} from "@/modules/roster/db-service";

const OPERATIONS = ["STATUS", "ADD_ALLOCATION", "REMOVE_ALLOCATION"] as const;
const STATUSES = [
  "WORKING",
  "WEEKLY_OFF",
  "LEAVE",
  "COMP_OFF",
  "PUBLIC_HOLIDAY",
  "UNASSIGNED",
] as const;

function readPeriod(formData: FormData) {
  const errors: FieldErrors = {};
  const month = readInteger(formData, "month", "Month", errors, {
    required: true,
    min: 1,
    max: 12,
  });
  const year = readInteger(formData, "year", "Year", errors, {
    required: true,
    min: 2000,
    max: 2100,
  });
  return { month, year, errors };
}

export async function generateRoster(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const { month, year, errors } = readPeriod(formData);
  if (hasErrors(errors)) return errorState("Select a valid month and year.", errors);

  try {
    const result = await generateAndSaveRoster(month!, year!);
    revalidatePaths(rosterPaths());
    return successState(
      `Roster generated with ${result.summary.totalShifts} shifts, ${result.summary.mandatoryErrors} mandatory gaps, and ${result.summary.warnings} warnings.`,
    );
  } catch (error) {
    return errorState(
      error instanceof Error ? error.message : "Could not generate roster.",
    );
  }
}

export async function updateRosterEntryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const { month, year, errors } = readPeriod(formData);
  const employeeId = readRequiredId(formData, "employeeId");
  const date = readDate(formData, "date", "Date", errors);
  const operation = readEnumValue(formData, "operation", "Operation", errors, OPERATIONS, "STATUS");
  const status = readEnumValue(formData, "status", "Status", errors, STATUSES, "WORKING");
  const brandId = readOptionalId(formData, "brandId");
  const processId = readOptionalId(formData, "processId");

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const result = await updateRosterEntry({
      month: month!,
      year: year!,
      employeeId: employeeId!,
      date: date!,
      operation: operation!,
      status: status ?? undefined,
      brandId,
      processId,
    });
    revalidatePaths(rosterPaths());
    return successState(
      `Roster entry updated. ${result.errors} mandatory issue(s), ${result.warnings} warning(s).`,
    );
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Could not update roster entry.");
  }
}

export async function publishMonthlyRoster(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const { month, year, errors } = readPeriod(formData);
  if (hasErrors(errors)) return errorState("Select a valid month and year.", errors);

  try {
    await publishRoster(month!, year!);
    revalidatePaths(rosterPaths());
    return successState("Roster published successfully.");
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Could not publish roster.");
  }
}

export async function revalidateRosters(
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;
  try {
    await revalidateDraftRosters();
    revalidatePaths(rosterPaths());
    return successState("Draft rosters revalidated against current configuration.");
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Could not revalidate rosters.");
  }
}
