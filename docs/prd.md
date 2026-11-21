# Smart Roster Management System
## Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Development baseline  
**Project type:** Browser-based roster management application  
**Primary users:** Operations Manager, Pod Lead  
**Prepared for:** DataStraw Tech Internship Assessment

---

## 1. Product Overview

### 1.1 Purpose

Build a browser-based application that helps an operations team maintain employee and client-brand data, configure process-specific operating rules, plan monthly employee rosters, detect staffing conflicts, and manage changes without manually rebuilding the entire schedule.

The product must solve the underlying scheduling and coverage problem. It is not merely a calendar or spreadsheet replacement.

### 1.2 Problem Statement

The company manages multiple D2C brands through operational processes such as Customer Support (CS), Abandoned Cart Conversions (ACC), retention, and Non-Delivery Report management (NDR). Employees are distributed across operational pods and may be assigned to one or more brands and processes.

Each brand-process combination can have different working days and minimum staffing requirements. Employees also have weekly offs, public holidays, planned leaves, comp-offs, and availability constraints.

A change to one employee's availability can create coverage gaps across one or more brand-process combinations. The application must make these impacts visible before a roster is published.

### 1.3 Product Goals

1. Maintain a central, configurable database of employees, brands, processes, pods, assignments, and scheduling rules.
2. Generate or assist in generating monthly rosters for the whole team.
3. Respect brand/process operating calendars and employee availability.
4. Detect coverage gaps, double assignments, and leave/weekly-off conflicts.
5. Support company-wide, pod-wise, brand-wise, process-wise, and employee-wise roster views.
6. Allow managers to make manual changes and validate their impact.
7. Handle post-generation changes without requiring a complete manual rebuild.
8. Support at least 30 employees and remain configurable as the organisation grows.

### 1.4 Success Criteria

- An operations manager can configure the organisation without changing application code.
- A monthly roster can be generated for all active employees.
- The system identifies insufficient coverage on required operating days.
- The system prevents or flags incompatible overlapping assignments.
- A manager can change an employee's availability after generation and see affected coverage issues.
- A roster with unresolved mandatory conflicts cannot be published.
- The application is publicly accessible and includes realistic sample data.

---

## 2. Users and Roles

### 2.1 Operations Manager

The primary user and owner of roster planning.

**Responsibilities**
- Create and maintain brands, processes, employees, pods, and assignments.
- Configure working calendars and minimum coverage.
- Record employee availability, weekly offs, planned leaves, comp-offs, and public holidays.
- Generate, review, edit, validate, and publish monthly rosters.
- Resolve coverage issues and scheduling conflicts.

### 2.2 Pod Lead

A lead responsible for overseeing a particular operational pod.

**Responsibilities**
- View employees and schedules belonging to their pod.
- Review pod-level roster coverage.
- Identify availability or scheduling issues within the pod.

**MVP permission assumption:** Pod Lead is a read-only, scoped role. Approval workflows are not part of the mandatory MVP unless added later.

### 2.3 Employee

An employee whose work and non-working days are represented in the roster.

**MVP permission assumption:** Employee self-service leave requests and personal login are outside the first release. Employee records and availability are maintained by authorised managers.

### 2.4 Authentication and Authorisation

- The MVP should provide a protected manager area.
- Role-based access should be structured so Pod Lead access can be introduced without redesigning the data model.
- Public users must not be able to access employee or roster data.
- Authentication provider and detailed account lifecycle are implementation decisions.

---

## 3. Domain Concepts and Terminology

| Concept | Definition |
|---|---|
| Company | The operations company employing the workforce |
| Brand | A client account served by the company |
| Process | A type of operational work, e.g. CS, ACC, NDR, retention |
| Employee | A member of the company's workforce |
| Pod | An internal group of employees managed by a pod lead |
| Assignment | A mapping that makes an employee eligible to work on a brand and process |
| Operating calendar | Days on which a brand-process combination requires service |
| Coverage requirement | Minimum number of eligible employees required for a brand-process on a given day |
| Availability | Whether an employee can work on a date |
| Weekly off | A recurring or configured non-working day for an employee |
| Leave | A date or date range when an employee is unavailable |
| Comp-off | A compensatory day off recorded for an employee |
| Public holiday | A configured holiday, which may or may not stop a particular process |
| Roster | The planned employee work/off schedule for a selected month |
| Roster entry | One employee's schedule status for one date |
| Coverage gap | A required brand-process staffing level that is not met |
| Conflict | A rule violation, such as double booking or assignment during approved leave |

