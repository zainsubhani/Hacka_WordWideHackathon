import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { employerId: user.employerId },
    orderBy: { periodStart: "desc" },
  });

  return NextResponse.json({ invoices });
}

export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [transactionCount, payments] = await Promise.all([
    prisma.transaction.count({
      where: {
        checkIn: { employerId: user.employerId },
        createdAt: { gte: periodStart, lte: now },
      },
    }),
    prisma.payment.findMany({
      where: {
        employerId: user.employerId,
        status: "paid",
        createdAt: { gte: periodStart, lte: now },
      },
    }),
  ]);

  const totalAmount = payments
    .reduce((sum, p) => sum + Number(p.amountValue), 0)
    .toFixed(2);

  const invoice = await prisma.invoice.create({
    data: {
      employerId: user.employerId,
      periodStart,
      periodEnd: now,
      totalCredits: transactionCount,
      totalAmount,
    },
  });

  return NextResponse.json({ invoice });
}
