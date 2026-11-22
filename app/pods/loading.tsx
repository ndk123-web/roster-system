import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function PodsLoading() {
  return (
    <ListPageLoading
      title="Operational Pods & Pod Leads"
      subtitle="Team supervisory units, pod lead assignments, and department coverage tracking"
      statCount={0}
      filters={false}
      rows={6}
      columns={4}
    />
  );
}
