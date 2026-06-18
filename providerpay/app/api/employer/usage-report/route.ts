import { NextResponse } from "next/server";
import { getUsageReport } from "@/lib/usageReport";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const { weeks, totals } = await getUsageReport();

  if (format === "csv") {
    const lines = [
      "week_start,check_ins,risk_flags,credits_used",
      ...weeks.map(
        (w) => `${w.weekStart},${w.checkIns},${w.riskFlags},${w.creditsUsed}`
      ),
      "",
      `totals,${totals.totalCheckIns},${totals.totalRiskFlags},${totals.totalCreditsUsed}`,
    ];

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="providerpay-usage-report.csv"',
      },
    });
  }

  return NextResponse.json({ weeks, totals });
}