**Important distinction:** A permanent assignment (employee → brand → process) defines where an employee is eligible to work. A monthly roster entry defines what that employee is scheduled to do on a particular date. These are separate concepts.

**Pod relationship:** A pod is an internal reporting/management grouping. It does not replace brand-process assignments. Employees from one pod may serve different brands, and a brand may receive resources from multiple pods if configured.

---

## 4. Scope

### 4.1 MVP — Must Have

- Employee CRUD and activation/deactivation.
- Brand CRUD.
- Process CRUD, including manager-created processes.
- Pod CRUD and pod-lead association.
- Employee-to-brand-to-process assignment management.
- Configurable brand-process operating days.
- Configurable minimum staffing requirements.
- Public holiday configuration.
- Employee weekly-off configuration.
- Planned leave and comp-off records.
- Monthly roster generation.
- Roster views at company, pod, brand, process, and employee levels.
- Conflict and coverage validation.
- Manual roster editing.
- Re-validation after edits or changes.
- Draft and Published roster states.
- Realistic seed dataset with at least 30 employees.
- Public deployment, GitHub repository, setup instructions, `.env.example`, and demo support.

### 4.2 Should Have

- Fair distribution of weekly offs.
- Employee scheduling preferences.
- Backup resource suggestions.
- Clear explanation of why a coverage issue occurred.
- Roster change history.
- CSV export.

### 4.3 Could Have / Future Scope

- Automatic roster regeneration after approved leave or availability changes.
- Alternative roster plan comparison.
- Pod Lead and Operations Manager approval workflow.
- Notifications when a published roster changes.
- Excel or Google Sheets export.
- AI-assisted explanations of scheduling conflicts.
- Employee self-service leave requests.
- Advanced optimisation solver.

### 4.4 Out of Scope for MVP

- Payroll, attendance tracking, salary calculation, or biometric integration.
- Shift time tracking and timesheets.
- Customer-facing brand portal.
- Automatic leave approval.
- AI/ML-based roster generation.
- Complex multi-shift optimisation unless explicitly added to the requirements.

---

## 5. Functional Requirements

Priority definitions: **P0 = mandatory for MVP**, **P1 = valuable**, **P2 = future enhancement**.

### FR-01: Employee Management — P0

The system shall allow an Operations Manager to:
- Create an employee with name, email or employee code, active status, pod, and other basic profile fields.
- Edit employee details.
- Activate or deactivate an employee.
- View an employee's brand/process assignments and monthly schedule.
- Prevent inactive employees from receiving new roster assignments.

### FR-02: Brand Management — P0

The system shall allow an Operations Manager to:
- Create, view, edit, and deactivate brands.
- Store brand name and status.
- View processes, assignments, and coverage rules associated with a brand.
- Retain historical roster references when a brand is deactivated.

### FR-03: Process Management — P0

The system shall allow an Operations Manager to:
- Create, view, edit, and deactivate processes.
- Store process name, code, and description.
- Reuse a process across multiple brands.
- Configure operating rules separately for each brand-process combination.
- Add new processes without changing application source code.

Examples include CS, ACC, NDR, retention, and brand-specific processes.

### FR-04: Pod Management — P0

The system shall allow an Operations Manager to:
- Create and edit operational pods.
- Assign a pod lead.
- Add or move employees between pods.
- View pod membership and pod-wise roster.
- Ensure an employee has one current primary pod in the MVP.

### FR-05: Resource Assignment Management — P0

The system shall allow an Operations Manager to:
- Assign one or more employees to a brand-process combination.
- Assign an employee to multiple brands and/or processes where permitted.
- Remove or deactivate an assignment without changing code.
- View all employees assigned to a brand or process.
- Represent single-resource brands, multi-resource brands, and multiple employees sharing one process.
- Record assignment effective dates if required for historical accuracy.

The sample data should reflect the assessment pattern: approximately 80% of brands have one dedicated employee handling their assigned processes; remaining brands generally have two or three employees. This is a sample-data target, not a hard-coded system restriction.

### FR-06: Operating Rules and Coverage — P0

The system shall allow the manager to configure rules for each brand-process combination, including:
- Operates every day, including Sundays and public holidays.
- Operates every day except public holidays.
- Sundays and public holidays are off.
- Custom days of the week.
- Minimum staffing requirement.
- Different rules for different processes under the same brand.
- Different minimum staffing requirements for particular days, where configured.

The system shall distinguish the brand-process operating calendar from an individual employee's working schedule.

### FR-07: Public Holiday Management — P0

