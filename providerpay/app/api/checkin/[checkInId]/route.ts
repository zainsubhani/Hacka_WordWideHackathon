import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { checkInId: string } }
) {
  const { satisfied } = (await request.json()) as { satisfied: boolean };

  try {
    const checkIn = await prisma.checkIn.update({
      where: { id: params.checkInId },
      data: { satisfied },
    });

    return NextResponse.json({
      checkInId: checkIn.id,
      satisfied: checkIn.satisfied,
    });
  } catch {
    return NextResponse.json(
      { error: "Check-in not found" },
      { status: 404 }
    );
  }
}
