"use client";

import { useState } from "react";

export default function BuyCreditsButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mollie/create-payment", {
        method: "POST",
      });
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error ?? "Could not start payment.");
        setLoading(false);
      }
    } catch {
      setError("Could not start payment.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-md bg-teal-700 py-2.5 font-medium text-white disabled:opacity-40"
      >
        {loading ? "Redirecting..." : "Buy 20 credits"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
