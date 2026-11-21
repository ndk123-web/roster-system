// DB Query Layer — Smart Roster Management System
// All queries are run server-side only via Prisma singleton.
// Import only in Server Components or API routes.

import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// ─── Typedefs returned to consumers ──────────────────────────────────────────

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalBrands: number;
  activeBrands: number;
  totalProcesses: number;
  totalPods: number;
  pendingLeaves: number;
  approvedLeavesThisMonth: number;
  upcomingHolidays: { name: string; date: string }[];
  pods: PodSummary[];
  singleResourceBrandsCount: number;
  multiResourceBrandsCount: number;
}

export interface PodSummary {
  id: string;
  name: string;
  leadName: string | null;
  memberCount: number;
  brandCount: number;
}

export interface EmployeeRow {
  id: string;
  code: string;
  name: string;
  email: string;
  active: boolean;
  podId: string | null;
  podName: string | null;
  isLead: boolean;
  weeklyOffDays: number[]; // 0=Sun..6=Sat
}

export interface BrandRow {
  id: string;
  code: string;
  name: string;
  active: boolean;
  isSingleResource: boolean; // derived: uniqueEmployees ≤ 1
  rules: {
    processId: string;
    processName: string;
    processCode: string;
    operatingPattern: string;
    operatesOnHolidays: boolean;
    defaultMinStaffing: number;
  }[];
  assignedEmployeeCount: number;
}

export interface AssignmentRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  brandId: string;
  brandName: string;
  brandCode: string;
  processId: string;
  processName: string;
  processCode: string;
  isPrimary: boolean;
  active: boolean;
}

export interface LeaveRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string | null;
}

export interface CompOffRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  status: string;
  reason: string | null;
}

export interface HolidayRow {
  id: string;
  date: string;
  name: string;
  description: string | null;
  affectsAllProcesses: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  await connection(); // opt into dynamic rendering — no prerender
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    totalEmployees,
    activeEmployees,
    totalBrands,
    activeBrands,
    totalProcesses,
    pods,
    pendingLeaves,
    approvedLeavesThisMonth,
    upcomingHolidays,
    brandAssignmentGroups,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { active: true } }),
    prisma.brand.count(),
    prisma.brand.count({ where: { active: true } }),
    prisma.process.count({ where: { active: true } }),
    prisma.pod.findMany({
      include: {
        lead: { select: { name: true } },
        employees: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.leave.count({ where: { status: "PENDING" } }),
    prisma.leave.count({
      where: {
        status: "APPROVED",
        startDate: { gte: monthStart },
        endDate: { lte: monthEnd },
      },
    }),
    prisma.publicHoliday.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    // Count distinct employees per brand to derive single/multi resource
    prisma.employeeAssignment.groupBy({
      by: ["brandId"],
      where: { active: true },
      _count: { employeeId: true },
    }),
  ]);

  // Derive single-resource count: brand has ≤ 1 unique assigned employee
  let singleResourceBrandsCount = 0;
  let multiResourceBrandsCount = 0;
  for (const g of brandAssignmentGroups) {
    if (g._count.employeeId <= 1) singleResourceBrandsCount++;
    else multiResourceBrandsCount++;
  }

  // Brands with zero assignments are still single-resource conceptually
  const brandsWithNoAssignments = activeBrands - brandAssignmentGroups.length;
  singleResourceBrandsCount += brandsWithNoAssignments;

  return {
    totalEmployees,
    activeEmployees,
    totalBrands,
    activeBrands,
    totalProcesses,
    totalPods: pods.length,
    pendingLeaves,
    approvedLeavesThisMonth,
    upcomingHolidays: upcomingHolidays.map((h) => ({
      name: h.name,
      date: format(h.date, "MMM d, yyyy"),
    })),
    pods: pods.map((p) => {
      // Count how many brands have an assignment from this pod's employees
      return {
        id: p.id,
        name: p.name,
        leadName: p.lead?.name ?? null,
        memberCount: p.employees.length,
        brandCount: 0, // filled separately if needed — keep query light
      };
    }),
    singleResourceBrandsCount,
    multiResourceBrandsCount,
  };
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function getEmployees(): Promise<EmployeeRow[]> {
  await connection();
  const employees = await prisma.employee.findMany({
    include: {
      pod: { select: { id: true, name: true, leadId: true } },
      weeklyOffs: { select: { dayOfWeek: true } },
    },
    orderBy: { code: "asc" },
  });

  return employees.map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
    email: e.email,
    active: e.active,
    podId: e.podId,
    podName: e.pod?.name ?? null,
    isLead: e.pod?.leadId === e.id,
    weeklyOffDays: e.weeklyOffs.map((w) => w.dayOfWeek),
  }));
}

