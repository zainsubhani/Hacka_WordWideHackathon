import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

const SESSION_COOKIE = "pp_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000;
const INVITE_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SIGNUP_TOKEN_TTL_MS = 60 * 60 * 1000;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createLoginToken(email: string) {
  return prisma.loginToken.create({
    data: {
      token: generateToken(),
      email,
      expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS),
    },
  });
}

export async function createInviteToken(email: string, employerId: string) {
  return prisma.loginToken.create({
    data: {
      token: generateToken(),
      email,
      employerId,
      expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  });
}

export async function createSignupToken(email: string, companyName: string) {
  return prisma.loginToken.create({
    data: {
      token: generateToken(),
      email,
      companyName,
      expiresAt: new Date(Date.now() + SIGNUP_TOKEN_TTL_MS),
    },
  });
}

export async function createSession(userId: string) {
  const session = await prisma.session.create({
    data: {
      token: generateToken(),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });

  return session;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}

export async function consumeLoginToken(token: string) {
  const loginToken = await prisma.loginToken.findUnique({ where: { token } });

  if (!loginToken || loginToken.consumedAt || loginToken.expiresAt < new Date()) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: loginToken.email },
  });

  const employerId = existingUser?.employerId ?? loginToken.employerId ?? null;

  if (!employerId && !loginToken.companyName) return null;

  const newEmployerSlug = !employerId
    ? await uniqueSlug(loginToken.companyName!)
    : null;

  return prisma.$transaction(async (tx) => {
    await tx.loginToken.update({
      where: { token },
      data: { consumedAt: new Date() },
    });

    if (existingUser) return existingUser;

    let finalEmployerId = employerId;

    if (!finalEmployerId) {
      const employer = await tx.employer.create({
        data: {
          name: loginToken.companyName!,
          slug: newEmployerSlug!,
          creditBalance: 0,
        },
      });
      finalEmployerId = employer.id;
    }

    return tx.user.create({
      data: { email: loginToken.email, employerId: finalEmployerId },
    });
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE);
  }
}
