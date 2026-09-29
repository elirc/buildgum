# Tooling And Build System

## Vite Mental Model

Vite serves source modules during development and bundles for production. The module script in [`index.html`](../../../index.html#L10-L11) points to [`src/main.tsx`](../../../src/main.tsx#L1-L10). Production output is created by `npm run build` from [`package.json`](../../../package.json#L10-L10).

Why it matters: dev behavior and production bundles are related but not identical. Always run production build before merging risky UI changes.

## Type Checking

`npm run check` runs `tsc --noEmit` in [`package.json`](../../../package.json#L9-L9). Compiler options include bundler resolution and React JSX in [`tsconfig.json`](../../../tsconfig.json#L9-L15), plus unused checks in [`tsconfig.json`](../../../tsconfig.json#L17-L21).

Pitfall checklist:

- Do not assume TypeScript checks runtime API/storage data.
- Do not ignore unused warnings; this repo fails on unused locals/params.
- Do not add `any` to bypass design thinking.

## Missing Tooling To Notice

The repo currently lacks:

- Test script.
- Lint script.
- Formatting script.
- CI workflow.
- Browser/E2E tooling.
- Type-level API schema checks.

This is not unusual for a freshly generated prototype. It becomes a priority before production integration.

## Drill

Design a minimal quality gate for this repo:

1. `npm run check`
2. `npm run build`
3. Add a future `npm test` for unit/UI tests.
4. Add a future lint/format command.

Self-grade:

- Basic: runs current commands.
- Solid: explains what each catches.
- Strong: proposes CI order, cache strategy, and failure triage.

## Verification Notes

- Ran `npm run check` successfully.
- Earlier run of `npm run build` passed.
- No CI, lint, or test configuration found.
