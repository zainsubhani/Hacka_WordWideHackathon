# ProviderPay

An employer-funded, pay-per-use confidential check-in for financial/provider
stress. No subscriptions, no booked sessions — one exchange per credit, no
implied ongoing relationship. See [`claude.md`](../claude.md) at the repo
root for the full product constraints this build follows.

This is a one-day hackathon build: Next.js App Router, TypeScript, Tailwind,
Prisma + SQLite.

## Routes

- `/employee` — three-step check-in flow: sliders (autonomy, financial
  pressure, energy, connection) → free-text "what are you carrying" →
  choice between sending to someone you trust (no backend) or using a
  credit for a listener reply (posts to `/api/checkin`).
- `/employee/status/[checkInId]` — lets an employee come back later and see
  a listener's reply, looked up by the `checkInId` returned at submit time.
  There's no auth in this build, so that id is the lookup key.
- `/listener` — pick which seeded listener you are (no auth).
- `/listener/[listenerId]` — that listener's queue of unreplied check-ins,
  with a reply box per row.
- `/employer` — credit balance, aggregate-only stats (total check-ins, risk
  flags caught, credits used), a low-credit warning, recent payment history,
  and a "Buy 20 credits" button that starts a Mollie test-mode checkout.

## API routes

- `POST /api/checkin` — runs the risk check before touching credits or
  matching a listener. If risk is flagged, the check-in is recorded but no
  credit is deducted and the frontend is told to show crisis resources
  instead. Otherwise it decrements the employer's credit, creates the
  `CheckIn`, assigns the first available `Listener`, and creates the linking
  `Transaction`.
- `POST /api/listener/reply` — records a listener's reply on a `Transaction`
  and flips that listener back to available.
- `POST /api/mollie/create-payment` — creates a test-mode Mollie payment for
  one credit block (20 credits), records a `Payment` row, and returns the
  Mollie checkout URL for the frontend to redirect to.
- `POST /api/mollie/webhook` — re-fetches the payment from the Mollie API to
  confirm its real status (never trusts the webhook body), and on `"paid"`
  increments the matching employer's credit balance. Always responds `200`
  regardless of internal outcome, per Mollie's retry behavior.

## Data model

`Employer`, `CheckIn`, `Transaction`, `Listener`, `Payment` — see
[`prisma/schema.prisma`](prisma/schema.prisma).

## Risk check

`checkRisk` (in [`lib/checkRisk.ts`](lib/checkRisk.ts)) calls the Anthropic
API with a tightly scoped yes/no system prompt when `ANTHROPIC_API_KEY` is
set, and falls back to a keyword list otherwise so the demo never breaks if
a key is missing.

## Getting started

```bash
npm install
npx prisma migrate dev   # applies migrations, creates dev.db
npx prisma db seed       # one Employer (20 credits), three Listeners
npm run dev
```

Open [http://localhost:3000/employee](http://localhost:3000/employee) or
[http://localhost:3000/employer](http://localhost:3000/employer).

### Environment variables (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `MOLLIE_API_KEY` | Mollie **test** API key. Never use a live key. |
| `PUBLIC_BASE_URL` | Public URL Mollie can reach for the webhook (e.g. an ngrok URL during local dev). `localhost` won't work here. |
| `ANTHROPIC_API_KEY` | Optional. Enables the real risk-check call; falls back to keyword matching if unset. |

`DATABASE_URL` lives in `.env` and defaults to `file:./dev.db`.

### Testing the Mollie flow locally

Mollie's webhook needs a publicly reachable URL, so `localhost` alone won't
trigger it:

```bash
ngrok http 3000
```

Copy the printed `https://...ngrok-free.dev` URL into `PUBLIC_BASE_URL` in
`.env.local` and restart `npm run dev` (the free ngrok URL changes each time
you restart the tunnel, so this step repeats per session).

## Hard constraints

- The employer dashboard never exposes individual check-in text, slider
  values, or employee identity — aggregate counts only.
- Every check-in passes through the risk check before any credit is
  deducted or listener matched.
- No real money moves — Mollie is always used in test mode.
