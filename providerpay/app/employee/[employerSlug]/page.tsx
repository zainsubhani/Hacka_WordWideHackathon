"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type Sliders = {
  autonomy: number;
  financialPressure: number;
  energy: number;
  connection: number;
};

type Screen =
  | "sliders"
  | "carrying"
  | "choice"
  | "trustedConfirmation"
  | "listenerSuccess"
  | "crisis"
  | "error";

const SLIDER_FIELDS: { key: keyof Sliders; label: string }[] = [
  { key: "autonomy", label: "Autonomy" },
  { key: "financialPressure", label: "Financial pressure" },
  { key: "energy", label: "Energy" },
  { key: "connection", label: "Connection" },
];

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-4 text-sm text-gray-500 hover:text-gray-900"
    >
      ← Back
    </button>
  );
}

function TrustedIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-gray-400"
    >
      <path
        d="M12 20.5s-7-4.2-7-9.7A4.3 4.3 0 0 1 9.3 6.5c1.1 0 2.1.5 2.7 1.3.6-.8 1.6-1.3 2.7-1.3A4.3 4.3 0 0 1 19 10.8c0 5.5-7 9.7-7 9.7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListenerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-gray-400"
    >
      <path
        d="M4 11.5a8 8 0 1 1 5 7.4L4 20l1.1-3.4A7.9 7.9 0 0 1 4 11.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-teal-700"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3 4.7-5.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-gray-500"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {children}
    </div>
  );
}

export default function EmployeePage() {
  const { employerSlug } = useParams<{ employerSlug: string }>();
  const [screen, setScreen] = useState<Screen>("sliders");
  const [sliders, setSliders] = useState<Sliders>({
    autonomy: 5,
    financialPressure: 5,
    energy: 5,
    connection: 5,
  });
  const [carryingText, setCarryingText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkInId, setCheckInId] = useState("");

  function updateSlider(key: keyof Sliders, value: number) {
    setSliders((prev) => ({ ...prev, [key]: value }));
  }

  async function useListenerCredit() {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerSlug,
          sliderValues: sliders,
          carryingText,
        }),
      });

      const data = await response.json();

      if (data.showCrisisResources) {
        setScreen("crisis");
      } else if (data.success) {
        setCheckInId(data.checkInId);
        setScreen("listenerSuccess");
      } else {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        setScreen("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setScreen("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-[400px] px-4 py-8">
      {screen === "sliders" && (
        <Card>
          <h1 className="mb-6 text-lg font-medium text-gray-900">
            How&apos;s this week carrying you?
          </h1>
          <div className="space-y-5">
            {SLIDER_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm text-gray-900">{sliders[key]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={sliders[key]}
                  onChange={(e) => updateSlider(key, Number(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setScreen("carrying")}
            className="mt-6 w-full rounded-md bg-teal-700 py-2.5 font-medium text-white"
          >
            Continue
          </button>
        </Card>
      )}

      {screen === "carrying" && (
        <Card>
          <BackLink onClick={() => setScreen("sliders")} />
          <h1 className="mb-4 text-lg font-medium text-gray-900">
            What&apos;s one thing you&apos;re carrying right now?
          </h1>
          <textarea
            value={carryingText}
            onChange={(e) => setCarryingText(e.target.value)}
            className="min-h-[100px] w-full rounded-md border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/30"
            placeholder="Type here, or describe it however feels natural."
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-md border border-gray-200"
              aria-label="Voice input (not yet available)"
            >
              <MicIcon />
            </button>
            <button
              onClick={() => setScreen("choice")}
              disabled={carryingText.trim().length === 0}
              className="flex-1 rounded-md bg-teal-700 py-2.5 font-medium text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </Card>
      )}

      {screen === "choice" && (
        <div className="space-y-4">
          <BackLink onClick={() => setScreen("carrying")} />

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <TrustedIcon />
            <h2 className="mt-3 text-base font-medium text-gray-900">
              Send to someone you trust
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Share this with a person in your life, not a listener.
            </p>
            <button
              onClick={() => setScreen("trustedConfirmation")}
              className="mt-4 w-full rounded-md border border-gray-200 py-2.5 font-medium text-gray-900"
            >
              Send to someone you trust
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <ListenerIcon />
            <h2 className="mt-3 text-base font-medium text-gray-900">
              Use a credit for a listener reply
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              A trained listener will respond. Uses one credit.
            </p>
            <span className="mt-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-700">
              Reply within 24 hours
            </span>
            <button
              onClick={useListenerCredit}
              disabled={submitting}
              className="mt-4 w-full rounded-md bg-teal-700 py-2.5 font-medium text-white disabled:opacity-40"
            >
              {submitting ? "Sending..." : "Use a credit"}
            </button>
          </div>
        </div>
      )}

      {screen === "trustedConfirmation" && (
        <Card>
          <CheckIcon />
          <h1 className="mt-3 text-lg font-medium text-gray-900">Sent</h1>
          <p className="mt-1 text-sm text-gray-500">
            What you&apos;re carrying has been noted for you to share with someone
            you trust. No data was sent to a listener.
          </p>
        </Card>
      )}

      {screen === "listenerSuccess" && (
        <Card>
          <CheckIcon />
          <h1 className="mt-3 text-lg font-medium text-gray-900">
            A listener has been matched
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            One credit was used. You&apos;ll hear back soon.
          </p>
          <Link
            href={`/employee/status/${checkInId}`}
            className="mt-4 block w-full rounded-md border border-gray-200 py-2.5 text-center font-medium text-gray-900"
          >
            Check for a reply later
          </Link>
        </Card>
      )}

      {screen === "crisis" && (
        <Card>
          <h1 className="text-lg font-medium text-gray-900">
            You&apos;re not alone
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            What you shared suggests you might be in crisis. This wasn&apos;t
            sent to a listener. Please reach out to one of these resources
            right now:
          </p>
          <ul className="mt-4 space-y-2 rounded-md bg-gray-50 p-4 text-sm text-gray-900">
            <li>988 Suicide &amp; Crisis Lifeline — call or text 988 (US)</li>
            <li>Crisis Text Line — text HOME to 741741</li>
            <li>Emergency services — call 911 (US) or your local emergency number</li>
          </ul>
        </Card>
      )}

      {screen === "error" && (
        <Card>
          <h1 className="text-lg font-medium text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          <button
            onClick={() => setScreen("choice")}
            className="mt-4 w-full rounded-md border border-gray-200 py-2.5 font-medium text-gray-900"
          >
            Back
          </button>
        </Card>
      )}
    </main>
  );
}
