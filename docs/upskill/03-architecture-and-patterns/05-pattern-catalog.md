# Pattern Catalog

## Pattern: Typed View Config

**Problem it solves:** Keeps navigation labels/icons aligned with allowed views.
**General shape:** A typed union defines valid keys; config array maps keys to UI metadata.
**Real example:** [`src/types.ts`](../../../src/types.ts#L1-L1), [`src/App.tsx`](../../../src/App.tsx#L35-L42).
**Second example:** No second example found.
**Why this implementation works:** Adding an invalid key fails TypeScript.
**Failure modes:** Missing render branch; no URL routing.
**Use it when:** View set is small and local.
**Avoid it when:** Routes need URLs, loaders, permissions, or deep links.
**Drill:** Add a hypothetical `settings` view on paper.

## Pattern: Derived Collection

**Problem it solves:** Avoids duplicate state.
**General shape:** Store minimal state; compute view-ready collection during render.
**Real example:** `filteredProducts` in [`src/App.tsx`](../../../src/App.tsx#L65-L67).
**Second example:** `cartProducts` in [`src/App.tsx`](../../../src/App.tsx#L69-L71).
**Failure modes:** Expensive recomputation for large data; no memoization if needed.
**Use it when:** Data is small or computation is cheap.
**Avoid it when:** Computation is expensive and measured as a bottleneck.
**Drill:** Identify one value that should remain derived.

## Pattern: Functional State Update

**Problem it solves:** Updates state from previous state safely.
**General shape:** Pass updater function to setter.
**Real example:** Add cart ID in [`src/App.tsx`](../../../src/App.tsx#L73-L74).
**Second example:** Remove cart ID in [`src/App.tsx`](../../../src/App.tsx#L79-L80).
**Failure modes:** Mutating previous array in place.
**Use it when:** Next state depends on current state.
**Avoid it when:** State can be replaced directly from event value.
**Drill:** Explain why `setCartIds([...cartIds, id])` can be less robust inside async handlers.

## Pattern: Browser Storage Synchronization

**Problem it solves:** Persists local state across reloads.
**General shape:** Initialize from storage, write back in effect.
**Real example:** [`src/App.tsx`](../../../src/App.tsx#L53-L62).
**Second example:** No second example found.
**Failure modes:** Parse errors, quota errors, SSR, stale migrations.
**Use it when:** Data is non-sensitive and user-local.
**Avoid it when:** Data is sensitive, authoritative, or multi-device.
**Drill:** Add versioning to the stored cart format on paper.

## Pattern: Callback Prop Boundary

**Problem it solves:** Child triggers parent-owned state change.
**General shape:** Parent passes a named function; child calls it from an event.
**Real example:** `onAddToCart` through `Discover` in [`src/App.tsx`](../../../src/App.tsx#L142-L147), used in [`src/App.tsx`](../../../src/App.tsx#L212-L219).
**Second example:** `onRemove` in checkout line item [`src/App.tsx`](../../../src/App.tsx#L399-L400).
**Failure modes:** Callback names become vague; too many props.
**Use it when:** Parent owns state.
**Avoid it when:** The action belongs to an external service or global store.
**Drill:** Rename callbacks on paper to clarify intent.

## Pattern: Presentational Component

**Problem it solves:** Keeps display logic focused.
**General shape:** Component receives typed props and renders UI.
**Real example:** `ProductPreview` in [`src/App.tsx`](../../../src/App.tsx#L288-L327).
**Second example:** `StatusRow` in [`src/App.tsx`](../../../src/App.tsx#L539-L547).
**Failure modes:** Slowly accumulates state and side effects.
**Use it when:** UI depends only on props.
**Avoid it when:** Component needs data fetching, auth, or mutation ownership.
**Drill:** Identify props and outputs for `ProductPreview`.

## Pattern: Data-Driven Table

**Problem it solves:** Renders repeated operational rows from arrays.
**General shape:** Map data array to rows.
**Real example:** Products table in [`src/App.tsx`](../../../src/App.tsx#L600-L618).
**Second example:** Orders table in [`src/App.tsx`](../../../src/App.tsx#L651-L673).
**Failure modes:** Missing empty state, missing sorting, missing virtualization.
**Use it when:** Data is small and static.
**Avoid it when:** Data is remote, paginated, or permission-filtered.
**Drill:** Add an empty-state design for products.

## Pattern: Status-To-Class Mapping

**Problem it solves:** Maps domain state to visual state.
**General shape:** Convert status string to CSS class and define class styles.
**Real example:** Product status class in [`src/App.tsx`](../../../src/App.tsx#L608-L608), CSS in [`src/style.css`](../../../src/style.css#L797-L813).
**Second example:** Activity severity class in [`src/App.tsx`](../../../src/App.tsx#L561-L562), CSS in [`src/style.css`](../../../src/style.css#L763-L775).
**Failure modes:** New status has no style; casing mismatch.
**Use it when:** Union values are known and stable.
**Avoid it when:** Styling requires complex policy or localization.
**Drill:** Add `Archived` status on paper and list all update points.

## Pattern: Display Formatter Helper

**Problem it solves:** Centralizes repeated formatting.
**General shape:** Small pure helper near usage.
**Real example:** `formatMoney` and `formatCount` in [`src/App.tsx`](../../../src/App.tsx#L44-L47).
**Second example:** No second helper module found.
**Failure modes:** Currency logic grows too complex for file-local helper.
**Use it when:** Formatting is simple and local.
**Avoid it when:** Money/currency rules become domain-critical.
**Drill:** Specify requirements for a production money formatter.

## Pattern: Static Asset Boundary

**Problem it solves:** Serves images without importing them through TS.
**General shape:** Put file in `public/` and reference absolute path.
**Real example:** `/storefront-preview.png` in [`src/App.tsx`](../../../src/App.tsx#L201-L202).
**Second example:** Favicon in [`index.html`](../../../index.html#L5-L5).
**Failure modes:** Missing asset path, oversized image, no responsive variants.
**Use it when:** Asset is static and public.
**Avoid it when:** Asset needs hashing/import processing or private access.
**Drill:** Explain how you would add responsive image sizes.

## Pattern: Responsive Layout Breakpoints

**Problem it solves:** Keeps UI usable across widths.
**General shape:** Define desktop layout, then media queries collapse grids/nav.
**Real example:** Desktop shell in [`src/style.css`](../../../src/style.css#L115-L131), tablet changes in [`src/style.css`](../../../src/style.css#L849-L883), mobile nav in [`src/style.css`](../../../src/style.css#L885-L980).
**Second example:** Product grid collapse in [`src/style.css`](../../../src/style.css#L880-L881), [`src/style.css`](../../../src/style.css#L940-L945).
**Failure modes:** Overlapping text, hidden labels, inaccessible icon-only buttons.
**Use it when:** CSS is still app-level.
**Avoid it when:** Many pages need a shared design system.
**Drill:** Test which components depend on sticky positioning.

## Pattern: Mock Operational Surface

**Problem it solves:** Lets product/design explore workflows before backend exists.
**General shape:** Seed realistic data and render operational UI.
**Real example:** Activity seed and panel in [`src/data.ts`](../../../src/data.ts#L215-L220), [`src/App.tsx`](../../../src/App.tsx#L549-L573).
**Second example:** Admin controls in [`src/App.tsx`](../../../src/App.tsx#L746-L778).
**Failure modes:** Mock UI mistaken for real security/compliance.
**Use it when:** Validating product workflow.
**Avoid it when:** Users could rely on it as a control.
**Drill:** Label which admin claims need backend proof.
