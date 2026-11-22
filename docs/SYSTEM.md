# How Smart Roster works

This reference explains where Smart Roster code lives, how data moves through the app, and what happens at each lifecycle step. It also records the edge cases and limits that are true in the current implementation.

## On this page

- [System shape](#system-shape)
- [Where the system lives](#where-the-system-lives)
- [Data model](#data-model)
- [Configuration workflows](#configuration-workflows)
- [Roster generation](#roster-generation)
- [Validation and issues](#validation-and-issues)
- [Roster lifecycle](#roster-lifecycle)
- [Availability sync](#availability-sync)
- [Dashboard and navigation counts](#dashboard-and-navigation-counts)
- [Setup and operations](#setup-and-operations)
- [Edge cases](#edge-cases)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Source index](#source-index)

For setup instructions and the implementation summary, see [the project README](README.md).

## System shape

Smart Roster is a Next.js App Router app backed by Prisma and PostgreSQL. Pages render server components and pass data to client components for interaction. Forms call server actions. Server actions validate form input, mutate Prisma data, and revalidate affected routes. The roster domain code is split between a pure engine and a persistence service.

```text
Browser
  -> App Router page
  -> client manager component
  -> server action
  -> Prisma mutation
  -> db-service
  -> pure roster engine
  -> persisted roster, entries, allocations, issues, audit log
  -> revalidatePaths
  -> updated page
```

The current MVP has no login. The `User` and `Role` models exist in `prisma/schema.prisma`, but no route checks a session or enforces a role.

Dynamic pages opt into runtime rendering with `connection()`. Route-level `loading.tsx` files provide skeleton shells while those pages load. The sidebar stays mounted during navigation, and `IssueCountProvider` shares one issue-count request between the sidebar and header.

## Where the system lives

| Area | Source of truth |
| --- | --- |
| Routing and pages | `app/` |
| Server actions | `app/**/actions.ts` |
| Reusable UI and page managers | `components/` |
| App shell and navigation | `components/layout/` |
| Master-data forms | `components/master-data/` |
| Availability forms | `components/availability/` |
| Roster workbench | `components/roster/` |
| Issue dashboard and issue list | `components/dashboard/`, `components/issues/` |
| Pure generation and validation logic | `modules/roster/engine.ts` |
| Database loading, persistence, sync, revalidation | `modules/roster/db-service.ts` |
| Shared query layer | `lib/queries.ts` |
| Form validation helpers | `lib/mutations/validate.ts` |
| Route revalidation helper | `lib/mutations/revalidate.ts` |
| Prisma client singleton | `lib/prisma.ts` |
| Schema and seed | `prisma/schema.prisma`, `prisma/seed.mjs` |
| APIs | `app/api/` |
| Product requirements | `docs/prd.md` |
| Setup and verification history | `docs/README.md` |

Key route entry points:

| Route | What it does |
| --- | --- |
| `/dashboard` | Shows operational cards and persisted issues for the current month. |
| `/roster` | Generates, reviews, edits, validates, and publishes the selected month. |
| `/issues` | Lists persisted issues for the selected month. Acknowledgement is local UI state. |
| `/availability` | Creates, edits, approves, rejects, and deletes leave and comp-off records. |
| `/employees` | Manages employees and weekly offs. |
| `/pods` | Manages pods and pod leads. |
| `/brands` | Manages brands and their brand-process rules. |
| `/processes` | Manages processes. |
| `/assignments` | Manages effective-dated employee assignments. |
| `/holidays` | Manages public holidays. |
| `/api/issues/count` | Returns the current-month issue count as JSON. |
| `/api/seed` | Reports row counts on GET and resets the database on authenticated POST. |
| `/api/health` | Provides a basic health response. |

## Data model

The schema in `prisma/schema.prisma` is authoritative. The following relationships drive most behavior.

### Core entities

- `Employee` has a unique `code` and `email`, one optional primary `Pod`, an `active` flag, effective-dated weekly offs, assignments, leave, comp-off, roster entries, and issues.
- `Pod` has a unique name, one optional lead, and many members. The lead must be one of the members.
- `Brand` and `Process` have unique names, unique codes, `active` flags, rules, assignments, allocations, and issues.
- `EmployeeAssignment` joins one employee, one brand, and one process. It has an `active` flag, `isPrimary` flag, `effectiveFrom`, and optional `effectiveTo`.
- `BrandProcessRule` is unique per brand-process pair. It stores `operatingPattern`, `customDaysOfWeek`, `operatesOnHolidays`, and `defaultMinStaffing`.
- `CustomStaffingRule` overrides staffing by weekday or by specific date for one brand-process rule.
- `PublicHoliday` is unique by date and has an `affectsAllProcesses` flag.
- `EmployeeWeeklyOff` stores one effective-dated weekday off per employee and weekday.
- `Leave` stores a date range, type, status, reason, and employee.
- `CompOff` stores one date per employee, status, reason, and employee.
- `Roster` is unique by `month` and `year` and has a `DRAFT`, `ISSUES_FOUND`, or `PUBLISHED` status.
- `RosterEntry` is unique by roster, employee, and date. It stores `WORKING`, `WEEKLY_OFF`, `LEAVE`, `COMP_OFF`, `PUBLIC_HOLIDAY`, or `UNASSIGNED`.
- `RosterAllocation` links a roster entry to one brand and process.
- `ValidationIssue` stores severity, issue type, optional brand, process, employee, staffing counts, message, and suggestion.
- `AuditLog` records generation, publication, revalidation, availability sync, and manual overrides.
- `User` and `Role` exist for a future authorization layer, but the app does not use them.

### Effective dates

`EmployeeAssignment` and `EmployeeWeeklyOff` use an inclusive window:

```text
date >= effectiveFrom && (effectiveTo === null || date <= effectiveTo)
```

A blank `effectiveTo` means open-ended. `EmployeeAssignment` is unique by employee, brand, and process, so the app cannot store multiple historical windows for the same triple. Editing an assignment updates the existing row.

Brand and process eligibility also require active records. A brand or process can be inactive while its assignments remain in the table, but those assignments do not make an employee eligible.

### Deletion behavior

- Employee deletion through the UI sets `active = false`. Historical roster entries and issues remain.
- Brand deletion through the UI sets `active = false`. Rules and assignments remain but become ineligible.
- Process deletion through the UI sets `active = false`. Rules and assignments remain but become ineligible.
- Pod deletion through the UI is a hard delete. Members are freed by setting `podId = null`, and the lead reference is cleared before deletion.
- Direct database deletes follow Prisma cascade rules. Use the UI for the intended lifecycle behavior.

### Derived fields

`isSingleResource` is not stored. `loadGenerationInput()` derives it by counting distinct assigned employees per brand and treating one or fewer as single-resource. This label changes issue wording, not allocation rules.

Resource type is also derived from assignments. There is no separate resource-type field.

## Configuration workflows

Configure the month before generating a roster. The engine reads configuration at generation time and again during validation.

### Employees

Use `/employees` to create and edit employees. The UI manages code, name, email, active state, pod, and weekly offs. Employee code and email are unique. Deactivate an employee instead of deleting the row when the employee has roster history.

Weekly offs are effective-dated by weekday. The database permits one row per employee and weekday. The UI requires at least one weekly off for an employee, but the database does not enforce that rule for records created outside the app.

### Pods

Use `/pods` to create pods and assign a lead. A lead must belong to the same pod. The UI shows a hint that pod leadership does not block roster allocation. Deleting a pod frees its members and removes the pod.

### Brands, processes, and rules

Use `/brands` and `/processes` to create and deactivate brand and process records. Use the brand manager to configure one rule per brand-process pair.

The rule calendar works as follows:

1. A holiday closes a rule when `operatesOnHolidays` is false.
2. `SUNDAYS_AND_HOLIDAYS_OFF` closes Sunday and holidays.
3. `CUSTOM` operates only on the configured weekdays.
4. Other patterns operate every day, subject to the holiday guard in step 1.

The holiday scope flag on a public holiday changes holiday labelling. It does not override the brand-process `operatesOnHolidays` rule.

Staffing requirements resolve in this order:

1. A `CustomStaffingRule` with a matching `specificDate`.
2. The highest matching `CustomStaffingRule` for the weekday.
3. `defaultMinStaffing`.

Negative staffing values clamp to zero.

### Assignments

Use `/assignments` to define where an employee can work. Select an active employee, brand, and process. Set `Effective From` and optional `Effective To`. A blank `Effective To` means the assignment stays open.

Mark one assignment as primary when that assignment must win eligibility ordering. Primary status affects order, not eligibility. If two assignments are otherwise equal, the engine prefers the employee with fewer allocations in the month and then employee code order.

### Holidays

Use `/holidays` to create one holiday per calendar date. The `affectsAllProcesses` flag controls labels across the roster. Each brand-process rule still controls whether coverage is required on that date.

### Availability

Use `/availability` to create leave and comp-off records.

Leave validation checks:

- The employee is active.
- `endDate` is on or after `startDate`.
- The leave does not overlap another leave record for the same employee. The overlap check includes rejected records.
- Required fields and enums are valid.

Comp-off validation checks:

- The employee is active.
- The date is valid.
- The employee does not already have a comp-off on that date.

Approved leave and approved comp-off remove an employee from eligibility. Pending leave leaves the employee eligible and creates a warning when they are scheduled. Rejected records have no scheduling effect.

## Roster generation

Generate a roster from `/roster` by selecting a month and year and using the generate action. Generation replaces the draft for that month. Published rosters cannot be regenerated.

The generation flow is:

1. `loadGenerationInput()` in `modules/roster/db-service.ts:73` loads employees, pods, brands, processes, assignments, weekly offs, rules, holidays, leaves, comp-offs, and derived brand resource flags.
2. `generateMonthlyRoster()` in `modules/roster/engine.ts:291` expands the month into local calendar dates keyed as `yyyy-MM-dd`.
3. For each date, the engine resolves each active brand-process rule into an operating requirement and required staffing count.
4. The engine builds the eligible pool from active assignments that cover the date, active employees, approved leave, approved comp-off, and weekly offs.
5. Requirements are sorted by the number of eligible employees, then by rule ID. This prioritizes the hardest requirements.
6. Eligible employees are sorted by primary assignment flag, month allocation count, then employee code.
7. Each employee can receive at most one allocation per date.
8. The engine writes coverage status, daily health, employee schedules, issues, counts, and a `DRAFT` or `ISSUES_FOUND` status.
9. `generateAndSaveRoster()` in `modules/roster/db-service.ts:217` replaces persisted entries, allocations, and issues in a transaction and writes an audit log.

### Entry status precedence

The engine assigns exactly one status per employee per date. It checks conditions in this order:

1. Inactive employee, status `UNASSIGNED`.
2. Approved leave, status `LEAVE`.
3. Approved comp-off, status `COMP_OFF`.
4. One or more allocations, status `WORKING`.
5. Weekly off, status `WEEKLY_OFF`.
6. Holiday that applies, status `PUBLIC_HOLIDAY`.
7. Otherwise, status `UNASSIGNED`.

A pending leave is checked after status assignment. It creates a `WARNING` issue only when the employee is `WORKING`.

A holiday applies to an employee when `affectsAllProcesses` is true, or when the employee has an active assignment to a brand-process rule with `operatesOnHolidays = false` on that date.

### Coverage health

`coverageHealthPercentage` is `filled shifts / required shifts`, rounded to a whole number. When there are no required shifts, it reports 100.

## Validation and issues

Validation has two paths. Both persist issues to the selected roster.

### Generation-time validation

The engine creates issues during generation. It records coverage gaps when a requirement cannot be filled. It records pending-leave warnings when an employee with pending leave is scheduled.

Persisted issues are the source of truth for the issues page, dashboard panel, sidebar badge, header count, and `/api/issues/count`.

### Revalidation

`validateAndSaveRoster()` in `modules/roster/db-service.ts:318` recomputes issues against the persisted schedule. It does not rewrite the schedule.

Revalidation checks:

- Inactive employees still present in the roster.
- `WORKING` entries without allocations.
- Non-`WORKING` entries that still have allocations.
- Pending leave on `WORKING` entries.
- Approved leave or comp-off on `WORKING` entries.
- Weekly off conflicts.
- More than one allocation for an employee on one date.
- Allocations on non-operating brand-process days.
- Allocations without an active, effective assignment.
- Coverage gaps from the persisted allocations.

Revalidation deletes all existing issue rows for the roster and writes a fresh set. Issue IDs therefore change on every validation run. A local acknowledgement on `/issues` resets when the issues reload.

For draft rosters, revalidation sets status to `ISSUES_FOUND` when errors exist and `DRAFT` when none exist. Published rosters keep `PUBLISHED` status even when revalidation finds errors.

Master-data actions call `revalidateRosters()` after changes. Published rosters are validated but not rewritten. Failures are returned in the action message through `revalidateRostersQuietly()`.

### Manual edit validation

`updateRosterEntry()` in `modules/roster/db-service.ts:614` validates before and after a manual edit.

Adding an allocation requires:

- A draft roster.
- An active employee.
- An active brand and process.
- An operating brand-process rule on the date.
- An active assignment covering the date.
- No weekly off on the date.
- No approved leave or comp-off on the date.

Manual allocation edits replace existing allocations on that entry, so they cannot create multiple allocations for one employee and date. Changing status to `WORKING` requires an existing allocation. Changing status away from `WORKING` removes allocations. Removing an allocation requires that the allocation exists. Published rosters reject all edits.

Every successful manual edit runs full revalidation for the month.

### Publication gate

`publishRoster()` in `modules/roster/db-service.ts:1079` blocks publication when any `ERROR` issue exists. `WARNING` issues do not block publication. A published roster cannot be edited or regenerated.

## Roster lifecycle

Use this sequence for a normal month:

1. Configure employees, pods, brands, processes, rules, assignments, and holidays.
2. Generate the month roster.
3. Review coverage health and issues.
4. Approve or reject pending availability records.
5. Resolve errors through configuration changes, approved availability changes, or manual draft edits.
6. Revalidate after changes.
7. Publish when no error issues remain.

The app keeps three closely related actions distinct:

| Action | Changes schedule | Changes status | Typical use |
| --- | --- | --- | --- |
| Generate | Replaces the whole draft | Recomputes status | Start over for the month. |
| Revalidate | Does not change entries or allocations | Recomputes draft status | Check a schedule after master-data changes. |
| Availability sync | Recomputes affected draft dates from the engine | Recomputes draft status | Reflect approved, rejected, changed, or deleted availability. |
| Publish | Does not change entries or allocations | Sets `PUBLISHED` | Freeze a valid roster. |

Manual edits are preserved by revalidation and by availability changes outside the affected dates. Generation overwrites all manual edits in the draft.

## Availability sync

Availability actions call `syncAvailability()` in `app/availability/actions.ts:56`, which groups changed dates by employee and calls `syncAvailabilityToRostersQuietly()` in `modules/roster/db-service.ts:1225`.

The sync does the following:

1. Deduplicates dates for each employee.
2. Groups dates by roster month and year.
3. Skips months with no roster.
4. Generates a fresh baseline for draft rosters.
5. Deletes and recreates entries and allocations for the affected dates.
6. Writes an `AVAILABILITY_SYNC` audit log.
7. Revalidates the affected month.
8. Skips entry rewrites for published rosters, but still revalidates them.

This means an approved leave on a draft date changes the employee status to `LEAVE` and reassigns the freed requirement to the next eligible employee. Rejecting or deleting that leave restores the baseline for the affected dates.

Manual overrides on affected draft dates are overwritten because those dates are regenerated from the engine. Manual overrides on other dates remain.

Sync failures do not roll back the availability mutation. The action still succeeds, and the returned message includes the sync failure.

## Dashboard and navigation counts

`getDashboardStats()` in `lib/queries.ts:183` supplies dashboard cards. `getCurrentRosterIssues()` in `lib/queries.ts:148` supplies the dashboard conflict panel. Both read the current local month and year.

Dashboard cards include:

- Total and active employees.
- Total and active brands.
- Total active processes.
- Total pods.
- Pending leave count.
- Approved leaves fully contained in the current month.
- Up to five upcoming holidays.
- Derived single-resource and multi-resource brand counts.

`getCurrentIssueCount()` in `lib/queries.ts:136` counts all validation issues for the current-month roster. The sidebar badge, header text, and `/api/issues/count` use this count. The badge hides when the count is zero.

The dashboard panel shows the first five current-month issues with real data. Its badges reflect the current error and warning counts, and its `View All` link includes the full count.

`/issues` uses `getRosterView()` for the selected month. A month selector on that page can therefore show different issues from the dashboard, sidebar, and header, which always use the current month.

The header label starts with `Draft` and appends the issue count when issues exist. That label is not a full roster lifecycle indicator. The roster page shows the selected roster status.

## Setup and operations

Run commands from the repository root.

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Set `DATABASE_URL` to the PostgreSQL connection string. Set `SEED_API_TOKEN` when you want to use the protected seed API.

The seed is destructive. It clears all operational rows, then inserts 30 employees, 3 pods, 5 brands, 3 processes, 15 brand-process rules, 30 assignments, 2 public holidays, and a current-month roster with 900 entries, 450 allocations, and zero issues.

Check database counts:

```bash
curl http://localhost:3000/api/seed
```

Reset the database through the API:

```bash
curl -X POST http://localhost:3000/api/seed -H "x-seed-token: $SEED_API_TOKEN"
```

Run verification:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The latest verification passed lint, typecheck, and production build. Browser checks confirmed that approving Anita Roy's 2026-11-02 leave changes the draft roster entry to `LEAVE`, rejecting it restores `WORKING`, and the dashboard, sidebar, issues page, and count API agree on the resulting issue count.

## Edge cases

### Master data

- Deactivating an employee keeps historical roster entries. Revalidation then reports `INACTIVE_EMPLOYEE_SCHEDULED` errors until the schedule is corrected.
- A brand or process can be inactive while assignments remain. Those assignments do not grant eligibility.
- Deleting a pod does not delete its employees. It clears their pod and lead references.
- A pod lead must belong to that pod. Changing pod membership can require changing the lead first.
- The assignment table rejects a duplicate employee, brand, and process triple. Use edit instead of create for a new effective window.
- `Effective To` is inclusive. An assignment ending on the 10th covers the 10th.
- A blank `Effective To` remains active until it is changed.
- Weekly offs are unique by employee and weekday. An effective-dated replacement for the same weekday updates the existing row.
- The engine expects weekly offs to exist. Records created outside the UI can bypass the UI requirement.
- Two public holidays cannot share a date because the schema has a unique date constraint.
- `affectsAllProcesses = false` does not close coverage. It only narrows the label to employees assigned to a rule closed on holidays.
- A rule with `ALL_365` and `operatesOnHolidays = false` closes on holidays because the holiday guard runs before the pattern check.
- A `CUSTOM` rule with `operatesOnHolidays = true` can operate on a holiday when that weekday is in `customDaysOfWeek`.
- A staffing override with a matching specific date wins over a weekday override.
- Multiple weekday staffing overrides use the highest `requiredStaffing`.
- A staffing value below zero clamps to zero.
- The dashboard derives single-resource brands from active assignment counts. A brand with zero assignments counts as single-resource.
- The dashboard pod `brandCount` currently returns zero. It is a placeholder and not a reliable metric.

### Availability

- A leave range with `endDate` before `startDate` is rejected.
- Leave overlap checks include rejected leave records, so a rejected record can still block a new overlapping record.
- Inactive employees cannot receive new leave or comp-off records.
- A leave can be created directly as `APPROVED`. Sync runs immediately.
- Comp-off is unique by employee and date. There is no comp-off date range.
- The schema default for comp-off status is `APPROVED`. The UI can submit another valid status.
- Pending leave does not remove an allocation. It creates a warning when the employee works that date.
- Rejected leave and comp-off records remain in the database but have no scheduling effect.
- Editing leave from one employee or date range to another syncs both the old and new values.
- Deleting leave or comp-off restores the baseline for the deleted dates.
- Duplicate affected dates are deduplicated before sync.
- Dates spanning multiple months sync each month that already has a roster.
- Availability changes for a month without a roster do nothing until a roster is generated.
- Published roster entries are never rewritten by availability changes, but published rosters are revalidated and can gain new issues.
- Availability sync failures are reported in the action message while the availability record is still saved.

### Generation and validation

- Generating a roster replaces the entire draft, including manual edits.
- Published rosters cannot be regenerated.
- A month with no active rules has no required shifts. Coverage health reports 100 and employees are usually `UNASSIGNED`.
- A month with active rules but no eligible assignments produces coverage errors.
- One employee can receive at most one allocation per date.
- A multi-resource brand still needs distinct eligible employees to cover multiple process requirements on the same date.
- When the only eligible employee for a brand is unavailable, the engine cannot cover that requirement and records a coverage gap.
- Primary assignments win ordering, but they do not bypass active, effective-date, holiday, leave, comp-off, or weekly-off checks.
- Approved leave outranks allocations in status precedence. If an approved leave exists, the engine marks the employee `LEAVE` and does not allocate them.
- Approved comp-off follows approved leave in precedence.
- A pending leave warning appears only when the employee is scheduled as `WORKING`.
- A public holiday can exist without changing a rule's required staffing when that rule sets `operatesOnHolidays = true`.
- Revalidation preserves entries and allocations. It does not fix stale configurations.
- Revalidation deletes and recreates issue rows, so issue IDs and local acknowledgements do not survive it.
- Draft status can change between `DRAFT` and `ISSUES_FOUND`. Published status never changes during revalidation.
- Warnings do not block publication. Errors do.
- A roster can be published and later revalidated into a state with errors. Publication is one-way and has no unpublish action.

### Manual edits

- Manual edits are available only for draft rosters.
- Adding an allocation replaces existing allocations for that employee and date.
- A `WORKING` status cannot be set without an allocation.
- Changing status away from `WORKING` deletes allocations.
- Removing a non-existent allocation fails.
- Manual edits cannot bypass non-operating days, inactive brands or processes, inactive employees, effective-date windows, weekly offs, approved leave, or approved comp-off.
- A successful manual edit revalidates the whole month and can reveal issues on other dates.

### Dashboard and navigation

- Dashboard, sidebar, header, and count API use the current local month. The issues page uses its selected month.
- Seed helpers use UTC date helpers while dashboard and count queries use local `new Date()`. Month boundaries can differ for deployments near midnight or in non-UTC timezones.
- Approved leaves that span month boundaries are not counted by the dashboard's `approvedLeavesThisMonth` card because it requires both start and end inside the month.
- The header always starts with `Draft`, even for a published roster.
- The sidebar badge hides at zero and shows a warning state above zero.
- The dashboard conflict panel shows at most five issues, while its `View All` link uses the full count.
- Issue acknowledge and resolve controls are local UI state. Reloading or revalidation restores the persisted list.
- The shared issue-count provider deduplicates requests inside a client session. A full reload fetches the count again.

### Runtime and delivery

- `connection()` makes query-backed pages dynamic. Removing it can reintroduce prerender errors when a query reads the current date.
- Route-level skeletons appear while dynamic pages load. The sidebar remains mounted.
- Production builds followed by `next dev` can serve stale `.next` output. Restart the dev server after a build.
- The seed API POST requires `x-seed-token`. GET is open and only reports counts.
- Direct database changes bypass UI validation and do not trigger revalidation or route cache refresh.
- Revalidation helpers revalidate roster, issues, dashboard, availability, and master-data paths after relevant mutations.

## Known limitations

- No authentication or authorization despite the `User` and `Role` models.
- No migration history. Setup uses `prisma db push`.
- No Zod. Form validation is manual through `lib/mutations/validate.ts`.
- No automated test suite. Verification uses lint, typecheck, production build, and browser smoke checks.
- No shift start or end times. An allocation represents one employee for one date and brand-process pair.
- No dedicated resource-type field. Resource type is inferred from assignments.
- No pod-lead permissions or manager roles.
- No separate holiday exception model per process beyond brand-process rules.
- No unpublish action and no automatic conflict resolution.
- No queue for generation or revalidation. Large months perform work synchronously in server actions.
- No public deployment URL is configured in the repository.
- Audit logs are write-only in the current UI.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Approved leave still shows `WORKING` on a draft | Availability sync failed or the roster was generated before approval | Check the action message, then approve again or regenerate the draft |
| Approved leave does not change a published roster | Published schedules are frozen | Revalidate to show new issues, or use a draft month |
| Publishing is blocked | One or more `ERROR` issues remain | Open `/issues`, resolve errors, then revalidate |
| Warnings appear but publishing works | Warnings do not block publication | Review them before publishing if needed |
| Dashboard count differs from issues page | Dashboard uses current month, issues page uses selected month | Select the current month on `/issues` |
| Coverage health is 100 with no employees scheduled | No active rules require staffing | Configure brand-process rules |
| Duplicate assignment error appears | The same employee, brand, and process already exists | Edit the existing assignment |
| Two holidays on one date are rejected | Public holiday date is unique | Update the existing holiday |
| `x-seed-token` error on seed reset | Missing or wrong header token | Set `SEED_API_TOKEN` and send the matching header |
| Build prerender error about `new Date()` | A dynamic query lost `connection()` | Restore `connection()` in the query |
| Header label says `Draft` for a published roster | Header label is count-driven and static text | Check roster status on `/roster` |

## Source index

Use these symbols when tracing behavior in code.

| Symbol | Path | Responsibility |
| --- | --- | --- |
| `generateMonthlyRoster` | `modules/roster/engine.ts:291` | Pure month generation |
| `isRuleOperating` | `modules/roster/engine.ts:242` | Holiday and weekday operating logic |
| `getRequiredStaffing` | `modules/roster/engine.ts:222` | Staffing override precedence |
| `loadGenerationInput` | `modules/roster/db-service.ts:73` | Builds engine input from Prisma |
| `generateAndSaveRoster` | `modules/roster/db-service.ts:217` | Persists generated rosters |
| `validateAndSaveRoster` | `modules/roster/db-service.ts:318` | Recomputes and persists issues |
| `updateRosterEntry` | `modules/roster/db-service.ts:614` | Manual draft edits with guardrails |
| `publishRoster` | `modules/roster/db-service.ts:1079` | Publication gate |
| `syncAvailabilityToRosters` | `modules/roster/db-service.ts:1116` | Draft-date rebuild and validation |
| `syncAvailabilityToRostersQuietly` | `modules/roster/db-service.ts:1225` | Non-throwing sync wrapper |
| `revalidateRosters` | `modules/roster/db-service.ts:1236` | Revalidates all rosters |
| `getCurrentIssueCount` | `lib/queries.ts:136` | Shared current-month count |
| `getCurrentRosterIssues` | `lib/queries.ts:148` | Dashboard conflict data |
| `getDashboardStats` | `lib/queries.ts:183` | Dashboard cards |
| `syncAvailability` | `app/availability/actions.ts:56` | Groups availability changes for sync |
| `IssueCountProvider` | `components/layout/issue-count-provider.tsx` | Deduplicated client-side count fetch |
| `UrgentConflictsPanel` | `components/dashboard/urgent-conflicts-panel.tsx` | Real dashboard issue telemetry |
