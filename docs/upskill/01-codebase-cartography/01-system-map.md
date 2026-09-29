# System Map

## Repo Shape

Buildgum is a single Vite React app, not a monorepo. `rg --files` found root metadata, public assets, and one `src` app folder. There are no `apps/`, `packages/`, server folders, migrations, CI workflows, Docker files, env examples, or tests in this repo.

```text
buildgum/
  package.json             scripts and dependencies
  tsconfig.json            TypeScript compiler mode
  index.html               browser root and module script
  public/                  static assets
  src/
    main.tsx               React mount entry
    App.tsx                app shell, views, state, calculations
    data.ts                seeded domain data
    types.ts               TypeScript domain contracts
    style.css              global layout and component styling
  docs/upskill/            training curriculum
```

## Runtime Surfaces

| Surface | Exists? | Evidence | Notes |
| --- | --- | --- | --- |
| Browser UI | Yes | [`src/main.tsx`](../../../src/main.tsx#L1-L10), [`src/App.tsx`](../../../src/App.tsx#L83-L168) | Primary runtime. |
| API/server | No | No API/server files found. | Future production boundary. |
| Persistence | Seed only | [`src/data.ts`](../../../src/data.ts#L1-L228) | In-memory constants and browser localStorage only. |
| Auth/security | No real auth | Checkout says TLS/fraud but no enforcement in [`src/App.tsx`](../../../src/App.tsx#L358-L360). | Treat text as mock UI. |
| Workers/async jobs | No | No worker/queue files found. | Future side-effect boundary. |
| Tests/CI | No | `package.json` has no test script in [`package.json`](../../../package.json#L7-L12). | Add before serious changes. |

## Ownership Map

| Area | Owner file | Public interface | Private internals |
| --- | --- | --- | --- |
| App boot | [`src/main.tsx`](../../../src/main.tsx#L1-L10) | DOM element `#app` from [`index.html`](../../../index.html#L9-L11) | StrictMode wrapper. |
| View routing | [`src/App.tsx`](../../../src/App.tsx#L35-L42), [`src/App.tsx`](../../../src/App.tsx#L140-L165) | `ViewKey` union in [`src/types.ts`](../../../src/types.ts#L1-L1) | Conditional rendering via local state. |
| Domain contracts | [`src/types.ts`](../../../src/types.ts#L1-L74) | `Product`, `Creator`, `Order`, `Metric`, `Activity`, `Discount` | Union strings are compile-time guards only. |
| Seed data | [`src/data.ts`](../../../src/data.ts#L1-L228) | Exported arrays/constants | Data is not validated at runtime. |
| Storefront | [`src/App.tsx`](../../../src/App.tsx#L172-L327) | Props between `App`, `Discover`, `ProductCard`, `ProductPreview` | Local callbacks and derived display. |
| Checkout | [`src/App.tsx`](../../../src/App.tsx#L329-L453) | Cart products, promo string, remove/complete callbacks | Local math and mock confirmation. |
| Operations views | [`src/App.tsx`](../../../src/App.tsx#L455-L780) | Dashboard/products/orders/analytics/admin components | Tables and panels driven by seed data. |
| Styling | [`src/style.css`](../../../src/style.css#L1-L980) | Class names used in JSX | Global CSS, no CSS modules. |

## Public Interfaces And Private Internals

Public within this small repo:

- `App` default export in [`src/App.tsx`](../../../src/App.tsx#L782-L782).
- Type exports in [`src/types.ts`](../../../src/types.ts#L1-L74).
- Data exports in [`src/data.ts`](../../../src/data.ts#L3-L228).
- Static asset path `/storefront-preview.png` referenced in [`src/App.tsx`](../../../src/App.tsx#L201-L202).

Private internals:

- Component helpers such as `MetricGrid`, `RevenuePanel`, `StatusRow`, and `ActivityPanel` are file-local in [`src/App.tsx`](../../../src/App.tsx#L478-L573).
- Formatting helpers are file-local in [`src/App.tsx`](../../../src/App.tsx#L44-L47).

## Senior Noticing

- `src/App.tsx` combines view routing, state, business calculations, and all view components. That is fine for a prototype, but it increases blast radius as features grow.
- `localStorage` read uses `JSON.parse` without a recovery path in [`src/App.tsx`](../../../src/App.tsx#L53-L56). That is a possible risk, not a confirmed bug in normal use.
- Orders join products by `productId` in render time in [`src/App.tsx`](../../../src/App.tsx#L652-L653). Fine for six products; worth rethinking if backed by remote data.

## Verification Notes

- Ran `rg --files`.
- Inspected root metadata and all `src` files.
- No hidden server/API/test/CI folders were found in the project root.