The system shall allow the manager to:
- Add, edit, and remove public holidays.
- Set holiday date, name, and applicable scope.
- Configure whether a brand-process operates on a public holiday.
- Apply holiday rules during roster generation and validation.

A public holiday must not automatically make every process non-operational; the brand-process rule determines whether coverage is required.

### FR-08: Employee Availability and Weekly Offs — P0

The system shall allow the manager to:
- Configure an employee's recurring or date-specific weekly off.
- Record availability exceptions.
- View an employee's availability for a selected month.
- Apply employee availability during roster generation.
- Detect when a non-working status conflicts with a required assignment.

### FR-09: Leave and Comp-Off Management — P0

The system shall allow the manager to:
- Record leave start date, end date, type, and status.
- Support at least Pending, Approved, and Rejected leave statuses.
- Record comp-off dates.
- Treat approved leave and approved comp-off as unavailable dates.
- Avoid treating rejected leave as unavailable.
- Clearly distinguish pending leave from approved leave in the UI and validation output.
- Identify coverage impact when availability changes.

**MVP assumption:** Managers enter and update leave records. Employee self-service requests are future scope.

### FR-10: Monthly Roster Generation — P0

The system shall allow the manager to:
- Select a month and year.
- Generate a roster for all active employees.
- Use brand-process operating rules, employee assignments, availability, weekly offs, public holidays, approved leaves, comp-offs, and minimum coverage.
- Account for employees assigned to multiple brands or processes.
- Show working, weekly off, leave, comp-off, public holiday, and unassigned/exception statuses as applicable.
- Save the generated roster as a Draft.
- Avoid silently creating a roster that appears valid when mandatory constraints are unmet.

If no feasible assignment is found, the system shall retain the draft/partial plan and show actionable issues rather than hide the failure.

### FR-11: Roster Views — P0

The application shall provide:
- **Company view:** Complete monthly roster across all pods.
- **Pod view:** Employees and schedules grouped by pod.
- **Brand view:** Assigned employees, processes, and daily coverage.
- **Process view:** Staffing and schedule for a selected process.
- **Employee view:** Individual working days, weekly offs, holidays, leaves, and assignments.

Each view shall support selecting a month. Where useful, users shall be able to filter by brand, process, pod, or employee.

### FR-12: Conflict Detection and Validation — P0

The system shall detect and display:
- Required brand-process coverage with no available assigned employee.
- Staffing below the configured minimum.
- An employee assigned to overlapping responsibilities or incompatible shifts on the same date.
- An employee rostered on approved leave or comp-off.
- An employee rostered on a configured weekly off.
- A required process day with insufficient eligible employees.
- A schedule change that creates coverage gaps across multiple brands/processes.
- Violations of configured hard rules.
- Violations of preferences as warnings where appropriate.

Every issue should include:
- Severity (Error or Warning).
- Date.
- Affected brand and process, if applicable.
- Affected employee, if applicable.
- Required staffing and available/assigned staffing where relevant.
- A human-readable explanation.
- Suggested action or resolution hint where possible.

### FR-13: Manual Roster Editing — P0

The system shall allow an authorised manager to:
- Change an employee's roster status for a date.
- Assign or reassign an eligible employee to a brand-process requirement.
- Remove an assignment from a date.
- Save changes to the draft.
- Re-run validation after each change or on demand.
- See the effect on all affected brand-process coverage requirements.

Manual edits must not bypass hard validation. The system may save a draft with errors but must clearly flag it as not ready to publish.

### FR-14: Change Handling — P0

After a roster has been generated, the system shall handle:
- An employee becoming unavailable.
- A leave being approved, rejected, or modified.
- A weekly off being changed.
- A brand-process operating rule being modified.
- A minimum staffing requirement being changed.
- An employee assignment being added or removed.

The system shall identify affected dates and brand-process combinations, revalidate the roster, and show resulting issues. Full automatic regeneration is optional; the MVP may require the manager to choose and apply a proposed change.

### FR-15: Roster Lifecycle — P0

The MVP shall support these states:
- **Not Generated:** No roster exists for the selected month.
- **Draft:** A roster exists and can be edited.
- **Issues Found:** Validation has found one or more unresolved issues.
- **Published:** The manager has published a roster that passes mandatory validation.

A roster with unresolved mandatory errors must not be publishable. Warnings may be allowed at publication, subject to a clear manager acknowledgement if implemented.

### FR-16: Seed Data — P0

