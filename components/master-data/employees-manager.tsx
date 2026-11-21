"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClockIcon, PodIcon } from "@/components/ui/icons";
import {
  createEmployee,
  deactivateEmployee,
  updateEmployee,
} from "@/app/employees/actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/master-data/row-actions";

interface EmployeeRow {
  id: string;
  code: string;
  name: string;
  email: string;
  active: boolean;
  podId: string | null;
  podName: string | null;
  isLead: boolean;
  leadsPodName: string | null;
  weeklyOffDays: number[];
  weeklyOffFrom: string | null;
  weeklyOffTo: string | null;
}

interface PodOption {
  id: string;
  name: string;
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function EmployeesManager({
  rows,
  pods,
}: {
  rows: EmployeeRow[];
  pods: PodOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [deleting, setDeleting] = useState<EmployeeRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const fields: EntityField[] = [
    { name: "code", label: "Employee Code", type: "text", required: true, placeholder: "EMP033" },
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "podId",
      label: "Operational Pod",
      type: "select",
      options: [
        { value: "", label: "Unassigned" },
        ...pods.map((pod) => ({ value: pod.id, label: pod.name })),
      ],
      hint: editing?.leadsPodName
        ? `Lead of ${editing.leadsPodName}; reassign as lead before moving pods.`
        : undefined,
    },
    {
      name: "weeklyOffDays",
      label: "Weekly Off Days",
      type: "multiSelect",
      options: WEEKDAY_NAMES.map((label, value) => ({ value: String(value), label })),
      hint: "Hold Ctrl/Cmd to select multiple recurring off days.",
    },
    { name: "weeklyOffFrom", label: "Weekly Off From", type: "date" },
    { name: "weeklyOffTo", label: "Weekly Off To", type: "date" },
    { name: "active", label: "Active", type: "checkbox" },
  ];

  const values: EntityValues = editing
    ? {
        id: editing.id,
        code: editing.code,
        name: editing.name,
        email: editing.email,
        podId: editing.podId ?? "",
        weeklyOffDays: editing.weeklyOffDays.map(String),
        weeklyOffFrom: editing.weeklyOffFrom ?? "",
        weeklyOffTo: editing.weeklyOffTo ?? "",
        active: editing.active,
      }
    : { active: true, podId: "", weeklyOffDays: [], weeklyOffFrom: "", weeklyOffTo: "" };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="text-xs text-neutral-500 font-mono tabular-nums">
          {rows.length} employee{rows.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" onClick={() => setCreating(true)}>
          New Employee
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Operational Pod</th>
              <th className="px-4 py-3">Weekly Off</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((emp) => (
              <tr key={emp.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-neutral-500 text-[11px] font-semibold">
                  {emp.code}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900 flex items-center gap-2">
                    <span>{emp.name}</span>
                    {emp.isLead && (
                      <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] rounded font-mono">
                        POD LEAD
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">{emp.email}</div>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <PodIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{emp.podName ?? "Unassigned"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ClockIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {emp.weeklyOffDays.map((day) => WEEKDAY_NAMES[day]).join(", ") || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={emp.active ? "success" : "secondary"}>
                    <CheckIcon className="w-3 h-3" />
                    <span>{emp.active ? "Active" : "Inactive"}</span>
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => setEditing(emp)}
                    onDelete={() => setDeleting(emp)}
                    deleteLabel="Deactivate"
                    disableDelete={emp.isLead}
                    deleteTitle={emp.isLead ? "Reassign this pod lead first" : undefined}
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
        title={editing ? "Edit Employee" : "New Employee"}
        description="Employee code and email must be unique across the organisation."
        fields={fields}
        values={values}
        action={editing ? updateEmployee : createEmployee}
        submitLabel={editing ? "Save Changes" : "Create Employee"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Deactivate Employee"
        description={`Deactivate ${deleting?.name ?? ""}? Historical roster entries are preserved.`}
        confirmLabel="Deactivate"
        action={deactivateEmployee}
        id={deleting?.id ?? ""}
      />
    </div>
  );
}
