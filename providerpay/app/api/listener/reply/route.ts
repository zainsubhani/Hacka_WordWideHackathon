import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { transactionId, replyText } = body as {
    transactionId: string;
    replyText: string;
  };

  if (!transactionId || !replyText?.trim()) {
    return NextResponse.json(
      { error: "transactionId and replyText are required" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: { replyText, repliedAt: new Date() },
    });

    if (transaction.listenerId) {
      await tx.listener.update({
        where: { id: transaction.listenerId },
        data: { available: true },
      });
    }
  });

  return NextResponse.json({ success: true });
}
