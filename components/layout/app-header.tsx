"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, CalendarIcon } from "@/components/ui/icons";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({
  title = "Operations Dashboard",
  subtitle = "Workforce allocation, brand coverage, and conflict telemetry",
}: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-neutral-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-neutral-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-neutral-500 truncate hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Roster Month & Status */}
        <div className="flex items-center gap-2 border border-neutral-200 rounded-md px-2.5 py-1 bg-neutral-50 text-xs">
          <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
          <span className="font-medium text-neutral-800">November 2026</span>
          <Badge variant="warning" className="ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Draft (3 Issues)
          </Badge>
        </div>

        {/* Action Buttons */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:inline-flex"
          aria-label="Revalidate roster constraints"
        >
          <RefreshCwIcon className="w-3.5 h-3.5 text-neutral-600" />
          <span>Revalidate</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          href="/roster"
          aria-label="View current monthly roster"
        >
          <span>View Roster</span>
        </Button>
      </div>
    </header>
  );
}
