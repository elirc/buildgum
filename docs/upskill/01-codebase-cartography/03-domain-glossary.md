# Domain Glossary

| Term | Meaning in this repo | Where it appears | Confusions to avoid |
| --- | --- | --- | --- |
| Creator | Seller profile for a digital product business. | `Creator` in [`src/types.ts`](../../../src/types.ts#L31-L39), `creator` seed in [`src/data.ts`](../../../src/data.ts#L3-L11). | Not an authenticated account yet. |
| Product | Sellable digital item with price, delivery, status, risk, tags, and metrics. | `Product` in [`src/types.ts`](../../../src/types.ts#L7-L29), products in [`src/data.ts`](../../../src/data.ts#L13-L143). | Not persisted; no SKU/versioning. |
| Product status | Publishing/review state: `Live`, `Draft`, `Review`, `Paused`. | [`src/types.ts`](../../../src/types.ts#L3-L3), rendered in [`src/App.tsx`](../../../src/App.tsx#L608-L608). | UI label only; no workflow enforcement. |
| Risk level | Display label for operational risk: `Low`, `Medium`, `High`. | [`src/types.ts`](../../../src/types.ts#L5-L5), CSS in [`src/style.css`](../../../src/style.css#L797-L813). | Not a fraud engine. |
| Order | Mock purchase record linking to product by `productId`. | `Order` in [`src/types.ts`](../../../src/types.ts#L41-L52), seed orders in [`src/data.ts`](../../../src/data.ts#L152-L213). | No payment processor or database row. |
| License key | Mock fulfillment token on an order. | [`src/types.ts`](../../../src/types.ts#L51-L51), examples in [`src/data.ts`](../../../src/data.ts#L163-L211). | Not generated or validated. |
| Discount | Promo code with percentage value, redemptions, and expiration. | [`src/types.ts`](../../../src/types.ts#L69-L74), [`src/data.ts`](../../../src/data.ts#L222-L226). | Expiration is not enforced. |
| Cart | Browser-local selected product IDs. | `cartIds` in [`src/App.tsx`](../../../src/App.tsx#L53-L56), persisted in [`src/App.tsx`](../../../src/App.tsx#L60-L62). | Not server-side, not user-scoped. |
| Checkout | Mock purchase UI and calculation. | [`src/App.tsx`](../../../src/App.tsx#L329-L453). | Does not charge cards. |
| Activity | Audit-log-like operational event. | [`src/types.ts`](../../../src/types.ts#L61-L67), [`src/data.ts`](../../../src/data.ts#L215-L220), render in [`src/App.tsx`](../../../src/App.tsx#L549-L573). | Not a real audit log; no append-only guarantee. |
| Metric | Dashboard stat with label, value, delta, tone. | [`src/types.ts`](../../../src/types.ts#L54-L59), [`src/data.ts`](../../../src/data.ts#L145-L150). | Values are strings, not numeric measures. |
| View | Local UI mode. | `ViewKey` in [`src/types.ts`](../../../src/types.ts#L1-L1), nav in [`src/App.tsx`](../../../src/App.tsx#L35-L42). | Not URL routing. |

## Drill

Choose `Order`. Draw a relationship diagram from `orders` to `products` using [`src/data.ts`](../../../src/data.ts#L152-L213) and [`src/App.tsx`](../../../src/App.tsx#L652-L653). Then write down what database constraint would be required if this became a backend table.

Strong answer includes: foreign key, missing product fallback, migration/backfill plan, and UI behavior for deleted products.
