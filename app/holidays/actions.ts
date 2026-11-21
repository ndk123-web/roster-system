"use server";

import { prisma } from "@/lib/prisma";
import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import { revalidateDraftRostersQuietly } from "@/modules/roster/db-service";
import {
  hasErrors,
  readBoolean,
  readDate,
  readOptionalString,
  readRequiredId,
  readRequiredString,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = ["/holidays", "/dashboard", "/roster", "/issues"];

export async function createHoliday(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const date = readDate(formData, "date", "Holiday date", errors);
  const name = readRequiredString(formData, "name", "Holiday name", errors, 120);
  const description = readOptionalString(formData, "description", "Description", errors);
  const affectsAllProcesses = readBoolean(formData, "affectsAllProcesses");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.publicHoliday.findUnique({
      where: { date: date! },
      select: { id: true },
    });
    if (duplicate) {
      errors.date = "A holiday already exists on this date.";
      return errorState("Fix the highlighted fields.", errors);
    }
    await prisma.publicHoliday.create({
      data: { date: date!, name, description, affectsAllProcesses },
    });
  } catch (error) {
    if (applyUniqueError(error, { date: "date" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create holiday.");
  }

  await revalidateDraftRostersQuietly();
  revalidatePaths(PATHS);
  return successState(`Holiday ${name} created.`);
}

export async function updateHoliday(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing holiday id.");

  const errors: FieldErrors = {};
  const date = readDate(formData, "date", "Holiday date", errors);
  const name = readRequiredString(formData, "name", "Holiday name", errors, 120);
  const description = readOptionalString(formData, "description", "Description", errors);
  const affectsAllProcesses = readBoolean(formData, "affectsAllProcesses");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.publicHoliday.findFirst({
      where: { date: date!, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) {
      errors.date = "A holiday already exists on this date.";
      return errorState("Fix the highlighted fields.", errors);
    }
    await prisma.publicHoliday.update({
      where: { id },
      data: { date: date!, name, description, affectsAllProcesses },
    });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Holiday not found.");
    if (applyUniqueError(error, { date: "date" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update holiday.");
  }

  await revalidateDraftRostersQuietly();
  revalidatePaths(PATHS);
  return successState(`Holiday ${name} updated.`);
}

export async function deleteHoliday(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing holiday id.");

  try {
    await prisma.publicHoliday.delete({ where: { id } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Holiday not found.");
    return errorState("Could not delete holiday.");
  }

  await revalidateDraftRostersQuietly();
  revalidatePaths(PATHS);
  return successState("Holiday deleted.");
}
