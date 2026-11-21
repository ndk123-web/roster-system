import { BuildingIcon, ShieldCheckIcon } from "@/components/ui/icons";

interface DistributionSummaryProps {
  singleResource: number;
  multiResource: number;
  totalBrands: number;
  totalEmployees: number;
}

export function DistributionSummary({
  singleResource,
  multiResource,
  totalBrands,
  totalEmployees,
}: DistributionSummaryProps) {
  const singlePct = totalBrands > 0 ? Math.round((singleResource / totalBrands) * 100) : 0;
  const multiPct = totalBrands > 0 ? Math.round((multiResource / totalBrands) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <BuildingIcon className="w-4 h-4 text-neutral-700" />
              <span>Staffing Pattern &amp; Operating Rules</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Reflects company D2C operating model and single-resource risk distribution
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
            Live DB
          </span>
        </div>

        {/* 80 / 20 Model Visualizer */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-neutral-700">
                Single-Resource Brands (80% Target)
              </span>
              <span className="font-mono text-neutral-900 font-semibold tabular-nums">
                {singleResource} of {totalBrands} Brands ({singlePct}%)
              </span>
            </div>
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${singlePct}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Managed by 1 dedicated employee handling all brand processes. Highest sensitivity to unplanned leave.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-neutral-700">
                Multi-Resource Brands (20% Target)
              </span>
              <span className="font-mono text-neutral-900 font-semibold tabular-nums">
                {multiResource} of {totalBrands} Brands ({multiPct}%)
              </span>
            </div>
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-neutral-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${multiPct}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              2–3 employees assigned to specific or overlapping processes (CS, ACC, NDR).
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <div className="text-xs font-semibold text-neutral-900 mb-2">
            Workforce Configuration
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200/60">
              <div className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                {totalBrands}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-tight mt-0.5">
                Active Brands
              </div>
            </div>
            <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200/60">
              <div className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                {totalEmployees}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-tight mt-0.5">
                Active Employees
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-neutral-600" />
          <span>Configurable per brand-process via UI without code changes</span>
        </span>
      </div>
    </div>
  );
}
