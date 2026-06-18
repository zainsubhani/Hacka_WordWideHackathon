# ProviderPay

One-line pitch: an employer-funded, pay-per-use confidential check-in for
financial/provider stress. No subscriptions, no booked sessions — one
exchange per credit, no implied ongoing relationship.

## Hard constraints
- This is a one-day hackathon build. Prioritize a working end-to-end demo
  over clean architecture. Stub anything that isn't on the critical demo path.
- The employer dashboard must NEVER expose individual check-in text,
  slider values, or employee identity — aggregate counts only.
- Every check-in must pass through the risk-check step BEFORE any credit
  is deducted or listener is matched. If risk is flagged, skip credit
  deduction and matching entirely and show crisis resources instead.
- The AI suggestion shown after the "carrying" prompt is free and never
  consumes a credit. A credit is only spent if the employee explicitly
  asks to talk to a person after seeing the suggestion.
- No real money should move except small test-mode Mollie transactions.
  Always use the test API key, never a live key.
- Keep the UI flat and minimal — no marketing fluff, this is a working
  prototype, not a polished product.

## Tech stack
Next.js App Router, TypeScript, Prisma + SQLite, Tailwind, deployed to Vercel.

## Data models
- Employer: id, name, creditBalance (int)
- CheckIn: id, employerId, sliderValues (json), carryingText (string),
  riskFlag (bool), suggestionText (string, nullable), satisfied
  (bool, nullable), createdAt
- Transaction: id, checkInId, listenerId (nullable), replyText (nullable),
  repliedAt (nullable), createdAt
- Listener: id, name, available (bool)

## Risk check
A function `checkRisk(text: string): Promise<boolean>` that returns true
if the text suggests immediate danger to self or others. For the hackathon,
implement as a single call to the Anthropic API with a tightly scoped
system prompt asking for a yes/no answer only. Fall back to a basic keyword
list if no API key is configured, so the demo never breaks if a key is missing.

## AI suggestion
After the "what are you carrying" prompt and before the trusted-contact /
listener-credit choice screen, `/api/suggest` runs `checkRisk` first — if
flagged, return immediately and show crisis resources, skipping the
suggestion call entirely. Otherwise call the Anthropic API with the slider
values and carrying text for a brief, warm, non-clinical reflection (2-4
sentences, one concrete reframe, no diagnosis or therapy jargon), store it
on a new CheckIn row as `suggestionText`, and return it to the frontend.
The employee then marks the CheckIn `satisfied` true ("this helps") with no
further action, or false ("I'd like to talk to someone") before proceeding
to the existing choice screen — only the listener-credit path from there
spends a credit, and it links to this same CheckIn row rather than creating
a new one.

## Mollie integration
Use the REST API directly: POST https://api.mollie.com/v2/payments with
amount, description, redirectUrl, and webhookUrl, authenticated with the
test API key in the Authorization header. On webhook callback, fetch the
payment by id, confirm status is "paid", then increment the matching
Employer's creditBalance. Webhook must respond 200 OK regardless of what
it does internally, per Mollie's retry behavior.
