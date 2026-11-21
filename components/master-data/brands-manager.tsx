"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuildingIcon, CheckIcon } from "@/components/ui/icons";
import { createBrand, deactivateBrand, updateBrand } from "@/app/brands/actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/master-data/row-actions";
import {
  BrandRulesManager,
  type BrandRuleRow,
} from "@/components/master-data/brand-rules-manager";

interface BrandRow {
  id: string;
  code: string;
  name: string;
  active: boolean;
  isSingleResource: boolean;
  rules: BrandRuleRow[];
  assignedEmployeeCount: number;
}

interface ProcessOption {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

const fields: EntityField[] = [
  { name: "code", label: "Brand Code", type: "text", required: true, placeholder: "BRD-ALPHA" },
  { name: "name", label: "Brand Name", type: "text", required: true },
  { name: "active", label: "Active", type: "checkbox" },
];

export function BrandsManager({
  rows,
  processes,
}: {
  rows: BrandRow[];
  processes: ProcessOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [deleting, setDeleting] = useState<BrandRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const values: EntityValues = editing
    ? { id: editing.id, code: editing.code, name: editing.name, active: editing.active }
    : { active: true };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="text-xs text-neutral-500 font-mono tabular-nums">
          {rows.length} brand{rows.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" onClick={() => setCreating(true)}>
          New Brand
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Brand Name</th>
              <th className="px-4 py-3">Resource Type</th>
              <th className="px-4 py-3">Processes &amp; Calendars</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((brand) => (
              <tr key={brand.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-neutral-500 text-[11px] font-semibold">
                  {brand.code}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-semibold text-neutral-900">{brand.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 pl-5">
                    {brand.assignedEmployeeCount} assigned employee
                    {brand.assignedEmployeeCount !== 1 ? "s" : ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={brand.isSingleResource ? "default" : "secondary"}>
                    {brand.isSingleResource ? "Single-Resource" : "Multi-Resource"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <BrandRulesManager
                    brandId={brand.id}
                    brandName={brand.name}
                    rules={brand.rules}
                    processes={processes}
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge variant={brand.active ? "success" : "secondary"}>
                    <CheckIcon className="w-3 h-3" />
                    <span>{brand.active ? "Active" : "Inactive"}</span>
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => setEditing(brand)}
                    onDelete={() => setDeleting(brand)}
                    deleteLabel="Deactivate"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EntityFormDialog
        key={editing?.id ?? "new"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Brand" : "New Brand"}
        description="Brand code and name must be unique."
        fields={fields}
        values={values}
        action={editing ? updateBrand : createBrand}
        submitLabel={editing ? "Save Changes" : "Create Brand"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Deactivate Brand"
        description={`Deactivate ${deleting?.name ?? ""}? Existing assignments and historical rosters are preserved.`}
        confirmLabel="Deactivate"
        action={deactivateBrand}
        id={deleting?.id ?? ""}
      />
    </div>
  );
}
