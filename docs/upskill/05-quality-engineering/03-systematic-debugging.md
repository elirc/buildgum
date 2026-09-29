# Systematic Debugging

General method:

1. Reproduce.
2. Narrow the layer.
3. Form one hypothesis.
4. Test cheaply.
5. Fix root cause.
6. Add regression coverage.

## Scenario: App Crashes On Load After Cart Storage Corruption

**Reproduction:** Set `localStorage["buildgum-cart"] = "bad"` and reload.
**First question:** Is the bug in React render or storage parsing?
**Narrowing path:**
1. Check [`src/App.tsx`](../../../src/App.tsx#L53-L56).
2. If parse throws, add safe parser.
3. If parse succeeds, inspect derived `cartProducts` in [`src/App.tsx`](../../../src/App.tsx#L69-L71).
**Useful probes:**
- Browser console.
- Breakpoint in state initializer.
**Likely root causes:**
- Unhandled `JSON.parse`.
**Regression test to add:**
- Malformed storage falls back to default cart.
**Senior lesson:** Storage is an untrusted boundary.

## Scenario: Search Shows No Products

**Reproduction:** Type a query that should match a tag.
**First question:** Is the bug in input state or filter haystack?
**Narrowing path:**
1. Check input value path in [`src/App.tsx`](../../../src/App.tsx#L120-L127).
2. Check haystack fields in [`src/App.tsx`](../../../src/App.tsx#L65-L67).
3. Check product tags in [`src/data.ts`](../../../src/data.ts#L29-L31).
**Useful probes:**
- React DevTools state.
**Likely root causes:**
- Missing searchable field or case mismatch.
**Regression test to add:**
- Search by tag renders matching product.
**Senior lesson:** Search semantics become a product contract.

## Scenario: Checkout Total Looks Wrong

**Reproduction:** Add multiple products and use `BUILD20`.
**First question:** Is the bug in cart contents or total math?
**Narrowing path:**
1. Inspect cart derivation in [`src/App.tsx`](../../../src/App.tsx#L69-L71).
2. Inspect discount lookup in [`src/App.tsx`](../../../src/App.tsx#L344-L346).
3. Inspect tax/total formula in [`src/App.tsx`](../../../src/App.tsx#L347-L348).
**Useful probes:**
- Temporary console log during local debugging.
**Likely root causes:**
- Percentage expectation, fixed tax assumption, floating-point rounding.
**Regression test to add:**
- Known cart and promo produces expected cents.
**Senior lesson:** Money calculations need explicit policy.

## Scenario: Product Risk Has No Color

**Reproduction:** Add new risk label in seed data.
**First question:** Is the bug type, render, or CSS?
**Narrowing path:**
1. Check `RiskLevel` in [`src/types.ts`](../../../src/types.ts#L5-L5).
2. Check class generation in [`src/App.tsx`](../../../src/App.tsx#L614-L614).
3. Check CSS mappings in [`src/style.css`](../../../src/style.css#L797-L813).
**Useful probes:**
- DevTools inspect class.
**Likely root causes:**
- Missing CSS class.
**Regression test to add:**
- Exhaustive status/risk mapping test.
**Senior lesson:** Data-to-CSS string contracts need guardrails.

## Scenario: Mobile Layout Overlaps

**Reproduction:** Resize below 760px.
**First question:** Is the overlap caused by grid layout, fixed bottom nav, or text length?
**Narrowing path:**
1. Check mobile breakpoint in [`src/style.css`](../../../src/style.css#L885-L980).
2. Check line item grid in [`src/style.css`](../../../src/style.css#L963-L970).
3. Check long delivery text in [`src/App.tsx`](../../../src/App.tsx#L394-L397).
**Useful probes:**
- Browser responsive mode.
**Likely root causes:**
- Fixed nav padding, nowrap table cells, long text.
**Regression test to add:**
- Visual or Playwright screenshot for mobile.
**Senior lesson:** Responsive design is a contract with content, not just viewport width.
