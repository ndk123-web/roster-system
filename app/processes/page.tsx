import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, BuildingIcon, UsersIcon } from "@/components/ui/icons";
import { SEED_PROCESSES, SEED_RULES, SEED_EMPLOYEES } from "@/data/seed-data";

export default function ProcessesPage() {
  return (
    <AppShell>
      <AppHeader
        title="Operational Processes &amp; Workflows"
        subtitle="Configure enterprise operational processes reusable across D2C brands (CS, ACC, NDR, Retention)"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEED_PROCESSES.map((proc) => {
            const applicableRules = SEED_RULES.filter((r) => r.processId === proc.id);
            const skilledCount = SEED_EMPLOYEES.filter((e) =>
              e.skills.includes(proc.code)
            ).length;

            return (
              <div
                key={proc.id}
                className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                        {proc.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {proc.name}
                        </h3>
                        <span className="text-[11px] text-neutral-500">
                          Operational Process Type
                        </span>
                      </div>
                    </div>
                    <Badge variant="success">
                      <CheckIcon className="w-3 h-3" />
                      <span>Active</span>
                    </Badge>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed my-3">
                    {proc.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100 text-xs">
                    <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200/60 flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-neutral-500" />
                      <div>
                        <div className="font-mono font-bold text-neutral-900 tabular-nums">
                          {skilledCount} Personnel
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          Certified Pool
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200/60 flex items-center gap-2">
                      <BuildingIcon className="w-4 h-4 text-neutral-500" />
                      <div>
                        <div className="font-mono font-bold text-neutral-900 tabular-nums">
                          {applicableRules.length} Brands
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          Active Calendars
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Manager Configurable</span>
                  <span className="text-neutral-900 font-semibold cursor-pointer hover:underline">
                    Edit Definition →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
