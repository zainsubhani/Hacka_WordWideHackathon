import { prisma } from "@/lib/prisma";
import BuyCreditsButton from "./BuyCreditsButton";

const LOW_CREDIT_THRESHOLD = 5;

export default async function EmployerPage() {
  const employer = await prisma.employer.findFirst();
  const [totalCheckIns, riskFlagsCaught, creditsUsed, payments] =
    await Promise.all([
      prisma.checkIn.count(),
      prisma.checkIn.count({ where: { riskFlag: true } }),
      prisma.transaction.count(),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const creditBalance = employer?.creditBalance ?? 0;
  const isLow = creditBalance <= LOW_CREDIT_THRESHOLD;

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-xl font-semibold">Employer dashboard</h1>

      <div className="space-y-1 rounded border p-4">
        <p className="text-sm text-gray-600">Credit balance</p>
        <p className="text-2xl font-semibold">{creditBalance}</p>
      </div>

      {isLow && (
        <p className="rounded border border-amber-400 bg-amber-50 p-3 text-sm text-amber-800">
          Credit balance is low — buy more to keep listener replies available.
        </p>
      )}

      <BuyCreditsButton />

      <div className="space-y-2">
        <h2 className="font-medium">Aggregate stats</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>Total check-ins: {totalCheckIns}</li>
          <li>Risk flags caught: {riskFlagsCaught}</li>
          <li>Credits used: {creditsUsed}</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">Recent payments</h2>
        {payments.length === 0 && (
          <p className="text-sm text-gray-600">No payments yet.</p>
        )}
        <ul className="space-y-1 text-sm text-gray-600">
          {payments.map((payment) => (
            <li key={payment.id} className="flex justify-between">
              <span>{payment.createdAt.toLocaleString()}</span>
              <span>
                {payment.creditsToAdd} credits — {payment.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
