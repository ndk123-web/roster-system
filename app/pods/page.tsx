import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { PodIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { SEED_PODS, SEED_EMPLOYEES } from "@/data/seed-data";

export default function PodsPage() {
  return (
    <AppShell>
      <AppHeader
        title="Operational Pods &amp; Pod Leads"
        subtitle="Team supervisory units, pod lead assignments, and department coverage tracking"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SEED_PODS.map((pod) => {
            const members = SEED_EMPLOYEES.filter((e) => e.podId === pod.id);
            const lead = SEED_EMPLOYEES.find((e) => e.id === pod.leadId);

            return (
              <div
                key={pod.id}
                className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-neutral-900 text-white">
                        <PodIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {pod.name}
                        </h3>
                        <span className="text-[11px] text-neutral-500">
                          Supervised by{" "}
                          <span className="font-semibold text-neutral-800">
                            {lead?.name || "Unassigned"}
                          </span>{" "}
                          (Pod Lead)
                        </span>
                      </div>
                    </div>

                    <Badge variant="success">
                      <ShieldCheckIcon className="w-3 h-3" />
                      <span>Active Pod</span>
                    </Badge>
                  </div>

                  <p className="text-xs text-neutral-600 my-3 leading-relaxed">
                    {pod.description}
                  </p>

                  {/* Team Members List */}
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="text-[11px] font-semibold text-neutral-700 mb-1.5 flex items-center justify-between">
                      <span>Assigned Personnel ({members.length})</span>
                      <span className="text-neutral-400 font-normal">8 Members per Pod</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {members.map((m) => {
                        const isLead = m.id === pod.leadId;
                        return (
                          <span
                            key={m.id}
                            className={`px-2 py-0.5 rounded text-xs ${
                              isLead
                                ? "bg-neutral-900 text-white font-medium"
                                : "bg-neutral-100 text-neutral-800 font-normal"
                            }`}
                          >
                            {m.name} {isLead && "(Lead)"}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Coverage Rate: 95%+</span>
                  <span className="text-neutral-900 font-semibold cursor-pointer hover:underline">
                    View Pod Roster →
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
