# Code Review Mindset

Review layers:

1. Does it work?
2. Is it correct?
3. Will it stay correct?
4. Does it fit the codebase?
5. Is it kind to future maintainers?

## Repo-Specific Checklist

- State ownership: does change respect `App` state boundaries in [`src/App.tsx`](../../../src/App.tsx#L49-L81)?
- Type contracts: are unions/interfaces updated in [`src/types.ts`](../../../src/types.ts#L1-L74)?
- Data shape: are seed data and render paths aligned in [`src/data.ts`](../../../src/data.ts#L1-L228)?
- CSS contracts: do new status/risk/severity values have styles in [`src/style.css`](../../../src/style.css#L792-L813)?
- Checkout: does it avoid pretending mock UI is real payment behavior?
- Accessibility: are icon buttons labeled and focusable?
- Quality: did `npm run check` and `npm run build` pass?

## Good Review Comments

> Could we keep this as derived data instead of storing another state value? `filteredProducts` already follows that pattern in `src/App.tsx:65-67`, which avoids drift.

> This is a good UI improvement, but the new product status also needs a CSS mapping or fallback. Right now the class name is derived from the status string.

> I think this crosses a trust boundary. Client-side checkout math is fine for the mock, but real order creation needs server-side price validation.

## Drill

Review a change that adds `Blocked` risk. Write one blocking comment, one maintainability comment, and one optional style comment.
