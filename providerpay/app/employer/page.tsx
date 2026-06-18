import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getUsageReport } from "@/lib/usageReport";
import BuyCreditsButton from "./BuyCreditsButton";
import GenerateInvoiceButton from "./GenerateInvoiceButton";
import InviteForm from "./InviteForm";

const LOW_CREDIT_THRESHOLD = 5;

export default async function EmployerPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/employer/login");
  }

  const employerId = user.employerId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    employer,
    totalCheckIns,
    riskFlagsCaught,
    transactionsThisMonth,
    payments,
    invoices,
    teammates,
    usageReport,
  ] = await Promise.all([
    prisma.employer.findUniqueOrThrow({ where: { id: employerId } }),
    prisma.checkIn.count({ where: { employerId } }),
    prisma.checkIn.count({ where: { employerId, riskFlag: true } }),
    prisma.transaction.count({
      where: {
        checkIn: { employerId },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.payment.findMany({
      where: { employerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { employerId },
      orderBy: { periodStart: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      where: { employerId },
      orderBy: { createdAt: "asc" },
    }),
    getUsageReport(employerId),
  ]);

  const creditBalance = employer.creditBalance;
  const isLow = creditBalance <= LOW_CREDIT_THRESHOLD;
  const maxWeeklyCheckIns = Math.max(
    1,
    ...usageReport.weeks.map((w) => w.checkIns)
  );

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-4 px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900">
              {employer.name}
            </h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 underline hover:text-gray-900"
            >
              Log out
            </button>
          </form>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Check-in link for your team:{" "}
          <span className="font-mono text-gray-900">
            /employee/{employer.slug}
          </span>
        </p>

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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">
            Usage, last 8 weeks
          </h2>
          <a
            href="/api/employer/usage-report?format=csv"
            className="text-sm text-gray-500 underline hover:text-gray-900"
          >
            Download CSV
          </a>
        </div>
        <div className="space-y-1.5">
          {usageReport.weeks.map((week) => (
            <div key={week.weekStart} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-gray-500">
                {week.weekStart}
              </span>
              <div className="h-3 flex-1 rounded-sm bg-gray-50">
                <div
                  className="h-3 rounded-sm bg-gray-900"
                  style={{
                    width: `${(week.checkIns / maxWeeklyCheckIns) * 100}%`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-gray-500">
                {week.checkIns}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-medium text-gray-900">
          Spend summary
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Credits purchased</p>
            <p className="text-2xl font-semibold text-gray-900">
              {usageReport.totals.totalCreditsPurchased}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Total paid</p>
            <p className="text-2xl font-semibold text-gray-900">
              €{usageReport.totals.totalAmountPaid}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Invoices</h2>
          <GenerateInvoiceButton />
        </div>
        {invoices.length === 0 && (
          <p className="text-sm text-gray-500">No invoices generated yet.</p>
        )}
        <ul className="space-y-1 text-sm text-gray-500">
          {invoices.map((invoice) => (
            <li key={invoice.id} className="flex justify-between">
              <span>
                {invoice.periodStart.toLocaleDateString()} –{" "}
                {invoice.periodEnd.toLocaleDateString()}
              </span>
              <span>
                {invoice.totalCredits} credits — €{invoice.totalAmount} —{" "}
                {invoice.status}
              </span>
            </li>
          ))}
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

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-medium text-gray-900">Team</h2>
        <ul className="mb-3 space-y-1 text-sm text-gray-500">
          {teammates.map((teammate) => (
            <li key={teammate.id} className="flex justify-between">
              <span>{teammate.email}</span>
              <span>{teammate.role}</span>
            </li>
          ))}
        </ul>
        <InviteForm />
      </div>
    </main>
  );
}
