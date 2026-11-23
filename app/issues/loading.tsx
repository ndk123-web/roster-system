import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function IssuesLoading() {
  return (
    <ListPageLoading
      title="Issues"
      statCount={4}
      rows={8}
      columns={5}
    />
  );
}
