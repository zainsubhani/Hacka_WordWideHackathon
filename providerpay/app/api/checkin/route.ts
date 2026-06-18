import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRisk } from "@/lib/checkRisk";

export async function POST(request: Request) {
  const body = await request.json();
  const { employerSlug, sliderValues, carryingText } = body as {
    employerSlug: string;
    sliderValues: Record<string, number>;
    carryingText: string;
  };

  const employer = await prisma.employer.findUnique({
    where: { slug: employerSlug },
  });

  if (!employer) {
    return NextResponse.json(
      { riskFlag: false, error: "Unknown check-in link" },
      { status: 404 }
    );
  }

  const riskFlag = await checkRisk(carryingText);

  if (riskFlag) {
    const checkIn = await prisma.checkIn.create({
      data: {
        employerId: employer.id,
        sliderValues,
        carryingText,
        riskFlag,
      },
    });

    console.warn(
      `[CRISIS ALERT] CheckIn ${checkIn.id} flagged risk at ${checkIn.createdAt.toISOString()}. Review immediately.`
    );

    return NextResponse.json({ riskFlag: true, showCrisisResources: true });
  }

  if (employer.creditBalance < 1) {
    return NextResponse.json(
      { riskFlag: false, error: "No credits remaining" },
      { status: 402 }
    );
  }

  const listener = await prisma.listener.findFirst({
    where: { available: true },
  });

  if (!listener) {
    return NextResponse.json(
      { riskFlag: false, error: "No listener available" },
      { status: 503 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.employer.update({
      where: { id: employer.id },
      data: { creditBalance: { decrement: 1 } },
    });

    const checkIn = await tx.checkIn.create({
      data: {
        employerId: employer.id,
        sliderValues,
        carryingText,
        riskFlag,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        checkInId: checkIn.id,
        listenerId: listener.id,
      },
    });

    await tx.listener.update({
      where: { id: listener.id },
      data: { available: false },
    });

    return { checkIn, transaction };
  });

  return NextResponse.json({
    riskFlag: false,
    success: true,
    checkInId: result.checkIn.id,
    transactionId: result.transaction.id,
  });
}
