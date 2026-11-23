import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function HolidaysLoading() {
  return (
    <ListPageLoading
      title="Holidays"
      statCount={0}
      filters={false}
      rows={5}
      columns={4}
    />
  );
}
