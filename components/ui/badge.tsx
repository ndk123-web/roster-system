import type { HTMLAttributes } from "react";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "error"
  | "warning"
  | "success"
  | "draft";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className = "",
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-neutral-900 text-white border-neutral-900",
    secondary: "bg-neutral-100 text-neutral-800 border-neutral-200",
    outline: "bg-transparent text-neutral-800 border-neutral-300",
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    draft: "bg-neutral-100 text-neutral-600 border-neutral-300 border-dashed",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
