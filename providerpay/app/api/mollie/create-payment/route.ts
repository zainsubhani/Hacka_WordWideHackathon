import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CREDITS_PER_PAYMENT = 20;

export async function POST() {
  const apiKey = process.env.MOLLIE_API_KEY;
  const baseUrl = process.env.PUBLIC_BASE_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { error: "Mollie is not configured" },
      { status: 500 }
    );
  }

  const employer = await prisma.employer.findFirstOrThrow();

  const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: "10.00" },
      description: "ProviderPay: 20 credits",
      redirectUrl: `${baseUrl}/employer`,
      webhookUrl: `${baseUrl}/api/mollie/webhook`,
    }),
  });

  if (!mollieResponse.ok) {
    return NextResponse.json(
      { error: "Failed to create Mollie payment" },
      { status: 502 }
    );
  }

  const payment = await mollieResponse.json();

  await prisma.payment.create({
    data: {
      employerId: employer.id,
      mollieId: payment.id,
      status: payment.status,
      creditsToAdd: CREDITS_PER_PAYMENT,
    },
  });

  return NextResponse.json({ checkoutUrl: payment._links.checkout.href });
}
