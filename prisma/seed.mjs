import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();
const year = now.getUTCFullYear();
const month = now.getUTCMonth() + 1;
const monthStart = new Date(Date.UTC(year, month - 1, 1));
const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

const dateForDay = (day) => new Date(Date.UTC(year, month - 1, day));
const dateKey = (day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const emailFor = (name) =>
  `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@datastraw.ops`;

async function main() {
  console.log("Seeding clean Smart Roster dataset...");

  await prisma.validationIssue.deleteMany({});
  await prisma.rosterAllocation.deleteMany({});
  await prisma.rosterEntry.deleteMany({});
  await prisma.roster.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.compOff.deleteMany({});
  await prisma.employeeWeeklyOff.deleteMany({});
  await prisma.employeeAssignment.deleteMany({});
  await prisma.customStaffingRule.deleteMany({});
  await prisma.brandProcessRule.deleteMany({});
  await prisma.publicHoliday.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.process.deleteMany({});
  await prisma.pod.updateMany({ data: { leadId: null } });
  await prisma.employee.deleteMany({});
  await prisma.pod.deleteMany({});

  console.log("Cleared existing data.");

  const processes = [
    {
      id: "proc-cs",
      code: "CS",
      name: "Customer Support",
      description: "Inbound client inquiries, ticketing, live chat, and complaint resolution.",
    },
    {
      id: "proc-acc",
      code: "ACC",
      name: "Abandoned Cart Conversions",
      description: "Proactive checkout recovery, customer outreach, and discount assistance.",
    },
    {
      id: "proc-ndr",
      code: "NDR",
      name: "Non-Delivery Reports",
      description: "Courier tracking, RTO reduction, address verification, and delivery coordination.",
    },
  ];

  await prisma.process.createMany({ data: processes });

  const pods = [
    { id: "pod-1", name: "Pod North", description: "GlowAura, UrbanPulse, and Kavita Organics coverage." },
    { id: "pod-2", name: "Pod Central", description: "PureNourish, EcoVibe Home, and GlowAura support coverage." },
    { id: "pod-3", name: "Pod South", description: "UrbanPulse, Kavita Organics, and PureNourish coverage." },
  ];

  await prisma.pod.createMany({ data: pods });

  const employeeNames = [
    "Anita Roy",
    "Priya Sharma",
    "Rohan Patel",
    "Kavita Nair",
    "Arjun Mehta",
    "Pooja Hegde",
    "Aman Gupta",
    "Divya Deshmukh",
    "Vikram Seth",
    "Rajesh Kumar",
    "Meera Joshi",
    "Siddharth Rao",
    "Ananya Iyer",
    "Kunal Singhania",
    "Shalini Pandey",
    "Aditya Bhat",
    "Sneha Menon",
    "Varun Chopra",
    "Tanvi Saxena",
    "Gaurav Sen",
    "Isha Kapoor",
    "Nikhil Chawla",
    "Kritika Das",
    "Harsh Vardhan",
    "Amit Verma",
    "Ritu Nambiar",
    "Deepak Pillai",
    "Simran Gill",
    "Manish Tiwari",
    "Swati Reddy",
  ];

  const employees = employeeNames.map((name, index) => ({
    id: `emp-${String(index + 1).padStart(3, "0")}`,
    code: `EMP${String(index + 1).padStart(3, "0")}`,
    name,
    email: emailFor(name),
    podId: `pod-${Math.floor(index / 10) + 1}`,
    active: true,
  }));

  const weeklyOffs = employees.map((employee, index) => ({
    employeeId: employee.id,
    dayOfWeek: index % 2 === 0 ? 0 : 1,
    effectiveFrom: monthStart,
    effectiveTo: null,
  }));

  await prisma.employee.createMany({ data: employees });
  await prisma.employeeWeeklyOff.createMany({ data: weeklyOffs });
  await prisma.pod.update({ where: { id: "pod-1" }, data: { leadId: "emp-001" } });
  await prisma.pod.update({ where: { id: "pod-2" }, data: { leadId: "emp-011" } });
  await prisma.pod.update({ where: { id: "pod-3" }, data: { leadId: "emp-021" } });

  const brands = [
    { id: "brd-01", code: "GLOW", name: "GlowAura D2C" },
    { id: "brd-02", code: "URBN", name: "UrbanPulse" },
    { id: "brd-03", code: "KAVT", name: "Kavita Organics" },
    { id: "brd-04", code: "PURE", name: "PureNourish" },
    { id: "brd-05", code: "ECOV", name: "EcoVibe Home" },
  ];

  await prisma.brand.createMany({
    data: brands.map((brand) => ({ ...brand, active: true, startDate: monthStart })),
  });

  const rules = brands.flatMap((brand, brandIndex) =>
    processes.map((process, processIndex) => ({
      id: `rule-${brandIndex + 1}-${processIndex + 1}`,
      brandId: brand.id,
      processId: process.id,
      operatingPattern: "ALL_365",
      operatesOnHolidays: true,
      defaultMinStaffing: 1,
      startDate: monthStart,
    })),
  );

  await prisma.brandProcessRule.createMany({ data: rules });

  const assignments = rules.flatMap((rule, ruleIndex) => {
    const primary = employees[ruleIndex * 2];
    const backup = employees[ruleIndex * 2 + 1];
    return [
      {
        id: `asg-${primary.code}`,
        employeeId: primary.id,
        brandId: rule.brandId,
        processId: rule.processId,
        active: true,
        isPrimary: true,
        effectiveFrom: monthStart,
        effectiveTo: null,
      },
      {
        id: `asg-${backup.code}`,
        employeeId: backup.id,
        brandId: rule.brandId,
        processId: rule.processId,
        active: true,
        isPrimary: false,
        effectiveFrom: monthStart,
        effectiveTo: null,
      },
    ];
  });

  await prisma.employeeAssignment.createMany({ data: assignments });

  const holidays = [
    {
      date: dateForDay(14),
      name: "Diwali (Festival Holiday)",
      description: "National festive holiday",
      affectsAllProcesses: true,
    },
    {
      date: dateForDay(27),
      name: "Guru Nanak Jayanti",
      description: "Gazetted public holiday",
      affectsAllProcesses: true,
    },
  ];

  await prisma.publicHoliday.createMany({ data: holidays });

  const roster = await prisma.roster.create({
    data: {
      month,
      year,
      status: "DRAFT",
      generatedAt: new Date(),
      publishedAt: null,
    },
  });

  const assignmentByEmployee = new Map(
    assignments.map((assignment) => [assignment.employeeId, assignment]),
  );
  const weeklyOffByEmployee = new Map(
    weeklyOffs.map((weeklyOff) => [weeklyOff.employeeId, weeklyOff.dayOfWeek]),
  );
  const holidayByDay = new Map(holidays.map((holiday) => [dateKey(holiday.date.getUTCDate()), holiday]));

  const entries = [];
  const allocations = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = dateForDay(day);
    const dayOfWeek = date.getUTCDay();
    const holiday = holidayByDay.get(dateKey(day));

    for (const employee of employees) {
      const assignment = assignmentByEmployee.get(employee.id);
      const isWeeklyOff = weeklyOffByEmployee.get(employee.id) === dayOfWeek;
      const shouldAllocate = !isWeeklyOff && (dayOfWeek === 0 ? !assignment.isPrimary : assignment.isPrimary);
      const entryId = `entry-${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${employee.code}`;

      let status = "UNASSIGNED";
      let notes = "Available / Unassigned";

      if (shouldAllocate) {
        status = "WORKING";
        notes = `${brands.find((brand) => brand.id === assignment.brandId).code}:${
          processes.find((process) => process.id === assignment.processId).code
        }`;
        allocations.push({
          id: `alloc-${entryId}`,
          rosterEntryId: entryId,
          brandId: assignment.brandId,
          processId: assignment.processId,
        });
      } else if (isWeeklyOff) {
        status = "WEEKLY_OFF";
        notes = "Scheduled Weekly Off";
      } else if (holiday) {
        status = "PUBLIC_HOLIDAY";
        notes = holiday.name;
      }

      entries.push({
        id: entryId,
        rosterId: roster.id,
        employeeId: employee.id,
        date,
        status,
        notes,
      });
    }
  }

  await prisma.rosterEntry.createMany({ data: entries });
  await prisma.rosterAllocation.createMany({ data: allocations });

  await prisma.auditLog.create({
    data: {
      action: "ROSTER_GENERATED",
      entity: "Roster",
      entityId: roster.id,
      details: `Seeded clean roster for ${month}/${year}: ${entries.length} entries, ${allocations.length} allocations.`,
    },
  });

  console.log(
    `Created ${employees.length} employees, ${brands.length} brands, ${rules.length} rules, ${assignments.length} assignments, ${holidays.length} holidays.`,
  );
  console.log(
    `Created clean roster ${month}/${year} with ${entries.length} entries, ${allocations.length} allocations, and 0 issues.`,
  );
  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
