import { ListPageLoading } from "@/components/layout/list-page-loading";

export default function BrandsLoading() {
  return (
    <ListPageLoading
      title="Brands"
      statCount={3}
      rows={8}
      columns={5}
    />
  );
}
