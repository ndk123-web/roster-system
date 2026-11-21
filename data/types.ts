// Domain Types for Smart Roster Management System
// Conforming to PRD (docs/prd.md) and DataStraw Assessment requirements

export type Role = "OPERATIONS_MANAGER" | "POD_LEAD";

export type RosterStatus = "DRAFT" | "ISSUES_FOUND" | "PUBLISHED";

export type RosterEntryStatus =
  | "WORKING"
  | "WEEKLY_OFF"
  | "LEAVE"
  | "COMP_OFF"
  | "PUBLIC_HOLIDAY"
  | "UNASSIGNED";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveType = "CASUAL" | "SICK" | "PLANNED" | "COMP_OFF" | "OTHER";

export type OperatingPattern =
  | "ALL_365" // 365 days including Sundays and public holidays
  | "DAILY_EXCEPT_HOLIDAYS" // Daily except public holidays
  | "SUNDAYS_AND_HOLIDAYS_OFF" // Sundays and public holidays off
  | "CUSTOM"; // Custom days of week

export type Severity = "ERROR" | "WARNING";

export type IssueType =
  | "COVERAGE_GAP"
  | "OVERLAPPING_ASSIGNMENT"
  | "LEAVE_CONFLICT"
  | "WEEKLY_OFF_CONFLICT"
  | "INACTIVE_EMPLOYEE_SCHEDULED"
  | "PREFERENCE_VIOLATION";

export interface Pod {
  id: string;
  name: string;
  description: string;
  leadId: string;
  leadName: string;
}

export interface Employee {
  id: string;
  code: string; // e.g. EMP001
  name: string;
  email: string;
  podId: string;
  active: boolean;
  weeklyOffDay: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  skills: string[]; // Process codes they can handle: e.g. ['CS', 'ACC', 'NDR']
}

export interface Process {
  id: string;
  name: string;
  code: "CS" | "ACC" | "NDR" | "RET" | string;
  description: string;
  active: boolean;
}

export interface Brand {
  id: string;
  code: string;
  name: string;
  isSingleResource: boolean; // ~80% single-resource, ~20% multi-resource
  active: boolean;
}

export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  brandId: string;
  processId: string;
  isPrimary: boolean;
  active: boolean;
}

export interface BrandProcessRule {
  id: string;
  brandId: string;
  processId: string;
  operatingPattern: OperatingPattern;
  customDaysOfWeek?: number[];
  operatesOnHolidays: boolean;
  minStaffing: number;
}

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  affectsAllProcesses: boolean;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: LeaveType;
  status: LeaveStatus;
  reason: string;
}

export interface CompOffRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: LeaveStatus;
  reason: string;
}

export interface RosterAllocation {
  brandId: string;
  processId: string;
}

export interface RosterDayEntry {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0..6
  status: RosterEntryStatus;
  allocations: RosterAllocation[];
  notes?: string;
}

export interface EmployeeRoster {
  employeeId: string;
  days: Record<string, RosterDayEntry>; // keyed by YYYY-MM-DD
}

export interface ValidationIssue {
  id: string;
  date: string; // YYYY-MM-DD
  severity: Severity;
  issueType: IssueType;
  brandId?: string;
  brandName?: string;
  processId?: string;
  processName?: string;
  employeeId?: string;
  employeeName?: string;
  requiredStaffing?: number;
  allocatedStaffing?: number;
  message: string;
  suggestion?: string;
}

export interface MonthlyRosterData {
  month: number; // 11 = Nov
  year: number; // 2026
  status: RosterStatus;
  generatedAt: string;
  publishedAt?: string;
  employeeRosters: Record<string, EmployeeRoster>;
  issues: ValidationIssue[];
}
