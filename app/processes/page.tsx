import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { getProcesses } from "@/lib/queries";
import { ProcessesManager } from "@/components/master-data/processes-manager";

export const metadata = {
  title: "Operational Processes | Smart Roster Management",
};

export default async function ProcessesPage() {
  const processes = await getProcesses();

  return (
    <AppShell>
      <AppHeader
        title="Processes"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <ProcessesManager rows={processes} />
      </div>
    </AppShell>
  );
}
