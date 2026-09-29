# Architecture Critique

## Strong Design Choices

- Clear type vocabulary in [`src/types.ts`](../../../src/types.ts#L1-L74) gives learners and future contributors a domain map.
- Seed data in [`src/data.ts`](../../../src/data.ts#L1-L228) is separated from UI, which makes flows easier to trace.
- State is centralized in `App` and passed down through props in [`src/App.tsx`](../../../src/App.tsx#L49-L168), which is simple for the current size.
- Derived data avoids duplicate state in [`src/App.tsx`](../../../src/App.tsx#L64-L71).
- Responsive CSS is explicit and readable in [`src/style.css`](../../../src/style.css#L849-L980).

## Confirmed Gaps

| Gap | Evidence | Impact | Priority |
| --- | --- | --- | --- |
| No test harness | No test script in [`package.json`](../../../package.json#L7-L12). | Changes rely on manual verification and typecheck. | High before feature growth. |
| No runtime validation | `JSON.parse(... as string[])` in [`src/App.tsx`](../../../src/App.tsx#L55-L55). | Corrupt storage can crash. | Medium. |
| No backend/auth/persistence | No files found; README lists integrations as future in [`README.md`](../../../README.md#L24-L29). | Product is prototype only. | High before production. |
| Checkout math in UI | [`src/App.tsx`](../../../src/App.tsx#L344-L348). | Unsafe for real payment authority. | High before payment integration. |
| Large app module | [`src/App.tsx`](../../../src/App.tsx#L1-L782). | Increasing blast radius and review load. | Medium as code grows. |

## Hypotheses To Investigate

- Possible encoding issue in product table separator appears as `Â·` in line-numbered output around [`src/App.tsx`](../../../src/App.tsx#L605-L605). Verify in editor/browser before treating as a bug.
- `localStorage` parse failure may be user-reachable if storage is manually corrupted. Add a small test once a test harness exists.
- Admin tuple data in [`src/App.tsx`](../../../src/App.tsx#L747-L754) may drift because it is not typed.

## Improvements In Priority Order

1. Add test tooling and first UI/unit tests.
   - Migration path: add Vitest and React Testing Library.
   - Test strategy: cover search, cart persistence parser, checkout totals, view navigation.

2. Extract domain helpers.
   - Migration path: move checkout calculation into `src/domain/checkout.ts`.
   - Test strategy: pure unit tests for discount/tax/total.

3. Add runtime validation for storage and future APIs.
   - Migration path: introduce small validators or schema library.
   - Test strategy: malformed cart storage and unknown IDs.

4. Introduce route structure when URLs matter.
   - Migration path: use React Router or framework route support.
   - Test strategy: deep links and protected routes.

5. Plan backend boundaries.
   - Migration path: API client, server-side price authority, order persistence, idempotency.
   - Test strategy: API contract tests and webhook replay tests.

## If I Owned This For Three Months

Month 1: stabilize frontend quality. Add tests, lint/format, CI, component boundaries, and domain helpers.

Month 2: introduce real data contracts. Add API schema, runtime validation, authenticated routes, and a read-only product/order backend.

Month 3: make checkout production-grade. Add payment intent flow, server-side order creation, webhooks, idempotency, audit logs, and operational dashboards backed by real events.

## Senior Review Prompt

Before approving a production checkout PR, ask:

- Who owns price authority?
- What prevents duplicate orders?
- Where is authorization enforced?
- How are failed side effects retried or surfaced?
- How can we roll back without losing customer money or fulfillment state?
