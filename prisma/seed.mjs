import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with DataStraw Assessment dataset...");

  // 1. Clean existing records (in reverse dependency order)
  await prisma.validationIssue.deleteMany({});
  await prisma.rosterAllocation.deleteMany({});
  await prisma.rosterEntry.deleteMany({});
  await prisma.roster.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.compOff.deleteMany({});
  await prisma.employeeWeeklyOff.deleteMany({});
  await prisma.employeeAssignment.deleteMany({});
  await prisma.customStaffingRule.deleteMany({});
  await prisma.brandProcessRule.deleteMany({});
  await prisma.publicHoliday.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.process.deleteMany({});
  
  // Unlink leads before deleting pods/employees
  await prisma.pod.updateMany({ data: { leadId: null } });
  await prisma.employee.deleteMany({});
  await prisma.pod.deleteMany({});

  console.log("Cleared existing data.");

  // 2. Insert Processes
  const processes = [
    { id: "proc-cs", code: "CS", name: "Customer Support", description: "Inbound client inquiries, ticketing, live chat, and complaint resolution." },
    { id: "proc-acc", code: "ACC", name: "Abandoned Cart Conversions", description: "Proactive checkout recovery, customer outreach, and discount assistance." },
    { id: "proc-ndr", code: "NDR", name: "Non-Delivery Reports", description: "Courier tracking, RTO reduction, address verification, and delivery coordination." },
    { id: "proc-ret", code: "RET", name: "Customer Retention", description: "VIP retention, repeat purchase campaigns, and satisfaction follow-ups." },
  ];
  for (const proc of processes) {
    await prisma.process.create({ data: proc });
  }
  console.log(`Created ${processes.length} core processes.`);

  // 3. Insert Pods (initial without leadId)
  const pods = [
    { id: "pod-1", name: "Pod North (Flagship D2C)", description: "Handles Tier-1 cosmetics and lifestyle D2C client brands." },
    { id: "pod-2", name: "Pod South (Retention & NDR)", description: "Specialized logistics coordination, RTO management, and customer recovery." },
    { id: "pod-3", name: "Pod East (High-Volume Support)", description: "High-ticket consumer electronics, accessories, and 24/7 client care." },
    { id: "pod-4", name: "Pod West (Specialized Brands)", description: "Health, nutrition, apparel, and emerging direct-to-consumer accounts." },
  ];
  for (const pod of pods) {
    await prisma.pod.create({ data: pod });
  }

  // 4. Insert 32 Employees
  const employees = [
    // POD 1 (emp-001 to emp-008)
    { id: "emp-001", code: "EMP001", name: "Anita Roy", email: "anita.roy@datastraw.ops", podId: "pod-1", weeklyOff: 0 },
    { id: "emp-002", code: "EMP002", name: "Priya Sharma", email: "priya.sharma@datastraw.ops", podId: "pod-1", weeklyOff: 0 },
    { id: "emp-003", code: "EMP003", name: "Rohan Patel", email: "rohan.patel@datastraw.ops", podId: "pod-1", weeklyOff: 1 },
    { id: "emp-004", code: "EMP004", name: "Kavita Nair", email: "kavita.nair@datastraw.ops", podId: "pod-1", weeklyOff: 2 },
    { id: "emp-005", code: "EMP005", name: "Arjun Mehta", email: "arjun.mehta@datastraw.ops", podId: "pod-1", weeklyOff: 3 },
    { id: "emp-006", code: "EMP006", name: "Pooja Hegde", email: "pooja.hegde@datastraw.ops", podId: "pod-1", weeklyOff: 4 },
    { id: "emp-007", code: "EMP007", name: "Aman Gupta", email: "aman.gupta@datastraw.ops", podId: "pod-1", weeklyOff: 5 },
    { id: "emp-008", code: "EMP008", name: "Divya Deshmukh", email: "divya.deshmukh@datastraw.ops", podId: "pod-1", weeklyOff: 6 },

    // POD 2 (emp-009 to emp-016)
    { id: "emp-009", code: "EMP009", name: "Vikram Seth", email: "vikram.seth@datastraw.ops", podId: "pod-2", weeklyOff: 0 },
    { id: "emp-010", code: "EMP010", name: "Rajesh Kumar", email: "rajesh.kumar@datastraw.ops", podId: "pod-2", weeklyOff: 0 },
    { id: "emp-011", code: "EMP011", name: "Meera Joshi", email: "meera.joshi@datastraw.ops", podId: "pod-2", weeklyOff: 1 },
    { id: "emp-012", code: "EMP012", name: "Siddharth Rao", email: "siddharth.rao@datastraw.ops", podId: "pod-2", weeklyOff: 2 },
    { id: "emp-013", code: "EMP013", name: "Ananya Iyer", email: "ananya.iyer@datastraw.ops", podId: "pod-2", weeklyOff: 3 },
    { id: "emp-014", code: "EMP014", name: "Kunal Singhania", email: "kunal.singhania@datastraw.ops", podId: "pod-2", weeklyOff: 4 },
    { id: "emp-015", code: "EMP015", name: "Shalini Pandey", email: "shalini.pandey@datastraw.ops", podId: "pod-2", weeklyOff: 5 },
    { id: "emp-016", code: "EMP016", name: "Aditya Bhat", email: "aditya.bhat@datastraw.ops", podId: "pod-2", weeklyOff: 6 },

    // POD 3 (emp-017 to emp-024)
    { id: "emp-017", code: "EMP017", name: "Sneha Menon", email: "sneha.menon@datastraw.ops", podId: "pod-3", weeklyOff: 0 },
    { id: "emp-018", code: "EMP018", name: "Varun Chopra", email: "varun.chopra@datastraw.ops", podId: "pod-3", weeklyOff: 1 },
    { id: "emp-019", code: "EMP019", name: "Tanvi Saxena", email: "tanvi.saxena@datastraw.ops", podId: "pod-3", weeklyOff: 2 },
    { id: "emp-020", code: "EMP020", name: "Gaurav Sen", email: "gaurav.sen@datastraw.ops", podId: "pod-3", weeklyOff: 3 },
    { id: "emp-021", code: "EMP021", name: "Isha Kapoor", email: "isha.kapoor@datastraw.ops", podId: "pod-3", weeklyOff: 4 },
    { id: "emp-022", code: "EMP022", name: "Nikhil Chawla", email: "nikhil.chawla@datastraw.ops", podId: "pod-3", weeklyOff: 5 },
    { id: "emp-023", code: "EMP023", name: "Kritika Das", email: "kritika.das@datastraw.ops", podId: "pod-3", weeklyOff: 6 },
    { id: "emp-024", code: "EMP024", name: "Harsh Vardhan", email: "harsh.vardhan@datastraw.ops", podId: "pod-3", weeklyOff: 0 },

    // POD 4 (emp-025 to emp-032)
    { id: "emp-025", code: "EMP025", name: "Amit Verma", email: "amit.verma@datastraw.ops", podId: "pod-4", weeklyOff: 0 },
    { id: "emp-026", code: "EMP026", name: "Ritu Nambiar", email: "ritu.nambiar@datastraw.ops", podId: "pod-4", weeklyOff: 1 },
    { id: "emp-027", code: "EMP027", name: "Deepak Pillai", email: "deepak.pillai@datastraw.ops", podId: "pod-4", weeklyOff: 2 },
    { id: "emp-028", code: "EMP028", name: "Simran Gill", email: "simran.gill@datastraw.ops", podId: "pod-4", weeklyOff: 3 },
    { id: "emp-029", code: "EMP029", name: "Manish Tiwari", email: "manish.tiwari@datastraw.ops", podId: "pod-4", weeklyOff: 4 },
    { id: "emp-030", code: "EMP030", name: "Swati Reddy", email: "swati.reddy@datastraw.ops", podId: "pod-4", weeklyOff: 5 },
    { id: "emp-031", code: "EMP031", name: "Karan Malhotra", email: "karan.malhotra@datastraw.ops", podId: "pod-4", weeklyOff: 6 },
    { id: "emp-032", code: "EMP032", name: "Neha Roy", email: "neha.roy@datastraw.ops", podId: "pod-4", weeklyOff: 0 },
  ];

  for (const emp of employees) {
    await prisma.employee.create({
      data: {
        id: emp.id,
        code: emp.code,
        name: emp.name,
        email: emp.email,
        podId: emp.podId,
        active: true,
      },
    });

    // Create weekly off
    await prisma.employeeWeeklyOff.create({
      data: {
        employeeId: emp.id,
        dayOfWeek: emp.weeklyOff,
      },
    });
  }
  console.log(`Created ${employees.length} employees with weekly off schedules.`);

  // Update Pod Leads
  await prisma.pod.update({ where: { id: "pod-1" }, data: { leadId: "emp-001" } });
  await prisma.pod.update({ where: { id: "pod-2" }, data: { leadId: "emp-009" } });
  await prisma.pod.update({ where: { id: "pod-3" }, data: { leadId: "emp-017" } });
  await prisma.pod.update({ where: { id: "pod-4" }, data: { leadId: "emp-025" } });
  console.log("Assigned Pod Leads.");

  // 5. Insert 15 Brands (~80% single-resource, ~20% multi-resource)
  const brands = [
    { id: "brd-01", code: "GLOW", name: "GlowAura D2C" },
    { id: "brd-02", code: "URBN", name: "UrbanPulse" },
    { id: "brd-03", code: "KAVT", name: "Kavita Organics" },
    { id: "brd-04", code: "PURE", name: "PureNourish" },
    { id: "brd-05", code: "ECOV", name: "EcoVibe Home" },
    { id: "brd-06", code: "BEAU", name: "BellaBotanics" },
    { id: "brd-07", code: "NOVA", name: "NovaSound Audio" },
    { id: "brd-08", code: "STEP", name: "StrideFootwear" },
    { id: "brd-09", code: "SNAC", name: "NutriCrunch Foods" },
    { id: "brd-10", code: "FITP", name: "FitPro Activewear" },
    { id: "brd-11", code: "LUMX", name: "Lumina Skin" },
    { id: "brd-12", code: "ZENL", name: "ZenLiving Decor" },
    { id: "brd-13", code: "AURA", name: "AuraLifestyle Direct" }, // Multi-resource
    { id: "brd-14", code: "VELO", name: "Velora Tech Gear" },    // Multi-resource
    { id: "brd-15", code: "NEXU", name: "Nexus Healthcare" },   // Multi-resource
  ];

  for (const b of brands) {
    await prisma.brand.create({ data: { id: b.id, code: b.code, name: b.name, active: true } });
  }
  console.log(`Created ${brands.length} D2C client brands.`);

  // 6. Brand Operating Rules
  const rules = [
    // GlowAura (CS operates 365 days including Sundays & Holidays)
    { brandId: "brd-01", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, defaultMinStaffing: 1 },
    { brandId: "brd-01", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },
    { brandId: "brd-01", processId: "proc-ndr", operatingPattern: "SUNDAYS_AND_HOLIDAYS_OFF", operatesOnHolidays: false, defaultMinStaffing: 1 },

    // UrbanPulse
    { brandId: "brd-02", processId: "proc-cs", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },
    { brandId: "brd-02", processId: "proc-ndr", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },

    // Kavita Organics
    { brandId: "brd-03", processId: "proc-cs", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },
    { brandId: "brd-03", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },

    // AuraLifestyle (Multi-resource: CS needs 2 headcount, operates 365)
    { brandId: "brd-13", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, defaultMinStaffing: 2 },
    { brandId: "brd-13", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },
    { brandId: "brd-13", processId: "proc-ret", operatingPattern: "SUNDAYS_AND_HOLIDAYS_OFF", operatesOnHolidays: false, defaultMinStaffing: 1 },

    // Velora Tech Gear
    { brandId: "brd-14", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, defaultMinStaffing: 1 },
    { brandId: "brd-14", processId: "proc-ndr", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },

    // Nexus Healthcare
    { brandId: "brd-15", processId: "proc-cs", operatingPattern: "ALL_365", operatesOnHolidays: true, defaultMinStaffing: 1 },
    { brandId: "brd-15", processId: "proc-acc", operatingPattern: "DAILY_EXCEPT_HOLIDAYS", operatesOnHolidays: false, defaultMinStaffing: 1 },
  ];

  for (const r of rules) {
    await prisma.brandProcessRule.create({ data: r });
  }
  console.log(`Created ${rules.length} brand-process operating rules.`);

  // 7. Employee Assignments
  const assignments = [
    // GlowAura (Single-resource: Priya Sharma handles all processes)
    { employeeId: "emp-002", brandId: "brd-01", processId: "proc-cs", isPrimary: true },
    { employeeId: "emp-002", brandId: "brd-01", processId: "proc-acc", isPrimary: true },
    { employeeId: "emp-002", brandId: "brd-01", processId: "proc-ndr", isPrimary: true },

    // UrbanPulse (Single-resource: Rajesh Kumar)
    { employeeId: "emp-010", brandId: "brd-02", processId: "proc-cs", isPrimary: true },
    { employeeId: "emp-010", brandId: "brd-02", processId: "proc-ndr", isPrimary: true },

    // Kavita Organics (Rohan Patel)
    { employeeId: "emp-003", brandId: "brd-03", processId: "proc-cs", isPrimary: true },
    { employeeId: "emp-003", brandId: "brd-03", processId: "proc-acc", isPrimary: true },

    // AuraLifestyle (3 employees: Varun Chopra, Tanvi Saxena, Gaurav Sen)
    { employeeId: "emp-018", brandId: "brd-13", processId: "proc-cs", isPrimary: true },
    { employeeId: "emp-019", brandId: "brd-13", processId: "proc-cs", isPrimary: true }, // sharing CS for 2 headcount
    { employeeId: "emp-020", brandId: "brd-13", processId: "proc-acc", isPrimary: true },

    // Velora Tech Gear (Rohan Patel overlapping & Kunal Singhania)
    { employeeId: "emp-003", brandId: "brd-14", processId: "proc-cs", isPrimary: false },
    { employeeId: "emp-014", brandId: "brd-14", processId: "proc-ndr", isPrimary: true },

    // Nexus Healthcare
    { employeeId: "emp-026", brandId: "brd-15", processId: "proc-cs", isPrimary: true },
    { employeeId: "emp-027", brandId: "brd-15", processId: "proc-acc", isPrimary: true },
  ];

  for (const a of assignments) {
    await prisma.employeeAssignment.create({ data: a });
  }
  console.log(`Created ${assignments.length} assignments.`);

  // 8. Public Holidays
  const holidays = [
    { date: new Date("2026-11-14T00:00:00.000Z"), name: "Diwali (Festival Holiday)", description: "National festive holiday", affectsAllProcesses: true },
    { date: new Date("2026-11-27T00:00:00.000Z"), name: "Guru Nanak Jayanti", description: "Gazetted public holiday", affectsAllProcesses: true },
  ];
  for (const h of holidays) {
    await prisma.publicHoliday.create({ data: h });
  }
  console.log(`Created ${holidays.length} public holidays.`);

  // 9. Leaves & Comp-Offs
  await prisma.leave.create({
    data: {
      employeeId: "emp-002", // Priya Sharma
      startDate: new Date("2026-11-15T00:00:00.000Z"),
      endDate: new Date("2026-11-16T00:00:00.000Z"),
      type: "SICK",
      status: "APPROVED",
      reason: "Medical procedure (creates single-resource coverage gap on Sunday Nov 15)",
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: "emp-006",
      startDate: new Date("2026-11-08T00:00:00.000Z"),
      endDate: new Date("2026-11-09T00:00:00.000Z"),
      type: "CASUAL",
      status: "APPROVED",
      reason: "Personal family event",
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: "emp-021",
      startDate: new Date("2026-11-22T00:00:00.000Z"),
      endDate: new Date("2026-11-23T00:00:00.000Z"),
      type: "PLANNED",
      status: "PENDING",
      reason: "Out of station travel (pending approval)",
    },
  });

  await prisma.compOff.create({
    data: {
      employeeId: "emp-010", // Rajesh Kumar
      date: new Date("2026-11-20T00:00:00.000Z"),
      status: "APPROVED",
      reason: "Approved comp-off for working prior national holiday",
    },
  });
  console.log("Created leaves and comp-offs.");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
