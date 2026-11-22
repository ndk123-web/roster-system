import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function IssuesLoading() {
  return (
    <ListPageLoading
      title="Coverage Diagnostics & Constraint Telemetry"
      subtitle="Persisted validation results, mandatory publication gates, and change-driven revalidation"
      statCount={4}
      rows={8}
      columns={5}
    />
  );
}
