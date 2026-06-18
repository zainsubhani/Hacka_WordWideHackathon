import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSignupToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, companyName } = (await request.json()) as {
    email?: string;
    companyName?: string;
  };

  if (!email || !companyName) {
    return NextResponse.json(
      { error: "Company name and email are required" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account already exists for that email. Log in instead." },
      { status: 409 }
    );
  }

  const loginToken = await createSignupToken(email, companyName);
  const verifyUrl = new URL(request.url);
  verifyUrl.pathname = "/api/auth/verify";
  verifyUrl.search = `?token=${loginToken.token}`;

  return NextResponse.json({ verifyUrl: verifyUrl.toString() });
}
