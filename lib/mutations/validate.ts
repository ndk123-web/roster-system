export type FieldErrors = Record<string, string>;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function readRequiredString(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
  max = 160,
): string {
  const value = readString(formData, name);
  if (!value) errors[name] = `${label} is required.`;
  else if (value.length > max) errors[name] = `${label} must be ${max} characters or fewer.`;
  return value;
}

export function readOptionalString(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
  max = 500,
): string | null {
  const value = readString(formData, name);
  if (value.length > max) {
    errors[name] = `${label} must be ${max} characters or fewer.`;
    return null;
  }
  return value || null;
}

export function readEmail(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
): string {
  const value = readRequiredString(formData, name, label, errors, 200);
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors[name] = `${label} must be a valid email address.`;
  }
  return value;
}

export function readRequiredId(formData: FormData, name = "id"): string | null {
  return readString(formData, name) || null;
}

export function readOptionalId(formData: FormData, name: string): string | null {
  return readString(formData, name) || null;
}

export function readBoolean(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true";
}

export function readDate(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
  required = true,
): Date | null {
  const raw = readString(formData, name);
  if (!raw) {
    if (required) errors[name] = `${label} is required.`;
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    errors[name] = `${label} must be a valid date.`;
    return null;
  }
  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    errors[name] = `${label} must be a valid date.`;
    return null;
  }
  return date;
}

export function readInteger(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
  options: { required?: boolean; min?: number; max?: number } = {},
): number | null {
  const raw = readString(formData, name);
  if (!raw) {
    if (options.required) errors[name] = `${label} is required.`;
    return null;
  }
  if (!/^\d+$/.test(raw)) {
    errors[name] = `${label} must be a whole number.`;
    return null;
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    errors[name] = `${label} must be a whole number.`;
    return null;
  }
  if (options.min !== undefined && value < options.min) {
    errors[name] = `${label} must be at least ${options.min}.`;
    return null;
  }
  if (options.max !== undefined && value > options.max) {
    errors[name] = `${label} must be ${options.max} or fewer.`;
    return null;
  }
  return value;
}

export function readDayOfWeekValues(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
  required = false,
): number[] {
  const raw = formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string" && /^[0-6]$/.test(value))
    .map(Number);
  const supplied = formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (supplied.length === 0) {
    if (required) errors[name] = `Select at least one ${label.toLowerCase()}.`;
    return [];
  }
  if (raw.length !== supplied.length) {
    errors[name] = `${label} contains an invalid value.`;
    return [];
  }

  const unique = [...new Set(raw)].sort((left, right) => left - right);
  if (unique.length !== raw.length) {
    errors[name] = `${label} cannot contain duplicates.`;
    return [];
  }
  return unique;
}

export function readEnumValue<T extends string>(
  formData: FormData,
  name: string,
  label: string,
  errors: FieldErrors,
  values: readonly T[],
  fallback?: T,
): T | null {
  const value = readString(formData, name);
  if (!value) return fallback ?? null;
  if (!values.includes(value as T)) {
    errors[name] = `${label} is invalid.`;
    return null;
  }
  return value as T;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