The application shall include realistic fictional sample data:
- At least 30 employees.
- Multiple brands.
- Multiple operational pods and pod leads.
- Multiple processes.
- Single-resource and multi-resource brands.
- Different employee-to-process assignment patterns.
- Processes with more than one employee for coverage.
- Different operating calendars and minimum staffing rules.
- Weekly offs, public holidays, leaves, and comp-offs.

### FR-17: Audit and History — P1

The system should record who changed a roster or configuration and when. At minimum, preserve roster creation and publication timestamps. More detailed before/after audit history is recommended if time permits.

### FR-18: Export — P2

The system may support CSV/Excel export of company, pod, brand, process, and employee roster views.

---

## 6. Scheduling Rules and Algorithm Requirements

### 6.1 Hard Constraints

Hard constraints must not be violated by a publishable roster:

1. An inactive employee cannot receive a new assignment.
2. An employee cannot be scheduled on approved leave.
3. An employee cannot be scheduled on an approved comp-off.
4. An employee cannot be scheduled on a configured weekly off, unless an explicitly authorised override mechanism exists.
5. An employee must be assigned to the relevant brand-process to be eligible.
6. An employee cannot be double-booked for incompatible responsibilities on the same date/time.
7. Every required brand-process-day must meet its minimum staffing requirement for a valid publishable roster.
8. A process must not receive coverage on a date when its configured rules say it is not operating, unless the manager explicitly overrides the rule.

### 6.2 Soft Constraints / Preferences

Soft constraints improve roster quality but may be violated with warnings:
- Employee preferred weekly off.
- Fair distribution of weekly offs.
- Balanced workload among eligible employees.
- Avoiding excessive consecutive working days.
- Employee preferences, where captured.
- Continuity of employee-to-brand assignment.

A required client coverage day takes priority over a preferred weekly-off day. Mandatory constraints and preferences must be represented separately.

### 6.3 MVP Generation Strategy

Use a deterministic, rule-based scheduling algorithm. An optimisation solver is not required for the first release.

Suggested process:

1. Load active employees, pods, assignments, operating rules, holidays, availability, and leave records.
2. Expand the selected month into calendar dates.
3. Determine which brand-process combinations require coverage on each date.
4. Build the eligible employee list for each required brand-process-date.
5. Remove employees who are inactive, unavailable, on approved leave/comp-off, on weekly off, or otherwise ineligible.
6. Prioritise requirements with fewer eligible employees to reduce the chance of leaving single-resource processes uncovered.
7. Allocate eligible employees while preventing duplicate/incompatible assignments.
8. Track assigned headcount against the minimum coverage requirement.
9. Record unresolved requirements as coverage gaps.
10. Apply soft scoring for fairness/preferences where feasible.
11. Save the result as a Draft with validation results.
12. Allow the manager to edit and revalidate before publishing.

### 6.4 Important Scheduling Design Notes

- Do not assume all employees work the same days.
- Do not assume all brands operate on the same days.
- A brand may have CS operating seven days while ACC or NDR follows a different calendar.
- One employee may be eligible for multiple processes, but cannot be allocated to incompatible work simultaneously.
- A single-resource brand must produce a clear coverage gap if its only eligible employee is unavailable on a required day and no valid backup is assigned.
- A multi-resource brand should be checked against the actual process-level requirements; the presence of other brand employees does not automatically mean every process is covered.
- The generator must report infeasibility rather than silently relaxing hard rules.

### 6.5 Validation Timing

Run validation:
- After roster generation.
- After a manual roster edit.
- After an availability/leave/weekly-off change affecting an existing roster.
- After a brand-process operating rule or minimum staffing change.
- Before publication.

---

## 7. Core User Workflows

### Workflow A: Initial Setup

1. Manager signs in.
2. Creates pods and assigns pod leads.
3. Adds employees and assigns them to pods.
4. Creates brands.
5. Creates or selects processes.
6. Configures brand-process operating days and minimum staffing.
7. Creates employee-to-brand-process assignments.
8. Adds public holidays and employee weekly offs.

### Workflow B: Record Leave

1. Manager opens Availability & Leaves.
2. Selects an employee and date range.
3. Selects leave type and status.
4. Saves the record.
5. If the leave is approved and a roster exists, the system revalidates affected dates.
6. Any resulting coverage gaps are shown to the manager.

### Workflow C: Generate Monthly Roster

1. Manager opens Monthly Roster.
2. Selects month and year.
3. Clicks Generate Roster.
4. System calculates the schedule and saves a Draft.
5. Manager reviews company-wide and filtered views.
6. Manager opens Issues Found and reviews each conflict.
7. Manager edits assignments or availability as needed.
8. System revalidates the draft.
9. Manager publishes only when mandatory errors are resolved.

