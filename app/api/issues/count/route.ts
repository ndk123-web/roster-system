import { NextResponse } from "next/server";
import { getCurrentIssueCount } from "@/lib/queries";

// export const dynamic = "force-dynamic";

export async function GET() {
  const count = await getCurrentIssueCount();
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } },
  );
}
