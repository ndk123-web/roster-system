"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { SEED_BRANDS, SEED_RULES, SEED_PROCESSES, SEED_ASSIGNMENTS, SEED_EMPLOYEES } from "@/data/seed-data";

export default function BrandsPage() {
  const [filterType, setFilterType] = useState<"ALL" | "SINGLE" | "MULTI">("ALL");

  const filteredBrands = SEED_BRANDS.filter((b) => {
    if (filterType === "SINGLE") return b.isSingleResource;
    if (filterType === "MULTI") return !b.isSingleResource;
    return true;
  });

  const getOperatingPatternLabel = (pattern: string) => {
    switch (pattern) {
      case "ALL_365":
        return { label: "365-Day Operations (Sundays & Holidays)", variant: "default" as const };
      case "DAILY_EXCEPT_HOLIDAYS":
        return { label: "Daily Except Public Holidays", variant: "secondary" as const };
      case "SUNDAYS_AND_HOLIDAYS_OFF":
        return { label: "Sundays & Holidays Off", variant: "outline" as const };
      default:
        return { label: pattern, variant: "outline" as const };
    }
  };

  return (
    <AppShell>
      <AppHeader
        title="D2C Client Brands &amp; Operating Rules"
        subtitle="Manage client brand profiles, process working calendars, and minimum staffing thresholds"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Metric / Filter Header */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filterType === "ALL"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              All 15 Brands
            </button>
            <button
              onClick={() => setFilterType("SINGLE")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterType === "SINGLE"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span>Single-Resource (80% Model)</span>
              <span className="font-mono text-[11px] bg-neutral-200 text-neutral-800 px-1 rounded">12</span>
            </button>
            <button
              onClick={() => setFilterType("MULTI")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterType === "MULTI"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span>Multi-Resource (20% Model)</span>
              <span className="font-mono text-[11px] bg-neutral-200 text-neutral-800 px-1 rounded">3</span>
            </button>
          </div>

          <span className="text-xs text-neutral-500 font-mono">
            Configured in database without code dependency
          </span>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brand) => {
            const brandRules = SEED_RULES.filter((r) => r.brandId === brand.id);
            const brandAssignments = SEED_ASSIGNMENTS.filter((a) => a.brandId === brand.id);
            const assignedEmpIds = Array.from(new Set(brandAssignments.map((a) => a.employeeId)));
            const assignedEmps = assignedEmpIds
              .map((id) => SEED_EMPLOYEES.find((e) => e.id === id)?.name)
              .filter(Boolean);

            return (
              <div
                key={brand.id}
                className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-500">
                          {brand.code}
                        </span>
                        <h3 className="text-sm font-semibold text-neutral-900" translate="no">
                          {brand.name}
                        </h3>
                      </div>
                      <span className="text-[11px] text-neutral-500 mt-0.5 block">
                        {brand.isSingleResource
                          ? "Dedicated Single-Resource Account"
                          : "Multi-Resource Shared Account"}
                      </span>
                    </div>

                    <Badge variant={brand.isSingleResource ? "secondary" : "default"}>
                      {brand.isSingleResource ? "Single-Resource" : "Multi-Resource"}
                    </Badge>
                  </div>

                  {/* Assigned Personnel */}
                  <div className="my-3 pt-3 border-t border-neutral-100">
                    <span className="text-[11px] text-neutral-500 block mb-1">
                      Assigned Personnel:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedEmps.map((name) => (
                        <span
                          key={name}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800"
                        >
                          {name}
                        </span>
                      ))}
                      {assignedEmps.length === 0 && (
                        <span className="text-xs text-neutral-400 italic">
                          Standard Pod Allocation Pool
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Configured Process Rules */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                    <span className="text-[11px] font-semibold text-neutral-700 block">
                      Operating Calendars &amp; Min Headcount:
                    </span>
                    {brandRules.map((rule) => {
                      const proc = SEED_PROCESSES.find((p) => p.id === rule.processId);
                      const pat = getOperatingPatternLabel(rule.operatingPattern);
                      return (
                        <div
                          key={rule.id}
                          className="p-2 rounded bg-neutral-50 border border-neutral-200/60 text-xs flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-neutral-900 block truncate">
                              {proc?.name || rule.processId} ({proc?.code})
                            </span>
                            <span className="text-[10px] text-neutral-500 block truncate">
                              {pat.label}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-semibold tabular-nums text-neutral-800 shrink-0">
                            Min: {rule.minStaffing}
                          </span>
                        </div>
                      );
                    })}
                    {brandRules.length === 0 && (
                      <div className="text-[11px] text-neutral-400">
                        Inherits default pod operating calendar (Daily except holidays)
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Operating Status: Active</span>
                  <span className="text-neutral-900 font-semibold cursor-pointer hover:underline">
                    Edit Rules →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
