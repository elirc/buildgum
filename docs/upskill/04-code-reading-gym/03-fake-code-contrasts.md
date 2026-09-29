# Fake Code Contrasts

## Contrast 1: Coupling UI Shape To Future DB Shape

```ts
// Illustrative fake code: not from this repo.
type ProductRow = Product
```

Better:

```ts
// Illustrative fake code: not from this repo.
type ProductRow = {
  id: string
  creatorId: string
  priceCents: number
  currency: 'USD'
  status: ProductStatus
}
```

Real pattern: display `Product` is defined in [`src/types.ts`](../../../src/types.ts#L7-L29). Do not assume it is a database row.

## Contrast 2: Missing Permission Filter

```ts
// Illustrative fake code: not from this repo.
const orders = await db.orders.findMany()
```

Better:

```ts
// Illustrative fake code: not from this repo.
const orders = await db.orders.findMany({ where: { creatorId: actor.creatorId } })
```

Real pattern: current order table has no auth because there is no backend; see [`src/App.tsx`](../../../src/App.tsx#L625-L678). Future APIs need tenant scoping.

## Contrast 3: N+1 Lookup

```ts
// Illustrative fake code: not from this repo.
orders.map(async order => ({ ...order, product: await api.product(order.productId) }))
```

Better:

```ts
// Illustrative fake code: not from this repo.
const productsById = new Map(products.map(product => [product.id, product]))
```

Real pattern: current render-time `find` is fine for seed data in [`src/App.tsx`](../../../src/App.tsx#L652-L653), but remote data should batch.

## Contrast 4: Stale State

```ts
// Illustrative fake code: not from this repo.
setCartIds([...cartIds, product.id])
```

Better:

```ts
// Illustrative fake code: not from this repo.
setCartIds(current => current.includes(product.id) ? current : [...current, product.id])
```

Real pattern: Buildgum uses the better functional update in [`src/App.tsx`](../../../src/App.tsx#L73-L74).

## Contrast 5: Side Effect In Render

```ts
// Illustrative fake code: not from this repo.
function Checkout() {
  payment.charge()
  return <Success />
}
```

Better: side effects happen in event handlers or server workflows with idempotency.

Real pattern: current checkout success is state-only in [`src/App.tsx`](../../../src/App.tsx#L442-L445), not a real charge.

## Contrast 6: Swallowing Errors

```ts
// Illustrative fake code: not from this repo.
try { JSON.parse(value) } catch {}
```

Better: recover to a safe default and make the issue observable in development/tests.

Real pattern: current parse has no catch in [`src/App.tsx`](../../../src/App.tsx#L53-L56), making it a good future ticket.

## Contrast 7: Overusing `any`

```ts
// Illustrative fake code: not from this repo.
const product: any = data
```

Better: validate unknown input, then narrow to `Product`.

Real pattern: the repo has explicit domain types in [`src/types.ts`](../../../src/types.ts#L1-L74). Preserve that habit.

## Contrast 8: Changing Public Contracts Casually

```ts
// Illustrative fake code: not from this repo.
type RiskLevel = 'ok' | 'bad'
```

Better: migrate with compatibility, UI mapping, tests, and data backfill.

Real pattern: `RiskLevel` feeds seed data, tables, and CSS in [`src/types.ts`](../../../src/types.ts#L5-L5), [`src/App.tsx`](../../../src/App.tsx#L614-L614), and [`src/style.css`](../../../src/style.css#L797-L813).
