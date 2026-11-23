import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function EmployeesLoading() {
  return (
    <ListPageLoading
      title="Employees"
      statCount={0}
      rows={10}
      columns={5}
    />
  );
}
