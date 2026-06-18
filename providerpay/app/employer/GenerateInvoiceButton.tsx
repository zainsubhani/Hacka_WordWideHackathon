"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateInvoiceButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/employer/invoices", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Could not generate invoice.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not generate invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 disabled:opacity-40"
      >
        {loading ? "Generating..." : "Generate this month's invoice"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
