import { prisma } from "@/lib/prisma";
import BuyCreditsButton from "./BuyCreditsButton";

const LOW_CREDIT_THRESHOLD = 5;

export default async function EmployerPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const employer = await prisma.employer.findFirst();
  const [totalCheckIns, riskFlagsCaught, transactionsThisMonth, payments] =
    await Promise.all([
      prisma.checkIn.count(),
      prisma.checkIn.count({ where: { riskFlag: true } }),
      prisma.transaction.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const creditBalance = employer?.creditBalance ?? 0;
  const isLow = creditBalance <= LOW_CREDIT_THRESHOLD;

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-4 px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-4 text-lg font-medium text-gray-900">
          Employer dashboard
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Credits remaining</p>
            <p className="text-2xl font-semibold text-gray-900">
              {creditBalance}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Transactions this month</p>
            <p className="text-2xl font-semibold text-gray-900">
              {transactionsThisMonth}
            </p>
          </div>
        </div>

        {isLow && (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Credit balance is low — buy more to keep listener replies
            available.
          </p>
        )}

        <div className="mt-4">
          <BuyCreditsButton />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-medium text-gray-900">
          Aggregate stats
        </h2>
        <ul className="space-y-1 text-sm text-gray-500">
          <li>Total check-ins: {totalCheckIns}</li>
          <li>Risk flags caught: {riskFlagsCaught}</li>
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-medium text-gray-900">
          Recent payments
        </h2>
        {payments.length === 0 && (
          <p className="text-sm text-gray-500">No payments yet.</p>
        )}
        <ul className="space-y-1 text-sm text-gray-500">
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
