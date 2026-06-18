import { prisma } from "@/lib/prisma";

const WEEKS = 8;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1) - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getUsageReport() {
  const earliestWeekStart = new Date(
    startOfWeek(new Date()).getTime() - (WEEKS - 1) * MS_PER_WEEK
  );

  const [checkIns, payments] = await Promise.all([
    prisma.checkIn.findMany({
      where: { createdAt: { gte: earliestWeekStart } },
      select: {
        createdAt: true,
        riskFlag: true,
        transaction: { select: { id: true } },
      },
    }),
    prisma.payment.findMany({ where: { status: "paid" } }),
  ]);

  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const weekStart = new Date(earliestWeekStart.getTime() + i * MS_PER_WEEK);
    const weekEnd = new Date(weekStart.getTime() + MS_PER_WEEK);
    const inWeek = checkIns.filter(
      (c) => c.createdAt >= weekStart && c.createdAt < weekEnd
    );

    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      checkIns: inWeek.length,
      riskFlags: inWeek.filter((c) => c.riskFlag).length,
      creditsUsed: inWeek.filter((c) => c.transaction).length,
    };
  });

  const totals = {
    totalCheckIns: checkIns.length,
    totalRiskFlags: checkIns.filter((c) => c.riskFlag).length,
    totalCreditsUsed: checkIns.filter((c) => c.transaction).length,
    totalCreditsPurchased: payments.reduce((sum, p) => sum + p.creditsToAdd, 0),
    totalAmountPaid: payments
      .reduce((sum, p) => sum + Number(p.amountValue), 0)
      .toFixed(2),
  };

  return { weeks, totals };
}
