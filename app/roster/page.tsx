import { connection } from "next/server";
import { RosterWorkbench } from "@/components/roster/roster-workbench";
import { getRosterView } from "@/modules/roster/db-service";

export const metadata = {
  title: "Monthly Roster | Smart Roster Management",
};

function parsePeriod(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  await connection();
  const query = await searchParams;
  const now = new Date();
  const month = parsePeriod(query.month, now.getMonth() + 1, 1, 12);
  const year = parsePeriod(query.year, now.getFullYear(), 2000, 2100);
  const view = await getRosterView(month, year);

  return <RosterWorkbench view={view} month={month} year={year} />;
}
