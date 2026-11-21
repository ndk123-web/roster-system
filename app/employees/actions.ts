"use server";

import { prisma } from "@/lib/prisma";
import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import {
  hasErrors,
  readBoolean,
  readEmail,
  readOptionalId,
  readRequiredId,
  readRequiredString,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = ["/employees", "/pods", "/assignments", "/dashboard"];

export async function createEmployee(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Employee code", errors, 40);
  const name = readRequiredString(formData, "name", "Employee name", errors, 120);
  const email = readEmail(formData, "email", "Email", errors);
  const podId = readOptionalId(formData, "podId");
  const active = readBoolean(formData, "active");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.employee.findFirst({
      where: { OR: [{ code }, { email }] },
      select: { code: true, email: true },
    });
    if (duplicate) {
      if (duplicate.code === code) errors.code = "Employee code already exists.";
      if (duplicate.email === email) errors.email = "Email already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    if (podId) {
      const pod = await prisma.pod.findUnique({ where: { id: podId }, select: { id: true } });
      if (!pod) {
        errors.podId = "Selected pod no longer exists.";
        return errorState("Fix the highlighted fields.", errors);
      }
    }
    await prisma.employee.create({ data: { code, name, email, active, podId } });
  } catch (error) {
    if (applyUniqueError(error, { code: "code", email: "email" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create employee.");
  }

  revalidatePaths(PATHS);
  return successState(`Employee ${code} created.`);
}

export async function updateEmployee(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing employee id.");

  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Employee code", errors, 40);
  const name = readRequiredString(formData, "name", "Employee name", errors, 120);
  const email = readEmail(formData, "email", "Email", errors);
  const podId = readOptionalId(formData, "podId");
  const active = readBoolean(formData, "active");

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.employee.findFirst({
      where: { OR: [{ code }, { email }], id: { not: id } },
      select: { code: true, email: true },
    });
    if (duplicate) {
      if (duplicate.code === code) errors.code = "Employee code already exists.";
      if (duplicate.email === email) errors.email = "Email already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    if (podId) {
      const pod = await prisma.pod.findUnique({ where: { id: podId }, select: { id: true } });
      if (!pod) {
        errors.podId = "Selected pod no longer exists.";
        return errorState("Fix the highlighted fields.", errors);
      }
    }
    await prisma.employee.update({
      where: { id },
      data: { code, name, email, active, podId },
    });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Employee not found.");
    if (applyUniqueError(error, { code: "code", email: "email" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update employee.");
  }

  revalidatePaths(PATHS);
  return successState(`Employee ${code} updated.`);
}

export async function deactivateEmployee(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing employee id.");

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { code: true, leadOfPod: { select: { name: true } } },
    });
    if (!employee) return errorState("Employee not found.");
    if (employee.leadOfPod) {
      return errorState(
        `Reassign ${employee.code} as lead of ${employee.leadOfPod.name} before deactivating.`,
      );
    }
    await prisma.employee.update({ where: { id }, data: { active: false } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Employee not found.");
    return errorState("Could not deactivate employee.");
  }

  revalidatePaths(PATHS);
  return successState("Employee deactivated.");
}
