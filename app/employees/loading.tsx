import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function EmployeesLoading() {
  return (
    <ListPageLoading
      title="Employee Workforce Directory"
      subtitle="Manage personnel profiles, pod assignments, weekly off configurations, and process certifications"
      statCount={0}
      rows={10}
      columns={5}
    />
  );
}
