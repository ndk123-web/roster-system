import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { SEED_HOLIDAYS } from "@/data/seed-data";

export default function HolidaysPage() {
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
              <h2 className="text-xs font-semibold text-neutral-900">
                Brand-Process Holiday Applicability Rule (PRD Section 5 FR-07)
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                A public holiday does not automatically shut down all client accounts. Brands operating under a 365-day schedule continue to mandate coverage, while brands configured with &ldquo;Daily except public holidays&rdquo; or &ldquo;Sundays &amp; holidays off&rdquo; will release personnel from work.
              </p>
            </div>
          </div>
        </div>

        {/* Holidays Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              Configured Holidays for November 2026
            </h3>
            <Button variant="outline" size="sm">
              <span>+ Add Holiday</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Calendar Date</th>
                  <th className="px-4 py-3">Holiday Name</th>
                  <th className="px-4 py-3">Applicability Scope</th>
                  <th className="px-4 py-3 text-right">Rule Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {SEED_HOLIDAYS.map((h) => (
                  <tr key={h.date} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-neutral-900 tabular-nums">
                      {h.date}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      {h.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {h.affectsAllProcesses
                        ? "All processes observing national holidays"
                        : "Custom process selection"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="secondary">
                        <span>Exempts Non-365 Brands</span>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
