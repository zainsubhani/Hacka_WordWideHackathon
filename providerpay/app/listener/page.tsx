import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ListenerSelectPage() {
  const listeners = await prisma.listener.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-[400px] px-4 py-8">
      <h1 className="mb-4 text-lg font-medium text-gray-900">Who are you?</h1>
      <ul className="space-y-3">
        {listeners.map((listener) => (
          <li key={listener.id}>
            <Link
              href={`/listener/${listener.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="font-medium text-gray-900">{listener.name}</div>
              <div className="mt-1 text-sm text-gray-500">
                {listener.available ? "Available" : "Busy"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
