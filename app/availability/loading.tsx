import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function AvailabilityLoading() {
  return (
    <ListPageLoading
      title="Availability & Leave Management"
      subtitle="Track approved leaves, comp-offs, and pending requests that affect roster coverage"
      statCount={4}
      sections={2}
      rows={6}
      columns={5}
    />
  );
}
