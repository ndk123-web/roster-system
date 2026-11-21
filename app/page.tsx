import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ShieldCheckIcon,
  UsersIcon,
  AlertIcon,
  BuildingIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/ui/icons";

export const metadata = {
  title: "Smart Roster Management System | DataStraw Assessment",
  description:
    "Intelligent workforce and roster management application solving multi-brand D2C operational scheduling.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
      >
        Skip to main content
      </a>

      {/* Navigation Header */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
              SR
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-neutral-900">
                Smart Roster
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-neutral-400 font-normal">
                / CX Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Assessment Baseline 1.0</span>
            </Badge>

            <Button
              variant="primary"
              size="sm"
              href="/dashboard"
              aria-label="Open Operations Dashboard"
            >
              <span>Launch Dashboard</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6 border-b border-neutral-100 bg-linear-to-b from-neutral-50/60 to-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-white text-xs text-neutral-700 shadow-2xs">
              <SparklesIcon className="w-3.5 h-3.5 text-neutral-700" />
              <span className="font-medium">DataStraw Tech Internship Assessment</span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500">Multi-Brand Scheduling Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-950 text-balance leading-[1.12]">
              Intelligent Roster Planning for Growing D2C Operations
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed text-pretty">
              Solve the complex scheduling problem across 30+ employees, operational pods, and client accounts. Accurately balance 365-day operating calendars, single-resource brands, and leave impact with automated conflict validation.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                href="/dashboard"
                className="w-full sm:w-auto"
                aria-label="Go to the operations dashboard"
              >
                <span>Launch Operations Dashboard</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                href="/roster"
                className="w-full sm:w-auto"
                aria-label="View monthly team roster"
              >
                <CalendarIcon className="w-4 h-4 mr-1 text-neutral-600" />
                <span>View Monthly Roster</span>
              </Button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-neutral-700" />
                Deterministic Constraint Engine
              </span>
              <span className="hidden sm:inline-block text-neutral-300">•</span>
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-neutral-700" />
                80/20 Staffing Architecture
              </span>
            </div>
          </div>
        </section>

        {/* Live Operational Metric Snapshot Preview */}
        <section className="py-14 px-6 border-b border-neutral-200/80 bg-neutral-50/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                Enterprise Operations at a Glance
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Real-time workforce health monitoring for November 2026
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span>Workforce Distribution</span>
                  <Badge variant="secondary">4 Pods</Badge>
                </div>
                <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                  32 Personnel
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Overseen by 4 pod leads managing specialized teams across CS, ACC, NDR, and Retention.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span>Brand Staffing Model</span>
                  <Badge variant="secondary">80 / 20 Ratio</Badge>
                </div>
                <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                  15 Client Brands
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  12 single-resource accounts (~80%) and 3 multi-resource accounts (~20%) with strict coverage SLA tracking.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span>Conflict Telemetry</span>
                  <Badge variant="error">3 Gaps Detected</Badge>
                </div>
                <div className="text-2xl font-bold text-red-600 tabular-nums">
                  Pre-Publish Validation
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Hard constraint validator catches approved leave clashes and double-bookings before publication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Architecture Capabilities */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Built for Real-World Operational Complexity
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Engineered according to the DataStraw Tech Assessment specifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-neutral-200 bg-white shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-800">
                <BuildingIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Client-Specific Operating Rules
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Configure 365-day operations (Sundays &amp; holidays included), daily except holidays, or standard weekday schedules independently per brand and process.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-neutral-200 bg-white shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-800">
                <AlertIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Dynamic Post-Generation Change Telemetry
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                When an employee managing all brand processes takes medical leave or comp-off, the engine flags the resulting gap and guides the manager to resolution without manual roster recreation.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-neutral-200 bg-white shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-800">
                <UsersIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Multi-View Operational Perspective
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Switch seamlessly between Company-wide, Pod-wise, Brand-wise, Process-wise, and Individual Employee roster matrices with zero layout shift.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-neutral-200 bg-white shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-800">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Mandatory Publication Gate
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Strict distinction between hard constraints and preferences. A roster with unresolved mandatory coverage gaps cannot be silently published.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 px-6 border-t border-neutral-200 bg-neutral-900 text-white">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold tracking-tight text-white">
                Ready to explore the operations dashboard?
              </h3>
              <p className="text-xs text-neutral-400">
                Test roster generation, telemetry conflict detection, and pod allocation.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              href="/dashboard"
              className="bg-white text-neutral-900 hover:bg-neutral-100 shrink-0"
              aria-label="Access operations dashboard"
            >
              <span>Access Dashboard</span>
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 px-6 bg-white text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Smart Roster System</span>
            <span>•</span>
            <span>DataStraw Tech Assessment</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-600">
            <Link
              href="/dashboard"
              className="hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/roster"
              className="hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded"
            >
              Monthly Roster
            </Link>
            <Link
              href="/issues"
              className="hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded"
            >
              Coverage Diagnostics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