### Workflow D: Handle a Change After Generation

1. A leave is approved or an employee becomes unavailable.
2. System identifies affected roster dates.
3. System recalculates coverage and flags any gaps.
4. Manager reviews affected brand-process combinations.
5. Manager assigns an eligible backup or changes the schedule.
6. System validates the change.
7. Manager saves and republishes/updates the roster according to the roster lifecycle.

### Workflow E: View a Roster

1. User selects a month.
2. User selects company, pod, brand, process, or employee view.
3. System displays relevant daily statuses and coverage.
4. User filters to locate an employee, brand, or process.

---

## 8. Data Model — Conceptual

The following is a logical starting point. Exact Prisma model names, field types, indexes, and relation cardinalities will be finalised during schema design.

| Entity | Key fields / purpose |
|---|---|
| User | Login identity, role, linked employee where applicable |
| Employee | Name, email/code, active status, pod |
| Pod | Name, pod lead |
| Brand | Name, active status |
| Process | Name, code, description, active status |
| EmployeeAssignment | Employee, brand, process, effective dates, active status |
| BrandProcessRule | Brand, process, operating-day configuration, holiday behaviour |
| CoverageRule | Brand-process, applicable day/condition, minimum staffing |
| PublicHoliday | Date, name, scope |
| EmployeeWeeklyOff | Employee, recurring weekday or date-specific off |
| EmployeeAvailability | Employee, date/range, availability status |
| Leave | Employee, start/end date, leave type, approval status |
| CompOff | Employee, date, status |
| Roster | Month, year, status, generated/published timestamps |
| RosterEntry | Roster, employee, date, status |
| RosterAllocation | Roster entry, brand-process assignment / work allocation |
| ValidationIssue | Roster, date, severity, issue type, affected entities, message |
| AuditLog | Actor, action, entity, timestamp, before/after metadata |

### 8.1 Relationship Notes

- An employee belongs to one current pod in the MVP; a pod contains multiple employees.
- A pod has one designated pod lead in the MVP.
- A brand can have many processes through brand-process rules.
- A process can be used by many brands.
- EmployeeAssignment links employees to a brand and a process.
- A roster belongs to one month/year.
- A roster contains daily entries for employees.
- A roster entry can have one or more work allocations only if the scheduling rules permit non-overlapping work.
- ValidationIssue records explain why a roster is not publishable.

### 8.2 Data Integrity

- Use foreign keys for relational integrity.
- Prevent duplicate active employee-brand-process assignments.
- Prevent duplicate roster entries for the same roster, employee, and date.
- Use transactions for generation and publication operations.
- Preserve historical roster data when master records are deactivated.
- Store dates consistently and handle the organisation's configured timezone.

---

## 9. User Interface Requirements

### 9.1 Visual Direction

Use a simple monochrome admin interface. Visual clarity and roster readability take priority over decoration.

**Theme tokens**
- Main background: `#FFFFFF`
- Sidebar / subtle surface: `#F5F5F5`
- Primary text: `#171717`
- Secondary text: `#737373`
- Borders: `#E5E5E5`
- Primary action: black background with white text
- Critical issue: restrained red indicator
- Neutral statuses: grey tones

### 9.2 Layout

- Persistent left sidebar.
- Simple top navigation with page title and month/context selector where relevant.
- Main content area with restrained spacing.
- Tables for employee, brand, process, pod, and assignment management.
- Calendar/grid for monthly roster.
- Right-side or dedicated issue panel for validation details.
- Responsive layout for laptop and tablet; desktop-first for roster editing.

### 9.3 Main Navigation

1. Dashboard
2. Employees
3. Brands
4. Processes
5. Pods
6. Assignments
7. Availability & Leaves
8. Public Holidays
9. Monthly Roster
10. Coverage Issues

### 9.4 Roster UI

- Display employee names against calendar dates.
- Use concise labels for statuses such as Working, Weekly Off, Leave, Comp-Off, Public Holiday, and Unassigned.
- Make coverage gaps easy to identify.
- Show required versus assigned headcount for each brand-process-date.
- Provide filters for pod, brand, process, and employee.
- Provide a clear Draft / Issues Found / Published state.
- Avoid relying on colour alone; include text or icons for status meaning.

### 9.5 UI Components

Use reusable components for:
- Data tables and filters.
- Create/edit dialogs or forms.
- Month picker.
- Roster calendar/grid.
- Status labels.
- Coverage summary.
- Validation issue list.
- Confirmation dialogs for destructive or publish actions.

