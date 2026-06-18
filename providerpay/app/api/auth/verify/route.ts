import { NextResponse } from "next/server";
import { consumeLoginToken, createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/employer/login?error=invalid`);
  }

  const user = await consumeLoginToken(token);

  if (!user) {
    return NextResponse.redirect(`${origin}/employer/login?error=expired`);
  }

  await createSession(user.id);

  return NextResponse.redirect(`${origin}/employer`);
}
