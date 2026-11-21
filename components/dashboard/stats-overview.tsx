import {
  UsersIcon,
  BuildingIcon,
  ProcessIcon,
  AlertIcon,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

export function StatsOverview() {
  const stats = [
    {
      title: "Total Workforce",
      value: "32",
      metricDetail: "Active Employees",
      subtext: "Distributed across 4 operational pods",
      icon: UsersIcon,
      badge: "100% Active",
      badgeVariant: "success" as const,
    },
    {
      title: "D2C Client Brands",
      value: "15",
      metricDetail: "Configured Accounts",
      subtext: "12 single-resource (80%), 3 multi-resource (20%)",
      icon: BuildingIcon,
      badge: "80 / 20 Model",
      badgeVariant: "secondary" as const,
    },
    {
      title: "Active Processes",
      value: "4",
      metricDetail: "Core Workflows",
      subtext: "CS, ACC, NDR, Retention (configurable rules)",
      icon: ProcessIcon,
      badge: "365 & Custom",
      badgeVariant: "secondary" as const,
    },
    {
      title: "Constraint Telemetry",
      value: "3",
      metricDetail: "Unresolved Gaps",
      subtext: "2 mandatory coverage gaps, 1 schedule overlap",
      icon: AlertIcon,
      badge: "Action Required",
      badgeVariant: "error" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                {stat.title}
              </span>
              <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {stat.metricDetail}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {stat.subtext}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <Badge variant={stat.badgeVariant}>
                {stat.badge}
              </Badge>
              <span className="text-[11px] text-neutral-400">Live Status</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
