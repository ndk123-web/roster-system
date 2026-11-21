import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { getPodsWithMembers } from "@/lib/queries";
import { PodIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Operational Pods | Smart Roster Management",
};

export default async function PodsPage() {
  const pods = await getPodsWithMembers();

  return (
    <AppShell>
      <AppHeader
        title="Operational Pods & Pod Leads"
        subtitle="Team supervisory units, pod lead assignments, and department coverage tracking"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pods.map((pod) => {
            const lead = pod.lead;
            const regularMembers = pod.employees.filter((e) => e.id !== lead?.id);

            return (
              <div
                key={pod.id}
                className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden"
              >
                {/* Pod Header */}
                <div className="px-5 py-4 border-b border-neutral-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <PodIcon className="w-4 h-4 text-neutral-700" />
                      <h3 className="text-sm font-semibold text-neutral-900">{pod.name}</h3>
                    </div>
                    {pod.description && (
                      <p className="text-[11px] text-neutral-500">{pod.description}</p>
                    )}
                  </div>
                  <Badge variant={lead ? "success" : "warning"}>
                    {lead ? (
                      <>
                        <ShieldCheckIcon className="w-3 h-3" />
                        <span>Lead Assigned</span>
                      </>
                    ) : (
                      <span>No Lead</span>
                    )}
                  </Badge>
                </div>

                {/* Pod Lead */}
                {lead && (
                  <div className="px-5 py-3 bg-neutral-50/60 border-b border-neutral-100 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        {lead.name}
                        <span className="px-1 py-0.5 bg-neutral-900 text-white text-[8px] rounded font-mono">
                          POD LEAD
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">{lead.code} · {lead.email}</div>
                    </div>
                  </div>
                )}

                {/* Members */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500 font-semibold">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span>{pod.employees.length} Members</span>
                  </div>
                  <div className="space-y-1.5">
                    {regularMembers.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-neutral-900">{emp.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{emp.code}</div>
                          </div>
                        </div>
                        <Badge variant={emp.active ? "success" : "secondary"}>
                          {emp.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                    {regularMembers.length === 0 && (
                      <p className="text-[11px] text-neutral-400 italic">No additional members</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
