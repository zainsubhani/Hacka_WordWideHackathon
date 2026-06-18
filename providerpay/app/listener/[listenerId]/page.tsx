import { prisma } from "@/lib/prisma";
import QueueItem from "./QueueItem";

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
      <main className="mx-auto min-h-screen max-w-[400px] px-4 py-8">
        <p className="text-sm text-gray-500">Listener not found.</p>
      </main>
    );
  }

  const queue = await prisma.transaction.findMany({
    where: { listenerId: listener.id, replyText: null },
    include: { checkIn: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-[400px] px-4 py-8">
      <h1 className="mb-4 text-lg font-medium text-gray-900">
        {listener.name}&apos;s queue
      </h1>

      {queue.length === 0 && (
        <p className="text-sm text-gray-500">No pending replies.</p>
      )}

      <div className="space-y-4">
        {queue.map((transaction) => (
          <QueueItem
            key={transaction.id}
            transactionId={transaction.id}
            carryingText={transaction.checkIn.carryingText}
            sliderValues={
              transaction.checkIn.sliderValues as Record<string, number>
            }
          />
        ))}
      </div>
    </main>
  );
}
