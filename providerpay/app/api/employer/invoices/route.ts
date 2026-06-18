import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { periodStart: "desc" },
  });

  return NextResponse.json({ invoices });
}

export async function POST() {
  const employer = await prisma.employer.findFirstOrThrow();

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [transactionCount, payments] = await Promise.all([
    prisma.transaction.count({
      where: { createdAt: { gte: periodStart, lte: now } },
    }),
    prisma.payment.findMany({
      where: {
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
      employerId: employer.id,
      periodStart,
      periodEnd: now,
      totalCredits: transactionCount,
      totalAmount,
    },
  });

  return NextResponse.json({ invoice });
}
