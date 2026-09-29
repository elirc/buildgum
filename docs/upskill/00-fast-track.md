# Weekend Fast Track

## Goal

By Sunday night you should be able to run Buildgum, explain the main UI state, trace storefront-to-checkout, make one safe documentation or UI-text change, and describe what this frontend prototype does not yet cover.

## Install, Run, Check

Verified commands:

```bash
npm install
npm run check
npm run build
```

Verified dev command shape:

```bash
npx vite --host 127.0.0.1
```

The `package.json` scripts are `dev`, `check`, `build`, and `preview` in [`package.json`](../../package.json#L7-L12). `npm run check` runs `tsc --noEmit`; `npm run build` runs `tsc && vite build`.

## First Two Flows To Trace

1. Storefront discovery:
   - Open [`src/App.tsx`](../../src/App.tsx#L49-L81) for state.
   - Open [`src/App.tsx`](../../src/App.tsx#L172-L243) for the `Discover` view.
   - Open [`src/App.tsx`](../../src/App.tsx#L245-L286) for product cards.
   - Open [`src/data.ts`](../../src/data.ts#L13-L143) for product seed data.

2. Checkout:
   - Open [`src/App.tsx`](../../src/App.tsx#L329-L453) for subtotal, discount, tax, remove, and confirmation.
   - Open [`src/data.ts`](../../src/data.ts#L222-L226) for discount codes.
   - Open [`src/types.ts`](../../src/types.ts#L69-L74) for the discount contract.

## First 10 Files To Open

| Order | File | What to look for | Do not get distracted by |
| --- | --- | --- | --- |
| 1 | [`README.md`](../../README.md) | Project identity and intended production integration points. | The fact that backend items are aspirational. |
| 2 | [`package.json`](../../package.json#L1-L22) | Scripts, runtime dependencies, dev dependencies. | `node_modules`. |
| 3 | [`src/main.tsx`](../../src/main.tsx#L1-L10) | React mount boundary and StrictMode. | React internals. |
| 4 | [`src/types.ts`](../../src/types.ts#L1-L74) | Domain contracts and unions. | Adding new types yet. |
| 5 | [`src/data.ts`](../../src/data.ts#L1-L228) | Seeded domain data and relationships. | Treating seed data as persistence. |
| 6 | [`src/App.tsx`](../../src/App.tsx#L35-L81) | Navigation keys, local state, derived state. | Styling details. |
| 7 | [`src/App.tsx`](../../src/App.tsx#L83-L168) | Layout and conditional view rendering. | Rewriting routing. |
| 8 | [`src/App.tsx`](../../src/App.tsx#L329-L453) | Checkout calculations and side effects. | Payment provider details that do not exist. |
| 9 | [`src/style.css`](../../src/style.css#L115-L188) | App shell and navigation layout. | Color tuning. |
| 10 | [`src/style.css`](../../src/style.css#L849-L980) | Responsive breakpoints. | Full design-system extraction. |

## Small Safe Change

Try changing one label that has no domain contract impact, for example the `Forecast` button in [`src/App.tsx`](../../src/App.tsx#L696-L699). Run `npm run check` afterward. A safe change preserves state shape, props, type unions, and behavior.

## Teach-Back Exercise

In five minutes, explain:

- Which state variables are user-controlled in [`src/App.tsx`](../../src/App.tsx#L49-L58).
- Which values are derived from products and cart IDs in [`src/App.tsx`](../../src/App.tsx#L64-L71).
- Why `Product` in [`src/types.ts`](../../src/types.ts#L7-L29) matters even without a backend.
- What would need to change before accepting real card payments.

Self-grade:

- Basic: names the files and can run `npm run check`.
- Solid: traces product selection and checkout total.
- Strong: identifies missing validation, auth, persistence, and payment boundaries without claiming they exist.

## Not Covered By The Fast Path

- Real API routes, database schema, auth/session management, payment webhooks, test harness, CI, deployment, observability, and rollback strategy. These are intentionally discussed later as design and risk topics.

## Verification Notes

- `npm run check` passed.
- `npm run build` passed during the implementation pass.
- `npx vite --host 127.0.0.1` served the app and root returned `200`.