---

## 10. Non-Functional Requirements

### NFR-01: Reliability

- Roster generation and publication must use safe database transactions.
- A failed generation must not leave a partially corrupted roster.
- The system must clearly communicate validation failures.
- The application must not silently ignore unavailable employees or unmet coverage.

### NFR-02: Performance

For the MVP target of at least 30 employees and multiple brands/processes:
- Normal management pages should load within approximately 2 seconds under typical demo conditions.
- Monthly roster generation should complete within approximately 5 seconds for the sample dataset under typical demo conditions.
- Use pagination or filtering for growing employee/brand lists.
- Avoid unnecessary repeated database queries.

These are project targets, not guarantees; measure them during testing.

### NFR-03: Scalability

- Data model must support adding employees, brands, processes, pods, and rules without code changes to the business model.
- Avoid hard-coded brand names, process names, employee counts, or fixed operating calendars.
- Use indexed foreign keys and frequently filtered fields.
- Keep scheduling logic separate from UI components so it can evolve independently.

### NFR-04: Security

- Store secrets only in environment variables.
- Never commit `.env` or production database credentials.
- Protect manager routes and server actions/API endpoints.
- Validate and authorise every write operation on the server.
- Do not trust client-provided employee, brand, or roster IDs without checking access.
- Use HTTPS in production.
- Avoid exposing database connection strings in client-side code or logs.

### NFR-05: Data Integrity

- Use relational constraints and transactions.
- Validate date ranges and status transitions.
- Prevent duplicate assignments and duplicate daily roster entries where prohibited.
- Keep published roster data consistent.
- Revalidate published rosters when relevant configuration changes.

### NFR-06: Maintainability

- Use TypeScript with clear domain types.
- Keep database access in a dedicated data/service layer.
- Keep roster generation and validation in independent modules.
- Use Zod or equivalent validation for incoming data.
- Use consistent naming and error handling.
- Document setup, assumptions, and scheduling logic in the README.

### NFR-07: Usability

- Common manager workflows should be understandable without technical knowledge.
- Errors must explain what happened and what needs attention.
- Filters and views should make it easy to find a specific employee, brand, process, or date.
- Destructive actions and publication should require confirmation.
- Status must not be conveyed by colour alone.

### NFR-08: Compatibility and Accessibility

- Support current versions of major desktop browsers.
- Provide responsive layouts for common laptop and tablet sizes.
- Use semantic form labels and keyboard-accessible controls.
- Maintain readable contrast and visible focus states.

### NFR-09: Availability and Deployment

- Deploy the application to a publicly accessible hosting platform.
- Use a managed PostgreSQL database (Neon).
- Configure production environment variables separately from local development.
- Include a health/error state for database connectivity where practical.

### NFR-10: Backup and Recovery

- Use the database provider's available backup/restore capabilities for production data.
- Do not treat generated roster data as disposable; preserve published rosters.
- Document the basic recovery approach.

---

## 11. Proposed Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Framework | Next.js (App Router) | Browser application and server-side functionality |
| Language | TypeScript | Type safety |
| UI | React | Component-based interface |
| Styling | Tailwind CSS | Monochrome visual system |
| Components | shadcn/ui | Forms, dialogs, tables, controls |
| Database | Neon PostgreSQL | Persistent relational data |
| ORM | Prisma | Schema, migrations, typed database access |
| Validation | Zod | Request and form validation |
| Date utilities | date-fns | Month/date calculations |
| Version control | Git + GitHub | Source history and repository |
| Deployment | Vercel (proposed) | Public application hosting |

### 11.1 Architecture

**Browser UI → Next.js server layer → domain/service logic → Prisma Client → Neon PostgreSQL**

Suggested separation:
- `app/`: routes and pages.
- `components/`: reusable UI.
- `lib/`: Prisma client and shared utilities.
- `server/` or `services/`: business operations.
- `modules/roster/`: generation, validation, and roster-specific domain logic.
- `prisma/`: schema and migrations.
- `types/`: shared TypeScript types where needed.

Do not place scheduling rules directly inside React components.

---

## 12. Error Handling and Edge Cases

The system must handle at least these cases:

