"use client";

import { Button } from "@/components/ui/button";

export function RowActions({
  onEdit,
  onDelete,
  deleteLabel,
  disableDelete,
  deleteTitle,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel: string;
  disableDelete?: boolean;
  deleteTitle?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button type="button" size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onDelete}
        disabled={disableDelete}
        title={deleteTitle}
      >
        {deleteLabel}
      </Button>
    </div>
  );
}
