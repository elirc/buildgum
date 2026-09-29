# Data Model And Persistence

## Current Data Model

The current data model is TypeScript types plus seeded constants:

- `Product`: [`src/types.ts`](../../../src/types.ts#L7-L29), seed rows in [`src/data.ts`](../../../src/data.ts#L13-L143).
- `Creator`: [`src/types.ts`](../../../src/types.ts#L31-L39), seed object in [`src/data.ts`](../../../src/data.ts#L3-L11).
- `Order`: [`src/types.ts`](../../../src/types.ts#L41-L52), seed rows in [`src/data.ts`](../../../src/data.ts#L152-L213).
- `Metric`: [`src/types.ts`](../../../src/types.ts#L54-L59), seed rows in [`src/data.ts`](../../../src/data.ts#L145-L150).
- `Activity`: [`src/types.ts`](../../../src/types.ts#L61-L67), seed rows in [`src/data.ts`](../../../src/data.ts#L215-L220).
- `Discount`: [`src/types.ts`](../../../src/types.ts#L69-L74), seed rows in [`src/data.ts`](../../../src/data.ts#L222-L226).

## Relationships

| Relationship | Evidence | Current enforcement |
| --- | --- | --- |
| Order belongs to product | `productId` in [`src/types.ts`](../../../src/types.ts#L44-L44), lookup in [`src/App.tsx`](../../../src/App.tsx#L652-L653). | None beyond optional fallback. |
| Product belongs to creator by text | `creator` and `handle` in [`src/types.ts`](../../../src/types.ts#L10-L11). | No creator ID. |
| Discount affects checkout | Discount lookup in [`src/App.tsx`](../../../src/App.tsx#L344-L346). | Code match only; expiry ignored. |

## Persistence

There is no database, migration system, ORM, schema file, seed script, or query layer. The only durable local state is browser localStorage for cart IDs in [`src/App.tsx`](../../../src/App.tsx#L53-L62).

## How To Safely Add Persistence Later

1. Define database entities from current types, but do not copy UI strings blindly.
2. Add stable IDs for creator, product, price, discount, order, license, and activity.
3. Store money in integer minor units.
4. Add foreign keys for `order.product_id`.
5. Add indexes for common lookups: creator products, customer orders, product status, order status, created date.
6. Add runtime schema validation at API boundaries.
7. Backfill seed data through migration/seed scripts.
8. Keep client display types separate from persistence rows.

## Drill

Design a `products` table from `Product`. Mark each field as required, optional, derived, or denormalized.

Strong answer includes price cents, currency, creator ID, publish status, risk status, timestamps, and migration strategy.
