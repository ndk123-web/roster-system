import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function AssignmentsLoading() {
  return (
    <ListPageLoading
      title="Assignments"
      statCount={0}
      rows={10}
      columns={6}
    />
  );
}
