import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function EmployeeRedirectPage() {
  const employer = await prisma.employer.findFirst();

  if (!employer) {
    redirect("/");
  }

  redirect(`/employee/${employer.slug}`);
}
