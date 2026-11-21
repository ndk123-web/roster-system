"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import {
  PodIcon,
  CheckIcon,
  ClockIcon,
} from "@/components/ui/icons";
import { SEED_EMPLOYEES, SEED_PODS } from "@/data/seed-data";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [selectedPod, setSelectedPod] = useState("all");

  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const filteredEmployees = useMemo(() => {
    return SEED_EMPLOYEES.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.code.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      const matchesPod = selectedPod === "all" || emp.podId === selectedPod;
      return matchesSearch && matchesPod;
    });
  }, [search, selectedPod]);

  return (
    <AppShell>
      <AppHeader
        title="Employee Workforce Directory"
        subtitle="Manage personnel profiles, pod assignments, weekly off configurations, and process certifications"
      />

      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        {/* Controls Bar */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Filter by name, code, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs w-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              aria-label="Filter employees"
            />

            <select
              value={selectedPod}
              onChange={(e) => setSelectedPod(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-800 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              aria-label="Filter by pod"
            >
              <option value="all">All 4 Pods</option>
              {SEED_PODS.map((pod) => (
                <option key={pod.id} value={pod.id}>
                  {pod.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-neutral-500 font-mono tabular-nums">
              Showing {filteredEmployees.length} of {SEED_EMPLOYEES.length} Personnel
            </span>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 font-semibold text-neutral-900">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Operational Pod</th>
                  <th className="px-4 py-3">Configured Weekly Off</th>
                  <th className="px-4 py-3">Certified Skills</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredEmployees.map((emp) => {
                  const pod = SEED_PODS.find((p) => p.id === emp.podId);
                  const isLead = pod?.leadId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-neutral-500 text-[11px] font-semibold">
                        {emp.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900 flex items-center gap-2">
                          <span>{emp.name}</span>
                          {isLead && (
                            <span className="px-1.5 py-0.2 bg-neutral-900 text-white text-[9px] rounded font-mono">
                              POD LEAD
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {emp.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <PodIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>{pod?.name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <ClockIcon className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{weekdayNames[emp.weeklyOffDay]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {emp.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 border border-neutral-200 text-neutral-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="success">
                          <CheckIcon className="w-3 h-3" />
                          <span>Active</span>
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
