# File Reading Order

## Junior Path

| Order | File | Why it matters | Look for | Avoid |
| --- | --- | --- | --- | --- |
| 1 | [`README.md`](../../../README.md) | States product scope and future integration points. | What is real now vs future. | Assuming integration points already exist. |
| 2 | [`package.json`](../../../package.json#L7-L22) | Shows scripts and stack. | `dev`, `check`, `build`; React/Vite deps. | Dependency internals. |
| 3 | [`index.html`](../../../index.html#L1-L13) | Browser document root. | `#app` and module script. | Styling. |
| 4 | [`src/main.tsx`](../../../src/main.tsx#L1-L10) | React mount point. | StrictMode and `<App />`. | Overthinking createRoot. |
| 5 | [`src/types.ts`](../../../src/types.ts#L1-L74) | Domain vocabulary. | Union types and fields. | Adding fields before tracing usage. |
| 6 | [`src/data.ts`](../../../src/data.ts#L13-L143) | Product examples. | Required fields match `Product`. | Treating constants as database rows. |
| 7 | [`src/App.tsx`](../../../src/App.tsx#L49-L81) | Main state and state transitions. | `view`, `query`, `selectedId`, `cartIds`, `promo`. | JSX below until you understand state. |
| 8 | [`src/App.tsx`](../../../src/App.tsx#L83-L168) | Shell layout and view switching. | Conditional render by `view`. | CSS classes. |
| 9 | [`src/App.tsx`](../../../src/App.tsx#L172-L286) | Storefront UI. | Props flowing into cards. | Dashboard details. |
| 10 | [`src/App.tsx`](../../../src/App.tsx#L329-L453) | Checkout math. | subtotal, discount, tax, total. | Payment gateways not present. |

## Mid-Level Path

| Order | File | Why it matters | Look for | Avoid |
| --- | --- | --- | --- | --- |
| 1 | [`src/types.ts`](../../../src/types.ts#L1-L74) | Contracts drive safe changes. | Which fields are optional. | Using `any`. |
| 2 | [`src/data.ts`](../../../src/data.ts#L152-L213) | Orders reference products. | `productId` relationship. | Assuming referential integrity is enforced. |
| 3 | [`src/App.tsx`](../../../src/App.tsx#L64-L81) | Derived state and mutations. | Filtering invalid cart IDs. | Mutating arrays in place. |
| 4 | [`src/App.tsx`](../../../src/App.tsx#L344-L348) | Business calculation in UI. | Tax/discount invariants. | Hiding domain math in JSX. |
| 5 | [`src/App.tsx`](../../../src/App.tsx#L575-L678) | Table views. | Status/risk rendering. | Duplicating table patterns casually. |
| 6 | [`src/App.tsx`](../../../src/App.tsx#L680-L744) | Analytics mini-model. | Local `channels` array and chart data. | Treating numbers as authoritative analytics. |
| 7 | [`src/style.css`](../../../src/style.css#L280-L365) | Layout primitives. | Grid shapes, shared panel/card styles. | One-off CSS. |
| 8 | [`src/style.css`](../../../src/style.css#L849-L980) | Responsive behavior. | Breakpoint decisions. | Font scaling regressions. |

## Senior Path

| Order | File | Review lens |
| --- | --- |
| [`src/App.tsx`](../../../src/App.tsx#L49-L168) | Should local state, routing, derived state, and layout stay in one file? When does this become a module boundary? |
| [`src/App.tsx`](../../../src/App.tsx#L329-L453) | Checkout is the riskiest future boundary: validation, payment, tax, fraud, idempotency, error handling. |
| [`src/types.ts`](../../../src/types.ts#L1-L74) | Which type contracts will become API schemas? Which unions need versioning/migration? |
| [`src/data.ts`](../../../src/data.ts#L1-L228) | Which seed objects map to database tables? Which relationships need constraints? |
| [`src/style.css`](../../../src/style.css#L1-L980) | Which classes are reusable design tokens vs page-specific styling? |
| [`package.json`](../../../package.json#L7-L22) | Missing lint/test/format/e2e scripts are a quality-system gap. |

## Drill

Pick one field from `Product`, such as `risk` in [`src/types.ts`](../../../src/types.ts#L21-L21). Trace every place it appears and answer:

- Is it data, display, policy, or all three?
- What would break if a new risk level `Blocked` were added?
- Where should compile-time and runtime validation live in a production app?

Self-grade:

- Basic: finds the type and one render site.
- Solid: finds seed data, product table, and CSS class mapping.
- Strong: identifies the API/schema migration and UI fallback implications.
