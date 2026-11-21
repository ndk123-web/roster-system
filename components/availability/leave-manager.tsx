"use client";

import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "@/components/ui/icons";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/master-data/row-actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import {
  createLeave,
  deleteLeave,
  setLeaveStatus,
  updateLeave,
} from "@/app/availability/actions";
import type { LeaveRow } from "@/lib/queries";

const LEAVE_TYPES = ["CASUAL", "SICK", "PLANNED", "COMP_OFF", "OTHER"];
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
  if (status === "APPROVED") return "error" as const;
  if (status === "PENDING") return "warning" as const;
  return "secondary" as const;
}

function statusLabel(status: string) {
  if (status === "APPROVED") return "Approved (Unavailable)";
  if (status === "PENDING") return "Pending Review";
  return "Rejected";
}

export function LeaveManager({
  rows,
  employees,
}: {
  rows: LeaveRow[];
  employees: EmployeeOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LeaveRow | null>(null);
  const [deleting, setDeleting] = useState<LeaveRow | null>(null);
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
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date", required: true },
    {
      name: "type",
      label: "Leave Type",
      type: "select",
      required: true,
      options: LEAVE_TYPES.map((type) => ({ value: type, label: type.replaceAll("_", " ") })),
    },
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
        startDate: editing.startDate,
        endDate: editing.endDate,
        type: editing.type,
        status: editing.status,
        reason: editing.reason ?? "",
      }
    : { status: "PENDING", type: "PLANNED" };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Leave Requests</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Approved leaves create hard constraints during roster generation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-500 tabular-nums">
            {rows.length} records
          </span>
          <Button size="sm" onClick={() => setCreating(true)}>
            New Leave
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-neutral-400" role="status">
          No leave records found. Add one to make the employee unavailable on specific dates.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave Period</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((leave) => (
                <tr key={leave.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{leave.employeeName}</div>
                    <div className="text-[10px] font-mono text-neutral-500">
                      {leave.employeeCode}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-neutral-700">
                      <ClockIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>
                        {format(parseISO(leave.startDate), "MMM d")}
                        {leave.startDate !== leave.endDate
                          ? ` – ${format(parseISO(leave.endDate), "MMM d, yyyy")}`
                          : `, ${format(parseISO(leave.startDate), "yyyy")}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{leave.type.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 italic max-w-xs truncate">
                    {leave.reason ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(leave.status)}>
                      {statusLabel(leave.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {leave.status !== "APPROVED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setStatusChange({
                              id: leave.id,
                              name: leave.employeeName,
                              status: "APPROVED",
                              label: "Approve Leave",
                            })
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {leave.status !== "REJECTED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setStatusChange({
                              id: leave.id,
                              name: leave.employeeName,
                              status: "REJECTED",
                              label: "Reject Leave",
                            })
                          }
                        >
                          Reject
                        </Button>
                      )}
                      <RowActions
                        onEdit={() => setEditing(leave)}
                        onDelete={() => setDeleting(leave)}
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
        key={editing?.id ?? "new-leave"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Leave" : "New Leave"}
        description="Approved leave blocks scheduling. Pending leave is shown as a forecast only."
        fields={fields}
        values={values}
        action={editing ? updateLeave : createLeave}
        submitLabel={editing ? "Save Changes" : "Create Leave"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Delete Leave"
        description={`Delete the leave record for ${deleting?.employeeName ?? ""}? Roster validation will no longer see this absence.`}
        confirmLabel="Delete"
        action={deleteLeave}
        id={deleting?.id ?? ""}
      />

      <ConfirmDialog
        open={statusChange !== null}
        onClose={closeStatus}
        title={statusChange?.label ?? "Update Leave"}
        description={`Change the status of ${statusChange?.name ?? ""}'s leave? This immediately revalidates affected roster dates.`}
        confirmLabel={statusChange?.label ?? "Update"}
        action={setLeaveStatus}
        id={statusChange?.id ?? ""}
        extraFields={{ status: statusChange?.status ?? "" }}
        tone="primary"
      />
    </div>
  );
}
