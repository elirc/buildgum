# Good First Tickets

## Ticket 1: Add Empty State For Product Search
**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** Conditional rendering, UX states.
**Story:** As a buyer, I want a useful message when search has no matches so that I know what happened.
**Why this is a good contribution:** Small blast radius in `Discover`.
**Acceptance criteria:**
- [ ] Empty message appears when `filteredProducts.length === 0`.
- [ ] Existing product grid still works.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L211-L220) - product grid mapping.
**Files likely touched:**
- `src/App.tsx` - add empty branch.
- `src/style.css` - optional styling.
**Implementation plan:** Add a conditional before the grid map, style it with existing panel tokens, run checks.
**Illustrative fake-code shape:**
```tsx
// Illustrative fake code: adapt to the repo.
{items.length === 0 ? <EmptyState /> : items.map(...)}
```
**What could go wrong:** Empty state appears before user types because empty query may still return all products.
**Suggested checks:** `npm run check`, `npm run build`.
**Review questions:** Does it preserve layout on mobile?

## Ticket 2: Add Safe Cart Storage Parser
**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** Runtime validation, error recovery.
**Story:** As a user, I want corrupted local cart storage not to crash the app.
**Acceptance criteria:**
- [ ] Invalid JSON falls back safely.
- [ ] Non-array JSON falls back safely.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L53-L56) - current parse.
**Files likely touched:** `src/App.tsx`.
**Implementation plan:** Add file-local parser helper, use it in initializer, keep default behavior.
**Illustrative fake-code shape:**
```ts
// Illustrative fake code: adapt to the repo.
function parseIds(raw: string | null): string[] {
  try { return isStringArray(JSON.parse(raw ?? '[]')) ? parsed : fallback }
  catch { return fallback }
}
```
**What could go wrong:** Catching errors silently hides debugging signal.
**Suggested checks:** `npm run check`, manual reload with bad localStorage.
**Review questions:** Should invalid data reset to default product or empty cart?

## Ticket 3: Extract Checkout Total Helper
**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** Pure functions, domain seams.
**Story:** As a maintainer, I want checkout math in a helper so it can be tested.
**Acceptance criteria:**
- [ ] UI behavior unchanged.
- [ ] Helper accepts cart products and promo.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L344-L348)
**Files likely touched:** `src/App.tsx`, optional new `src/domain/checkout.ts`.
**Implementation plan:** Move calculation to pure helper, return subtotal/discount/tax/total.
**What could go wrong:** Moving too much UI state into helper.
**Suggested checks:** `npm run check`, `npm run build`.
**Review questions:** Is the helper pure and easy to test?

## Ticket 4: Type Admin Controls
**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** Type modeling.
**Story:** As a maintainer, I want admin control rows typed so labels and states do not drift.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L746-L775)
**Acceptance criteria:**
- [ ] Local tuple becomes typed object list.
- [ ] Render output unchanged.
**Files likely touched:** `src/App.tsx`, maybe `src/types.ts`.
**Implementation plan:** Add `type AdminControl` and convert arrays to objects.
**What could go wrong:** Over-engineering a tiny local list.
**Suggested checks:** `npm run check`.
**Review questions:** Does the new type make invalid states harder?

## Ticket 5: Add Activity Severity Fallback
**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** Exhaustive mapping.
**Story:** As a maintainer, I want activity severity styling to fail gracefully.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L560-L568)
- [`src/style.css`](../../../src/style.css#L763-L775)
**Acceptance criteria:**
- [ ] Known severities map explicitly.
- [ ] Unknown future values have neutral style if introduced through untyped data.
**Files likely touched:** `src/App.tsx`, `src/style.css`.
**What could go wrong:** Weakening useful compile-time unions.
**Suggested checks:** `npm run check`.
**Review questions:** Is the fallback for runtime data or type data?

## Ticket 6: Fix Potential Product Table Separator Encoding
**Difficulty:** Easy
**Estimated time:** 30 minutes
**Skills practiced:** Verification before fixing.
**Story:** As a reader, I want product table text to display cleanly.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L604-L606)
**Acceptance criteria:**
- [ ] Verify whether the separator renders incorrectly in browser/editor.
- [ ] If wrong, replace with ASCII-safe separator or proper middot.
**Files likely touched:** `src/App.tsx`.
**What could go wrong:** Changing without verifying.
**Suggested checks:** Browser inspection, `npm run check`.
**Review questions:** Did you verify the actual rendered issue?

