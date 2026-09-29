# JavaScript Runtime Model

## Concept: Browser Runtime And Global APIs

JavaScript in this repo runs in the browser. That means DOM APIs and `window.localStorage` exist at runtime. The cart initializer reads from `window.localStorage` in [`src/App.tsx`](../../../src/App.tsx#L53-L56), and the effect writes to it in [`src/App.tsx`](../../../src/App.tsx#L60-L62).

Why it matters: browser APIs are side effects. They can fail, be unavailable in SSR, contain malformed data, or behave differently across privacy modes.

Failure modes:

- `JSON.parse` throws if stored data is corrupt.
- Type assertion `as string[]` does not verify runtime shape.
- SSR or server-side tests fail if `window` is not present.

Drill: design a safe parser for `buildgum-cart` without editing code. Write the input/output table for `null`, `"[]"`, `"[\"p-automation\"]"`, `"bad"`, and `"{\"id\":1}"`.

Self-grade:

- Basic: knows localStorage stores strings.
- Solid: handles parse failure.
- Strong: validates an array of known product IDs and logs invalid values without crashing.

## Concept: Derived Data Instead Of Duplicate State

The app stores `cartIds`, then derives `cartProducts` by looking up products and filtering missing values in [`src/App.tsx`](../../../src/App.tsx#L69-L71). It stores `query`, then derives `filteredProducts` in [`src/App.tsx`](../../../src/App.tsx#L65-L67).

Why it matters: duplicate state creates consistency bugs. Derived state makes the invariant simple: products remain the source of product facts; cart state stores only selected IDs.

Failure modes:

- If `cartProducts` were stored separately, product price updates could drift.
- If filtering moved into a mutation handler, new query paths could forget it.

Drill: explain why `selectedProduct` is derived with a fallback in [`src/App.tsx`](../../../src/App.tsx#L64-L64).

## Concept: Array Operations And Complexity

This repo uses `map`, `filter`, `find`, `reduce`, and `includes` heavily:

- Search filtering: [`src/App.tsx`](../../../src/App.tsx#L65-L67)
- Cart mapping: [`src/App.tsx`](../../../src/App.tsx#L69-L71)
- Add unique cart ID: [`src/App.tsx`](../../../src/App.tsx#L73-L74)
- Checkout subtotal: [`src/App.tsx`](../../../src/App.tsx#L345-L345)
- Order/product join: [`src/App.tsx`](../../../src/App.tsx#L652-L653)

Why it matters: the same code that is clean for six products may become slow or chatty with thousands of rows or remote data. This is not a current performance bug; it is a scaling consideration.

Drill: mark each array operation as O(n), O(n*m), or constant for the current data size.

## Concept: Money In JavaScript

Checkout math uses numbers in [`src/App.tsx`](../../../src/App.tsx#L344-L348). JavaScript numbers are floating-point values. They are fine for a mock, but risky for real money.

Production failure modes:

- Rounding errors.
- Currency differences.
- Server/client price mismatch.
- Discount values outside expected bounds.
- Tax jurisdiction rules.

Drill: propose a `MoneyCents` type and list where it would replace plain `number`.

## Interview Prep Hooks

Be ready to answer:

- Why is `JSON.parse(stored) as string[]` not runtime validation?
- Why derive `filteredProducts` instead of storing it?
- What is the event loop impact of localStorage? It is synchronous, so large writes can block.
- When would `Promise.all` matter? Not in current code, but a future API-backed dashboard should parallelize independent requests.

## Verification Notes

- Inspected `src/App.tsx` state and derived data.
- No async promises, fetch calls, workers, or server APIs exist yet.
