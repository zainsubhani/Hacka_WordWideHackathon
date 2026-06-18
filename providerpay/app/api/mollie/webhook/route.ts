import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const mollieId = formData.get("id");
    const apiKey = process.env.MOLLIE_API_KEY;

    if (typeof mollieId !== "string" || !apiKey) {
      return new NextResponse(null, { status: 200 });
    }

    const mollieResponse = await fetch(
      `https://api.mollie.com/v2/payments/${mollieId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!mollieResponse.ok) {
      return new NextResponse(null, { status: 200 });
    }

    const payment = await mollieResponse.json();

    const paymentRow = await prisma.payment.findUnique({
      where: { mollieId },
    });

    if (!paymentRow) {
      return new NextResponse(null, { status: 200 });
    }

    if (payment.status === "paid" && paymentRow.status !== "paid") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { mollieId },
          data: { status: "paid" },
        }),
        prisma.employer.update({
          where: { id: paymentRow.employerId },
          data: { creditBalance: { increment: paymentRow.creditsToAdd } },
        }),
      ]);
    } else if (payment.status !== paymentRow.status) {
      await prisma.payment.update({
        where: { mollieId },
        data: { status: payment.status },
      });
    }
  } catch {
    // Always acknowledge the webhook regardless of internal outcome.
  }

  return new NextResponse(null, { status: 200 });
}
