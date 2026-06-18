import { NextResponse } from "next/server";
import { getSessionUser, createInviteToken } from "@/lib/auth";

export async function POST(request: Request) {
  const currentUser = await getSessionUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const loginToken = await createInviteToken(email, currentUser.employerId);
  const verifyUrl = new URL(request.url);
  verifyUrl.pathname = "/api/auth/verify";
  verifyUrl.search = `?token=${loginToken.token}`;

  return NextResponse.json({ verifyUrl: verifyUrl.toString() });
}
