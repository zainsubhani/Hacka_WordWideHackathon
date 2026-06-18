"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "expired") {
      setError("That link expired or was already used. Request a new one.");
    } else if (params.get("error") === "invalid") {
      setError("That link is invalid. Request a new one.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVerifyUrl("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not send a login link.");
        return;
      }

      setVerifyUrl(data.verifyUrl);
    } catch {
      setError("Could not send a login link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm space-y-4 px-4 py-16">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-1 text-lg font-medium text-gray-900">
          Employer login
        </h1>
        <p className="mb-4 text-sm text-gray-500">
          Enter your email and we&apos;ll send a login link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send login link"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {verifyUrl && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
            <p className="mb-1 text-gray-500">
              Demo mode — no email is sent. Use this link to continue:
            </p>
            <a
              href={verifyUrl}
              className="break-all text-gray-900 underline"
            >
              {verifyUrl}
            </a>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">
          No account yet?{" "}
          <Link href="/employer/signup" className="text-gray-900 underline">
            Sign up your company
          </Link>
        </p>
      </div>
    </main>
  );
}
