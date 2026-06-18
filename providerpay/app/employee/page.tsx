"use client";

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

export default function EmployeePage() {
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
        body: JSON.stringify({ sliderValues: sliders, carryingText }),
      });

      const data = await response.json();

      if (data.showCrisisResources) {
        setScreen("crisis");
      } else if (data.success) {
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
    <main className="mx-auto max-w-md p-6">
      {screen === "sliders" && (
        <div className="space-y-6">
          <h1 className="text-xl font-semibold">Check in with yourself</h1>
          {SLIDER_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{label}</span>
                <span>{sliders[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={sliders[key]}
                onChange={(e) => updateSlider(key, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
          <button
            onClick={() => setScreen("carrying")}
            className="w-full rounded bg-black px-4 py-2 text-white"
          >
            Next
          </button>
        </div>
      )}

      {screen === "carrying" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">
            What&apos;s one thing you&apos;re carrying right now?
          </h1>
          <textarea
            value={carryingText}
            onChange={(e) => setCarryingText(e.target.value)}
            rows={6}
            className="w-full rounded border p-3"
            placeholder="Type freely..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setScreen("sliders")}
              className="w-full rounded border px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={() => setScreen("choice")}
              disabled={carryingText.trim().length === 0}
              className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {screen === "choice" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">What do you want to do?</h1>
          <button
            onClick={() => setScreen("trustedConfirmation")}
            className="w-full rounded border p-4 text-left"
          >
            <div className="font-medium">Send to someone you trust</div>
            <div className="text-sm text-gray-600">
              Share this with a person in your life, not a listener.
            </div>
          </button>
          <button
            onClick={useListenerCredit}
            disabled={submitting}
            className="w-full rounded border p-4 text-left disabled:opacity-40"
          >
            <div className="font-medium">Use a credit for a listener reply</div>
            <div className="text-sm text-gray-600">
              {submitting
                ? "Sending..."
                : "A trained listener will respond. Uses one credit."}
            </div>
          </button>
          <button
            onClick={() => setScreen("carrying")}
            className="w-full rounded border px-4 py-2"
          >
            Back
          </button>
        </div>
      )}

      {screen === "trustedConfirmation" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Sent</h1>
          <p className="text-sm text-gray-600">
            What you&apos;re carrying has been noted for you to share with someone
            you trust. No data was sent to a listener.
          </p>
        </div>
      )}

      {screen === "listenerSuccess" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">A listener has been matched</h1>
          <p className="text-sm text-gray-600">
            One credit was used. You&apos;ll hear back soon.
          </p>
        </div>
      )}

      {screen === "crisis" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">You&apos;re not alone</h1>
          <p className="text-sm text-gray-600">
            What you shared suggests you might be in crisis. This wasn&apos;t sent
            to a listener. Please reach out to one of these resources right now:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>988 Suicide &amp; Crisis Lifeline — call or text 988 (US)</li>
            <li>Crisis Text Line — text HOME to 741741</li>
            <li>Emergency services — call 911 (US) or your local emergency number</li>
          </ul>
        </div>
      )}

      {screen === "error" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-600">{errorMessage}</p>
          <button
            onClick={() => setScreen("choice")}
            className="w-full rounded border px-4 py-2"
          >
            Back
          </button>
        </div>
      )}
    </main>
  );
}
