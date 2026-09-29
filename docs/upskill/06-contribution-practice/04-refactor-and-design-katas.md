# Refactor And Design Katas

## Kata 1: Identify A Boundary Leak
Prompt: Is checkout calculation in [`src/App.tsx`](../../../src/App.tsx#L344-L348) a boundary leak?
Self-grade: Strong answer says "acceptable for prototype, leak before real payment," then proposes extraction and tests.

## Kata 2: Propose An Outbox/Eventing Change
Prompt: Design receipt email and license provisioning after payment.
Self-grade: Strong answer includes order transaction, outbox row, worker, idempotency key, retry, dead-letter visibility.

## Kata 3: Split A Large Module
Prompt: Split [`src/App.tsx`](../../../src/App.tsx#L1-L782).
Self-grade: Strong answer minimizes churn: types/data stay, extract views first, keep behavior tested.

## Kata 4: Remove Duplication
Prompt: Compare product and order table row rendering in [`src/App.tsx`](../../../src/App.tsx#L588-L674).
Self-grade: Strong answer avoids premature generic table abstraction unless repeated needs are clear.

## Kata 5: Improve Type Safety
Prompt: Replace admin control tuples in [`src/App.tsx`](../../../src/App.tsx#L747-L754).
Self-grade: Strong answer introduces a narrow type and preserves display.

## Kata 6: Design A Migration
Prompt: Move products from seed data to database.
Self-grade: Strong answer includes schema, IDs, backfill, API DTO, read path, tests, rollback.

## Kata 7: Reduce N+1
Prompt: Improve order/product lookup in [`src/App.tsx`](../../../src/App.tsx#L652-L653).
Self-grade: Strong answer uses a map only if data grows or remote calls are involved.

## Kata 8: Write An RFC
Prompt: RFC for production checkout.
Self-grade: Strong answer has problem, goals, non-goals, architecture, alternatives, risks, rollout, tests.

## Kata 9: Review A Flawed PR
Prompt: PR adds real admin API data without auth.
Self-grade: Strong answer blocks on authorization and asks for role/tenant tests.
