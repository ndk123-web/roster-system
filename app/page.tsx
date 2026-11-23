import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Smart Roster | Operations",
  description: "Plan and publish monthly rosters across brands, processes, and employees.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 font-mono text-sm font-bold text-white">
              SR
            </div>
            <span className="text-sm font-semibold tracking-tight">Smart Roster</span>
          </div>
          <Button variant="primary" size="sm" href="/dashboard">
            Dashboard
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
            Smart Roster
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-600">
            Plan and publish monthly rosters across brands, processes, and employees.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" href="/dashboard" className="w-full sm:w-auto">
              Open Dashboard
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" href="/roster" className="w-full sm:w-auto">
              <CalendarIcon className="mr-1 h-4 w-4" />
              View Roster
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 px-6 py-6 text-xs text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span>Smart Roster</span>
          <nav className="flex items-center gap-4" aria-label="Footer">
            <Link href="/dashboard" className="rounded hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900">
              Dashboard
            </Link>
            <Link href="/roster" className="rounded hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900">
              Roster
            </Link>
            <Link href="/issues" className="rounded hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900">
              Issues
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
