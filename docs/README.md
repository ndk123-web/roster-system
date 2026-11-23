# Smart Roster Documentation

This is the project README for Smart Roster. Run all commands from the repository root unless stated otherwise.

Smart Roster is a Next.js operations tool for building, validating, reviewing, and publishing a monthly staffing roster. It models employees, pods, brands, processes, brand-process operating rules, assignments, weekly offs, holidays, leave, and comp-offs in PostgreSQL through Prisma.

Read [How Smart Roster works](SYSTEM.md) for the detailed implementation reference, lifecycle, edge-case catalog, and source index.

## Implementation summary

The MVP was completed in stages:

1. Master-data verification
   - Fixed assignment and holiday CRUD verification gaps.
   - Expanded revalidation paths for employees, pods, brands, processes, assignments, holidays, roster, issues, dashboard, and availability.
   - Smoke-tested assignment and holiday create, edit, and delete flows in the browser.

2. Availability management
   - Converted the availability page to database-backed server rendering.
   - Added leave and comp-off CRUD with approval/reject status transitions.
   - Validated date ranges, active employees, overlaps, duplicate comp-offs, and required fields.
   - Standardized leave and comp-off status badges to `Approved`, `Pending`, and `Rejected` with green, amber, and neutral colours.
   - Smoke-tested leave and comp-off create, edit, status change, approve, reject, and delete flows.

3. Roster generation core
   - Replaced seed-data generation with a pure `modules/roster/engine.ts` that accepts database-loaded input.
   - Persisted rosters, entries, allocations, validation issues, and audit logs through `modules/roster/db-service.ts`.
   - Added database-backed roster and issues pages with server actions.
   - Verified generation, persisted roster views, issue persistence, and revalidation in the browser.

4. Roster UI and lifecycle
   - Added company, pod, brand, process, and employee roster views.
   - Added month/year selection, search, filters, daily coverage summaries, and shift detail inspection.
   - Added manual draft entry edits for status changes, allocation assignment, and allocation removal.
   - Added draft validation after manual edits that preserves the edited schedule.
   - Added issue severity filters, revalidate actions, and publication gating.
   - Connected post-change revalidation to master-data and availability actions.
   - Smoke-tested manual status edits, allocation removal, and leave-triggered revalidation.

5. Delivery readiness
   - Added `.env.example`.
   - Added `npm run db:seed`.
   - Wired `/api/seed` into the seed command with a required `x-seed-token` request header.
   - Replaced the boilerplate README with project documentation.
   - Ran lint, typecheck, production build, browser smoke tests, and a final database reset.

6. Validation hardening
   - Added hard write-time checks for single allocation per employee/date, operating brand-process days, eligible assignments, active employees, and valid working status.
   - Added validation issues for non-operating allocations, working entries without allocations, and allocations on non-working days.
   - Extended revalidation to published rosters without changing published schedules or status.
   - Surfaced revalidation failures in master-data and availability action messages.
   - Applied the public-holiday scope flag to employee public-holiday labelling while keeping brand-process holiday coverage authoritative.

7. Clean reset dataset
   - Replaced the conflict-heavy demo seed with 30 employees, 3 pods, 5 brands, 3 processes, 15 brand-process rules, and 30 assignments.
   - Pre-generated the current-month roster with 900 entries, 450 allocations, and zero validation issues.
   - Retained two public holidays with every brand-process rule operating on holidays; no leave or comp-off records are seeded.
   - Made the sidebar coverage badge and roster header status read the current-month issue count, hiding zero-value badges.

8. Navigation loading states
   - Added route-level skeletons for master data, availability, holidays, issues, roster, and dashboard pages.
   - Kept the sidebar mounted during route transitions with a shared loading shell.
   - Consolidated the coverage-count fetch into one provider shared by the sidebar and header.
   - Removed blocking instant-navigation opt-outs so dynamic routes can prefetch their shell and show skeletons immediately.

9. Availability-driven roster sync and live telemetry
   - Approved leave and comp-off records recompute affected draft roster dates from the engine, so statuses show `LEAVE` or `COMP_OFF` and allocations reflect the next eligible resource.
   - Rejected or deleted availability records restore the baseline for affected draft dates.
   - Published rosters remain frozen and are only revalidated so new conflict issues become visible.
   - Replaced the dashboard's mock conflict list with persisted current-month issues.
   - Added `Effective From` and `Effective To` form hints and clarified that a pod lead does not block roster allocation.

