import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { getBrandsWithRules } from "@/lib/queries";
import { BuildingIcon, CheckIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Client Brands | Smart Roster Management",
};

export const instant = false

const PATTERN_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ALL_365: { label: "365-Day Operations", variant: "default" },
  DAILY_EXCEPT_HOLIDAYS: { label: "Daily Except Holidays", variant: "secondary" },
  SUNDAYS_AND_HOLIDAYS_OFF: { label: "Sundays & Holidays Off", variant: "outline" },
  CUSTOM: { label: "Custom Calendar", variant: "outline" },
};

export default async function BrandsPage() {
  const brands = await getBrandsWithRules();

  const singleCount = brands.filter((b) => b.isSingleResource).length;
  const multiCount = brands.filter((b) => !b.isSingleResource).length;

  return (
    <AppShell>
      <AppHeader
        title="D2C Client Brands"
        subtitle="Manage brand-process configurations, operating calendars, and staffing requirements"
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        {/* Summary */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-wrap gap-4 items-center">
          <div className="text-xs text-neutral-500">
            <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">{brands.length}</span>{" "}
            Total Brands
          </div>
          <div className="text-xs text-neutral-500">
            <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">{singleCount}</span>{" "}
            Single-Resource (~80% model)
          </div>
          <div className="text-xs text-neutral-500">
            <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">{multiCount}</span>{" "}
            Multi-Resource (~20% model)
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Brand Name</th>
                  <th className="px-4 py-3">Resource Type</th>
                  <th className="px-4 py-3">Processes & Calendars</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-neutral-500 text-[11px] font-semibold">
                      {brand.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="font-semibold text-neutral-900">{brand.name}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 pl-5">
                        {brand.assignedEmployeeCount} assigned employee{brand.assignedEmployeeCount !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={brand.isSingleResource ? "default" : "secondary"}>
                        {brand.isSingleResource ? "Single-Resource" : "Multi-Resource"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {brand.rules.length > 0 ? (
                          brand.rules.map((rule) => {
                            const p = PATTERN_LABELS[rule.operatingPattern] ?? {
                              label: rule.operatingPattern,
                              variant: "outline" as const,
                            };
                            return (
                              <div key={rule.processId} className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                                  {rule.processCode}
                                </span>
                                <Badge variant={p.variant}>{p.label}</Badge>
                                <span className="text-[10px] text-neutral-400">
                                  min {rule.defaultMinStaffing} staff
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-neutral-400 italic">No rules configured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={brand.active ? "success" : "secondary"}>
                        <CheckIcon className="w-3 h-3" />
                        <span>{brand.active ? "Active" : "Inactive"}</span>
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
