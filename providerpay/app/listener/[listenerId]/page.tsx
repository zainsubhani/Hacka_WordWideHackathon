import { prisma } from "@/lib/prisma";
import ReplyForm from "./ReplyForm";

export default async function ListenerQueuePage({
  params,
}: {
  params: { listenerId: string };
}) {
  const listener = await prisma.listener.findUnique({
    where: { id: params.listenerId },
  });

  if (!listener) {
    return (
      <main className="mx-auto max-w-md p-6">
        <p>Listener not found.</p>
      </main>
    );
  }

  const queue = await prisma.transaction.findMany({
    where: { listenerId: listener.id, replyText: null },
    include: { checkIn: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-xl font-semibold">{listener.name}&apos;s queue</h1>

      {queue.length === 0 && (
        <p className="text-sm text-gray-600">No pending replies.</p>
      )}

      <div className="space-y-6">
        {queue.map((transaction) => (
          <div key={transaction.id} className="space-y-3 rounded border p-4">
            <p className="text-sm">{transaction.checkIn.carryingText}</p>
            <ReplyForm transactionId={transaction.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
