"use server";

import { prisma } from "@/lib/prisma";
import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import { revalidateDraftRostersQuietly } from "@/modules/roster/db-service";
import {
  hasErrors,
  readBoolean,
  readOptionalString,
  readRequiredId,
  readRequiredString,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = [
  "/processes",
  "/brands",
  "/assignments",
  "/dashboard",
  "/roster",
  "/issues",
];

export async function createProcess(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Process code", errors, 40);
  const name = readRequiredString(formData, "name", "Process name", errors, 120);
  const description = readOptionalString(formData, "description", "Description", errors);
  const active = readBoolean(formData, "active");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.process.findFirst({
      where: { OR: [{ code }, { name }] },
      select: { code: true, name: true },
    });
    if (duplicate) {
      if (duplicate.code === code) errors.code = "Process code already exists.";
      if (duplicate.name === name) errors.name = "Process name already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    await prisma.process.create({ data: { code, name, description, active } });
  } catch (error) {
    if (applyUniqueError(error, { code: "code", name: "name" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create process.");
  }

  await revalidateDraftRostersQuietly();
  revalidatePaths(PATHS);
  return successState(`Process ${code} created.`);
}

export async function updateProcess(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing process id.");

  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Process code", errors, 40);
  const name = readRequiredString(formData, "name", "Process name", errors, 120);
  const description = readOptionalString(formData, "description", "Description", errors);
  const active = readBoolean(formData, "active");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.process.findFirst({
      where: { OR: [{ code }, { name }], id: { not: id } },
      select: { code: true, name: true },
    });
    if (duplicate) {
      if (duplicate.code === code) errors.code = "Process code already exists.";
      if (duplicate.name === name) errors.name = "Process name already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    await prisma.process.update({
      where: { id },
      data: { code, name, description, active },
    });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Process not found.");
    if (applyUniqueError(error, { code: "code", name: "name" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update process.");
  }

  await revalidateDraftRostersQuietly();
  revalidatePaths(PATHS);
  return successState(`Process ${code} updated.`);
}

export async function deactivateProcess(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing process id.");

  try {
    await prisma.process.update({ where: { id }, data: { active: false } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Process not found.");
    return errorState("Could not deactivate process.");
  }

  await revalidateDraftRostersQuietly();
  revalidatePaths(PATHS);
  return successState("Process deactivated.");
}
