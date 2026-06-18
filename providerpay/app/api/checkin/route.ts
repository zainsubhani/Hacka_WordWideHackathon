import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRisk } from "@/lib/checkRisk";

async function matchListenerAndDeduct(
  employerId: string,
  checkInData:
    | { existingCheckInId: string }
    | { sliderValues: Record<string, number>; carryingText: string }
) {
  const employer = await prisma.employer.findUniqueOrThrow({
    where: { id: employerId },
  });

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
      where: { id: employerId },
      data: { creditBalance: { decrement: 1 } },
    });

    const checkInId =
      "existingCheckInId" in checkInData
        ? checkInData.existingCheckInId
        : (
            await tx.checkIn.create({
              data: {
                employerId,
                sliderValues: checkInData.sliderValues,
                carryingText: checkInData.carryingText,
                riskFlag: false,
              },
            })
          ).id;

    const transaction = await tx.transaction.create({
      data: {
        checkInId,
        listenerId: listener.id,
      },
    });

    await tx.listener.update({
      where: { id: listener.id },
      data: { available: false },
    });

    return { checkInId, transactionId: transaction.id };
  });

  return NextResponse.json({
    riskFlag: false,
    success: true,
    checkInId: result.checkInId,
    transactionId: result.transactionId,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { employerSlug, checkInId, sliderValues, carryingText } = body as {
    employerSlug?: string;
    checkInId?: string;
    sliderValues?: Record<string, number>;
    carryingText?: string;
  };

  if (checkInId) {
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: { transaction: true },
    });

    if (!existingCheckIn) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }

    if (existingCheckIn.transaction) {
      return NextResponse.json(
        { error: "This check-in has already been sent to a listener" },
        { status: 409 }
      );
    }

    return matchListenerAndDeduct(existingCheckIn.employerId, {
      existingCheckInId: existingCheckIn.id,
    });
  }

  const employer = await prisma.employer.findUnique({
    where: { slug: employerSlug },
  });

  if (!employer) {
    return NextResponse.json(
      { riskFlag: false, error: "Unknown check-in link" },
      { status: 404 }
    );
  }

  const riskFlag = await checkRisk(carryingText!);

  if (riskFlag) {
    const checkIn = await prisma.checkIn.create({
      data: {
        employerId: employer.id,
        sliderValues: sliderValues!,
        carryingText: carryingText!,
        riskFlag,
      },
    });

    console.warn(
      `[CRISIS ALERT] CheckIn ${checkIn.id} flagged risk at ${checkIn.createdAt.toISOString()}. Review immediately.`
    );

    return NextResponse.json({ riskFlag: true, showCrisisResources: true });
  }

  return matchListenerAndDeduct(employer.id, {
    sliderValues: sliderValues!,
    carryingText: carryingText!,
  });
}