## Features

- Master-data management for employees, pods, brands, processes, assignments, weekly offs, and public holidays.
- Availability management for leave and comp-off records with approval states.
- Deterministic monthly roster generation from active configuration.
- Coverage validation with blocking errors and soft warnings.
- Draft persistence with manual roster entry edits.
- Five roster views: company, pod, brand, process, and employee.
- Coverage issues page with severity filters and manager actions.
- Sidebar coverage badge and roster header status driven by the current-month persisted issue count.
- Route-level skeleton loading states with a persistent sidebar and shared coverage-count fetch.
- Publication gate that blocks rosters with mandatory errors.
- Revalidation after master-data changes while preserving manual edits.
- Availability changes recompute affected draft dates and restore the baseline on reject/delete; published schedules stay frozen.
- Dashboard conflict telemetry driven by persisted current-month issues.
- Protected health and seed API.
- Seed data with realistic multi-brand, multi-process scheduling scenarios.

## Architecture

```text
Browser UI
  -> Next.js App Router pages and server actions
  -> modules/roster domain engine and DB service
  -> lib/mutations validation and revalidation helpers
  -> Prisma Client
  -> PostgreSQL
```

Key directories:

- `app/`: routes and server actions.
- `components/`: reusable UI and page-level managers.
- `modules/roster/`: pure generation/validation engine, DB service, and view types.
- `lib/`: Prisma client, form validation, mutation helpers, and shared types.
- `prisma/`: schema and seed data.

## Data model

- `Employee` belongs to one primary `Pod` and owns effective-dated weekly offs.
- `Pod` has one lead who must belong to that pod.
- `Brand` and `Process` are many-to-many through `EmployeeAssignment`.
- `BrandProcessRule` defines start date, operating pattern, holiday behaviour, default staffing, and custom staffing per brand-process pair.
- `Roster` has one unique month/year, many `RosterEntry` rows, many `RosterAllocation` rows, and persisted `ValidationIssue` rows.
- `AuditLog` records generation, publication, revalidation, and manual override actions.

Employee deactivation and brand/process deactivation are soft deactivations. Pod deletion is a hard delete and frees members before removal.

## Scheduling logic

1. Expand the selected month into calendar dates.
2. Resolve active brand-process rules, holidays, and custom staffing requirements.
3. Build the eligible employee pool from active assignments whose effective dates cover each day.
4. Exclude approved leave, approved comp-off, and configured weekly offs.
5. Treat pending leave as a warning rather than a hard absence.
6. Allocate employees deterministically to operating brand-process requirements.
7. Persist the draft, allocations, issues, summary, and audit entry.
8. Revalidate persisted entries when configuration or availability changes.

A brand is treated as single-resource when the loaded configuration has one or fewer assigned employees. When the only employee for a brand is unavailable, the engine cannot cover that requirement and records a coverage gap. Multi-resource brands can satisfy multiple process requirements when enough distinct eligible employees exist. One employee can receive at most one allocation per date.

Conflicting requirements, insufficient staffing, non-operating allocations, inactive employees, and structurally invalid working entries are recorded as `ERROR` issues that block publication. Soft preference violations, such as pending leave, are recorded as `WARNING` issues. Manual edits enforce the same hard constraints at write time: one allocation per employee per date, operating brand-process day, active assignment coverage, and no working status without an allocation. Drafts and published rosters are revalidated without rewriting persisted schedules.

## Automated and human-controlled steps

Automated:

- Calendar expansion.
- Eligibility checks.
- Availability checks.
- Deterministic allocation.
- Coverage and conflict validation.
- Draft and published-roster revalidation after relevant data changes.

Human-controlled:

- Master-data configuration.
- Leave approval and comp-off approval.
- Regenerating a draft from scratch.
- Manual entry edits and conflict resolution.
- Publishing a valid roster.
- Database reset and deployment.

Published rosters are locked: they cannot be regenerated or manually edited. They can still be revalidated so new issues become visible, but configuration and availability changes never rewrite published schedules or status. Draft rosters affected by leave or comp-off changes are recomputed from the engine for those dates; rejecting or deleting availability restores the baseline for those dates. Revalidation failures from master-data and availability actions are surfaced in the action message instead of being silently ignored.

## Local setup

Requirements:

- Node.js 20 or newer.
- npm.
- PostgreSQL database, such as Neon.

