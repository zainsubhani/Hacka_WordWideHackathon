import Link from "next/link";

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-900"
    >
      {children}
    </Link>
  );
}

function CtaButtons() {
  return (
    <div className="flex gap-3">
      <PrimaryButton href="/employee">Try a check-in</PrimaryButton>
      <SecondaryButton href="/employer">For employers</SecondaryButton>
    </div>
  );
}

const STATS = [
  { number: "72%", label: "say society expects them to handle it silently" },
  { number: "1 in 3", label: "see asking for help as a weakness" },
  { number: "49%", label: "who do seek help quit before it works" },
];

const STEPS = [
  {
    title: "Check in, ninety seconds",
    description:
      "A few sliders on how the week felt, then one prompt: what's one thing you're carrying right now.",
  },
  {
    title: "Choose where it goes",
    description:
      "Send it to someone you trust, or use a credit your employer already funded for a listener's reply.",
  },
  {
    title: "One reply, nothing implied",
    description:
      "A thoughtful response within 24 hours. No next session booked, no ongoing relationship assumed.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-20 px-4 py-16">
      <section className="space-y-6">
        <h1 className="font-serif text-4xl font-medium leading-tight text-gray-900">
          Carrying it alone isn&apos;t strength.
        </h1>
        <p className="text-lg text-gray-500">
          ProviderPay is confidential support for the financial pressure of
          being a provider — no booking, no subscription, one exchange at a
          time.
        </p>
        <CtaButtons />
      </section>

      <section className="space-y-3">
        <div className="grid grid-cols-3 gap-6">
          {STATS.map((stat) => (
            <div key={stat.number}>
              <p className="font-serif text-3xl text-gray-900">{stat.number}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400">
          Source: 2,000-person survey on provider pressure, 2026.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-medium text-gray-900">How it works</h2>
        <div className="space-y-5">
          {STEPS.map((step) => (
            <div key={step.title} className="border-l-2 border-gray-200 pl-4">
              <p className="font-bold text-gray-900">{step.title}</p>
              <p className="text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-gray-900">
          Not another wellbeing subscription
        </h2>
        <p className="leading-relaxed text-gray-600">
          Most platforms sell employers a flat seat license whether anyone
          uses it or not, and quietly expect people to commit to an ongoing
          course of sessions. ProviderPay is funded as a pay-per-use credit
          pool from the financial wellness budget, not the EAP budget —
          employers pay only for exchanges that actually happen, and nothing
          about the product asks anyone to come back.
        </p>
      </section>

      <section className="space-y-6 border-t border-gray-200 pt-12 text-center">
        <p className="text-lg font-medium text-gray-900">
          Ready to see it work?
        </p>
        <div className="flex justify-center gap-3">
          <CtaButtons />
        </div>
      </section>
    </main>
  );
}
