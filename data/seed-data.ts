// Realistic Seed Dataset for Smart Roster Management System
// Fulfills all DataStraw Assessment Test requirements:
// - 32 Active Employees across 4 Pods with Pod Leads
// - 15 D2C Brands (12 single-resource ~80%, 3 multi-resource ~20%)
// - 4 Core Processes (CS, ACC, NDR, Retention)
// - Configurable operating calendars (365 days, Sunday off, holiday off)
// - Leaves, Comp-Offs, and Public Holidays for November 2026

import type {
  Pod,
  Employee,
  Process,
  Brand,
  EmployeeAssignment,
  BrandProcessRule,
  PublicHoliday,
  LeaveRecord,
  CompOffRecord,
} from "./types";

export const SEED_PROCESSES: Process[] = [
  {
    id: "proc-cs",
    code: "CS",
    name: "Customer Support",
    description: "Inbound client inquiries, ticketing, live chat, and complaint resolution.",
    active: true,
  },
  {
    id: "proc-acc",
    code: "ACC",
    name: "Abandoned Cart Conversions",
    description: "Proactive checkout recovery, customer outreach, and discount assistance.",
    active: true,
  },
  {
    id: "proc-ndr",
    code: "NDR",
    name: "Non-Delivery Reports",
    description: "Courier tracking, RTO reduction, address verification, and delivery coordination.",
    active: true,
  },
  {
    id: "proc-ret",
    code: "RET",
    name: "Customer Retention",
    description: "VIP retention, repeat purchase campaigns, and satisfaction follow-ups.",
    active: true,
  },
];

export const SEED_PODS: Pod[] = [
  {
    id: "pod-1",
    name: "Pod North (Flagship D2C)",
    description: "Handles Tier-1 cosmetics and lifestyle D2C client brands.",
    leadId: "emp-001",
    leadName: "Anita Roy",
  },
  {
    id: "pod-2",
    name: "Pod South (Retention & NDR)",
    description: "Specialized logistics coordination, RTO management, and customer recovery.",
    leadId: "emp-009",
    leadName: "Vikram Seth",
  },
  {
    id: "pod-3",
    name: "Pod East (High-Volume Support)",
    description: "High-ticket consumer electronics, accessories, and 24/7 client care.",
    leadId: "emp-017",
    leadName: "Sneha Menon",
  },
  {
    id: "pod-4",
    name: "Pod West (Specialized Brands)",
    description: "Health, nutrition, apparel, and emerging direct-to-consumer accounts.",
    leadId: "emp-025",
    leadName: "Amit Verma",
  },
];

