# Interview Prep From Buildgum

Use this repo as a practical interview lab for mid-level JavaScript/React roles. Bring answers back to real anchors.

## JavaScript Runtime Questions

### Q: What is risky about `JSON.parse(stored) as string[]`?
Anchor: [`src/App.tsx`](../../../src/App.tsx#L53-L56)

- Junior answer: It parses localStorage into an array.
- Mid-level answer: The assertion does not validate runtime shape and invalid JSON can crash.
- Senior answer: Browser storage is an untrusted boundary; add a safe parser, version the storage format, recover predictably, and test malformed values.

### Q: Why use functional state updates for cart changes?
Anchor: [`src/App.tsx`](../../../src/App.tsx#L73-L80)

- Junior: It updates the cart.
- Mid-level: It avoids stale state when next state depends on previous state.
- Senior: It preserves invariants under batched updates and gives a clear duplicate-prevention rule.

### Q: What should happen if checkout becomes async?
Anchor: current mock pay in [`src/App.tsx`](../../../src/App.tsx#L442-L445)

- Junior: Call an API when button is clicked.
- Mid-level: Add loading/error states, disable duplicate submissions, validate response.
- Senior: Move price authority server-side, use idempotency keys, reconcile webhooks, and make side effects observable.

## TypeScript Questions

### Q: What do unions buy us here?
Anchor: [`src/types.ts`](../../../src/types.ts#L1-L5)

- Junior: They limit values.
- Mid-level: They force updates when adding statuses or views.
- Senior: They are compile-time contracts; runtime API data still needs validation and migration plans.

### Q: When is an optional field a smell?
Anchor: [`src/types.ts`](../../../src/types.ts#L15-L28)

- Junior: It might be undefined.
- Mid-level: UI must branch safely.
- Senior: Optionality should reflect domain truth, not incomplete modeling; `subscription` likely wants a structured pricing model.

## React Questions

### Q: What is the state owner in this app?
Anchor: [`src/App.tsx`](../../../src/App.tsx#L49-L81)

- Junior: `App` has the state.
- Mid-level: Child components receive props and callbacks; `App` derives filtered/cart products.
- Senior: This is fine for prototype scale but should be split as features, tests, and routing grow.

### Q: Controlled vs uncontrolled inputs?
Anchors: controlled search [`src/App.tsx`](../../../src/App.tsx#L120-L127), uncontrolled checkout fields [`src/App.tsx`](../../../src/App.tsx#L364-L385)

- Junior: Controlled uses `value`.
- Mid-level: Controlled inputs make validation/submission easier.
- Senior: Real checkout needs a form boundary, validation schema, tokenized payment fields, and careful PII handling.

## Debugging Questions

### Q: Product risk color disappeared. How do you debug?
Anchors: [`src/types.ts`](../../../src/types.ts#L5-L5), [`src/App.tsx`](../../../src/App.tsx#L614-L614), [`src/style.css`](../../../src/style.css#L797-L813)

- Junior: Inspect CSS.
- Mid-level: Trace data value to generated class to CSS selector.
- Senior: Add exhaustive mapping or fallback and test it; do not rely only on string-derived classes from untrusted data.

### Q: Checkout total is wrong. Where do you start?
Anchor: [`src/App.tsx`](../../../src/App.tsx#L344-L348)

- Junior: Check the formula.
- Mid-level: Reproduce with known cart and discount.
- Senior: Clarify money/tax/discount policy, move pure math to tested helper, and avoid floating-point money in production.

## System Design Questions

### Q: Design real checkout for Buildgum.

Strong answer includes:

- Client creates checkout request, but server owns price and discount validation.
- Payment intent through provider.
- Order table with state machine.
- Idempotency key for retries.
- Signed webhook handler.
- License provisioning worker/outbox.
- Receipt email side effect with retry.
- Observability for every transition.
- Rollback plan for failed fulfillment.

Tie back to mock anchors: checkout UI [`src/App.tsx`](../../../src/App.tsx#L329-L453), products [`src/data.ts`](../../../src/data.ts#L13-L143), orders [`src/data.ts`](../../../src/data.ts#L152-L213).

### Q: Design auth for creator/admin views.

Strong answer includes:

- User, creator, role, session.
- Route guards and API authorization.
- Tenant scoping on product/order queries.
- Admin roles separate from creator ownership.
- IDOR tests.

Current unprotected render anchor: [`src/App.tsx`](../../../src/App.tsx#L161-L165).

## Code Review Questions

### Prompt: A PR adds `fetch('/orders')` in `Orders` and renders all returned orders.

Expected review:

- Blocking: Where is authorization/tenant filtering enforced?
- Important: Loading/error/empty states.
- Important: Runtime response validation.
- Optional: Consider query cache if repeated.

### Prompt: A PR stores full product objects in localStorage.

Expected review:

- Blocking if used for prices: client-tamper risk.
- Important: stale product data and migration burden.
- Better: store IDs and derive products, as current code does in [`src/App.tsx`](../../../src/App.tsx#L69-L71).

## Behavioral Prompts

### Tell me about a time you made a small safe contribution.

Use a ticket such as adding an empty search state. Strong story: you read existing patterns, touched one component, ran `npm run check`, verified UI, and avoided broad refactors.

### Tell me about debugging a frontend issue.

Use cart corruption or risk color. Strong story: reproduce, isolate layer, inspect file anchors, fix root cause, add regression test plan.

### Tell me about technical judgment.

Use checkout. Strong story: you recognized mock UI was not production behavior, named trust boundaries, and proposed a staged migration rather than wiring payments directly in the client.

## Practice Plan

1. Pick one anchor-heavy question.
2. Answer at junior, mid-level, senior depth.
3. Record yourself for two minutes.
4. Check whether you mentioned invariant, boundary, test, risk, and tradeoff.
