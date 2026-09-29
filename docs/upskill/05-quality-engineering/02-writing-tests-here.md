# Writing Tests Here

No test harness exists yet. The first contribution should add one rather than inventing ad hoc scripts.

## Suggested Setup

Inferred commands:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add scripts:

```json
{
  "test": "vitest",
  "test:run": "vitest run"
}
```

This is illustrative; adapt after choosing tooling.

## Test Recipes

1. Happy path: product search filters visible cards.
   - Anchors: [`src/App.tsx`](../../../src/App.tsx#L120-L127), [`src/App.tsx`](../../../src/App.tsx#L211-L220).

2. Validation failure: malformed localStorage does not crash.
   - Anchor: [`src/App.tsx`](../../../src/App.tsx#L53-L56).
   - Requires code change to add parser before test can pass.

3. Permission failure: future admin route denies non-admin.
   - Anchor: current unprotected admin render in [`src/App.tsx`](../../../src/App.tsx#L161-L165).
   - Not implementable until auth exists.

4. Cross-resource rejection: future creator cannot read another creator order.
   - Anchor: order/product relation in [`src/App.tsx`](../../../src/App.tsx#L652-L653).
   - Future API test.

5. Async side effect: future checkout creates order once with idempotency key.
   - Anchor: current mock pay handler in [`src/App.tsx`](../../../src/App.tsx#L442-L445).

6. Cache/query invalidation: future product update refreshes tables.
   - Anchor: products table in [`src/App.tsx`](../../../src/App.tsx#L600-L618).

7. Migration/schema behavior: future `orders.product_id` foreign key rejects unknown product.
   - Anchor: fallback today in [`src/App.tsx`](../../../src/App.tsx#L661-L661).

8. UI state: add product to cart, remove it, and assert summary updates.
   - Anchors: [`src/App.tsx`](../../../src/App.tsx#L73-L81), [`src/App.tsx`](../../../src/App.tsx#L226-L239).

## Exact Current Checks

Verified:

```bash
npm run check
npm run build
```

No `npm test` exists yet.
