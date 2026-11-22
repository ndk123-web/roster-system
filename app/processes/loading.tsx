import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function ProcessesLoading() {
  return (
    <ListPageLoading
      title="Operational Processes & Workflows"
      subtitle="Configure enterprise operational processes reusable across D2C brands (CS, ACC, NDR, Retention)"
      statCount={0}
      filters={false}
      rows={6}
      columns={4}
    />
  );
}
