# Mid-Level Feature Tickets

Each ticket requires a design note before implementation.

## Ticket 1: Add Test Harness And First Tests
**Scope:** Tooling + UI tests.
**Design notes required:** Test runner choice, jsdom setup, scripts, first coverage targets.
**Anchors:** [`package.json`](../../../package.json#L7-L12), [`src/App.tsx`](../../../src/App.tsx#L120-L127), [`src/App.tsx`](../../../src/App.tsx#L344-L348).
**Risk:** Tooling churn.
**Rollback:** Remove test deps/scripts and test files.

## Ticket 2: Extract Checkout Domain Module
**Scope:** Domain helper + tests.
**Anchors:** [`src/App.tsx`](../../../src/App.tsx#L344-L348), [`src/data.ts`](../../../src/data.ts#L222-L226).
**Risk:** Behavior drift in totals.
**Rollback:** Inline helper back into component.

## Ticket 3: Add Runtime Cart Validation
**Scope:** Parser + tests + docs.
**Anchors:** [`src/App.tsx`](../../../src/App.tsx#L53-L62).
**Risk:** Unexpected reset of user carts.
**Rollback:** Keep parser but change fallback behavior.

## Ticket 4: Add URL Routing
**Scope:** Browser routes for storefront, checkout, dashboard, products, orders, analytics, admin.
**Anchors:** [`src/types.ts`](../../../src/types.ts#L1-L1), [`src/App.tsx`](../../../src/App.tsx#L140-L165).
**Risk:** Breaking existing local nav.
**Rollback:** Return to local `view` state.

## Ticket 5: Componentize App Views
**Scope:** Split `App.tsx` into view/component modules.
**Anchors:** [`src/App.tsx`](../../../src/App.tsx#L172-L780).
**Risk:** Large mechanical diff.
**Rollback:** Keep exports file-local until tests exist.

## Ticket 6: Add Product Form Mock
**Scope:** UI state + validation for creating a product draft.
**Anchors:** Product create buttons in [`src/App.tsx`](../../../src/App.tsx#L195-L198), [`src/App.tsx`](../../../src/App.tsx#L583-L586).
**Risk:** Fake create can be mistaken for persistence.
**Rollback:** Hide behind demo state.

## Ticket 7: Add Discount Validation Semantics
**Scope:** Expiry/value validation and UI states.
**Anchors:** [`src/types.ts`](../../../src/types.ts#L69-L74), [`src/data.ts`](../../../src/data.ts#L222-L226), [`src/App.tsx`](../../../src/App.tsx#L344-L346).
**Risk:** Date/time ambiguity.
**Rollback:** Treat expiry as display-only.

## Ticket 8: Add Accessibility Pass
**Scope:** Labels, focus, tables, icon buttons, mobile nav.
**Anchors:** [`src/App.tsx`](../../../src/App.tsx#L120-L136), [`src/style.css`](../../../src/style.css#L80-L85).
**Risk:** Visual regressions.
**Rollback:** Revert individual styling changes.

## Ticket 9: Add Product/Order Lookup Map
**Scope:** Performance-oriented derived map for orders.
**Anchors:** [`src/App.tsx`](../../../src/App.tsx#L652-L653).
**Risk:** Premature optimization if overdone.
**Rollback:** Keep simple `find` until measured.

## Ticket 10: Add Error Boundary
**Scope:** React boundary + fallback UI.
**Anchors:** [`src/main.tsx`](../../../src/main.tsx#L6-L10), [`src/App.tsx`](../../../src/App.tsx#L83-L168).
**Risk:** Hiding errors in development.
**Rollback:** Dev-only rethrow or remove boundary.