## Ticket 7: Add README Link To Upskill Docs
**Difficulty:** Easy
**Estimated time:** 20 minutes
**Skills practiced:** Documentation navigation.
**Story:** As a learner, I want to find training docs from the root README.
**Read these anchors first:**
- [`README.md`](../../../README.md#L1-L29)
**Acceptance criteria:**
- [ ] Root README links to `docs/upskill/README.md`.
**Files likely touched:** `README.md`.
**Suggested checks:** Click link locally.
**Review questions:** Does this preserve existing README purpose?

## Ticket 8: Add Accessible Label To Icon-Only Mobile Nav Context
**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** Accessibility.
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L97-L105)
- [`src/style.css`](../../../src/style.css#L854-L857)
**Acceptance criteria:**
- [ ] Icon-only state still has accessible button names.
- [ ] Visible desktop labels unchanged.
**Files likely touched:** `src/App.tsx`.
**What could go wrong:** Duplicating labels for screen readers.
**Suggested checks:** Inspect accessibility tree if possible.
**Review questions:** Does the button name remain stable?

## Ticket 9: Add Cart Empty Message In Checkout
**Difficulty:** Easy
**Estimated time:** 45 minutes
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L388-L404)
- [`src/App.tsx`](../../../src/App.tsx#L442-L445)
**Acceptance criteria:**
- [ ] Empty cart shows a clear message.
- [ ] Pay button remains disabled.
**Files likely touched:** `src/App.tsx`, maybe `src/style.css`.
**Suggested checks:** Remove all items and inspect.
**Review questions:** Does user have a path back to products?

## Ticket 10: Add Product Count To Storefront Heading
**Difficulty:** Easy
**Estimated time:** 30 minutes
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L190-L199)
- [`src/App.tsx`](../../../src/App.tsx#L211-L220)
**Acceptance criteria:**
- [ ] Heading area shows filtered count.
- [ ] Count updates with search.
**Files likely touched:** `src/App.tsx`.
**Suggested checks:** Search by tag and title.
**Review questions:** Is count useful or noisy?

## Ticket 11: Document Product Field Ownership
**Difficulty:** Easy
**Estimated time:** 1 hour
**Read these anchors first:**
- [`src/types.ts`](../../../src/types.ts#L7-L29)
- [`src/data.ts`](../../../src/data.ts#L13-L143)
**Acceptance criteria:**
- [ ] Add docs explaining display fields vs future persistence fields.
**Files likely touched:** `docs/upskill`.
**Suggested checks:** Markdown link check manually.
**Review questions:** Are uncertainty labels clear?

## Ticket 12: Add Currency Note Near Formatter
**Difficulty:** Easy
**Estimated time:** 30 minutes
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L44-L47)
**Acceptance criteria:**
- [ ] Add a succinct comment or docs note, not a broad refactor.
**Files likely touched:** `src/App.tsx` or docs.
**Suggested checks:** `npm run check`.
**Review questions:** Is comment explaining policy, not obvious code?

## Ticket 13: Add Dashboard Metric Empty Fallback
**Difficulty:** Easy
**Estimated time:** 45 minutes
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L478-L490)
**Acceptance criteria:**
- [ ] Empty metrics array would not render a broken grid.
**Files likely touched:** `src/App.tsx`.
**Suggested checks:** Temporary local data edit, then revert.
**Review questions:** Does fallback follow existing visual pattern?

## Ticket 14: Add Responsive Image Dimensions Note
**Difficulty:** Easy
**Estimated time:** 45 minutes
**Read these anchors first:**
- [`src/App.tsx`](../../../src/App.tsx#L201-L202)
- [`src/style.css`](../../../src/style.css#L313-L331)
**Acceptance criteria:**
- [ ] Document asset size and future responsive image strategy.
**Files likely touched:** docs.
**Suggested checks:** Confirm asset path.
**Review questions:** Is this useful without changing product code?

## Ticket 15: Add Verification Checklist To PR Template Docs
**Difficulty:** Easy
**Estimated time:** 1 hour
**Read these anchors first:**
- [`docs/upskill/07-career-and-collaboration/02-writing-prs-and-rfcs.md`](../../07-career-and-collaboration/02-writing-prs-and-rfcs.md)
**Acceptance criteria:**
- [ ] Checklist mentions `npm run check`, `npm run build`, screenshots for UI.
**Files likely touched:** docs.
**Suggested checks:** Read rendered Markdown.
**Review questions:** Does it avoid process bloat?
