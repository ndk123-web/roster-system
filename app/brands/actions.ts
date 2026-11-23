"use server";

import { OperatingPattern, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  errorState,
  successStateWithRevalidation,
  type ActionState,
} from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import { revalidateRostersQuietly } from "@/modules/roster/db-service";
import {
  hasErrors,
  readBoolean,
  readDate,
  readDayOfWeekValues,
  readInteger,
  readOptionalId,
  readRequiredId,
  readRequiredString,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = [
  "/brands",
  "/assignments",
  "/dashboard",
  "/holidays",
  "/roster",
  "/issues",
];

interface CustomStaffingInput {
  dayOfWeek: number | null;
  specificDate: Date | null;
  requiredStaffing: number | null;
}

function readOperatingPattern(
  formData: FormData,
  errors: FieldErrors,
): OperatingPattern | null {
  const raw = readRequiredString(formData, "operatingPattern", "Operating pattern", errors);
  if (!raw) return null;
  if (!(Object.values(OperatingPattern) as string[]).includes(raw)) {
    errors.operatingPattern = "Select a valid operating pattern.";
    return null;
  }
  return raw as OperatingPattern;
}

function readCustomStaffing(
  formData: FormData,
  errors: FieldErrors,
): CustomStaffingInput {
  const dayRaw = readOptionalId(formData, "customStaffingDay");
  const specificDate = readDate(
    formData,
    "customStaffingDate",
    "Custom staffing date",
    errors,
    false,
  );
  const requiredStaffing = readInteger(
    formData,
    "customStaffingRequired",
    "Custom staffing",
    errors,
    { min: 1, max: 50 },
  );

  let dayOfWeek: number | null = null;
  if (dayRaw !== null) {
    if (!/^[0-6]$/.test(dayRaw)) {
      errors.customStaffingDay = "Select a valid weekday.";
    } else {
      dayOfWeek = Number(dayRaw);
    }
  }

  if (dayOfWeek !== null && specificDate) {
    errors.customStaffingDate = "Choose either a weekday or a date, not both.";
  }
  if ((dayOfWeek !== null || specificDate) && requiredStaffing === null) {
    errors.customStaffingRequired = "Enter the required staffing for this override.";
  }
  if (requiredStaffing !== null && dayOfWeek === null && !specificDate) {
    errors.customStaffingDay = "Choose a weekday or date for this override.";
  }

  return { dayOfWeek, specificDate, requiredStaffing };
}

async function writeCustomStaffing(
  tx: Prisma.TransactionClient,
  ruleId: string,
  custom: CustomStaffingInput,
): Promise<void> {
  await tx.customStaffingRule.deleteMany({ where: { brandProcessRuleId: ruleId } });
  if (custom.requiredStaffing === null) return;
  await tx.customStaffingRule.create({
    data: {
      brandProcessRuleId: ruleId,
      dayOfWeek: custom.dayOfWeek,
      specificDate: custom.specificDate,
      requiredStaffing: custom.requiredStaffing,
    },
  });
}

export async function createBrand(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const code = readRequiredString(formData, "code", "Brand code", errors, 40);
  const name = readRequiredString(formData, "name", "Brand name", errors, 120);
  const startDate = readDate(formData, "startDate", "Start date", errors);
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
    await prisma.brand.create({ data: { code, name, active, startDate } });
  } catch (error) {
    if (applyUniqueError(error, { code: "code", name: "name" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create brand.");
  }

  const revalidationError = await revalidateRostersQuietly();
  revalidatePaths(PATHS);
  return successStateWithRevalidation(`Brand ${code} created.`, revalidationError);
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
  const startDate = readDate(formData, "startDate", "Start date", errors);
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
    await prisma.brand.update({ where: { id }, data: { code, name, active, startDate } });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Brand not found.");
    if (applyUniqueError(error, { code: "code", name: "name" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update brand.");
  }

  const revalidationError = await revalidateRostersQuietly();
  revalidatePaths(PATHS);
  return successStateWithRevalidation(`Brand ${code} updated.`, revalidationError);
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

  const revalidationError = await revalidateRostersQuietly();
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Brand deactivated.", revalidationError);
}

export async function createBrandRule(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const brandId = readRequiredId(formData, "brandId");
  const processId = readRequiredId(formData, "processId");
  const operatingPattern = readOperatingPattern(formData, errors);
  const customDaysOfWeek = readDayOfWeekValues(
    formData,
    "customDaysOfWeek",
    "Custom operating days",
    errors,
    operatingPattern === OperatingPattern.CUSTOM,
  );
  const operatesOnHolidays = readBoolean(formData, "operatesOnHolidays");
  const defaultMinStaffing = readInteger(formData, "defaultMinStaffing", "Minimum staffing", errors, {
    required: true,
    min: 1,
    max: 50,
  });
  const customStaffing = readCustomStaffing(formData, errors);
  const ruleStartDate = readDate(formData, "startDate", "Rule start date", errors, false);

  if (!brandId) errors.brandId = "Missing brand id.";
  if (!processId) errors.processId = "Select a process.";
  if (!brandId || !processId) return errorState("Fix the highlighted fields.", errors);
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  let processCode = "process";
  try {
    const [brand, process] = await Promise.all([
      prisma.brand.findUnique({ where: { id: brandId }, select: { id: true, startDate: true } }),
      prisma.process.findUnique({ where: { id: processId }, select: { code: true } }),
    ]);
    if (!brand) errors.brandId = "Brand not found.";
    if (!process) errors.processId = "Select a valid process.";
    if (process) processCode = process.code;
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

    const duplicate = await prisma.brandProcessRule.findUnique({
      where: { brandId_processId: { brandId, processId } },
      select: { id: true },
    });
    if (duplicate) {
      errors.processId = "A rule already exists for this brand and process.";
      return errorState("Fix the highlighted fields.", errors);
    }

    await prisma.$transaction(async (tx) => {
      const rule = await tx.brandProcessRule.create({
        data: {
          brandId,
          processId,
          operatingPattern: operatingPattern!,
          customDaysOfWeek: operatingPattern === OperatingPattern.CUSTOM ? customDaysOfWeek : [],
          operatesOnHolidays,
          defaultMinStaffing: defaultMinStaffing!,
          startDate: ruleStartDate ?? brand?.startDate ?? null,
        },
      });
      await writeCustomStaffing(tx, rule.id, customStaffing);
    });
  } catch (error) {
    if (
      applyUniqueError(
        error,
        { brandId_processId: "processId", brandId: "brandId", processId: "processId" },
        errors,
      )
    ) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create brand process rule.");
  }

  const revalidationError = await revalidateRostersQuietly();
  revalidatePaths(PATHS);
  return successStateWithRevalidation(`Rule created for ${processCode}.`, revalidationError);
}

export async function updateBrandRule(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const id = readRequiredId(formData);
  const brandId = readRequiredId(formData, "brandId");
  const processId = readRequiredId(formData, "processId");
  const operatingPattern = readOperatingPattern(formData, errors);
  const customDaysOfWeek = readDayOfWeekValues(
    formData,
    "customDaysOfWeek",
    "Custom operating days",
    errors,
    operatingPattern === OperatingPattern.CUSTOM,
  );
  const operatesOnHolidays = readBoolean(formData, "operatesOnHolidays");
  const defaultMinStaffing = readInteger(formData, "defaultMinStaffing", "Minimum staffing", errors, {
    required: true,
    min: 1,
    max: 50,
  });
  const customStaffing = readCustomStaffing(formData, errors);
  const ruleStartDate = readDate(formData, "startDate", "Rule start date", errors, false);

  if (!id) return errorState("Missing rule id.");
  if (!brandId) errors.brandId = "Missing brand id.";
  if (!processId) errors.processId = "Select a process.";
  if (!brandId || !processId) return errorState("Fix the highlighted fields.", errors);
  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  let processCode = "process";
  try {
    const [rule, process] = await Promise.all([
      prisma.brandProcessRule.findFirst({
        where: { id, brandId },
        select: { id: true, brand: { select: { startDate: true } } },
      }),
      prisma.process.findUnique({ where: { id: processId }, select: { code: true } }),
    ]);
    if (!rule) return errorState("Rule not found.");
    if (!process) errors.processId = "Select a valid process.";
    if (process) processCode = process.code;
    if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

    const duplicate = await prisma.brandProcessRule.findFirst({
      where: { brandId, processId, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) {
      errors.processId = "A rule already exists for this brand and process.";
      return errorState("Fix the highlighted fields.", errors);
    }

    await prisma.$transaction(async (tx) => {
      await tx.brandProcessRule.update({
        where: { id },
        data: {
          processId,
          operatingPattern: operatingPattern!,
          customDaysOfWeek: operatingPattern === OperatingPattern.CUSTOM ? customDaysOfWeek : [],
          operatesOnHolidays,
          defaultMinStaffing: defaultMinStaffing!,
          startDate: ruleStartDate ?? rule.brand.startDate,
        },
      });
      await writeCustomStaffing(tx, id, customStaffing);
    });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Rule not found.");
    if (
      applyUniqueError(
        error,
        { brandId_processId: "processId", brandId: "brandId", processId: "processId" },
        errors,
      )
    ) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update brand process rule.");
  }

  const revalidationError = await revalidateRostersQuietly();
  revalidatePaths(PATHS);
  return successStateWithRevalidation(`Rule updated for ${processCode}.`, revalidationError);
}

export async function deleteBrandRule(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  const brandId = readRequiredId(formData, "brandId");
  if (!id) return errorState("Missing rule id.");
  if (!brandId) return errorState("Missing brand id.");

  try {
    const result = await prisma.brandProcessRule.deleteMany({ where: { id, brandId } });
    if (result.count === 0) return errorState("Rule not found.");
  } catch {
    return errorState("Could not delete brand process rule.");
  }

  const revalidationError = await revalidateRostersQuietly();
  revalidatePaths(PATHS);
  return successStateWithRevalidation("Brand process rule deleted.", revalidationError);
}
