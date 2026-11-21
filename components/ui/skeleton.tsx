// Skeleton UI — base pulse animation blocks for loading states
// Usage: <Skeleton className="h-4 w-32" />

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-neutral-100", className)}
    />
  );
}
