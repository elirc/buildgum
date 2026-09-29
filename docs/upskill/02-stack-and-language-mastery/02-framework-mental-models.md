# React Mental Models

## Concept: Render Is A Pure Description

React components return a description of UI for current state. `App` returns the shell and conditionally selected view in [`src/App.tsx`](../../../src/App.tsx#L83-L168). Components such as `ProductCard` and `ProductPreview` are pure with respect to props in [`src/App.tsx`](../../../src/App.tsx#L245-L327).

Why it matters: render should not charge cards, write files, mutate global data, or call APIs that change state. Side effects belong in event handlers, effects, or server actions depending on architecture.

Failure modes:

- Side effects inside render run unpredictably during re-renders.
- StrictMode can make development behavior expose impure logic.

Drill: identify which functions in `src/App.tsx` are pure render helpers and which perform state changes.

## Concept: State Placement

State is centralized in `App`: `view`, `query`, `selectedId`, `cartIds`, `promo`, and `checkoutComplete` are declared in [`src/App.tsx`](../../../src/App.tsx#L50-L58). Child components receive props and callbacks.

Why it matters: lifting state to the owner makes coordination easy. Over-lifting can make one file too large.

Failure modes:

- State too low: checkout summary and cart button drift.
- State too high: unrelated view changes re-render more of the app.

Drill: decide whether `promo` belongs in `App` or `Checkout`. A strong answer weighs cart summary needs, URL persistence, and future checkout routes.

## Concept: Effects Are Synchronization

The only effect writes cart IDs to localStorage in [`src/App.tsx`](../../../src/App.tsx#L60-L62). The effect synchronizes React state with an external browser store.

Why it matters: effects are for synchronizing with systems outside React, not for deriving values that can be computed during render.

Failure modes:

- Missing dependency writes stale data.
- Extra dependency causes unnecessary writes.
- Parse/write errors are unhandled.

Drill: explain why `filteredProducts` should not be computed in a `useEffect`.

## Concept: Keys Preserve Identity

Lists use stable keys:

- Nav buttons use `item.key` in [`src/App.tsx`](../../../src/App.tsx#L97-L100).
- Product cards use `product.id` in [`src/App.tsx`](../../../src/App.tsx#L212-L214).
- Cart line items use `product.id` in [`src/App.tsx`](../../../src/App.tsx#L388-L390).
- Metrics use `metric.label` in [`src/App.tsx`](../../../src/App.tsx#L481-L482).

Why it matters: keys let React preserve component identity across list updates.

Failure modes:

- Index keys break stateful list items when order changes.
- Non-unique labels can collide.

Drill: find one key that is safe and one that could become unsafe if product requirements changed.

## Concept: Controlled Vs Uncontrolled Inputs

Search and promo are controlled inputs: their `value` is state and `onChange` updates state in [`src/App.tsx`](../../../src/App.tsx#L122-L127) and [`src/App.tsx`](../../../src/App.tsx#L421-L423). Checkout email/company/card/country use `defaultValue` in [`src/App.tsx`](../../../src/App.tsx#L364-L385), so they are uncontrolled after initial render.

Why it matters: controlled inputs are easier to validate and submit; uncontrolled inputs are simpler but need refs/form handling for real submission.

Drill: classify every input in checkout and explain what would change for real form validation.

## Verification Notes

- Inspected all component definitions in `src/App.tsx`.
- No React Router, data-fetching library, form library, error boundary, or test renderer exists.