// ─── Pods ─────────────────────────────────────────────────────────────────────

export async function getPodsWithMembers() {
  await connection();
  return prisma.pod.findMany({
    include: {
      lead: { select: { id: true, name: true, code: true, email: true } },
      employees: {
        select: { id: true, name: true, code: true, email: true, active: true },
        orderBy: { code: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export async function getBrandsWithRules(): Promise<BrandRow[]> {
  await connection();
  const brands = await prisma.brand.findMany({
    include: {
      rules: {
        include: { process: { select: { id: true, name: true, code: true } } },
      },
      assignments: {
        where: { active: true },
        select: { employeeId: true },
      },
    },
    orderBy: { code: "asc" },
  });

  return brands.map((b) => {
    const uniqueEmployees = new Set(b.assignments.map((a) => a.employeeId)).size;
    return {
      id: b.id,
      code: b.code,
      name: b.name,
      active: b.active,
      isSingleResource: uniqueEmployees <= 1,
      assignedEmployeeCount: uniqueEmployees,
      rules: b.rules.map((r) => ({
        processId: r.processId,
        processName: r.process.name,
        processCode: r.process.code,
        operatingPattern: r.operatingPattern,
        operatesOnHolidays: r.operatesOnHolidays,
        defaultMinStaffing: r.defaultMinStaffing,
      })),
    };
  });
}

// ─── Processes ────────────────────────────────────────────────────────────────

export async function getProcesses() {
  await connection();
  return prisma.process.findMany({ orderBy: { code: "asc" } });
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function getAssignments(): Promise<AssignmentRow[]> {
  await connection();
  const rows = await prisma.employeeAssignment.findMany({
    include: {
      employee: { select: { id: true, name: true, code: true } },
      brand: { select: { id: true, name: true, code: true } },
      process: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ employee: { code: "asc" } }, { brand: { code: "asc" } }],
  });

  return rows.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    employeeCode: r.employee.code,
    brandId: r.brandId,
    brandName: r.brand.name,
    brandCode: r.brand.code,
    processId: r.processId,
    processName: r.process.name,
    processCode: r.process.code,
    isPrimary: r.isPrimary,
    active: r.active,
  }));
}

// ─── Leaves & CompOffs ────────────────────────────────────────────────────────

export async function getLeaves(): Promise<LeaveRow[]> {
  await connection();
  const rows = await prisma.leave.findMany({
    include: {
      employee: { select: { id: true, name: true, code: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    employeeCode: r.employee.code,
    startDate: format(r.startDate, "yyyy-MM-dd"),
    endDate: format(r.endDate, "yyyy-MM-dd"),
    type: r.type,
    status: r.status,
    reason: r.reason,
  }));
}

export async function getCompOffs(): Promise<CompOffRow[]> {
  await connection();
  const rows = await prisma.compOff.findMany({
    include: {
      employee: { select: { id: true, name: true, code: true } },
    },
    orderBy: { date: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    employeeCode: r.employee.code,
    date: format(r.date, "yyyy-MM-dd"),
    status: r.status,
    reason: r.reason,
  }));
}

// ─── Public Holidays ─────────────────────────────────────────────────────────

export async function getPublicHolidays(): Promise<HolidayRow[]> {
  await connection();
  const rows = await prisma.publicHoliday.findMany({ orderBy: { date: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    date: format(r.date, "yyyy-MM-dd"),
    name: r.name,
    description: r.description,
    affectsAllProcesses: r.affectsAllProcesses,
  }));
}
