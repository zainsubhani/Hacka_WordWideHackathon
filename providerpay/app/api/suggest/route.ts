import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRisk } from "@/lib/checkRisk";
import { getSuggestion } from "@/lib/suggest";

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
      { error: "Unknown check-in link" },
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

  const suggestionText = await getSuggestion(sliderValues, carryingText);

  const checkIn = await prisma.checkIn.create({
    data: {
      employerId: employer.id,
      sliderValues,
      carryingText,
      riskFlag: false,
      suggestionText,
    },
  });

  return NextResponse.json({
    riskFlag: false,
    checkInId: checkIn.id,
    suggestionText,
  });
}
