import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { getPublicHolidays } from "@/lib/queries";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { format, parseISO } from "date-fns";

export const metadata = {
  title: "Public Holidays | Smart Roster Management",
};

export default async function HolidaysPage() {
  const holidays = await getPublicHolidays();

  return (
    <AppShell>
      <AppHeader
        title="Public Holidays Calendar"
        subtitle="Manage configured public holidays and brand-process operational applicability"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Information Callout */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-neutral-100 text-neutral-800 shrink-0">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900 mb-1">
                Holiday Impact on Scheduling
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Public holidays affect operating calendars based on each brand-process rule. Brands
                configured as <strong>ALL_365</strong> operate even on holidays. Brands with{" "}
                <strong>DAILY_EXCEPT_HOLIDAYS</strong> or <strong>SUNDAYS_AND_HOLIDAYS_OFF</strong>{" "}
                patterns are exempt.
              </p>
            </div>
          </div>
        </div>

        {/* Holidays List */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Configured Holidays
            </h2>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              {holidays.length} holiday{holidays.length !== 1 ? "s" : ""}
            </span>
          </div>

          {holidays.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No public holidays configured.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-neutral-100 rounded-md px-3 py-2 min-w-[56px]">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">
                        {format(parseISO(holiday.date), "MMM")}
                      </div>
                      <div className="text-lg font-bold text-neutral-900 tabular-nums leading-none">
                        {format(parseISO(holiday.date), "d")}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 text-sm">{holiday.name}</div>
                      <div className="text-xs text-neutral-500 font-mono">
                        {format(parseISO(holiday.date), "EEEE, MMMM d, yyyy")}
                      </div>
                      {holiday.description && (
                        <div className="text-[11px] text-neutral-400 mt-0.5">{holiday.description}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant={holiday.affectsAllProcesses ? "default" : "outline"}>
                    {holiday.affectsAllProcesses ? "Affects All Processes" : "Selective Impact"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
