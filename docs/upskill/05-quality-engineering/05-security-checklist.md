# Security Checklist

## Current Reality

Buildgum has no real auth, API, server, cookies, payment provider, webhooks, database, file uploads, or secrets. Security review therefore focuses on mock UI boundaries and future production design.

## Checklist

| Risk | Current evidence | Current status | Future check |
| --- | --- | --- | --- |
| Authorization | Admin renders from local view state in [`src/App.tsx`](../../../src/App.tsx#L161-L165). | Not implemented. | Role checks on routes and APIs. |
| IDOR | Orders have customer/product IDs in [`src/data.ts`](../../../src/data.ts#L152-L213). | No backend. | Scope every order query by actor. |
| Input validation | Checkout fields in [`src/App.tsx`](../../../src/App.tsx#L364-L385). | HTML only. | Runtime schema and server validation. |
| XSS | React escapes text by default. Product text rendered in [`src/App.tsx`](../../../src/App.tsx#L263-L267). | Low current risk. | Avoid `dangerouslySetInnerHTML`. |
| CSRF | No server cookies/forms. | Not applicable. | Needed if cookie-auth APIs exist. |
| SSRF | No server fetch. | Not applicable. | Validate URLs in future integrations. |
| SQL/command injection | No DB/commands. | Not applicable. | Use parameterized queries. |
| Open redirect | No routing redirects. | Not applicable. | Validate return URLs. |
| Secrets | No env/secrets. | Not applicable. | Never expose payment secret keys to client. |
| Dependency risk | Dependencies in [`package.json`](../../../package.json#L14-L22). | `npm audit` previously reported no vulnerabilities. | Run audit in CI. |
| Webhooks | None. | Not implemented. | Verify signatures and replay idempotently. |
| Rate limiting | No API. | Not implemented. | Add on checkout/auth/search endpoints. |

## Pre-Merge Security Questions

- Does this change trust client-controlled price, status, risk, or creator ID?
- Does it expose admin data without role checks?
- Does it parse storage/API data without validation?
- Does it introduce HTML injection?
- Does it introduce secrets into browser code?
- Does it add irreversible side effects without idempotency?

## Drill

Turn checkout into a threat model. Identify attacker, asset, entry point, trust boundary, impact, and mitigation.
