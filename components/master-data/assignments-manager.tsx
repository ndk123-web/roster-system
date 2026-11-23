"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuildingIcon, CheckIcon } from "@/components/ui/icons";
import {
  createAssignment,
  deleteAssignment,
  updateAssignment,
} from "@/app/assignments/actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/master-data/row-actions";

interface Option {
  id: string;
  name: string;
  code: string;
}

interface AssignmentRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  brandId: string;
  brandName: string;
  brandCode: string;
  processId: string;
  processName: string;
  processCode: string;
  isPrimary: boolean;
  active: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export function AssignmentsManager({
  rows,
  employees,
  brands,
  processes,
}: {
  rows: AssignmentRow[];
  employees: Option[];
  brands: Option[];
  processes: Option[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AssignmentRow | null>(null);
  const [deleting, setDeleting] = useState<AssignmentRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const toOptions = (options: Option[]) =>
    options.map((option) => ({ value: option.id, label: `${option.code} — ${option.name}` }));

  const fields: EntityField[] = [
    { name: "employeeId", label: "Employee", type: "select", required: true, options: toOptions(employees) },
    { name: "brandId", label: "Brand", type: "select", required: true, options: toOptions(brands) },
    { name: "processId", label: "Process", type: "select", required: true, options: toOptions(processes) },
    {
      name: "effectiveFrom",
      label: "Effective From",
      type: "date",
      required: true,
      hint: "First eligible date. Dates before the brand start use the brand start date.",
    },
    {
      name: "effectiveTo",
      label: "Effective To",
      type: "date",
      hint: "Last eligible date. Leave blank for open-ended.",
    },
    { name: "isPrimary", label: "Primary assignment", type: "checkbox" },
    { name: "active", label: "Active", type: "checkbox" },
  ];

  const values: EntityValues = editing
    ? {
        id: editing.id,
        employeeId: editing.employeeId,
        brandId: editing.brandId,
        processId: editing.processId,
        effectiveFrom: editing.effectiveFrom,
        effectiveTo: editing.effectiveTo ?? "",
        isPrimary: editing.isPrimary,
        active: editing.active,
      }
    : { effectiveFrom: new Date().toISOString().slice(0, 10), isPrimary: false, active: true };

  const activeCount = rows.filter((row) => row.active).length;
  const primaryCount = rows.filter((row) => row.isPrimary).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-neutral-900">Active Resource Mappings</h2>
          <p className="text-xs text-neutral-500">
            Each row defines a certified employee–brand–process combination eligible for roster allocation.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>
              <span className="font-mono font-bold text-neutral-900 tabular-nums">{activeCount}</span> Active
            </span>
            <span>
              <span className="font-mono font-bold text-neutral-900 tabular-nums">{primaryCount}</span> Primary
            </span>
          </div>
          <Button size="sm" onClick={() => setCreating(true)}>
            New Assignment
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Process</th>
                <th className="px-4 py-3">Effective</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{assignment.employeeName}</div>
                    <div className="text-[10px] font-mono text-neutral-500">{assignment.employeeCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <BuildingIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <div>
                        <div className="font-medium text-neutral-800">{assignment.brandName}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{assignment.brandCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">
                      {assignment.processCode}
                    </span>
                    <span className="ml-1.5 text-neutral-600">{assignment.processName}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-neutral-500">
                    <div>{assignment.effectiveFrom}</div>
                    <div>{assignment.effectiveTo ?? "Open-ended"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={assignment.isPrimary ? "default" : "outline"}>
                      {assignment.isPrimary ? "Primary" : "Secondary"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={assignment.active ? "success" : "secondary"}>
                      <CheckIcon className="w-3 h-3" />
                      <span>{assignment.active ? "Active" : "Inactive"}</span>
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => setEditing(assignment)}
                      onDelete={() => setDeleting(assignment)}
                      deleteLabel="Delete"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EntityFormDialog
        key={editing?.id ?? "new"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Assignment" : "New Assignment"}
        description="An employee-brand-process combination can only be assigned once. Only active records are selectable."
        fields={fields}
        values={values}
        action={editing ? updateAssignment : createAssignment}
        submitLabel={editing ? "Save Changes" : "Create Assignment"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Delete Assignment"
        description={`Delete the assignment for ${deleting?.employeeName ?? ""} on ${deleting?.brandName ?? ""} / ${deleting?.processName ?? ""}? Historical roster allocations are preserved.`}
        confirmLabel="Delete"
        action={deleteAssignment}
        id={deleting?.id ?? ""}
      />
    </div>
  );
}
