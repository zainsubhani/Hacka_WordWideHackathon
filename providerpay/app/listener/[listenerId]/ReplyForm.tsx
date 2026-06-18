"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReplyForm({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
        router.refresh();
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
    <div className="space-y-2">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows={3}
        className="w-full rounded border p-2"
        placeholder="Write your reply..."
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting || replyText.trim().length === 0}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-40"
      >
        {submitting ? "Sending..." : "Send reply"}
      </button>
    </div>
  );
}
