import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLoginToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      {
        error:
          "No account found for that email. Ask an admin for an invite, or sign up your company.",
      },
      { status: 404 }
    );
  }

  const loginToken = await createLoginToken(email);
  const verifyUrl = new URL(request.url);
  verifyUrl.pathname = "/api/auth/verify";
  verifyUrl.search = `?token=${loginToken.token}`;

  return NextResponse.json({ verifyUrl: verifyUrl.toString() });
}
