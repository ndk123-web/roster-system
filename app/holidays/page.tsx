import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getPublicHolidays } from "@/lib/queries";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { HolidaysManager } from "@/components/master-data/holidays-manager";

export const metadata = {
  title: "Public Holidays | Smart Roster Management",
};

export const instant = false;

export default async function HolidaysPage() {
  const holidays = await getPublicHolidays();

  return (
    <AppShell>
      <AppHeader
        title="Public Holidays Calendar"
        subtitle="Manage configured public holidays and brand-process operational applicability"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
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

        <HolidaysManager rows={holidays} />
      </div>
    </AppShell>
  );
}
