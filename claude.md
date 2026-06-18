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
- No real money should move except small test-mode Mollie transactions.
  Always use the test API key, never a live key.
- Keep the UI flat and minimal — no marketing fluff, this is a working
  prototype, not a polished product.

## Tech stack
Next.js App Router, TypeScript, Prisma + SQLite, Tailwind, deployed to Vercel.

## Data models
- Employer: id, name, creditBalance (int)
- CheckIn: id, employerId, sliderValues (json), carryingText (string),
  riskFlag (bool), createdAt
- Transaction: id, checkInId, listenerId (nullable), replyText (nullable),
  repliedAt (nullable), createdAt
- Listener: id, name, available (bool)

## Risk check
A function `checkRisk(text: string): Promise<boolean>` that returns true
if the text suggests immediate danger to self or others. For the hackathon,
implement as a single call to the Anthropic API with a tightly scoped
system prompt asking for a yes/no answer only. Fall back to a basic keyword
list if no API key is configured, so the demo never breaks if a key is missing.

## Mollie integration
Use the REST API directly: POST https://api.mollie.com/v2/payments with
amount, description, redirectUrl, and webhookUrl, authenticated with the
test API key in the Authorization header. On webhook callback, fetch the
payment by id, confirm status is "paid", then increment the matching
Employer's creditBalance. Webhook must respond 200 OK regardless of what
it does internally, per Mollie's retry behavior.
