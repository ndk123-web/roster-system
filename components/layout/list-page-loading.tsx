import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

interface ListPageLoadingProps {
  title: string;
  subtitle: string;
  statCount?: number;
  sections?: number;
  rows?: number;
  columns?: number;
  filters?: boolean;
}

export function ListPageLoading({
  title,
  subtitle,
  statCount = 4,
  sections = 1,
  rows = 8,
  columns = 5,
  filters = true,
}: ListPageLoadingProps) {
  return (
    <AppShell>
      <AppHeader title={title} subtitle={subtitle} />
      <div
        className="p-6 space-y-5 max-w-7xl mx-auto"
        role="status"
        aria-label="Loading page content"
      >
        {statCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: statCount }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs space-y-2"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        )}

        {filters && (
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-wrap gap-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        )}

        {Array.from({ length: sections }).map((_, section) => (
          <div
            key={section}
            className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="divide-y divide-neutral-100">
              {Array.from({ length: rows }).map((_, row) => (
                <div key={row} className="px-4 py-3 flex items-center gap-4">
                  {Array.from({ length: columns }).map((_, column) => (
                    <Skeleton
                      key={column}
                      className={`h-3.5 ${column === 0 ? "w-40" : "w-24"}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
