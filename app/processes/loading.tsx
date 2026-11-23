import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function ProcessesLoading() {
  return (
    <ListPageLoading
      title="Processes"
      statCount={0}
      filters={false}
      rows={6}
      columns={4}
    />
  );
}
