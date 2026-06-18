"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SLIDER_LABELS: Record<string, string> = {
  autonomy: "Autonomy",
  financialPressure: "Financial pressure",
  energy: "Energy",
  connection: "Connection",
};

export default function QueueItem({
  transactionId,
  carryingText,
  sliderValues,
}: {
  transactionId: string;
  carryingText: string;
  sliderValues: Record<string, number>;
}) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/listener/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, replyText }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => router.refresh(), 300);
      } else {
        setError(data.error ?? "Could not send reply.");
        setSubmitting(false);
      }
    } catch {
      setError("Could not send reply.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-5 transition-opacity duration-300 ${
        submitted ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(sliderValues).map(([key, value]) => (
          <span key={key} className="text-xs text-gray-500">
            {SLIDER_LABELS[key] ?? key}: {value}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-900">{carryingText}</p>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="mt-3 min-h-[100px] w-full rounded-md border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/30"
        placeholder="Write your reply..."
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting || replyText.trim().length === 0}
        className="mt-3 w-full rounded-md bg-teal-700 py-2.5 font-medium text-white disabled:opacity-40"
      >
        {submitting ? "Sending..." : "Send reply"}
      </button>
    </div>
  );
}