1. A brand has one employee assigned to all its processes and that employee takes approved leave.
2. Two employees are assigned to one process, but both are unavailable on the same required day.
3. A brand has CS operating seven days, while another process is closed on Sundays.
4. A public holiday applies to one process but not another.
5. An employee is assigned to multiple brands and the schedule attempts to allocate them to incompatible work on the same day.
6. A manager changes an employee's weekly off after generating a roster.
7. A manager approves leave after a roster has been generated.
8. A manager increases a process's minimum staffing requirement.
9. An employee is deactivated while future roster entries exist.
10. A process or brand is deactivated while historical rosters reference it.
11. No eligible employee exists for a required brand-process-date.
12. A manager attempts to publish a roster with unresolved mandatory coverage gaps.

For each case, preserve data integrity and display an understandable validation result.

---

## 13. Acceptance Criteria

The MVP is accepted when the following end-to-end checks pass:

### AC-01: Organisation Setup
- Manager can create at least 30 employees, multiple brands, processes, and pods.
- Manager can assign pod leads.
- Manager can create new processes without code changes.

### AC-02: Assignment Flexibility
- One employee can be assigned to multiple brand-process combinations.
- A brand can have one or multiple employees.
- Multiple employees can share the same brand-process.
- Assignment changes are reflected in future roster generation.

### AC-03: Operating Rules
- A process can operate every day, exclude public holidays, or exclude Sundays and public holidays.
- Two processes under one brand can have different operating calendars.
- Minimum coverage can be configured per brand-process.

### AC-04: Availability
- Approved leave, comp-off, and weekly offs make an employee unavailable on applicable dates.
- Rejected leave does not block scheduling.
- Pending leave is visibly distinguished and follows the documented MVP policy.

### AC-05: Roster Generation
- Manager can select a month and generate a team roster.
- The roster accounts for assignments, calendars, availability, and minimum coverage.
- The roster is saved as a Draft.

### AC-06: Coverage Validation
- If a required process needs two employees but only one is available, the system reports a coverage gap of one.
- If a single-resource employee is unavailable on a required day and no backup exists, the system reports the gap.
- A process that is not operating on a date is not incorrectly reported as having a coverage gap.

### AC-07: Double Booking
- An employee cannot be assigned to incompatible responsibilities on the same date/shift.
- The validation issue identifies the employee and affected assignments.

### AC-08: Multiple Views
- Manager can view the roster company-wide, by pod, brand, process, and employee.
- Filters show the correct subset of roster data.

### AC-09: Manual Changes
- Manager can edit a draft roster.
- The system revalidates the changes.
- A change that creates a gap is reported.

### AC-10: Publication
- A roster with unresolved mandatory errors cannot be published.
- A valid roster can be published.
- Published status and timestamp are visible.

### AC-11: Change After Generation
- Approving a leave after generation triggers or allows revalidation.
- The application identifies affected coverage gaps and supports a manager-led resolution.

### AC-12: Delivery
- Public deployment works.
- GitHub repository contains source code, README, and `.env.example`.
- Demo video of 3–5 minutes demonstrates generation, different brand schedules, conflict detection, and a post-generation change.

---

## 14. Testing Strategy

### 14.1 Unit Tests

Test pure scheduling functions:
- Operating-day calculation.
- Holiday applicability.
- Employee eligibility.
- Leave and weekly-off checks.
- Duplicate allocation detection.
- Minimum coverage calculation.
- Conflict severity classification.

### 14.2 Integration Tests

Test:
- Prisma database operations.
- Employee/brand/process assignment creation.
- Roster generation and persistence.
- Validation issue persistence.
- Publication restrictions.
- Revalidation after leave or rule changes.

### 14.3 End-to-End Tests

Test the main manager journeys:
1. Configure a brand and process.
2. Assign employees.
3. Add weekly offs and leave.
4. Generate a monthly roster.
5. Inspect coverage.
6. Create a conflict through a post-generation change.
7. Resolve the conflict.
8. Publish the roster.

### 14.4 Essential Test Fixtures

Include fixtures for:
- Single-resource brand.
- Multi-resource brand with separate processes.
- Shared process with multiple employees.
- Seven-day process.
- Sunday-off process.
- Public-holiday-off process.
- Employee with approved leave.
- Employee with comp-off.
- Employee assigned to multiple brands.
- Insufficient staffing.

---

## 15. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scheduling logic becomes too complex | Invalid or slow rosters | Start with explicit hard constraints and a deterministic algorithm |
| Ambiguous leave policy | Incorrect availability | Define pending/approved/rejected behaviour and document it |
| Double booking across brands | Coverage and employee conflicts | Validate employee allocations globally per date/shift |
| Rule changes after generation | Stale roster | Revalidate affected dates and mark roster as needing review |
| Overly ambitious UI | Deadline risk | Prioritise tables, filters, and a readable roster grid |
| Too many optional features | Core requirements remain incomplete | Complete P0 requirements before P1/P2 |
| Database credentials exposed | Security breach | Use environment variables and `.env.example` only |

