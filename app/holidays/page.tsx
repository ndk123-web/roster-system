import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getPublicHolidays } from "@/lib/queries";
import { HolidaysManager } from "@/components/master-data/holidays-manager";

export const metadata = {
  title: "Public Holidays | Smart Roster Management",
};

export default async function HolidaysPage() {
  const holidays = await getPublicHolidays();

  return (
    <AppShell>
      <AppHeader title="Holidays" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <HolidaysManager rows={holidays} />
      </div>
    </AppShell>
  );
}
