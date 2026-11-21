"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PodIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";
import { createPod, deletePod, updatePod } from "@/app/pods/actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PodEmployee {
  id: string;
  name: string;
  code: string;
  email: string;
  active: boolean;
}

interface PodRow {
  id: string;
  name: string;
  description: string | null;
  leadId: string | null;
  lead: PodEmployee | null;
  employees: PodEmployee[];
}

interface EmployeeOption {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export function PodsManager({
  rows,
  employees,
}: {
  rows: PodRow[];
  employees: EmployeeOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PodRow | null>(null);
  const [deleting, setDeleting] = useState<PodRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const leadPodByEmployee = new Map(
    rows.filter((pod) => pod.leadId).map((pod) => [pod.leadId as string, pod.id]),
  );
  const leadOptions = employees
    .filter(
      (employee) =>
        employee.active &&
        (!leadPodByEmployee.has(employee.id) || leadPodByEmployee.get(employee.id) === editing?.id),
    )
    .map((employee) => ({
      value: employee.id,
      label: `${employee.name} (${employee.code})`,
    }));
  const memberOptions = employees
    .filter((employee) => employee.active)
    .map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.code})` }));

  const fields: EntityField[] = [
    { name: "name", label: "Pod Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "leadId", label: "Pod Lead", type: "select", options: leadOptions },
    {
      name: "memberIds",
      label: "Members",
      type: "multiSelect",
      options: memberOptions,
      hint: "Hold Ctrl/Cmd to select multiple employees.",
    },
  ];

  const values: EntityValues = editing
    ? {
        id: editing.id,
        name: editing.name,
        description: editing.description ?? "",
        leadId: editing.leadId ?? "",
        memberIds: editing.employees.map((employee) => employee.id),
      }
    : { leadId: "", memberIds: [] };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-mono tabular-nums">
          {rows.length} pod{rows.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" onClick={() => setCreating(true)}>
          New Pod
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rows.map((pod) => {
          const regularMembers = pod.employees.filter((employee) => employee.id !== pod.leadId);
          return (
            <div
              key={pod.id}
              className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-neutral-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <PodIcon className="w-4 h-4 text-neutral-700" />
                    <h3 className="text-sm font-semibold text-neutral-900">{pod.name}</h3>
                  </div>
                  {pod.description && (
                    <p className="text-[11px] text-neutral-500">{pod.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={pod.lead ? "success" : "warning"}>
                    {pod.lead ? (
                      <>
                        <ShieldCheckIcon className="w-3 h-3" />
                        <span>Lead Assigned</span>
                      </>
                    ) : (
                      <span>No Lead</span>
                    )}
                  </Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(pod)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setDeleting(pod)}>
                    Delete
                  </Button>
                </div>
              </div>

              {pod.lead && (
                <div className="px-5 py-3 bg-neutral-50/60 border-b border-neutral-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {pod.lead.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                      {pod.lead.name}
                      <span className="px-1 py-0.5 bg-neutral-900 text-white text-[8px] rounded font-mono">
                        POD LEAD
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {pod.lead.code} · {pod.lead.email}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500 font-semibold">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>{pod.employees.length} Members</span>
                </div>
                <div className="space-y-1.5">
                  {regularMembers.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-neutral-900">{employee.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{employee.code}</div>
                        </div>
                      </div>
                      <Badge variant={employee.active ? "success" : "secondary"}>
                        {employee.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                  {regularMembers.length === 0 && (
                    <p className="text-[11px] text-neutral-400 italic">No additional members</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EntityFormDialog
        key={editing?.id ?? "new"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Pod" : "New Pod"}
        description="Pod name and pod lead must be unique. Removed members become unassigned."
        fields={fields}
        values={values}
        action={editing ? updatePod : createPod}
        submitLabel={editing ? "Save Changes" : "Create Pod"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Delete Pod"
        description={
          deleting
            ? `Delete ${deleting.name}? ${deleting.employees.length} employee(s) will become unassigned.`
            : undefined
        }
        confirmLabel="Delete Pod"
        action={deletePod}
        id={deleting?.id ?? ""}
      >
        {deleting && deleting.employees.length > 0 && (
          <div className="rounded-md bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600">
            <span className="font-semibold">Freed employees:</span>{" "}
            {deleting.employees.map((employee) => employee.name).join(", ")}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