---

## 16. Assumptions and Decisions to Confirm

The assessment allows reasonable assumptions where operational details are not specified. The MVP should document these assumptions in the README.

1. **Employee shifts:** The initial model assumes one schedulable work allocation per employee per date unless shift-level scheduling is explicitly implemented.
2. **Weekly offs:** Weekly offs are employee-specific and may differ between employees.
3. **Pending leave:** Pending leave is shown as a warning/forecast risk but does not automatically block scheduling; approved leave blocks scheduling. This policy can be changed if the manager wants a conservative approach.
4. **Public holidays:** Holiday applicability is configured at brand-process level.
5. **Pods:** Each employee has one primary pod in the MVP.
6. **Pod Lead:** Pod Lead has scoped read-only access in the MVP.
7. **Manual override:** Hard constraints cannot be silently bypassed. Any override feature must require explicit authorisation and an audit record.
8. **Time zone:** Dates are interpreted in the organisation's configured business timezone.
9. **Roster granularity:** The MVP is date-based, not shift-time-based. If multiple shifts per day are needed, the data model must be extended.
10. **Assignment history:** Deactivating an assignment should not erase historical roster records.

---

## 17. Delivery Plan

A practical implementation order for the short assessment timeline:

### Phase 1 — Foundation
- Create Next.js TypeScript project.
- Configure Tailwind and shadcn/ui.
- Create Neon PostgreSQL database.
- Configure Prisma and environment variables.
- Create initial schema and migration.

### Phase 2 — Master Data
- Employees, pods, brands, processes.
- Employee-brand-process assignments.
- Operating rules and coverage requirements.
- Seed realistic sample data.

### Phase 3 — Availability
- Weekly offs.
- Public holidays.
- Leave and comp-off management.

### Phase 4 — Scheduling Core
- Calendar expansion.
- Employee eligibility.
- Deterministic roster generation.
- Coverage and conflict validation.
- Draft persistence.

### Phase 5 — Roster UI
- Company and filtered views.
- Manual edits.
- Issue list and coverage summaries.
- Publish validation.

### Phase 6 — Delivery
- Test key edge cases.
- Deploy publicly.
- Prepare README and `.env.example`.
- Record 3–5 minute demo.
- Write approach note and submit links.

**Execution principle:** Prioritise a correct roster engine and reliable validation over visual polish or optional automation.

---

## 18. README and Assessment Explanation Checklist

The repository README should answer these assessment questions:

1. How are employees, brands, processes, pods, and relationships modelled?
2. How does roster generation work, and how are constraints validated?
3. How are single-resource and multi-resource brands handled?
4. What happens when the only employee for a brand is unavailable?
5. How are conflicting requirements and insufficient staffing handled?
6. Which steps are automated and which remain under human control?
7. What would change if employee and brand counts doubled?
8. What would be improved with one additional week?

The README should also include:
- Project overview and feature list.
- Architecture summary.
- Local setup instructions.
- Neon and Prisma setup instructions.
- Environment variables (`.env.example`, with placeholders only).
- Migration and seed commands.
- Demo credentials if a demo login is provided.
- Deployment URL.
- Known limitations and documented assumptions.

---

## 19. Submission Deliverables

1. Publicly accessible application URL with realistic sample data.
2. GitHub repository containing source code, README, setup instructions, and `.env.example`.
3. 3–5 minute demo video showing:
   - Roster generation.
   - Different brand/process schedules.
   - Conflict detection.
   - Handling a change after roster generation.
4. Short approach note explaining architecture and key decisions.
5. Accessible LinkedIn profile link.

### Assessment submission details

- **To:** ozair.shaikh@datastraw.in; aryan.jaiswal@datastraw.in
- **CC:** talent@datastraw
- **Subject:** `Smart Roster Management System Assignment - [Your Full Name]`

---

## 20. Definition of Done

The MVP is done when:
- Core master data can be configured through the UI.
- The system supports at least 30 employees and multiple brands/processes/pods.
- Monthly rosters can be generated from configurable rules.
- Required coverage and employee availability are validated.
- Coverage gaps and double assignments are clearly reported.
- Manual changes trigger revalidation.
- Unresolved mandatory errors block publication.
- The main workflows are tested with realistic sample data.
- The application is deployed and the required submission materials are ready.

---

**Product principle:** A correct, explainable roster with visible conflicts is more valuable than a visually impressive calendar that hides invalid staffing.