# Boundaries And Layers

## Current Layers

| Layer | Current owner | Evidence | Should own | Must not own |
| --- | --- | --- | --- | --- |
| Document shell | `index.html` | [`index.html`](../../../index.html#L1-L13) | Root node, metadata, module script. | Product state. |
| React entry | `src/main.tsx` | [`src/main.tsx`](../../../src/main.tsx#L1-L10) | Mounting app and global CSS. | Domain logic. |
| UI/application | `src/App.tsx` | [`src/App.tsx`](../../../src/App.tsx#L49-L780) | Current state, derived data, render, mock calculations. | Future payment authority, auth, persistence. |
| Domain contracts | `src/types.ts` | [`src/types.ts`](../../../src/types.ts#L1-L74) | Shared types and allowed states. | Runtime validation alone. |
| Seed data | `src/data.ts` | [`src/data.ts`](../../../src/data.ts#L1-L228) | Demo data. | Durable records. |
| Styling | `src/style.css` | [`src/style.css`](../../../src/style.css#L1-L980) | Layout, components, responsive behavior. | Business logic. |

## Boundary Leaks To Watch

- Checkout contains money calculation directly in UI in [`src/App.tsx`](../../../src/App.tsx#L344-L348). Good for prototype; future domain/service boundary needed.
- Admin controls are untyped local tuples in [`src/App.tsx`](../../../src/App.tsx#L747-L754). Fine for display; future contract should be typed.
- CSS class names depend on status/risk strings in [`src/App.tsx`](../../../src/App.tsx#L608-L614) and [`src/style.css`](../../../src/style.css#L797-L813). This is an implicit contract.

## Difficulty Ladder

Junior: identify layer ownership before editing.

Mid-level: extract a component or helper only when it reduces blast radius and preserves behavior.

Senior: define migration boundaries: API schema, runtime validation, persistence model, auth policy, observability, and rollback.

## Drill

Draw the current boundary for checkout. Then draw the future production boundary with client, API, payment provider, tax service, order database, webhook handler, and fulfillment worker.
