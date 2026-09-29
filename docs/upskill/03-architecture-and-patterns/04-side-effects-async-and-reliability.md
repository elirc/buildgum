# Side Effects, Async, And Reliability

## Current Side Effects

| Side effect | Evidence | Current reliability |
| --- | --- | --- |
| Browser localStorage read | [`src/App.tsx`](../../../src/App.tsx#L53-L56) | No parse guard. |
| Browser localStorage write | [`src/App.tsx`](../../../src/App.tsx#L60-L62) | No quota/error handling. |
| UI checkout confirmation | [`src/App.tsx`](../../../src/App.tsx#L406-L414) | State-only; no external effect. |

No fetch calls, webhooks, email, queues, jobs, retries, cron, caches, workers, file uploads, or external APIs exist.

## Concepts For Future Production Checkout

Idempotency: repeated "Pay now" requests should not create duplicate orders. The current button simply calls `onComplete` in [`src/App.tsx`](../../../src/App.tsx#L442-L445); a real system needs idempotency keys and server-side order state.

Retries: payment/tax/fulfillment calls can fail transiently. Retrying must be safe and observable.

Outbox pattern: if an order is created and a receipt email must be sent, persist the intent to send in the same transaction, then process asynchronously.

Compensation: if license provisioning succeeds but receipt email fails, the system needs recovery, not silent inconsistency.

Backpressure: admin dashboards should avoid unbounded queries and expensive synchronous work.

Timeout handling: external calls need timeouts and clear failure states.

## Risky Places If Extended Naively

- Adding payment API calls directly inside `Checkout` render would be incorrect. Render code starts at [`src/App.tsx`](../../../src/App.tsx#L350-L451).
- Adding irreversible side effects to `useEffect` would be risky because StrictMode and dependency changes can rerun effects.
- Trusting client-side subtotal in [`src/App.tsx`](../../../src/App.tsx#L345-L348) would be unsafe for real orders.

## Drill

Design a future checkout sequence with these states: draft order, payment intent, paid order, fulfillment pending, fulfilled, receipt sent. Mark which transitions must be idempotent.
