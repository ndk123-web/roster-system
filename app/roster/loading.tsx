import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function RosterLoading() {
  return (
    <AppShell>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-white">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-3.5 w-80" />
      </div>

      <div className="p-6 space-y-4 max-w-full">
        {/* Controls bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-wrap gap-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>

        {/* Roster grid skeleton */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          {/* Header row: date columns */}
          <div className="flex border-b border-neutral-200 bg-neutral-50">
            <Skeleton className="h-10 w-52 m-1 shrink-0" />
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 m-1 shrink-0" />
            ))}
          </div>

          {/* Employee rows */}
          {Array.from({ length: 12 }).map((_, row) => (
            <div
              key={row}
              className="flex border-b border-neutral-100 items-center"
            >
              <div className="w-52 shrink-0 px-3 py-2 border-r border-neutral-100 space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              {Array.from({ length: 15 }).map((_, col) => (
                <Skeleton
                  key={col}
                  className="h-7 w-10 mx-0.5 my-1 shrink-0 rounded"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
