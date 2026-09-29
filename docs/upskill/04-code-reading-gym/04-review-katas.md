# Review Katas

## Kata 1: Add `Archived` Product Status

**Author intent:** Add an archived status for old products.
**Fake diff summary:**
- Adds `'Archived'` to `ProductStatus`.
- Updates one seed product.
- Does not update CSS or tests.
**Files this resembles:**
- [`src/types.ts`](../../../src/types.ts#L3-L3)
- [`src/App.tsx`](../../../src/App.tsx#L608-L608)
- [`src/style.css`](../../../src/style.css#L797-L813)
**Your task:** Review this PR.
**Expected findings:**
Blocking:
- New status lacks visual mapping/fallback.
Important:
- Needs test once harness exists.
Optional:
- Consider status description in docs.
**Good review comment example:**
> Could you add the status styling or an explicit fallback? The render path derives a CSS class from the status string, so `Archived` currently has no visual contract.

## Kata 2: Store Full Product Objects In Cart

**Author intent:** Avoid product lookup on checkout.
**Fake diff summary:** Saves `Product[]` to localStorage instead of IDs.
**Files this resembles:** [`src/App.tsx`](../../../src/App.tsx#L53-L71)
**Expected findings:**
Blocking:
- Product data will go stale and can be tampered with.
Important:
- Increases storage size and migration burden.
Optional:
- Add a typed parser for IDs instead.
**Good review comment example:**
> Keeping cart storage as IDs preserves product price authority. Let’s avoid storing full product objects unless we also define cache invalidation and migration rules.

## Kata 3: Real Payment In Client

**Author intent:** Make checkout charge cards.
**Fake diff summary:** Calls payment provider directly from `onComplete`.
**Files this resembles:** [`src/App.tsx`](../../../src/App.tsx#L442-L445)
**Expected findings:**
Blocking:
- Payment authority and secrets must not live in browser code.
- No idempotency or webhook reconciliation.
Important:
- Need server API and tests.
Optional:
- Keep mock success behind demo mode.
**Good review comment example:**
> This crosses a trust boundary. The browser can request checkout, but server-side code must own price validation, payment intent creation, idempotency, and order persistence.

## Kata 4: Add Admin Data From API Without Auth

**Author intent:** Load admin controls dynamically.
**Fake diff summary:** Fetches `/admin/controls` from browser for everyone.
**Files this resembles:** [`src/App.tsx`](../../../src/App.tsx#L746-L778)
**Expected findings:**
Blocking:
- Missing auth/role enforcement.
Important:
- Need loading/error states.
Optional:
- Type API response.
**Good review comment example:**
> The current admin panel is mock UI. Before making it real, the endpoint needs role enforcement and client states for loading, denied, and failure.

## Kata 5: Replace `Product` With `any`

**Author intent:** Move fast while adding API data.
**Fake diff summary:** Changes component props to `any`.
**Files this resembles:** [`src/types.ts`](../../../src/types.ts#L7-L29), [`src/App.tsx`](../../../src/App.tsx#L179-L185)
**Expected findings:**
Blocking:
- Loses compile-time contract for core domain.
Important:
- Should validate unknown API data into typed objects.
Optional:
- Use schema library.
**Good review comment example:**
> Can we keep the `Product` boundary and validate the incoming response instead? `any` would remove the protection that catches missing price/status/risk fields.

## Kata 6: Add Search API On Every Keystroke

**Author intent:** Server-side search.
**Fake diff summary:** `fetch` inside `onChange` for each keypress.
**Files this resembles:** [`src/App.tsx`](../../../src/App.tsx#L120-L127), [`src/App.tsx`](../../../src/App.tsx#L65-L67)
**Expected findings:**
Blocking:
- Race conditions and unbounded requests.
Important:
- Needs debounce/cancellation/loading/error state.
Optional:
- Keep local filter for offline demo mode.
**Good review comment example:**
> The current search is synchronous local filtering. Moving it remote needs request cancellation or stale-response protection so older responses cannot overwrite newer queries.

## Kata 7: One-Off Mobile CSS Fix

**Author intent:** Fix checkout on phone.
**Fake diff summary:** Adds absolute positions to line items.
**Files this resembles:** [`src/style.css`](../../../src/style.css#L963-L970)
**Expected findings:**
Blocking:
- May overlap content and break dynamic text.
Important:
- Should preserve grid/flex layout.
Optional:
- Add browser screenshot verification.
**Good review comment example:**
> Could we keep this in the existing responsive grid pattern? Absolute positioning here makes long product names and translated text more likely to overlap.

## Kata 8: Add Discount Expiry Display Only

**Author intent:** Show discount expiration.
**Fake diff summary:** Displays `expires` but checkout still applies expired codes.
**Files this resembles:** [`src/data.ts`](../../../src/data.ts#L222-L226), [`src/App.tsx`](../../../src/App.tsx#L344-L346)
**Expected findings:**
Blocking:
- If expiry is user-visible, validation must match display.
Important:
- Need date parsing policy and tests.
Optional:
- Explain time zone.
**Good review comment example:**
> Displaying expiry without enforcing it creates a misleading contract. Let’s either keep it informational in mock data or add validation semantics with tests.
