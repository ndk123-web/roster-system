"use client";

import { useFormStatus } from "react-dom";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

const controlStyles =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 shadow-xs outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/15 disabled:opacity-50";

const invalidStyles = "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/15";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Input({ className = "", invalid, ...props }: InputProps) {
  return (
    <input
      className={`${controlStyles} ${invalid ? invalidStyles : ""} ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", invalid, ...props }: SelectProps) {
  return (
    <select
      className={`${controlStyles} ${invalid ? invalidStyles : ""} ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={`${controlStyles} min-h-20 resize-y ${invalid ? invalidStyles : ""} ${className}`}
      {...props}
    />
  );
}

export function Checkbox({
  className = "",
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-neutral-300 text-neutral-900 accent-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${invalid ? "border-red-400" : ""} ${className}`}
      {...props}
    />
  );
}

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
}: {
  label: string;
  pendingLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
