"use client";

import { useActionState, useEffect, useId } from "react";
import { initialActionState, type ActionState } from "@/lib/mutations/action-state";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import {
  Checkbox,
  Input,
  Select,
  SubmitButton,
  Textarea,
} from "@/components/ui/form-controls";

export type EntityFieldType =
  | "text"
  | "email"
  | "date"
  | "textarea"
  | "select"
  | "checkbox"
  | "multiSelect";

export interface EntityField {
  name: string;
  label: string;
  type: EntityFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
}

export type EntityValues = Record<string, string | boolean | string[]>;

export function EntityFormDialog({
  open,
  onClose,
  title,
  description,
  fields,
  values,
  action,
  submitLabel = "Save",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: EntityField[];
  values: EntityValues;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formId = useId();

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  const renderField = (field: EntityField) => {
    const id = `${formId}-${field.name}`;
    const error = state.fieldErrors[field.name];
    const value = values[field.name];
    const common = {
      id,
      name: field.name,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
    };

    if (field.type === "checkbox") {
      return (
        <div key={field.name} className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center gap-2">
            <Checkbox {...common} defaultChecked={value === true} />
            <label htmlFor={id} className="text-xs font-semibold text-neutral-700">
              {field.label}
            </label>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="text-[11px] text-red-600">
              {error}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "select" || field.type === "multiSelect") {
      const selected = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
      return (
        <FormField
          key={field.name}
          label={field.label}
          htmlFor={id}
          error={error}
          hint={field.hint}
          className={field.type === "multiSelect" ? "sm:col-span-2" : ""}
        >
          <Select
            {...common}
            multiple={field.type === "multiSelect"}
            size={field.type === "multiSelect" ? 5 : undefined}
            defaultValue={field.type === "multiSelect" ? selected : selected[0] ?? ""}
            required={field.required && field.type !== "multiSelect"}
          >
            {field.type === "select" && !field.required && (
              <option value="">— None —</option>
            )}
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      );
    }

    if (field.type === "textarea") {
      return (
        <FormField
          key={field.name}
          label={field.label}
          htmlFor={id}
          error={error}
          className="sm:col-span-2"
        >
          <Textarea
            {...common}
            defaultValue={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            required={field.required}
          />
        </FormField>
      );
    }

    return (
      <FormField key={field.name} label={field.label} htmlFor={id} error={error}>
        <Input
          {...common}
          type={field.type}
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          required={field.required}
        />
      </FormField>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <form action={formAction} className="space-y-4">
        {typeof values.id === "string" && values.id ? (
          <input type="hidden" name="id" value={values.id} />
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map(renderField)}</div>
        {state.status === "error" && !state.message.startsWith("Fix") && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {state.message}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton label={submitLabel} pendingLabel="Saving..." />
        </div>
      </form>
    </Dialog>
  );
}
