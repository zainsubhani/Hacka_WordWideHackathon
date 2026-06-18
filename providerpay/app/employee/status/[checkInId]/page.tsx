import { prisma } from "@/lib/prisma";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function CheckInStatusPage({
  params,
}: {
  params: { checkInId: string };
}) {
  const transaction = await prisma.transaction.findUnique({
    where: { checkInId: params.checkInId },
    include: { listener: true },
  });

  return (
    <main className="mx-auto min-h-screen max-w-[400px] px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-4 text-lg font-medium text-gray-900">
          Your check-in
        </h1>

        {!transaction && (
          <p className="text-sm text-gray-500">
            We couldn&apos;t find this check-in.
          </p>
        )}

        {transaction && !transaction.replyText && (
          <p className="text-sm text-gray-500">
            A listener has been matched. No reply yet — check back later.
          </p>
        )}

        {transaction?.replyText && (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-medium text-teal-700">
                {transaction.listener ? initials(transaction.listener.name) : "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.listener?.name ?? "Your listener"}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.repliedAt?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-md bg-gray-50 p-4 text-sm text-gray-900">
              {transaction.replyText}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
