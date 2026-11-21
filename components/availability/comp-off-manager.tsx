"use client";

import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/master-data/row-actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import {
  createCompOff,
  deleteCompOff,
  setCompOffStatus,
  updateCompOff,
} from "@/app/availability/actions";
import type { CompOffRow } from "@/lib/queries";

const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

interface EmployeeOption {
  id: string;
  code: string;
  name: string;
}

interface StatusChange {
  id: string;
  name: string;
  status: string;
  label: string;
}

function statusVariant(status: string) {
  if (status === "APPROVED") return "warning" as const;
  if (status === "PENDING") return "outline" as const;
  return "secondary" as const;
}

export function CompOffManager({
  rows,
  employees,
}: {
  rows: CompOffRow[];
  employees: EmployeeOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CompOffRow | null>(null);
  const [deleting, setDeleting] = useState<CompOffRow | null>(null);
  const [statusChange, setStatusChange] = useState<StatusChange | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);
  const closeStatus = useCallback(() => setStatusChange(null), []);

  const fields: EntityField[] = [
    {
      name: "employeeId",
      label: "Employee",
      type: "select",
      required: true,
      options: employees.map((employee) => ({
        value: employee.id,
        label: `${employee.code} — ${employee.name}`,
      })),
    },
    { name: "date", label: "Comp-Off Date", type: "date", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: LEAVE_STATUSES.map((status) => ({ value: status, label: status })),
    },
    { name: "reason", label: "Reason", type: "textarea" },
  ];

  const values: EntityValues = editing
    ? {
        id: editing.id,
        employeeId: editing.employeeId,
        date: editing.date,
        status: editing.status,
        reason: editing.reason ?? "",
      }
    : { status: "APPROVED" };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Compensatory Off Days</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Approved comp-offs are treated as absence days during scheduling
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-500 tabular-nums">
            {rows.length} records
          </span>
          <Button size="sm" onClick={() => setCreating(true)}>
            New Comp-Off
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-neutral-400" role="status">
          No comp-off records found. Add one to block scheduling on a specific date.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((compOff) => (
                <tr key={compOff.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{compOff.employeeName}</div>
                    <div className="text-[10px] font-mono text-neutral-500">
                      {compOff.employeeCode}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-700">
                    {format(parseISO(compOff.date), "EEEE, MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 italic">{compOff.reason ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(compOff.status)}>{compOff.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {compOff.status !== "APPROVED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setStatusChange({
                              id: compOff.id,
                              name: compOff.employeeName,
                              status: "APPROVED",
                              label: "Approve Comp-Off",
                            })
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {compOff.status !== "REJECTED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setStatusChange({
                              id: compOff.id,
                              name: compOff.employeeName,
                              status: "REJECTED",
                              label: "Reject Comp-Off",
                            })
                          }
                        >
                          Reject
                        </Button>
                      )}
                      <RowActions
                        onEdit={() => setEditing(compOff)}
                        onDelete={() => setDeleting(compOff)}
                        deleteLabel="Delete"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EntityFormDialog
        key={editing?.id ?? "new-comp-off"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Comp-Off" : "New Comp-Off"}
        description="Approved comp-offs make an employee unavailable for the selected date."
        fields={fields}
        values={values}
        action={editing ? updateCompOff : createCompOff}
        submitLabel={editing ? "Save Changes" : "Create Comp-Off"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Delete Comp-Off"
        description={`Delete the comp-off for ${deleting?.employeeName ?? ""} on ${deleting?.date ?? ""}?`}
        confirmLabel="Delete"
        action={deleteCompOff}
        id={deleting?.id ?? ""}
      />

      <ConfirmDialog
        open={statusChange !== null}
        onClose={closeStatus}
        title={statusChange?.label ?? "Update Comp-Off"}
        description={`Change the status of ${statusChange?.name ?? ""}'s comp-off? This immediately revalidates affected roster dates.`}
        confirmLabel={statusChange?.label ?? "Update"}
        action={setCompOffStatus}
        id={statusChange?.id ?? ""}
        extraFields={{ status: statusChange?.status ?? "" }}
        tone="primary"
      />
    </div>
  );
}
