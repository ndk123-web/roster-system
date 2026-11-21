"use client";

import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createHoliday, deleteHoliday, updateHoliday } from "@/app/holidays/actions";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface HolidayRow {
  id: string;
  date: string;
  name: string;
  description: string | null;
  affectsAllProcesses: boolean;
}

const fields: EntityField[] = [
  { name: "date", label: "Holiday Date", type: "date", required: true },
  { name: "name", label: "Holiday Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "affectsAllProcesses", label: "Affects all processes", type: "checkbox" },
];

export function HolidaysManager({ rows }: { rows: HolidayRow[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<HolidayRow | null>(null);
  const [deleting, setDeleting] = useState<HolidayRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const values: EntityValues = editing
    ? {
        id: editing.id,
        date: editing.date,
        name: editing.name,
        description: editing.description ?? "",
        affectsAllProcesses: editing.affectsAllProcesses,
      }
    : { affectsAllProcesses: true };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-neutral-900">Configured Holidays</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-500 tabular-nums">
            {rows.length} holiday{rows.length !== 1 ? "s" : ""}
          </span>
          <Button size="sm" onClick={() => setCreating(true)}>
            New Holiday
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-neutral-400">
          No public holidays configured.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {rows.map((holiday) => (
            <div
              key={holiday.id}
              className="px-5 py-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center bg-neutral-100 rounded-md px-3 py-2 min-w-[56px]">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">
                    {format(parseISO(holiday.date), "MMM")}
                  </div>
                  <div className="text-lg font-bold text-neutral-900 tabular-nums leading-none">
                    {format(parseISO(holiday.date), "d")}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 text-sm">{holiday.name}</div>
                  <div className="text-xs text-neutral-500 font-mono">
                    {format(parseISO(holiday.date), "EEEE, MMMM d, yyyy")}
                  </div>
                  {holiday.description && (
                    <div className="text-[11px] text-neutral-400 mt-0.5">{holiday.description}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={holiday.affectsAllProcesses ? "default" : "outline"}>
                  {holiday.affectsAllProcesses ? "Affects All Processes" : "Selective Impact"}
                </Badge>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(holiday)}>
                  Edit
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setDeleting(holiday)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EntityFormDialog
        key={editing?.id ?? "new"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Edit Holiday" : "New Holiday"}
        description="Holiday dates must be unique. Brand-process rules decide whether a process operates."
        fields={fields}
        values={values}
        action={editing ? updateHoliday : createHoliday}
        submitLabel={editing ? "Save Changes" : "Create Holiday"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Delete Holiday"
        description={`Delete ${deleting?.name ?? ""}? Brand-process holiday rules will no longer see this date.`}
        confirmLabel="Delete"
        action={deleteHoliday}
        id={deleting?.id ?? ""}
      />
    </div>
  );
}
