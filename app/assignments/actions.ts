"use server";

import { prisma } from "@/lib/prisma";
import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import {
  hasErrors,
  readBoolean,
  readDate,
  readRequiredId,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = ["/assignments", "/brands", "/dashboard"];

export async function createAssignment(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const employeeId = readRequiredId(formData, "employeeId");
  const brandId = readRequiredId(formData, "brandId");
  const processId = readRequiredId(formData, "processId");
  const effectiveFrom = readDate(formData, "effectiveFrom", "Effective from", errors);
  const effectiveTo = readDate(formData, "effectiveTo", "Effective to", errors, false);
  const isPrimary = readBoolean(formData, "isPrimary");
  const active = readBoolean(formData, "active");

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (!brandId) errors.brandId = "Select a brand.";
  if (!processId) errors.processId = "Select a process.";
  if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
    errors.effectiveTo = "Effective end must be on or after the start date.";
  }
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const [employee, brand, process] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId! }, select: { active: true } }),
      prisma.brand.findUnique({ where: { id: brandId! }, select: { active: true } }),
      prisma.process.findUnique({ where: { id: processId! }, select: { active: true } }),
    ]);
    if (!employee?.active) errors.employeeId = "Select an active employee.";
    if (!brand?.active) errors.brandId = "Select an active brand.";
    if (!process?.active) errors.processId = "Select an active process.";
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

    const duplicate = await prisma.employeeAssignment.findFirst({
      where: { employeeId: employeeId!, brandId: brandId!, processId: processId! },
      select: { id: true },
    });
    if (duplicate) {
      errors.form = "This employee-brand-process assignment already exists.";
      return errorState(errors.form, errors);
    }

    await prisma.employeeAssignment.create({
      data: {
        employeeId: employeeId!,
        brandId: brandId!,
        processId: processId!,
        effectiveFrom: effectiveFrom!,
        effectiveTo,
        isPrimary,
        active,
      },
    });
  } catch (error) {
    if (
      applyUniqueError(
        error,
        {
          employeeId_brandId_processId: "form",
          employeeId: "employeeId",
          brandId: "brandId",
          processId: "processId",
        },
        errors,
      )
    ) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create assignment.");
  }

  revalidatePaths(PATHS);
  return successState("Assignment created.");
}

export async function updateAssignment(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing assignment id.");

  const errors: FieldErrors = {};
  const employeeId = readRequiredId(formData, "employeeId");
  const brandId = readRequiredId(formData, "brandId");
  const processId = readRequiredId(formData, "processId");
  const effectiveFrom = readDate(formData, "effectiveFrom", "Effective from", errors);
  const effectiveTo = readDate(formData, "effectiveTo", "Effective to", errors, false);
  const isPrimary = readBoolean(formData, "isPrimary");
  const active = readBoolean(formData, "active");

  if (!employeeId) errors.employeeId = "Select an employee.";
  if (!brandId) errors.brandId = "Select a brand.";
  if (!processId) errors.processId = "Select a process.";
  if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
    errors.effectiveTo = "Effective end must be on or after the start date.";
  }
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const [employee, brand, process] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId! }, select: { active: true } }),
      prisma.brand.findUnique({ where: { id: brandId! }, select: { active: true } }),
      prisma.process.findUnique({ where: { id: processId! }, select: { active: true } }),
    ]);
    if (!employee?.active) errors.employeeId = "Select an active employee.";
    if (!brand?.active) errors.brandId = "Select an active brand.";
    if (!process?.active) errors.processId = "Select an active process.";
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

    const duplicate = await prisma.employeeAssignment.findFirst({
      where: {
        employeeId: employeeId!,
        brandId: brandId!,
        processId: processId!,
        id: { not: id },
      },
      select: { id: true },
    });
    if (duplicate) {
      errors.form = "This employee-brand-process assignment already exists.";
      return errorState(errors.form, errors);
    }

    await prisma.employeeAssignment.update({
      where: { id },
      data: {
        employeeId: employeeId!,
        brandId: brandId!,
        processId: processId!,
        effectiveFrom: effectiveFrom!,
        effectiveTo,
        isPrimary,
        active,
      },
    });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Assignment not found.");
    if (
      applyUniqueError(
        error,
        {
          employeeId_brandId_processId: "form",
          employeeId: "employeeId",
          brandId: "brandId",
          processId: "processId",
        },
        errors,
      )
    ) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update assignment.");
  }

  revalidatePaths(PATHS);
  return successState("Assignment updated.");
}

export async function deleteAssignment(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing assignment id.");

  try {
    await prisma.employeeAssignment.delete({ where: { id } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Assignment not found.");
    return errorState("Could not delete assignment.");
  }

  revalidatePaths(PATHS);
  return successState("Assignment deleted.");
}
