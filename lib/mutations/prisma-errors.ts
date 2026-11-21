import { Prisma } from "@prisma/client";
import type { FieldErrors } from "./validate";

export function applyUniqueError(
  error: unknown,
  fieldMap: Record<string, string>,
  errors: FieldErrors,
): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  const targets = Array.isArray(error.meta?.target)
    ? (error.meta.target as string[])
    : [];
  for (const target of targets) {
    const field = fieldMap[target];
    if (field) errors[field] = "This value is already in use.";
  }
  if (Object.keys(errors).length === 0) {
    errors.form = "A record with these values already exists.";
  }
  return true;
}

export function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"
  );
}
