# Senior Build Projects

## Project 1: Production Checkout Architecture
**Duration:** 2-4 weeks
**Problem statement:** Current checkout is UI-only in [`src/App.tsx`](../../../src/App.tsx#L329-L453).
**Product value:** Real paid orders with safe fulfillment.
**Design checklist:** Server price authority, payment intent, tax, idempotency, order state machine, webhooks, receipt, license provisioning.
**Likely files/modules:** New API/server, domain checkout module, DB schema, webhook handler, UI states.
**Migration plan:** Keep mock checkout, add real path behind feature flag.
**Test plan:** Unit totals, API validation, webhook replay, E2E happy path.
**Security plan:** No secrets in browser, role checks, signed webhooks.
**Performance plan:** Async fulfillment and bounded retries.
**Rollout/rollback:** Feature flag and payment sandbox.
**Open questions:** Payment provider, tax provider, supported countries.
**Stretch goals:** Refund/dispute workflow.

## Project 2: Auth And Role-Based Access
**Duration:** 1-3 weeks
**Problem statement:** Admin/dashboard views are local-only and unprotected in [`src/App.tsx`](../../../src/App.tsx#L161-L165).
**Product value:** Protect creator/admin operations.
**Design checklist:** Users, creators, roles, sessions, route guards, API authorization.
**Migration plan:** Add auth shell without changing mock UI first.
**Test plan:** Permission success/failure and cross-resource rejection.
**Security plan:** IDOR tests, least privilege, secure session settings.
**Rollout/rollback:** Admin features hidden until auth is ready.

## Project 3: Data Model And API Contracts
**Duration:** 2-4 weeks
**Problem statement:** Seed data in [`src/data.ts`](../../../src/data.ts#L1-L228) stands in for persistence.
**Product value:** Durable products/orders/discounts/activity.
**Design checklist:** Schema, migrations, API DTOs, runtime validation, seed migration.
**Test plan:** Migration tests, API contract tests, data integrity tests.
**Security plan:** Tenant scoping.
**Performance plan:** Indexes for order/product queries.
**Rollout/rollback:** Read-only API before write flows.

## Project 4: Design System Extraction
**Duration:** 3-7 days
**Problem statement:** Reusable layout/panel/button/table styles live globally in [`src/style.css`](../../../src/style.css#L236-L365).
**Product value:** Safer UI growth.
**Design checklist:** Button, panel, table, badge, responsive grid primitives.
**Test plan:** Visual smoke tests/screenshots.
**Performance plan:** Avoid CSS bloat and specificity fights.
**Rollback:** Keep old class names as compatibility layer.

## Project 5: Observability Foundation
**Duration:** 1-2 weeks
**Problem statement:** No error reporting or operational signals exist.
**Product value:** Diagnose failures once APIs and payments exist.
**Design checklist:** Error boundary, client error reporting, API logs, metrics names, dashboard.
**Test plan:** Error boundary test and synthetic failure.
**Security plan:** Scrub PII and secrets.
**Rollout/rollback:** Start in dev/staging.

## Project 6: Quality Gate And CI
**Duration:** 2-5 days
**Problem statement:** Only local scripts exist in [`package.json`](../../../package.json#L7-L12).
**Product value:** Maintainers trust PRs.
**Design checklist:** Typecheck, build, tests, lint, formatting, dependency audit.
**Test plan:** CI must fail on broken type/build/test.
**Rollout/rollback:** Start with non-blocking status, then required checks.
