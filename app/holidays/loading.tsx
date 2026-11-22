import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function HolidaysLoading() {
  return (
    <ListPageLoading
      title="Public Holidays Calendar"
      subtitle="Manage configured public holidays and brand-process operational applicability"
      statCount={0}
      filters={false}
      rows={5}
      columns={4}
    />
  );
}
