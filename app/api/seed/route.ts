import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const run = promisify(execFile);

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
          : "Database is empty. Run POST /api/seed with the configured seed token.",
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

export async function POST(request: Request) {
  const configuredToken = process.env.SEED_API_TOKEN;
  if (!configuredToken) {
    return NextResponse.json(
      { status: "error", message: "SEED_API_TOKEN is not configured." },
      { status: 503 },
    );
  }

  if (request.headers.get("x-seed-token") !== configuredToken) {
    return NextResponse.json({ status: "error", message: "Unauthorized." }, { status: 401 });
  }

  try {
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    await run(command, ["run", "db:seed"], {
      cwd: process.cwd(),
      env: process.env,
      shell: process.platform === "win32",
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024,
    });

    return NextResponse.json({
      status: "success",
      message: "Database reset and seeded successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Could not seed database.",
      },
      { status: 500 },
    );
  }
}
