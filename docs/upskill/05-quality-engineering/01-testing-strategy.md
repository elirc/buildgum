# Testing Strategy

## Current State

No test files or test script were found. The only automated checks are TypeScript and production build:

- [`package.json`](../../../package.json#L9-L10)

## Recommended Test Layers

| Layer | What belongs here | Buildgum examples | What not to test |
| --- | --- | --- | --- |
| Type tests | Compile-time contracts. | `ViewKey`, `ProductStatus`, `RiskLevel` in [`src/types.ts`](../../../src/types.ts#L1-L5). | Runtime API trust. |
| Unit tests | Pure helpers. | Future checkout total helper extracted from [`src/App.tsx`](../../../src/App.tsx#L344-L348). | Browser rendering. |
| Component tests | UI state and interactions. | Search input, cart add/remove, checkout complete. | Third-party icon internals. |
| E2E tests | User flows in browser. | Storefront to checkout confirmation. | Every visual detail. |
| Contract tests | API schema compatibility once backend exists. | Future product/order/discount API. | Mock-only seed data. |

## Fixtures And Builders

Current seed data lives in [`src/data.ts`](../../../src/data.ts#L1-L228). Once tests exist, prefer small builders over importing all seed data into every test. Builders reduce coupling and make edge cases explicit.

## Flake Prevention

- Avoid real timers unless needed.
- Avoid depending on product order unless the behavior requires it.
- Use accessible queries for UI tests.
- Reset localStorage between tests.
- Keep tests deterministic around dates and currency.

## Drill

Write a test plan for checkout totals before writing any test code.

Strong answer includes: valid discount, invalid discount, empty cart, integer cents, tax rate policy, and UI disabled state.
