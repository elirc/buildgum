# Annotation Drills

For each drill, annotate inputs, outputs, dependencies, invariants, side effects, and failure modes.

## Drill 1: App State Owner

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L49-L81)

Questions:
- Which values are source state?
- Which functions mutate state?
- Which values are derived?
- Which side effect is nearby?

Self-grade:
- Basic: names `view`, `query`, `selectedId`, `cartIds`, `promo`, `checkoutComplete`.
- Solid: separates source state from derived `selectedProduct`, `filteredProducts`, `cartProducts`.
- Strong: identifies localStorage parse/write risk and duplicate-prevention invariant.

## Drill 2: Navigation Render

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L93-L107)

Questions:
- What is the key?
- What changes on click?
- What makes active styling work?

Self-grade:
- Basic: finds `setView`.
- Solid: connects `navItems` to `ViewKey`.
- Strong: notices lack of URL/deep-link semantics.

## Drill 3: Search Filter

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L65-L67)

Questions:
- What fields are searchable?
- What is the time complexity?
- What is the empty-state behavior?

Self-grade:
- Basic: says title/creator/category/kind/tags.
- Solid: explains lowercasing.
- Strong: notes client-only search and missing empty state.

## Drill 4: Product Card

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L245-L286)

Questions:
- Which props are data vs actions?
- What happens when "Add" is clicked?
- Why is `CSSProperties` used?

Self-grade:
- Basic: identifies `product`.
- Solid: connects `onAdd` and `onPreview`.
- Strong: explains CSS custom property typing and visual contract.

## Drill 5: Checkout Calculation

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L344-L348)

Questions:
- What is the invariant for total?
- What assumptions are hard-coded?
- What would be unsafe in production?

Self-grade:
- Basic: computes subtotal/discount/tax.
- Solid: names fixed tax and percentage discount.
- Strong: explains server-side price authority and integer money.

## Drill 6: Checkout Form

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L364-L385)

Questions:
- Which fields are controlled?
- What validation exists?
- How would submission read values?

Self-grade:
- Basic: sees default values.
- Solid: distinguishes uncontrolled fields from promo.
- Strong: proposes form validation and payment tokenization boundary.

## Drill 7: Order/Product Join

Excerpt: [`src/App.tsx`](../../../src/App.tsx#L651-L673)

Questions:
- What relationship is represented?
- What fallback exists?
- What scales poorly?

Self-grade:
- Basic: finds `productId`.
- Solid: explains `Unknown product`.
- Strong: identifies render-time lookup and future data integrity constraints.

## Drill 8: Responsive Layout

Excerpt: [`src/style.css`](../../../src/style.css#L849-L980)

Questions:
- What changes at 1180px?
- What changes at 760px?
- What accessibility concern appears with icon-only nav?

Self-grade:
- Basic: names breakpoints.
- Solid: explains grid collapse and fixed bottom nav.
- Strong: checks focus, labels, hit targets, and content overlap.

## Drill 9: Domain Type Optional Fields

Excerpt: [`src/types.ts`](../../../src/types.ts#L7-L29)

Questions:
- Which fields are optional?
- Which fields are display-only vs likely persistent?
- Which fields should become structured objects?

Self-grade:
- Basic: names `compareAt` and `subscription`.
- Solid: identifies price/rating/refund/conversion.
- Strong: suggests structured money, product status history, and creator ID.

## Drill 10: Activity Severity

Excerpt: [`src/data.ts`](../../../src/data.ts#L215-L220), [`src/App.tsx`](../../../src/App.tsx#L560-L568), [`src/style.css`](../../../src/style.css#L763-L775)

Questions:
- How does data become styling?
- What breaks if severity changes?
- What test would catch it?

Self-grade:
- Basic: finds severity field.
- Solid: connects lowercase class to CSS.
- Strong: proposes exhaustive mapping instead of string-derived class.
