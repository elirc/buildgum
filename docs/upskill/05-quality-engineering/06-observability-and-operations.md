# Observability And Operations

## Current State

No logging framework, metrics, tracing, health checks, error boundary, deployment config, rollback config, or alerting files were found. Operational UI is mock display only, such as activity rows in [`src/App.tsx`](../../../src/App.tsx#L549-L573).

## How Would I Know This Broke?

| Flow | Current signal | Missing production signal |
| --- | --- | --- |
| App boot | Browser blank screen or console error. | Error boundary reporting, uptime check. |
| Search | Manual UI observation. | Search latency and error metrics. |
| Cart storage | Browser crash/console error. | Client error logging. |
| Checkout | Mock success message. | Payment success/failure metrics, webhook reconciliation, order audit log. |
| Orders table | Manual UI observation. | API error rate, query latency, missing product alerts. |
| Admin controls | Mock values. | Control freshness, policy queue alerts, audit trail. |

## Future Observability Plan

1. Add React error boundary with user-safe fallback.
2. Add client error reporting with release/version tags.
3. Add API request logging once APIs exist.
4. Add metrics for checkout started, payment intent created, paid, fulfilled, refunded, disputed.
5. Add webhook replay/idempotency logs.
6. Add health checks for API, DB, queue, payment provider, tax service.
7. Define rollback runbook for checkout and product publishing.

## Drill

For checkout, define three logs, three metrics, and two alerts. A strong answer distinguishes user-facing failure from operator-facing diagnosis.
