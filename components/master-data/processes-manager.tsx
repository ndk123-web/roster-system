"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, ProcessIcon } from "@/components/ui/icons";
import {
  createProcess,
  deactivateProcess,
  updateProcess,
} from "@/app/processes/actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProcessRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

const fields: EntityField[] = [
  { name: "code", label: "Process Code", type: "text", required: true, placeholder: "CS" },
  { name: "name", label: "Process Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "active", label: "Active", type: "checkbox" },
];

export function ProcessesManager({ rows }: { rows: ProcessRow[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProcessRow | null>(null);
  const [deleting, setDeleting] = useState<ProcessRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const values: EntityValues = editing
    ? {
        id: editing.id,
        code: editing.code,
        name: editing.name,
        description: editing.description ?? "",
        active: editing.active,
      }
    : { active: true };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-mono tabular-nums">
          {rows.length} process{rows.length !== 1 ? "es" : ""}
        </span>
        <Button size="sm" onClick={() => setCreating(true)}>
          New Process
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((proc) => (
          <div
            key={proc.id}
            className="bg-white rounded-lg border border-neutral-200 shadow-xs p-5"
          >
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-neutral-100 text-neutral-700">
                  <ProcessIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{proc.name}</div>
                  <div className="text-[11px] font-mono text-neutral-500">{proc.code} Workflow</div>
                </div>
              </div>
              <Badge variant={proc.active ? "success" : "secondary"}>
                <CheckIcon className="w-3 h-3" />
                <span>{proc.active ? "Active" : "Inactive"}</span>
              </Badge>
            </div>

            {proc.description && (
              <p className="text-xs text-neutral-600 leading-relaxed mb-3">{proc.description}</p>
            )}

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-500">Reusable across all client brands</span>
              <div className="flex items-center gap-1.5">
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(proc)}>
                  Edit
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setDeleting(proc)}>
                  Deactivate
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EntityFormDialog
        key={editing?.id ?? "new"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Process" : "New Process"}
        description="Process code and name must be unique. Processes are reused across brands."
        fields={fields}
        values={values}
        action={editing ? updateProcess : createProcess}
        submitLabel={editing ? "Save Changes" : "Create Process"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Deactivate Process"
        description={`Deactivate ${deleting?.name ?? ""}? Existing assignments and historical rosters are preserved.`}
        confirmLabel="Deactivate"
        action={deactivateProcess}
        id={deleting?.id ?? ""}
      />
    </div>
  );
}