Steps:

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to your PostgreSQL connection string. Set `SEED_API_TOKEN` to a long random value if you want to use the protected seed API endpoint.

Apply the schema and seed the clean dataset:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

The seed is destructive: it clears all operational rows, then inserts 30 employees, 3 pods, 5 brands, 3 processes, 30 assignments, 2 public holidays, and a clean current-month roster with zero issues.

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Health check:

```bash
curl http://localhost:3000/api/seed
```

Protected reset via API:

```bash
curl -X POST http://localhost:3000/api/seed -H "x-seed-token: $SEED_API_TOKEN"
```

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Completed verification:

- `npm run lint` passed.
- `npx tsc --noEmit` passed.
- `npm run build` passed with 16/16 static pages generated.
- The production build uses the Next.js default Turbopack bundler so the configured Tailwind loader emits utility classes in the production CSS.
- Browser smoke tests covered master-data CRUD, availability CRUD, availability status badge consistency, roster generation, roster views, issue persistence, manual edits, allocation removal, post-change revalidation, single-allocation reassignment, working-status-without-allocation rejection, and non-operating-day allocation rejection.
- Browser navigation checks confirmed partial prerendering on every dynamic page, a persistent sidebar, loading skeletons on route transitions, and a single shared coverage-count request.
- Browser console checks showed no runtime errors after final reload.
- Browser availability status-change checks confirmed that approving Anita Roy's 2026-11-02 leave changes the roster entry to `LEAVE`, rejecting it restores `WORKING` with zero issues, and dashboard, sidebar, issues page, and count API all report the same single coverage gap.
- Final database reset produced the clean 30-employee, 5-brand dataset with a zero-issue roster and no sidebar coverage badge.

## Deployment

Deployment target: Vercel with a managed Neon PostgreSQL database. No public deployment URL is configured in this repository yet.

For deployment:

1. Create a Neon database.
2. Set `DATABASE_URL` and `SEED_API_TOKEN` as Vercel environment variables.
3. Run `npx prisma db push` and `npm run db:seed` against the production database to load the clean dataset.
4. Deploy the repository to Vercel.
5. Confirm `/api/seed` reports a database connection.

Demo credentials: none. The current MVP does not implement login.

Backup and recovery: use Neon's point-in-time recovery and branch/backup features. Published roster rows are preserved by normal application flows; only the explicit seed reset clears them.

## Assumptions and limitations

- One schedulable work allocation per employee per date; no start/end shift times.
- Weekly offs are employee-specific and may be effective-dated.
- Pending leave is a warning; approved leave blocks scheduling.
- Holiday coverage is configured per brand-process rule; the holiday scope flag controls whether the public-holiday label applies globally or only to employees assigned to rules closed on holidays.
- Each employee has one primary pod.
- Pod-lead scoped permissions and manager authentication are not implemented.
- The schema has no migration history; setup uses `prisma db push`.
- Form validation is implemented manually without Zod.
- Brand single-resource behaviour is derived from active assignment count because the schema has no dedicated flag.
- Process calendars are brand-process scoped, but holiday exceptions are not modelled separately per process.
- Public deployment, demo video, and automated test suite are not included yet.

## Scaling notes

If employee and brand counts doubled, generation would still be deterministic, but validation and revalidation would perform more database reads and writes. The main improvements would be indexing hot roster date columns, batching validation writes, moving the engine behind a queue for large months, and caching resolved eligibility sets per date.

With one additional week, the highest-value work would be automated tests for the engine and persistence layer, shift-level scheduling with time ranges, authentication with manager and pod-lead roles, and a tested public deployment with a documented demo URL.

## Assessment checklist answers

- Employees, brands, processes, pods, and relationships are modelled as normalized Prisma tables with assignments as the employee-to-brand/process join.
- Generation expands the month, resolves rules and availability, allocates deterministically, and persists validation issues.
- Single-resource and multi-resource brands are handled through eligible assignment counts and deterministic allocation.
- If the only employee for a brand is unavailable, the engine records a blocking coverage gap.
- Conflicting requirements and insufficient staffing are surfaced as persisted validation issues with severity and suggestions.
- Calculation and validation are automated; configuration, conflict resolution, regeneration, and publication remain manager-controlled.
- Doubling data increases generation and revalidation work; batching, indexes, and queued generation would be the next scaling step.
- Another week would prioritise tests, auth, shift-level scheduling, and a verified deployment.
