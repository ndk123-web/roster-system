"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EntityFormDialog,
  type EntityField,
  type EntityValues,
} from "@/components/master-data/entity-form-dialog";
import {
  createBrandRule,
  deleteBrandRule,
  updateBrandRule,
} from "@/app/brands/actions";

export interface BrandRuleRow {
  id: string;
  processId: string;
  processName: string;
  processCode: string;
  processActive: boolean;
  operatingPattern: string;
  customDaysOfWeek: number[];
  operatesOnHolidays: boolean;
  defaultMinStaffing: number;
  startDate: string | null;
  customStaffingRules: {
    id: string;
    dayOfWeek: number | null;
    specificDate: string | null;
    requiredStaffing: number;
  }[];
}

interface ProcessOption {
  id: string;
  code: string;
  name: string;
  active: boolean;
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

export const PATTERN_LABELS: Record<string, string> = {
  ALL_365: "365-Day Operations",
  DAILY_EXCEPT_HOLIDAYS: "Daily Except Holidays",
  SUNDAYS_AND_HOLIDAYS_OFF: "Sundays & Holidays Off",
  CUSTOM: "Custom Calendar",
};

function describeOverride(rule: BrandRuleRow): string {
  const override = rule.customStaffingRules[0];
  if (!override) return "";
  const when =
    override.dayOfWeek !== null
      ? WEEKDAY_NAMES[override.dayOfWeek]
      : (override.specificDate ?? "selected date");
  return ` · ${override.requiredStaffing} on ${when}`;
}

export function BrandRulesManager({
  brandId,
  brandName,
  brandStartDate,
  rules,
  processes,
}: {
  brandId: string;
  brandName: string;
  brandStartDate: string | null;
  rules: BrandRuleRow[];
  processes: ProcessOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BrandRuleRow | null>(null);
  const [deleting, setDeleting] = useState<BrandRuleRow | null>(null);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditing(null);
  }, []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  const processOptions = processes
    .filter((process) => process.active || process.id === editing?.processId)
    .map((process) => ({
      value: process.id,
      label: `${process.code} — ${process.name}${process.active ? "" : " (inactive)"}`,
    }));

  const fields: EntityField[] = [
    {
      name: "processId",
      label: "Process",
      type: "select",
      required: true,
      options: processOptions,
    },
    {
      name: "operatingPattern",
      label: "Operating Pattern",
      type: "select",
      required: true,
      options: Object.entries(PATTERN_LABELS).map(([value, label]) => ({ value, label })),
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      hint: "Coverage starts on this date.",
    },
    {
      name: "customDaysOfWeek",
      label: "Custom Operating Days",
      type: "multiSelect",
      options: WEEKDAY_NAMES.map((label, value) => ({ value: String(value), label })),
      hint: "Required only for Custom Calendar. Hold Ctrl/Cmd to select multiple days.",
    },
    {
      name: "operatesOnHolidays",
      label: "Operates on public holidays",
      type: "checkbox",
    },
    {
      name: "defaultMinStaffing",
      label: "Minimum Staffing",
      type: "number",
      required: true,
      hint: "1–50 employees per required service day.",
    },
    {
      name: "customStaffingDay",
      label: "Override Weekday",
      type: "select",
      options: WEEKDAY_NAMES.map((label, value) => ({ value: String(value), label })),
    },
    { name: "customStaffingDate", label: "Override Date", type: "date" },
    {
      name: "customStaffingRequired",
      label: "Override Staffing",
      type: "number",
      hint: "Optional one-off weekday/date staffing requirement.",
    },
  ];

  const override = editing?.customStaffingRules[0];
  const values: EntityValues = editing
    ? {
        id: editing.id,
        processId: editing.processId,
        operatingPattern: editing.operatingPattern,
        customDaysOfWeek: editing.customDaysOfWeek.map(String),
        operatesOnHolidays: editing.operatesOnHolidays,
        defaultMinStaffing: String(editing.defaultMinStaffing),
        startDate: editing.startDate ?? brandStartDate ?? "",
        customStaffingDay:
          override?.dayOfWeek !== null && override?.dayOfWeek !== undefined
            ? String(override.dayOfWeek)
            : "",
        customStaffingDate: override?.specificDate ?? "",
        customStaffingRequired:
          override?.requiredStaffing !== undefined ? String(override.requiredStaffing) : "",
      }
    : {
        processId: processOptions[0]?.value ?? "",
        operatingPattern: "ALL_365",
        customDaysOfWeek: [],
        operatesOnHolidays: false,
        defaultMinStaffing: "1",
        startDate: brandStartDate ?? "",
        customStaffingDay: "",
        customStaffingDate: "",
        customStaffingRequired: "",
      };

  return (
    <div className="space-y-2">
      {rules.length > 0 ? (
        rules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-md border border-neutral-200 bg-white px-2.5 py-2"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                {rule.processCode}
              </span>
              {!rule.processActive && (
                <Badge variant="warning">Process inactive</Badge>
              )}
              <Badge variant="outline">
                {PATTERN_LABELS[rule.operatingPattern] ?? rule.operatingPattern}
              </Badge>
              <span className="text-[10px] text-neutral-400">
                min {rule.defaultMinStaffing} staff
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              {rule.operatingPattern === "CUSTOM" && rule.customDaysOfWeek.length > 0 && (
                <span>
                  {rule.customDaysOfWeek.map((day) => WEEKDAY_NAMES[day]).join(", ")}
                </span>
              )}
              {rule.operatesOnHolidays ? "Holiday coverage required" : "Closed on holidays"}
              {rule.startDate ? ` · From ${rule.startDate}` : ""}
              {describeOverride(rule)}
            </div>
            <div className="mt-1.5 flex gap-1.5">
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(rule)}>
                Edit rule
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setDeleting(rule)}>
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-[11px] text-neutral-400 italic">No rules configured</p>
      )}
      <Button type="button" size="sm" variant="outline" onClick={() => setCreating(true)}>
        Add rule
      </Button>

      <EntityFormDialog
        key={editing?.id ?? "new"}
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? `Edit ${brandName} rule` : `New ${brandName} rule`}
        description="Rules are isolated per brand and process. Processes themselves remain reusable."
        fields={fields}
        values={values}
        hiddenFields={{ brandId }}
        action={editing ? updateBrandRule : createBrandRule}
        submitLabel={editing ? "Save Rule" : "Create Rule"}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        title="Remove Brand Process Rule"
        description={`Remove the ${deleting?.processCode ?? ""} rule from ${brandName}? Assignments and historical rosters are preserved.`}
        confirmLabel="Remove Rule"
        action={deleteBrandRule}
        id={deleting?.id ?? ""}
        extraFields={{ brandId }}
      />
    </div>
  );
}
