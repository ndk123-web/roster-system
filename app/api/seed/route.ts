import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [employeeCount, brandCount, podCount, processCount, holidayCount] =
      await Promise.all([
        prisma.employee.count(),
        prisma.brand.count(),
        prisma.pod.count(),
        prisma.process.count(),
        prisma.publicHoliday.count(),
      ]);

    return NextResponse.json({
      status: "success",
      database: "connected",
      counts: {
        employees: employeeCount,
        brands: brandCount,
        pods: podCount,
        processes: processCount,
        holidays: holidayCount,
      },
      message:
        employeeCount > 0
          ? "Database contains seeded operational data."
          : "Database is empty. Run POST /api/seed to populate.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Database connection error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Return confirmation that seeding can be triggered
    const employeeCount = await prisma.employee.count();
    return NextResponse.json({
      status: "success",
      message: "Database seed endpoint ready.",
      currentEmployees: employeeCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Database error",
      },
      { status: 500 }
    );
  }
}
