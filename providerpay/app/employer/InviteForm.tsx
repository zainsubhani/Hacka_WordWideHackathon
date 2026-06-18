"use client";

import { useState } from "react";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInviteUrl("");

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not create an invite.");
        return;
      }

      setInviteUrl(data.verifyUrl);
      setEmail("");
    } catch {
      setError("Could not create an invite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
          className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 disabled:opacity-40"
        >
          {loading ? "Inviting..." : "Invite"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {inviteUrl && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="mb-1 text-gray-500">
            Demo mode — share this invite link directly:
          </p>
          <a href={inviteUrl} className="break-all text-gray-900 underline">
            {inviteUrl}
          </a>
        </div>
      )}
    </div>
  );
}
