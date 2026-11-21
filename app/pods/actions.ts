"use server";

import { prisma } from "@/lib/prisma";
import { errorState, successState, type ActionState } from "@/lib/mutations/action-state";
import { applyUniqueError, isRecordNotFound } from "@/lib/mutations/prisma-errors";
import { revalidatePaths } from "@/lib/mutations/revalidate";
import {
  hasErrors,
  readOptionalId,
  readOptionalString,
  readRequiredId,
  readRequiredString,
  type FieldErrors,
} from "@/lib/mutations/validate";

const PATHS = ["/pods", "/employees", "/dashboard"];

function readMemberIds(formData: FormData): string[] {
  return Array.from(
    new Set(
      formData
        .getAll("memberIds")
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );
}

async function validateMembers(
  memberIds: string[],
  errors: FieldErrors,
): Promise<boolean> {
  if (memberIds.length === 0) return true;
  const members = await prisma.employee.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, active: true },
  });
  if (members.length !== memberIds.length || members.some((member) => !member.active)) {
    errors.memberIds = "Select only active employees.";
    return false;
  }
  return true;
}

async function validateLead(
  leadId: string | null,
  currentPodId: string | null,
  errors: FieldErrors,
): Promise<boolean> {
  if (!leadId) return true;
  const lead = await prisma.employee.findUnique({
    where: { id: leadId },
    select: { active: true, leadOfPod: { select: { id: true } } },
  });
  if (!lead || !lead.active) {
    errors.leadId = "Select an active employee as lead.";
    return false;
  }
  if (lead.leadOfPod && lead.leadOfPod.id !== currentPodId) {
    errors.leadId = "This employee already leads another pod.";
    return false;
  }
  return true;
}

export async function createPod(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const errors: FieldErrors = {};
  const name = readRequiredString(formData, "name", "Pod name", errors, 120);
  const description = readOptionalString(formData, "description", "Description", errors);
  const leadId = readOptionalId(formData, "leadId");
  const memberIds = readMemberIds(formData);

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.pod.findUnique({ where: { name }, select: { id: true } });
    if (duplicate) {
      errors.name = "Pod name already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    const leadValid = await validateLead(leadId, null, errors);
    const membersValid = await validateMembers(memberIds, errors);
    if (!leadValid || !membersValid || hasErrors(errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }

    const effectiveMemberIds =
      leadId && !memberIds.includes(leadId) ? [...memberIds, leadId] : memberIds;
    await prisma.$transaction(async (tx) => {
      const pod = await tx.pod.create({ data: { name, description, leadId } });
      if (effectiveMemberIds.length > 0) {
        await tx.employee.updateMany({
          where: { id: { in: effectiveMemberIds } },
          data: { podId: pod.id },
        });
      }
    });
  } catch (error) {
    if (applyUniqueError(error, { name: "name", leadId: "leadId" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not create pod.");
  }

  revalidatePaths(PATHS);
  return successState(`Pod ${name} created.`);
}

export async function updatePod(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing pod id.");

  const errors: FieldErrors = {};
  const name = readRequiredString(formData, "name", "Pod name", errors, 120);
  const description = readOptionalString(formData, "description", "Description", errors);
  const leadId = readOptionalId(formData, "leadId");
  const memberIds = readMemberIds(formData);

  if (hasErrors(errors)) return errorState("Fix the highlighted fields.", errors);

  try {
    const duplicate = await prisma.pod.findFirst({
      where: { name, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) {
      errors.name = "Pod name already exists.";
      return errorState("Fix the highlighted fields.", errors);
    }
    const leadValid = await validateLead(leadId, id, errors);
    const membersValid = await validateMembers(memberIds, errors);
    if (!leadValid || !membersValid || hasErrors(errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }

    const effectiveMemberIds =
      leadId && !memberIds.includes(leadId) ? [...memberIds, leadId] : memberIds;
    const currentMembers = await prisma.employee.findMany({
      where: { podId: id },
      select: { id: true },
    });
    const removedIds = currentMembers
      .map((member) => member.id)
      .filter((memberId) => !effectiveMemberIds.includes(memberId));

    await prisma.$transaction(async (tx) => {
      await tx.pod.update({ where: { id }, data: { name, description, leadId } });
      if (effectiveMemberIds.length > 0) {
        await tx.employee.updateMany({
          where: { id: { in: effectiveMemberIds } },
          data: { podId: id },
        });
      }
      if (removedIds.length > 0) {
        await tx.employee.updateMany({
          where: { id: { in: removedIds } },
          data: { podId: null },
        });
      }
    });
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Pod not found.");
    if (applyUniqueError(error, { name: "name", leadId: "leadId" }, errors)) {
      return errorState("Fix the highlighted fields.", errors);
    }
    return errorState("Could not update pod.");
  }

  revalidatePaths(PATHS);
  return successState(`Pod ${name} updated.`);
}

export async function deletePod(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = readRequiredId(formData);
  if (!id) return errorState("Missing pod id.");

  try {
    const pod = await prisma.pod.findUnique({
      where: { id },
      select: { name: true },
    });
    if (!pod) return errorState("Pod not found.");
    await prisma.$transaction([
      prisma.employee.updateMany({ where: { podId: id }, data: { podId: null } }),
      prisma.pod.delete({ where: { id } }),
    ]);
    revalidatePaths(PATHS);
    return successState(`Pod ${pod.name} deleted. Members are now unassigned.`);
  } catch (error) {
    if (isRecordNotFound(error)) return errorState("Pod not found.");
    return errorState("Could not delete pod.");
  }
}
