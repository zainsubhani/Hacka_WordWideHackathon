import { prisma } from "@/lib/prisma";
import BuyCreditsButton from "./BuyCreditsButton";

export default async function EmployerPage() {
  const employer = await prisma.employer.findFirst();

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-xl font-semibold">Employer dashboard</h1>
      <p className="text-sm text-gray-600">
        Credit balance: {employer?.creditBalance ?? 0}
      </p>
      <BuyCreditsButton />
    </main>
  );
}
