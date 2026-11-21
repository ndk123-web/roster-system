import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-neutral-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-[11px] text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}
