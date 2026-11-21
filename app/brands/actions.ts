"use server";

import { prisma } from "@/lib/prisma";
import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import {
  hasErrors,
  readBoolean,
  readRequiredId,
  readRequiredString,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = ["/brands", "/assignments", "/dashboard"];

export async function createBrand(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Brand code", errors, 40);
  const name = readRequiredString(formData, "name", "Brand name", errors, 120);
  const active = readBoolean(formData, "active");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.brand.findFirst({
      where: { OR: [{ code }, { name }] },
      select: { code: true, name: true },
    });
    if (duplicate) {
      if (duplicate.code === code) errors.code = "Brand code already exists.";
      if (duplicate.name === name) errors.name = "Brand name already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    await prisma.brand.create({ data: { code, name, active } });
  } catch (error) {
    if (applyUniqueError(error, { code: "code", name: "name" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create brand.");
  }

  revalidatePaths(PATHS);
  return successState(`Brand ${code} created.`);
}

export async function updateBrand(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing brand id.");

  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Brand code", errors, 40);
  const name = readRequiredString(formData, "name", "Brand name", errors, 120);
  const active = readBoolean(formData, "active");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.brand.findFirst({
      where: { OR: [{ code }, { name }], id: { not: id } },
      select: { code: true, name: true },
    });
    if (duplicate) {
      if (duplicate.code === code) errors.code = "Brand code already exists.";
      if (duplicate.name === name) errors.name = "Brand name already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    await prisma.brand.update({ where: { id }, data: { code, name, active } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Brand not found.");
    if (applyUniqueError(error, { code: "code", name: "name" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update brand.");
  }

  revalidatePaths(PATHS);
  return successState(`Brand ${code} updated.`);
}

export async function deactivateBrand(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing brand id.");

  try {
    await prisma.brand.update({ where: { id }, data: { active: false } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Brand not found.");
    return errorState("Could not deactivate brand.");
  }

  revalidatePaths(PATHS);
  return successState("Brand deactivated.");
}
