import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { getProcesses } from "@/lib/queries";
import { CheckIcon, ProcessIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Operational Processes | Smart Roster Management",
};

export const instant = false

export default async function ProcessesPage() {
  const processes = await getProcesses();

  return (
    <AppShell>
      <AppHeader
        title="Operational Processes & Workflows"
        subtitle="Configure enterprise operational processes reusable across D2C brands (CS, ACC, NDR, Retention)"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processes.map((proc) => (
            <div
              key={proc.id}
              className="bg-white rounded-lg border border-neutral-200 shadow-xs p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-neutral-100 text-neutral-700">
                    <ProcessIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{proc.name}</div>
                    <div className="text-[11px] font-mono text-neutral-500">{proc.code} Workflow</div>
                  </div>
                </div>
                <Badge variant={proc.active ? "success" : "secondary"}>
                  <CheckIcon className="w-3 h-3" />
                  <span>{proc.active ? "Active" : "Inactive"}</span>
                </Badge>
              </div>

              {proc.description && (
                <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                  {proc.description}
                </p>
              )}

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Reusable across all client brands</span>
                <span className="font-mono font-semibold text-neutral-700">{proc.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
