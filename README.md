# Smart Roster

Project documentation lives in [`docs/README.md`](docs/README.md).

Read [How Smart Roster works](docs/SYSTEM.md) for the detailed implementation reference, lifecycle, edge-case catalog, and source index.

It includes setup instructions, architecture, scheduling logic, implementation summary, verification results, deployment notes, assumptions, limitations, and assessment answers.

## How I Think

### 1. Data model

Employees, brands, processes, and pods are normalized Prisma tables. `EmployeeAssignment` is the effective-dated join between employee, brand, and process; pods have one lead from their own members. `BrandProcessRule` owns the start date, operating pattern, holiday behavior, and staffing minimums for each brand-process pair.

### 2. Roster generation and validation

Generation expands the month into dates, resolves active rules and holidays, builds the eligible pool, excludes approved leave, comp-off, and weekly offs, then allocates each employee at most once per date. The draft is saved with allocations, issues, and a summary; hard violations become `ERROR` issues that block publication, while soft risks become `WARNING` issues.

### 3. Single-resource vs multi-resource brands

A brand is treated as single-resource when it has one or fewer assigned employees. Both types use the same allocator, but multi-resource brands have a larger eligible pool and can cover multiple process requirements only when distinct employees are available.

### 4. Unavailable primary employee

Approved leave, comp-off, or a weekly off removes that employee from the day’s eligible pool. If no substitute can cover the required staffing for that brand-process date, the engine records a blocking `COVERAGE_GAP`; pending leave remains only a warning.

### 5. Conflicting requirements

Conflicts and insufficient staffing are persisted as validation issues with severity, date, brand/process context, and a suggested fix. Publication is blocked until `ERROR` issues are resolved, and manual edits are checked against the same hard constraints at write time.

### 6. Automation vs human control

Calendar expansion, eligibility, allocation, validation, and revalidation are automated because they are deterministic and repeatable. Managers keep control of master data, leave approval, regeneration, manual conflict resolution, and publication because those are business decisions.

### 7. Doubling the company

I would add indexes on roster date columns, batch validation writes, cache eligible employee sets per date, and move generation behind a queue. The roster UI would also need paged or virtualized views for larger datasets.

### 8. One more week

First I would add automated tests for the engine and persistence layer, especially coverage gaps, manual edits, and published-roster revalidation. That protects the highest-risk logic before adding shift times, authentication, or extra reporting. I would also like to add Proper Authentication For User, here User is Operational Manager who wants to manage their clients by assigning their employees to their clients/brands so that it will become an product and it will be isoalted around various operational manager.

Quick start:

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.
