# Validation, Auth, And Permissions

## Current Validation

| Boundary | Current behavior | Evidence | Risk |
| --- | --- | --- | --- |
| TypeScript compile time | Unions and interfaces constrain source code. | [`src/types.ts`](../../../src/types.ts#L1-L74). | Runtime data still untrusted. |
| Search input | Controlled string state. | [`src/App.tsx`](../../../src/App.tsx#L120-L127). | No debounce or remote query validation. |
| Promo code | Trim/uppercase before lookup. | [`src/App.tsx`](../../../src/App.tsx#L344-L344). | Expiry and bounds ignored. |
| Checkout fields | HTML input types/defaults. | [`src/App.tsx`](../../../src/App.tsx#L364-L385). | No submit validation. |
| Cart storage | Type assertion after parse. | [`src/App.tsx`](../../../src/App.tsx#L55-L55). | No runtime shape validation. |

## Current Auth And Authorization

No authentication, authorization, sessions, tenant scoping, API keys, role checks, or permission filters exist. Views such as Admin are reachable by local UI state in [`src/App.tsx`](../../../src/App.tsx#L161-L165). Treat Admin as mock UI only.

## What A Junior Might Miss

- `type="email"` in [`src/App.tsx`](../../../src/App.tsx#L367-L367) is not enough for real checkout validation.
- Text saying "TLS enforced" in [`src/App.tsx`](../../../src/App.tsx#L358-L360) is not a security control.
- `ViewKey` prevents typoed local views, not unauthorized access.

## What A Senior Checks

- Can a user access another creator's orders? Future API must enforce tenant/resource ownership.
- Can client prices be tampered with? Future checkout must use server-side price authority.
- Can a promo code be reused after expiration? Future validation must check expiration and redemption limits.
- Can admin routes be deep-linked? Future router/API must require roles.
- Are audit logs append-only and tamper-evident? Current `activity` data is only display seed data.

## IDOR Checklist For Future Work

When adding APIs:

- Every order lookup includes authenticated user/tenant scope.
- Every product mutation checks creator ownership.
- Every admin action requires a role separate from creator.
- IDs from route params are treated as untrusted input.
- Tests include cross-creator rejection.

## Drill

Write a future permission rule for "creator can see orders for their products." Identify input, authenticated actor, resource, policy decision, and error response.
