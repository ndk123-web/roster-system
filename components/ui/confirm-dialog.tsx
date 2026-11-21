"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { initialActionState, type ActionState } from "@/lib/mutations/action-state";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/form-controls";

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  action,
  id,
  extraFields = {},
  tone = "danger",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  extraFields?: Record<string, string>;
  tone?: "danger" | "primary";
  children?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        {Object.entries(extraFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {children}
        {state.status === "error" && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {state.message}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            label={confirmLabel}
            pendingLabel="Working..."
            variant={tone === "danger" ? "danger" : "primary"}
          />
        </div>
      </form>
    </Dialog>
  );
}
