import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PodIcon, ShieldCheckIcon, AlertIcon } from "@/components/ui/icons";

interface PodHealth {
  id: string;
  name: string;
  lead: string;
  membersCount: number;
  brandsCount: number;
  singleResourceBrands: number;
  coverageRate: number;
  status: "healthy" | "attention";
  attentionReason?: string;
}

const podsData: PodHealth[] = [
  {
    id: "pod-1",
    name: "Pod North (Flagship D2C)",
    lead: "Anita Roy (Lead)",
    membersCount: 8,
    brandsCount: 4,
    singleResourceBrands: 3,
    coverageRate: 94,
    status: "attention",
    attentionReason: "1 gap on Nov 15 (GlowAura CS)",
  },
  {
    id: "pod-2",
    name: "Pod South (Retention & NDR)",
    lead: "Vikram Seth (Lead)",
    membersCount: 8,
    brandsCount: 4,
    singleResourceBrands: 4,
    coverageRate: 91,
    status: "attention",
    attentionReason: "1 comp-off clash on Nov 20",
  },
  {
    id: "pod-3",
    name: "Pod East (High-Volume Support)",
    lead: "Sneha Menon (Lead)",
    membersCount: 8,
    brandsCount: 3,
    singleResourceBrands: 2,
    coverageRate: 100,
    status: "healthy",
  },
  {
    id: "pod-4",
    name: "Pod West (Specialized Brands)",
    lead: "Amit Verma (Lead)",
    membersCount: 8,
    brandsCount: 4,
    singleResourceBrands: 3,
    coverageRate: 97,
    status: "healthy",
  },
];

export function CoverageHealth() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs flex flex-col">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <PodIcon className="w-4 h-4 text-neutral-700" />
            <span>Operational Pods &amp; Coverage Health</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            4 pods supervised by dedicated Pod Leads across 32 active personnel
          </p>
        </div>

        <Link
          href="/pods"
          className="text-xs font-medium text-neutral-700 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          Manage Pods
        </Link>
      </div>

      <div className="p-5 space-y-4">
        {podsData.map((pod) => (
          <div
            key={pod.id}
            className="p-3.5 rounded-md border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-900 truncate">
                    {pod.name}
                  </span>
                  <Badge variant={pod.status === "healthy" ? "success" : "warning"}>
                    {pod.status === "healthy" ? (
                      <>
                        <ShieldCheckIcon className="w-3 h-3" />
                        <span>Optimal</span>
                      </>
                    ) : (
                      <>
                        <AlertIcon className="w-3 h-3" />
                        <span>Attention</span>
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Supervisor: <span className="font-medium text-neutral-700">{pod.lead}</span> •{" "}
                  <span className="tabular-nums">{pod.membersCount}</span> Employees •{" "}
                  <span className="tabular-nums">{pod.brandsCount}</span> Brands ({pod.singleResourceBrands} dedicated)
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                  {pod.coverageRate}%
                </span>
                <span className="text-[10px] text-neutral-500 block">Coverage</span>
              </div>
            </div>

            {/* Health Progress Bar */}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pod.coverageRate >= 98
                    ? "bg-emerald-500"
                    : pod.coverageRate >= 92
                    ? "bg-neutral-800"
                    : "bg-amber-500"
                }`}
                style={{ width: `${pod.coverageRate}%` }}
              />
            </div>

            {pod.attentionReason && (
              <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1 font-medium">
                <span>↳ {pod.attentionReason}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto px-5 py-3 bg-neutral-50/70 border-t border-neutral-100 rounded-b-lg flex items-center justify-between text-xs text-neutral-500">
        <span>Target: 100% Client Coverage on operating days</span>
        <span className="font-mono text-neutral-700">Total Assigned Headcount: 32</span>
      </div>
    </div>
  );
}
