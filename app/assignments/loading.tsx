import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function AssignmentsLoading() {
  return (
    <ListPageLoading
      title="Resource Assignments & Allocations"
      subtitle="Manage employee eligibility across client brands and operational processes"
      statCount={0}
      rows={10}
      columns={6}
    />
  );
}
