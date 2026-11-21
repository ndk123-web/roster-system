import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header skeleton */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-white">
        <Skeleton className="h-6 w-56 mb-2" />
        <Skeleton className="h-3.5 w-80" />
      </div>

      <div className="p-6 space-y-6 max-w-7xl">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-24 mt-auto" />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-md" />
          ))}
        </div>

        {/* Conflicts panel */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs">
          <div className="px-5 py-4 border-b border-neutral-100">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-neutral-200 shadow-xs"
            >
              <div className="px-5 py-4 border-b border-neutral-100">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-64" />
              </div>
              <div className="p-5 space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-1.5">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