export const SEED_EMPLOYEES: Employee[] = [
  // POD 1 (Employees 1 to 8) - Lead: Anita Roy
  { id: "emp-001", code: "EMP001", name: "Anita Roy", email: "anita.roy@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR", "RET"] },
  { id: "emp-002", code: "EMP002", name: "Priya Sharma", email: "priya.sharma@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-003", code: "EMP003", name: "Rohan Patel", email: "rohan.patel@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 1, skills: ["CS", "ACC"] },
  { id: "emp-004", code: "EMP004", name: "Kavita Nair", email: "kavita.nair@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 2, skills: ["CS", "NDR"] },
  { id: "emp-005", code: "EMP005", name: "Arjun Mehta", email: "arjun.mehta@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 3, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-006", code: "EMP006", name: "Pooja Hegde", email: "pooja.hegde@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 4, skills: ["CS", "RET"] },
  { id: "emp-007", code: "EMP007", name: "Aman Gupta", email: "aman.gupta@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 5, skills: ["ACC", "NDR"] },
  { id: "emp-008", code: "EMP008", name: "Divya Deshmukh", email: "divya.deshmukh@datastraw.ops", podId: "pod-1", active: true, weeklyOffDay: 6, skills: ["CS", "ACC", "NDR"] },

  // POD 2 (Employees 9 to 16) - Lead: Vikram Seth
  { id: "emp-009", code: "EMP009", name: "Vikram Seth", email: "vikram.seth@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR", "RET"] },
  { id: "emp-010", code: "EMP010", name: "Rajesh Kumar", email: "rajesh.kumar@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 0, skills: ["NDR", "CS"] },
  { id: "emp-011", code: "EMP011", name: "Meera Joshi", email: "meera.joshi@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 1, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-012", code: "EMP012", name: "Siddharth Rao", email: "siddharth.rao@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 2, skills: ["ACC", "RET"] },
  { id: "emp-013", code: "EMP013", name: "Ananya Iyer", email: "ananya.iyer@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 3, skills: ["CS", "NDR"] },
  { id: "emp-014", code: "EMP014", name: "Kunal Singhania", email: "kunal.singhania@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 4, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-015", code: "EMP015", name: "Shalini Pandey", email: "shalini.pandey@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 5, skills: ["CS", "ACC"] },
  { id: "emp-016", code: "EMP016", name: "Aditya Bhat", email: "aditya.bhat@datastraw.ops", podId: "pod-2", active: true, weeklyOffDay: 6, skills: ["NDR", "RET"] },

  // POD 3 (Employees 17 to 24) - Lead: Sneha Menon
  { id: "emp-017", code: "EMP017", name: "Sneha Menon", email: "sneha.menon@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR", "RET"] },
  { id: "emp-018", code: "EMP018", name: "Varun Chopra", email: "varun.chopra@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 1, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-019", code: "EMP019", name: "Tanvi Saxena", email: "tanvi.saxena@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 2, skills: ["CS", "ACC"] },
  { id: "emp-020", code: "EMP020", name: "Gaurav Sen", email: "gaurav.sen@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 3, skills: ["CS", "NDR"] },
  { id: "emp-021", code: "EMP021", name: "Isha Kapoor", email: "isha.kapoor@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 4, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-022", code: "EMP022", name: "Nikhil Chawla", email: "nikhil.chawla@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 5, skills: ["CS", "RET"] },
  { id: "emp-023", code: "EMP023", name: "Kritika Das", email: "kritika.das@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 6, skills: ["ACC", "NDR"] },
  { id: "emp-024", code: "EMP024", name: "Harsh Vardhan", email: "harsh.vardhan@datastraw.ops", podId: "pod-3", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR"] },

  // POD 4 (Employees 25 to 32) - Lead: Amit Verma
  { id: "emp-025", code: "EMP025", name: "Amit Verma", email: "amit.verma@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR", "RET"] },
  { id: "emp-026", code: "EMP026", name: "Ritu Nambiar", email: "ritu.nambiar@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 1, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-027", code: "EMP027", name: "Deepak Pillai", email: "deepak.pillai@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 2, skills: ["CS", "NDR"] },
  { id: "emp-028", code: "EMP028", name: "Simran Gill", email: "simran.gill@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 3, skills: ["CS", "ACC"] },
  { id: "emp-029", code: "EMP029", name: "Manish Tiwari", email: "manish.tiwari@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 4, skills: ["CS", "ACC", "NDR"] },
  { id: "emp-030", code: "EMP030", name: "Swati Reddy", email: "swati.reddy@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 5, skills: ["CS", "RET"] },
  { id: "emp-031", code: "EMP031", name: "Karan Malhotra", email: "karan.malhotra@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 6, skills: ["ACC", "NDR"] },
  { id: "emp-032", code: "EMP032", name: "Neha Roy", email: "neha.roy@datastraw.ops", podId: "pod-4", active: true, weeklyOffDay: 0, skills: ["CS", "ACC", "NDR"] },
];

// 15 Brands: 12 single-resource (~80%), 3 multi-resource (~20%)
export const SEED_BRANDS: Brand[] = [
  // Single-Resource Brands (12 brands)
  { id: "brd-01", code: "GLOW", name: "GlowAura D2C", isSingleResource: true, active: true },
  { id: "brd-02", code: "URBN", name: "UrbanPulse", isSingleResource: true, active: true },
  { id: "brd-03", code: "KAVT", name: "Kavita Organics", isSingleResource: true, active: true },
  { id: "brd-04", code: "PURE", name: "PureNourish", isSingleResource: true, active: true },
  { id: "brd-05", code: "ECOV", name: "EcoVibe Home", isSingleResource: true, active: true },
  { id: "brd-06", code: "BEAU", name: "BellaBotanics", isSingleResource: true, active: true },
  { id: "brd-07", code: "NOVA", name: "NovaSound Audio", isSingleResource: true, active: true },
  { id: "brd-08", code: "STEP", name: "StrideFootwear", isSingleResource: true, active: true },
  { id: "brd-09", code: "SNAC", name: "NutriCrunch Foods", isSingleResource: true, active: true },
  { id: "brd-10", code: "FITP", name: "FitPro Activewear", isSingleResource: true, active: true },
  { id: "brd-11", code: "LUMX", name: "Lumina Skin", isSingleResource: true, active: true },
  { id: "brd-12", code: "ZENL", name: "ZenLiving Decor", isSingleResource: true, active: true },

  // Multi-Resource Brands (3 brands: 2 to 3 employees assigned to separate/overlapping processes)
  { id: "brd-13", code: "AURA", name: "AuraLifestyle Direct", isSingleResource: false, active: true },
  { id: "brd-14", code: "VELO", name: "Velora Tech Gear", isSingleResource: false, active: true },
  { id: "brd-15", code: "NEXU", name: "Nexus Healthcare", isSingleResource: false, active: true },
];

// Operating Calendars and Rules for each Brand-Process
export const SEED_RULES: BrandProcessRule[] = [
  // GlowAura D2C (Single-Resource: Priya Sharma) - CS operates 365 days!
  { id: "rule-01", brandId: "brd-01", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, minStaffing: 1 },
  { id: "rule-02", brandId: "brd-01", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },
  { id: "rule-03", brandId: "brd-01", processId: "proc-ndr", operatingPattern: "SUNDAYS_AND_HOLIDAYS_OFF", operatesOnHolidays: false, minStaffing: 1 },

  // UrbanPulse (Single-Resource: Rajesh Kumar) - Daily except holidays
  { id: "rule-04", brandId: "brd-02", processId: "proc-cs", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },
  { id: "rule-05", brandId: "brd-02", processId: "proc-ndr", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },

  // Kavita Organics (Single-Resource: Rohan Patel)
  { id: "rule-06", brandId: "brd-03", processId: "proc-cs", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },
  { id: "rule-07", brandId: "brd-03", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },

  // Multi-Resource: AuraLifestyle Direct (CS needs 2 staff, ACC needs 1 staff)
  { id: "rule-08", brandId: "brd-13", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, minStaffing: 2 },
  { id: "rule-09", brandId: "brd-13", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },
  { id: "rule-10", brandId: "brd-13", processId: "proc-ret", operatingPattern: "SUNDAYS_AND_HOLIDAYS_OFF", operatesOnHolidays: false, minStaffing: 1 },

  // Multi-Resource: Velora Tech Gear (CS needs 1, NDR needs 1)
  { id: "rule-11", brandId: "brd-14", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, minStaffing: 1 },
  { id: "rule-12", brandId: "brd-14", processId: "proc-ndr", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },

  // Multi-Resource: Nexus Healthcare
  { id: "rule-13", brandId: "brd-15", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, minStaffing: 1 },
  { id: "rule-14", brandId: "brd-15", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, minStaffing: 1 },
];

// Employee Assignments
export const SEED_ASSIGNMENTS: EmployeeAssignment[] = [
  // GlowAura (Single-Resource dedicated: Priya Sharma)
  { id: "asgn-01", employeeId: "emp-002", brandId: "brd-01", processId: "proc-cs", isPrimary: true, active: true },
  { id: "asgn-02", employeeId: "emp-002", brandId: "brd-01", processId: "proc-acc", isPrimary: true, active: true },
  { id: "asgn-03", employeeId: "emp-002", brandId: "brd-01", processId: "proc-ndr", isPrimary: true, active: true },

  // UrbanPulse (Single-Resource dedicated: Rajesh Kumar)
  { id: "asgn-04", employeeId: "emp-010", brandId: "brd-02", processId: "proc-cs", isPrimary: true, active: true },
  { id: "asgn-05", employeeId: "emp-010", brandId: "brd-02", processId: "proc-ndr", isPrimary: true, active: true },

  // Kavita Organics (Rohan Patel)
  { id: "asgn-06", employeeId: "emp-003", brandId: "brd-03", processId: "proc-cs", isPrimary: true, active: true },
  { id: "asgn-07", employeeId: "emp-003", brandId: "brd-03", processId: "proc-acc", isPrimary: true, active: true },

  // Multi-Resource Brand AuraLifestyle (3 employees: Varun Chopra, Tanvi Saxena, Gaurav Sen)
  { id: "asgn-08", employeeId: "emp-018", brandId: "brd-13", processId: "proc-cs", isPrimary: true, active: true },
  { id: "asgn-09", employeeId: "emp-019", brandId: "brd-13", processId: "proc-cs", isPrimary: true, active: true }, // sharing CS to meet minStaffing: 2
  { id: "asgn-10", employeeId: "emp-020", brandId: "brd-13", processId: "proc-acc", isPrimary: true, active: true },

  // Multi-Resource Brand Velora Tech Gear (Rohan Patel overlapping & Kunal Singhania)
  { id: "asgn-11", employeeId: "emp-003", brandId: "brd-14", processId: "proc-cs", isPrimary: false, active: true }, // overlap test
  { id: "asgn-12", employeeId: "emp-014", brandId: "brd-14", processId: "proc-ndr", isPrimary: true, active: true },
];

export const SEED_HOLIDAYS: PublicHoliday[] = [
  { date: "2026-11-14", name: "Diwali (Festival Holiday)", affectsAllProcesses: true },
  { date: "2026-11-27", name: "Guru Nanak Jayanti", affectsAllProcesses: true },
];

export const SEED_LEAVES: LeaveRecord[] = [
  {
    id: "lv-01",
    employeeId: "emp-002", // Priya Sharma (GlowAura dedicated employee)
    startDate: "2026-11-15",
    endDate: "2026-11-16",
    type: "SICK",
    status: "APPROVED",
    reason: "Medical procedure (creates single-resource coverage gap on Sunday Nov 15)",
  },
  {
    id: "lv-02",
    employeeId: "emp-006",
    startDate: "2026-11-08",
    endDate: "2026-11-09",
    type: "CASUAL",
    status: "APPROVED",
    reason: "Personal family event",
  },
  {
    id: "lv-03",
    employeeId: "emp-021",
    startDate: "2026-11-22",
    endDate: "2026-11-23",
    type: "PLANNED",
    status: "PENDING",
    reason: "Out of station travel (pending approval)",
  },
];

export const SEED_COMPOFFS: CompOffRecord[] = [
  {
    id: "co-01",
    employeeId: "emp-010", // Rajesh Kumar (UrbanPulse dedicated)
    date: "2026-11-20",
    status: "APPROVED",
    reason: "Approved comp-off for working prior national holiday",
  },
];
