# Learning Rubrics

## Junior

Observable behaviors:

- Can run `npm run check` and `npm run build`.
- Can explain app boot from [`index.html`](../../../index.html#L9-L11) to [`src/main.tsx`](../../../src/main.tsx#L6-L10).
- Can identify source state in [`src/App.tsx`](../../../src/App.tsx#L49-L58).
- Can make small UI changes without touching unrelated files.
- Can ask for help with file anchors and reproduction steps.

Self-assessment:

- [ ] I can trace storefront search.
- [ ] I can trace cart add/remove.
- [ ] I can explain why `Product` type matters.
- [ ] I can run the verified checks.

## Mid-Level

Observable behaviors:

- Can design a small cross-file change with tests/checks.
- Can separate source state, derived data, and side effects.
- Can identify missing validation/auth/persistence boundaries.
- Can review PRs for correctness and maintainability.
- Can propose focused refactors with rollback.

Self-assessment:

- [ ] I can extract checkout math safely.
- [ ] I can design tests for search/cart/checkout.
- [ ] I can spot type/runtime validation gaps.
- [ ] I can write a clear PR description.

## Senior

Observable behaviors:

- Can critique architecture without overcorrecting a prototype.
- Can identify trust boundaries and blast radius.
- Can propose staged migrations.
- Can weigh performance/security/reliability tradeoffs.
- Can teach the repo to others using anchors and drills.

Self-assessment:

- [ ] I can design production checkout.
- [ ] I can design auth/tenant scoping.
- [ ] I can propose CI/test strategy.
- [ ] I can write an RFC with rollout/rollback.
