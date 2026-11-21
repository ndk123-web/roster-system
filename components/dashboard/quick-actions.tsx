import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  BuildingIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from "@/components/ui/icons";

export function QuickActions() {
  const actions = [
    {
      title: "Generate November Roster",
      description: "Run deterministic scheduling algorithm across all 32 active personnel.",
      href: "/roster",
      icon: CalendarIcon,
      actionText: "Open Generator",
      highlight: true,
    },
    {
      title: "Record Planned Leave",
      description: "Log medical, casual, or comp-off with instant conflict re-calculation.",
      href: "/availability",
      icon: ClockIcon,
      actionText: "Manage Leaves",
    },
    {
      title: "Configure Operating Rules",
      description: "Set 365-day, Sunday-off, or holiday policies for any client brand.",
      href: "/brands",
      icon: BuildingIcon,
      actionText: "Edit Rules",
    },
    {
      title: "Run Constraint Validation",
      description: "Evaluate double-bookings, understaffed shifts, and weekly-off clashes.",
      href: "/issues",
      icon: RefreshCwIcon,
      actionText: "View Diagnostics",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xs p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-900">
          Operational Quick Workflows
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Execute primary roster lifecycle actions and maintain workforce scheduling rules
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`p-3.5 rounded-md border text-left flex flex-col justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 group ${
                act.highlight
                  ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800"
                  : "bg-neutral-50/60 hover:bg-neutral-100/80 text-neutral-900 border-neutral-200/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className={`w-4 h-4 ${
                      act.highlight ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  />
                  <ArrowRightIcon
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                      act.highlight ? "text-neutral-400" : "text-neutral-400"
                    }`}
                  />
                </div>
                <div
                  className={`text-xs font-semibold ${
                    act.highlight ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {act.title}
                </div>
                <p
                  className={`text-[11px] mt-1 leading-snug line-clamp-2 ${
                    act.highlight ? "text-neutral-300" : "text-neutral-500"
                  }`}
                >
                  {act.description}
                </p>
              </div>

              <div
                className={`text-[11px] font-medium mt-3 pt-2 border-t ${
                  act.highlight
                    ? "border-neutral-800 text-neutral-200"
                    : "border-neutral-200/60 text-neutral-700"
                }`}
              >
                {act.actionText} →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
