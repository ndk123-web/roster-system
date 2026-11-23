import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function PodsLoading() {
  return (
    <ListPageLoading
      title="Pods"
      statCount={0}
      filters={false}
      rows={6}
      columns={4}
    />
  );
}
