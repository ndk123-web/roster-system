"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIssueCount } from "@/components/layout/issue-count-provider";
import {
  DashboardIcon,
  UsersIcon,
  BuildingIcon,
  ProcessIcon,
  PodIcon,
  AssignmentIcon,
  ClockIcon,
  CalendarIcon,
  AlertIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";

interface NavItem {
  name: string;
  href: string;
  icon: typeof DashboardIcon;
}

const primaryNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Monthly Roster", href: "/roster", icon: CalendarIcon },
  { name: "Coverage Issues", href: "/issues", icon: AlertIcon },
];

const managementNav: NavItem[] = [
  { name: "Employees", href: "/employees", icon: UsersIcon },
  { name: "Brands", href: "/brands", icon: BuildingIcon },
  { name: "Processes", href: "/processes", icon: ProcessIcon },
  { name: "Pods & Leads", href: "/pods", icon: PodIcon },
  { name: "Assignments", href: "/assignments", icon: AssignmentIcon },
];

const scheduleRulesNav: NavItem[] = [
  { name: "Availability & Leaves", href: "/availability", icon: ClockIcon },
  { name: "Public Holidays", href: "/holidays", icon: ShieldCheckIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { count: issueCount } = useIssueCount();

  return (
    <aside
      className="w-64 border-r border-neutral-200 bg-neutral-50/75 flex flex-col shrink-0 h-screen sticky top-0"
      aria-label="Operations Navigation"
    >
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-neutral-200 flex items-center justify-between bg-white">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-neutral-900 font-semibold tracking-tight text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          <div className="w-6 h-6 rounded bg-neutral-900 text-white flex items-center justify-center text-xs font-bold font-mono">
            SR
          </div>
          <span className="truncate">Smart Roster</span>
        </Link>
        <span
          className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-semibold tracking-wider bg-neutral-200/80 text-neutral-700 rounded"
          translate="no"
        >
          OPS
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Overview
          </div>
          <nav className="space-y-0.5" aria-label="Overview Links">
            {primaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const badge = item.href === "/issues" ? issueCount : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-white" : "text-neutral-500"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {badge !== null && badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-semibold rounded tabular-nums ${
                        isActive ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Master Data
          </div>
          <nav className="space-y-0.5" aria-label="Master Data Links">
            {managementNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-white" : "text-neutral-500"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Scheduling Rules
          </div>
          <nav className="space-y-0.5" aria-label="Scheduling Rules Links">
            {scheduleRulesNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-white" : "text-neutral-500"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User / Pod Lead Footer */}
      <div className="p-3 border-t border-neutral-200 bg-white">
        <div className="p-2.5 rounded-md bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-neutral-900 truncate">
              Operations Lead
            </div>
            <div className="text-[11px] text-neutral-500 truncate">
              Lead Admin Access
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
}
