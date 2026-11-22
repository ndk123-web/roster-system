import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function BrandsLoading() {
  return (
    <ListPageLoading
      title="D2C Client Brands"
      subtitle="Manage brand-process configurations, operating calendars, and staffing requirements"
      statCount={3}
      rows={8}
      columns={5}
    />
  );
}
