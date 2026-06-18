import { prisma } from "@/lib/prisma";

export default async function CheckInStatusPage({
  params,
}: {
  params: { checkInId: string };
}) {
  const transaction = await prisma.transaction.findUnique({
    where: { checkInId: params.checkInId },
  });

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-semibold">Your check-in</h1>
      {!transaction && (
        <p className="text-sm text-gray-600">
          We couldn&apos;t find this check-in.
        </p>
      )}
      {transaction && !transaction.replyText && (
        <p className="text-sm text-gray-600">
          A listener has been matched. No reply yet — check back later.
        </p>
      )}
      {transaction?.replyText && (
        <div className="space-y-2 rounded border p-4">
          <p className="text-sm">{transaction.replyText}</p>
          <p className="text-xs text-gray-500">
            Replied {transaction.repliedAt?.toLocaleString()}
          </p>
        </div>
      )}
    </main>
  );
}
