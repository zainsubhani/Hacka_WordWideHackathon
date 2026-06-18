import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ListenerSelectPage() {
  const listeners = await prisma.listener.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-semibold">Who are you?</h1>
      <ul className="space-y-2">
        {listeners.map((listener) => (
          <li key={listener.id}>
            <Link
              href={`/listener/${listener.id}`}
              className="block rounded border p-4"
            >
              <div className="font-medium">{listener.name}</div>
              <div className="text-sm text-gray-600">
                {listener.available ? "Available" : "Busy"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
