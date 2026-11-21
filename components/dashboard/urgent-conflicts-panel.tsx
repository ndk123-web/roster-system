import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertIcon, ChevronRightIcon, ArrowRightIcon } from "@/components/ui/icons";

interface ConflictItem {
  id: string;
  severity: "error" | "warning";
  brand: string;
  process: string;
  date: string;
  employeeAffected: string;
  requiredStaff: number;
  availableStaff: number;
  description: string;
  recommendation: string;
}

const mockIssues: ConflictItem[] = [
  {
    id: "gap-01",
    severity: "error",
    brand: "GlowAura D2C",
    process: "Customer Support (CS)",
    date: "Sun, Nov 15, 2026",
    employeeAffected: "Priya Sharma (Dedicated Lead)",
    requiredStaff: 1,
    availableStaff: 0,
    description: "Single-resource brand left uncovered. Operating calendar requires 365-day coverage, but Priya Sharma has approved medical leave.",
    recommendation: "Assign certified backup from Pod North (e.g. Sneha Roy).",
  },
  {
    id: "gap-02",
    severity: "error",
    brand: "UrbanPulse",
    process: "Non-Delivery Reports (NDR)",
    date: "Fri, Nov 20, 2026",
    employeeAffected: "Rajesh Kumar",
    requiredStaff: 1,
    availableStaff: 0,
    description: "Scheduled resource is on approved compensatory off. Process operates daily except public holidays.",
    recommendation: "Reassign from multi-resource buffer pool or grant coverage exception.",
  },
  {
    id: "warn-01",
    severity: "warning",
    brand: "Kavita Organics",
    process: "Abandoned Cart Conversions (ACC)",
    date: "Thu, Nov 12, 2026",
    employeeAffected: "Rohan Patel",
    requiredStaff: 1,
    availableStaff: 1,
    description: "Resource is also assigned to Brand Velora CS on the same shift. Overlapping multi-brand allocation detected.",
    recommendation: "Separate duty hours or assign alternate ACC specialist.",
  },
];

export function UrgentConflictsPanel() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-900">
              Unresolved Telemetry & Coverage Gaps
            </h2>
            <Badge variant="error" className="tabular-nums">
              2 Mandatory Errors
            </Badge>
            <Badge variant="warning" className="tabular-nums">
              1 Warning
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Mandatory errors block roster publication to prevent client account outages.
          </p>
        </div>

        <Link
          href="/issues"
          className="text-xs font-medium text-neutral-700 hover:text-neutral-950 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          <span>View All 3 Issues</span>
          <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
        </Link>
      </div>

      <div className="divide-y divide-neutral-100">
        {mockIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={issue.severity === "error" ? "error" : "warning"}>
                  <AlertIcon className="w-3 h-3 shrink-0" />
                  <span>{issue.severity === "error" ? "Critical Gap" : "Rule Warning"}</span>
                </Badge>
                <span className="text-xs font-semibold text-neutral-900" translate="no">
                  {issue.brand}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs text-neutral-600 font-medium">
                  {issue.process}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {issue.date}
                </span>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed">
                {issue.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <span className="font-medium text-neutral-700">Recommended fix:</span>
                <span className="italic">{issue.recommendation}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              <div className="text-right mr-2 hidden sm:block">
                <div className="text-[11px] text-neutral-500">Staffing Level</div>
                <div className="text-xs font-mono font-semibold tabular-nums text-red-600">
                  {issue.availableStaff} / {issue.requiredStaff} Assigned
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                href="/roster"
                aria-label={`Resolve coverage gap for ${issue.brand}`}
              >
                <span>Resolve Gap</span>
                <ArrowRightIcon className="w-3 h-3 text-neutral-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-neutral-50/70 border-t border-neutral-100 rounded-b-lg flex items-center justify-between text-xs text-neutral-500">
        <span>Rule engine re-checks constraints on every availability modification.</span>
        <span className="font-medium text-neutral-700">Hard constraint priority: Client Coverage &gt; Preference</span>
      </div>
    </div>
  );
}
