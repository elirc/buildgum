# Key Flows

## Flow: App Boot And Initial Render

**Why this flow matters:** Every UI feature depends on the root mounting correctly and the browser receiving the right bundle.

**Open these files first:**
- [`index.html`](../../../index.html#L9-L11) - root DOM element and module script.
- [`src/main.tsx`](../../../src/main.tsx#L1-L10) - React mount boundary.
- [`src/App.tsx`](../../../src/App.tsx#L83-L168) - app shell.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Browser | `index.html:9-11` | Provides `<div id="app">` and loads module. | DOM node | Missing node would crash non-null assertion. |
| 2 | React | `src/main.tsx:6-10` | `createRoot(...).render(<App />)` under StrictMode. | React tree | StrictMode may double-run dev effects. |
| 3 | App | `src/App.tsx:83-168` | Renders side nav, topbar, and selected view. | JSX | `view` must match `ViewKey`. |

**Validation and authorization:** None. This is public UI boot.

**Persistence and side effects:** None at boot except `App` initialization may read localStorage in [`src/App.tsx`](../../../src/App.tsx#L53-L56).

**Tests that cover it:** No direct coverage found. Evidence: no test script in [`package.json`](../../../package.json#L7-L12).

**What juniors usually miss:**
- The non-null assertion in [`src/main.tsx`](../../../src/main.tsx#L6-L6) is a contract with `index.html`.

**What seniors notice:**
- If this app moves to SSR, browser-only state initialization needs a boundary.

**Drill:** Remove `id="app"` locally, predict the failure, then restore it.

**Self-grade:**
- Basic: finds the mount line.
- Solid: explains why `#app` is required.
- Strong: names SSR/hydration implications.

## Flow: View Navigation

**Why this flow matters:** The app uses local state as a simple router. That teaches state ownership and conditional rendering.

**Open these files first:**
- [`src/types.ts`](../../../src/types.ts#L1-L1) - allowed view keys.
- [`src/App.tsx`](../../../src/App.tsx#L35-L42) - nav item definitions.
- [`src/App.tsx`](../../../src/App.tsx#L93-L107) - nav rendering.
- [`src/App.tsx`](../../../src/App.tsx#L140-L165) - conditional view rendering.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Type contract | `src/types.ts:1` | `ViewKey` union defines valid views. | string union | Adding a view requires multiple updates. |
| 2 | Nav config | `src/App.tsx:35-42` | Maps each view to label and icon. | array of config objects | Icon type is tied to `typeof Store`. |
| 3 | User click | `src/App.tsx:97-101` | Button calls `setView(item.key)`. | `ViewKey` | No URL deep links. |
| 4 | Render | `src/App.tsx:140-165` | Matching component renders. | JSX branch | Missing branch means dead nav item. |

**Validation and authorization:** Compile-time validation through `ViewKey`; no auth.

**Persistence and side effects:** None; view state is memory-only.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**
- A local router has no browser back/forward semantics.

**What seniors notice:**
- URL routing becomes important once users share product/order/admin URLs.

**Drill:** Design a new `settings` view on paper. List every file/line that must change before coding.

**Self-grade:**
- Basic: updates type and nav.
- Solid: adds render branch and accessible label.
- Strong: considers URL routing migration and tests.

## Flow: Storefront Search And Product Selection

**Why this flow matters:** This is the main UI-to-data path: user input changes derived product lists and product preview.

**Open these files first:**
- [`src/App.tsx`](../../../src/App.tsx#L50-L67) - query and filtering.
- [`src/App.tsx`](../../../src/App.tsx#L120-L127) - search input.
- [`src/App.tsx`](../../../src/App.tsx#L172-L243) - `Discover` view.
- [`src/App.tsx`](../../../src/App.tsx#L245-L286) - `ProductCard`.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | User | `src/App.tsx:120-127` | Types query. | string | No debounce needed for tiny data; future API would need it. |
| 2 | App state | `src/App.tsx:50-51` | Stores query. | string | Case handling must be consistent. |
| 3 | Derived data | `src/App.tsx:65-67` | Builds lowercased haystack and filters. | `Product[]` | All filtering is client-side. |
| 4 | Card | `src/App.tsx:212-219` | Renders each product. | `Product` props | Empty state missing. |
| 5 | Selection | `src/App.tsx:215-218` | Preview callback changes `selectedId`. | product ID | Selected product may be hidden by search. |

**Validation and authorization:** None. Search is local only.

**Persistence and side effects:** None.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**
- `filteredProducts` is derived and should not be stored separately.

**What seniors notice:**
- Search semantics become a product contract once backed by an API.

**Drill:** Predict what happens if the query hides the currently selected product. Verify by reading the code, not by guessing.

**Self-grade:**
- Basic: names `query`.
- Solid: traces input to filtered list.
- Strong: identifies empty-state and selected-preview UX risks.

## Flow: Cart Persistence

**Why this flow matters:** It is the only persistence-like behavior in the app and shows a browser side effect.

**Open these files first:**
- [`src/App.tsx`](../../../src/App.tsx#L53-L62) - read/write localStorage.
- [`src/App.tsx`](../../../src/App.tsx#L69-L81) - cart IDs mapped to products and removal.
- [`src/App.tsx`](../../../src/App.tsx#L73-L77) - add to cart.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Initializer | `src/App.tsx:53-56` | Reads `buildgum-cart` and parses IDs. | `string[]` | Invalid JSON can throw. |
| 2 | Derived cart | `src/App.tsx:69-71` | Maps IDs to products and filters missing products. | `Product[]` | Unknown IDs silently disappear. |
| 3 | Add | `src/App.tsx:73-77` | Adds product ID if absent. | string array | Quantity not supported. |
| 4 | Remove | `src/App.tsx:79-81` | Filters ID out. | string array | Removes all matching IDs. |
| 5 | Effect | `src/App.tsx:60-62` | Writes IDs back to localStorage. | JSON string | Side effect runs on cart changes. |

**Validation and authorization:** Type assertion only: `JSON.parse(stored) as string[]` in [`src/App.tsx`](../../../src/App.tsx#L55-L55). No runtime validation.

**Persistence and side effects:** Browser `localStorage`.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**
- `as string[]` does not validate runtime data.

**What seniors notice:**
- A future server cart needs user scoping, conflict resolution, and migration from localStorage.

**Drill:** Write an error table for malformed localStorage, unknown product ID, duplicate ID, and empty cart.

**Self-grade:**
- Basic: identifies localStorage key.
- Solid: explains derived cart filtering.
- Strong: proposes runtime parsing and migration strategy.

## Flow: Checkout Total And Confirmation

**Why this flow matters:** Checkout is the highest-risk future boundary: money, tax, fraud, fulfillment, and idempotency.

**Open these files first:**
- [`src/App.tsx`](../../../src/App.tsx#L329-L348) - checkout inputs and calculation.
- [`src/App.tsx`](../../../src/App.tsx#L417-L450) - summary and pay button.
- [`src/data.ts`](../../../src/data.ts#L222-L226) - discounts.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Promo | `src/App.tsx:344` | Finds discount by uppercased code. | `Discount | undefined` | Expiry ignored. |
| 2 | Subtotal | `src/App.tsx:345` | Sums product prices. | number | No cents/decimal money type. |
| 3 | Discount | `src/App.tsx:346` | Applies percentage. | number | No bounds check on discount value. |
| 4 | Tax | `src/App.tsx:347` | Applies fixed 8.25%. | number | Real tax is jurisdictional. |
| 5 | Total | `src/App.tsx:348` | Computes final total. | number | Floating-point money risk. |
| 6 | Confirm | `src/App.tsx:442-445` | Button calls `onComplete`. | callback | No payment/idempotency. |
| 7 | UI receipt | `src/App.tsx:406-414` | Shows static order ID. | JSX | Mock only. |

**Validation and authorization:** HTML inputs exist in [`src/App.tsx`](../../../src/App.tsx#L364-L385), but there is no submit validation, auth, or payment authorization.

**Persistence and side effects:** UI state only; no charge, receipt email, license generation, or order persistence.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**
- A green success box is not proof a side effect happened.

**What seniors notice:**
- Payment requires server-side price authority, idempotency keys, webhook reconciliation, tax evidence, and fulfillment rollback.

**Drill:** List five invariants that must hold before a real order can be created.

**Self-grade:**
- Basic: finds subtotal and total.
- Solid: names missing runtime validation.
- Strong: covers idempotency, server-side price authority, and webhook reconciliation.

## Flow: Product And Order Operations Tables

**Why this flow matters:** Operational UI teaches relationship rendering, status labels, and risk display.

**Open these files first:**
- [`src/types.ts`](../../../src/types.ts#L3-L5) - status and risk unions.
- [`src/App.tsx`](../../../src/App.tsx#L575-L623) - product table.
- [`src/App.tsx`](../../../src/App.tsx#L625-L678) - order table.
- [`src/style.css`](../../../src/style.css#L792-L813) - pill/risk styling.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Products view | `src/App.tsx:601-617` | Maps products into table rows. | `Product` | Table column and type can drift. |
| 2 | Status | `src/App.tsx:608` | Converts status to CSS class. | string union | New status needs CSS. |
| 3 | Risk | `src/App.tsx:614` | Converts risk to CSS class. | string union | New risk needs CSS. |
| 4 | Orders view | `src/App.tsx:652-653` | Finds product by `order.productId`. | `Order -> Product` | N+1 style lookup if data grows. |
| 5 | Fallback | `src/App.tsx:661` | Shows `Unknown product` if missing. | string | Good UI fallback but hides data issue. |

**Validation and authorization:** None. In a real admin UI, product/order visibility would require roles and tenant scoping.

**Persistence and side effects:** None.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**
- CSS class generation from data is a contract.

**What seniors notice:**
- Missing product fallback is user-friendly but should also be observable in production.

**Drill:** Add a hypothetical `Blocked` risk on paper. What type, data, render, CSS, and test changes are required?

**Self-grade:**
- Basic: updates type.
- Solid: updates CSS and table render.
- Strong: adds fallback handling and test coverage.

## Flow: Dashboard, Analytics, And Admin Panels

**Why this flow matters:** These panels are seed-data-driven operational surfaces. They teach how dashboards can mix domain data, calculated values, and display-only metrics.

**Open these files first:**
- [`src/data.ts`](../../../src/data.ts#L145-L150) - metrics.
- [`src/data.ts`](../../../src/data.ts#L215-L228) - activity, discounts, revenue series.
- [`src/App.tsx`](../../../src/App.tsx#L455-L573) - dashboard panels.
- [`src/App.tsx`](../../../src/App.tsx#L680-L780) - analytics/admin panels.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Dashboard | `src/App.tsx:468-473` | Composes metric, revenue, operations, activity panels. | JSX | No loading/error states. |
| 2 | Metrics | `src/App.tsx:478-490` | Renders metric cards. | `Metric[]` | Values are strings, not numbers. |
| 3 | Revenue chart | `src/App.tsx:502-505` | Maps numbers to bar heights. | `number[]` | Inline pixel heights from data. |
| 4 | Activity | `src/App.tsx:560-568` | Maps activity severity to classes. | `Activity[]` | Severity classes need CSS coverage. |
| 5 | Admin controls | `src/App.tsx:747-775` | Local tuple array renders control tiles. | array tuples | Untyped tuples can drift. |

**Validation and authorization:** None. In production, dashboard and admin require authorization and audit controls.

**Persistence and side effects:** None.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**
- Dashboard strings may look like data but are not reliable numeric measures.

**What seniors notice:**
- Admin tuple data in component scope is harder to validate and reuse than typed data.

**Drill:** Convert the admin controls tuple idea into a TypeScript type without changing product code. What fields would you name?

**Self-grade:**
- Basic: lists label/value/state.
- Solid: adds union for state.
- Strong: discusses API schema and permissions.
