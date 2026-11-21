import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getBrandsWithRules, getProcesses } from "@/lib/queries";
import { BrandsManager } from "@/components/master-data/brands-manager";

export const metadata = {
  title: "Client Brands | Smart Roster Management",
};

export const instant = false;

export default async function BrandsPage() {
  const [brands, processes] = await Promise.all([getBrandsWithRules(), getProcesses()]);

  const singleCount = brands.filter((brand) => brand.isSingleResource).length;
  const multiCount = brands.filter((brand) => !brand.isSingleResource).length;

  return (
    <AppShell>
      <AppHeader
        title="D2C Client Brands"
        subtitle="Manage brand-process configurations, operating calendars, and staffing requirements"
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
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

        <BrandsManager rows={brands} processes={processes} />
      </div>
    </AppShell>
  );
}
