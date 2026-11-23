import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function AvailabilityLoading() {
  return (
    <ListPageLoading
      title="Availability"
      statCount={4}
      sections={2}
      rows={6}
      columns={5}
    />
  );
}
