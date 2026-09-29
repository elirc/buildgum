# Now scale it: system-design follow-ups on Buildgum

Seven questions that follow a walkthrough of the checkout flow. Each answer starts from what the code does today and names the trade-off.

## Today's shape

```
  React 19 UI  (src/App.tsx)
    cart = [{productId, quantity}]   prices are NOT stored here
    checkout()  App.tsx:277
      attempt = frozen once: {id, requestKey, buyer, quote, createdAt}
      |
      v  save()  App.tsx:141
  repository.commit(base, command)   src/repository.ts:26
      |
      +-- browserLock (navigator.locks.request on STORAGE_KEY)   repository.ts:69
      |     |
      |     +-- load()            read current bytes
      |     +-- replay()          requestKey already present? -> return, write nothing
      |     +-- current.raw !== base.raw ?  -> throw "changed in another tab"
      |     +-- reduce()          pure; re-quotes, bumps revision, validates
      |     +-- encode()          validate -> stringify -> decode again
      |     +-- setItem()         ONE JSON document replaces the whole workspace
      v
  localStorage["buildgum-workspace-v1"]    <= 4 MiB
      products <= 1000, discounts <= 200, orders <= 2000
```

## 1. Put this behind a server. What moves where?

The invariants stay; only the boundary moves, and `astraupskill/02-CONCEPTS.md` states the mapping. `requestKey`, created at `src/App.tsx:283`, becomes an `Idempotency-Key` request header. The `replay` lookup at `src/model.ts:389` becomes a row in an idempotency table with a unique index on `(customerId, key)` holding the stored response, and the part that must not be got wrong is that it is written in the same transaction as the order; a separate transaction reintroduces the double-charge the design exists to remove. The raw-bytes compare at `src/repository.ts:31` becomes `If-Match` with an ETag, or a `version` column and a conditional `UPDATE ... WHERE id = ? AND version = ?` whose affected-row count is the answer. `navigator.locks` becomes the database transaction, plus a Postgres advisory lock keyed on customer and request key if you need cross-process serialization before the row exists. The `encode` ceiling at `src/model.ts:311` becomes a request body size limit plus schema validation at the route.

The trade-off worth naming: the browser version has one writer to worry about and a compare it can perform on literal bytes. A server has many writers and cannot afford a whole-document compare, so the conservative consistency boundary described below has to be narrowed at the same time.

## 2. The compare-and-set is whole-document. When must that change?

Today `src/repository.ts:31` rejects a write whose baseline bytes differ at all, so tab B's product edit is refused because tab A added an unrelated discount. `astraupskill/02-CONCEPTS.md` calls that deliberately conservative and explains the reason: one consistency boundary that a user can understand in a sentence.

It has to change the moment there is more than one human writer, because the rejection rate scales with total write traffic rather than with actual conflicts. The narrower mechanism already exists in the domain: `reduce` requires `list[index].version === command.expected` at `src/model.ts:411` and bumps the version at line 417, so per-record optimistic concurrency is enforced today even though the document-level check makes it redundant. Moving to rows means the record version becomes the only check, and the cost is that you lose the "did anything change under me" answer, which is what `revision` provides for an import. The honest summary: document-level is right for a single-file store, row-level is right for a database, and this code has both because it was written expecting the move.

## 3. A million receipts. What breaks first?

Not the query, the write. Every accepted command rewrites the entire workspace: `reduce` does a `structuredClone` of all state (`src/model.ts:400`), `encode` runs `validateState`, `JSON.stringify` and then `decode` on its own output (`src/model.ts:318`), and `setItem` writes the whole string. That is O(total data) per change regardless of how small the change is, so the cost of saving one product title grows with the number of receipts you have ever recorded. The declared ceilings, 2000 orders and 4 MiB at `src/model.ts:257` and `:311`, exist because of that, and `astraupskill/VERIFICATION.md` says raising them requires measuring serialization, validation and storage behavior first.

The fix is to stop storing an aggregate. In the browser that is IndexedDB with one record per product, discount and order, so a write touches one row and the validators run on that row rather than on the world. On a server it is simply tables. Either way `validateState`'s cross-record checks, unique request keys at `src/model.ts:307`, receipt lines referencing existing products at `:299`, become database constraints: a unique index and a foreign key. That is the trade: the checks get cheaper and stop being expressible as one readable function.

## 4. Paginate the orders list at a million rows.

The UI already has `orderPage` state (`src/App.tsx:100`), but it is slicing an in-memory array that was fully parsed on load, so it is presentation only. Real pagination has to come from the store.

Offset pagination is the wrong default here because receipts are append-ordered and constantly prepended: `reduce` uses `next.orders.unshift` at `src/model.ts:455`, so page 2 shifts under the reader every time an order arrives. A cursor on `(createdAt, id)` is the right shape, and `createdAt` is already a strictly formatted ISO string checked at `src/model.ts:283`, so it sorts lexicographically and is usable as a cursor without conversion. The trade-off is the usual one: no "page 412 of 9000", no exact total without a separate count. For an order history that is fine. For an accounting export it is not, so keep a bounded offset path for exports only.

## 5. Where do background jobs enter?

There are none, and the first candidates are the things the receipt currently only simulates. `astraupskill/VERIFICATION.md` lists them: payment authorization, license generation, tax calculation, fulfillment, notification. Each is an external effect, and the moment an external effect exists, the property this design is built on changes: today the only durable act is one `setItem` at `src/repository.ts:37`, which either happens or does not.

The pattern that preserves the current guarantee is an outbox: write the order and an outbox row in the same transaction, and let a worker drain it with at-least-once delivery. The provider's own idempotency key should be derived from the order's `requestKey`, which already exists and is already unique across the store (`src/model.ts:307`), so a retried job does not charge twice either. The trade is latency and a new uncertain state, "authorization pending", which today's two-value status at `src/model.ts:47` cannot express. `astraupskill/03-WORKED-CHANGE.md` makes the same point in its step 5: keep payment integration separate from claiming that a browser receipt is a payment confirmation.

## 6. Auth. What does the domain need to learn?

The domain is currently unaware of permissions, and the course is explicit that a lock, a TypeScript type or a hidden button is not security against an untrusted client (`astraupskill/02-CONCEPTS.md`). Adding auth means deciding which of the existing checks are integrity and which become authorization. `validateProduct` at `src/model.ts:127` is integrity, it stays in the domain and runs server-side. "May this caller edit this product" is new, and it belongs in front of the reducer, not inside it, because the reducer is pure and must stay testable without a session.

The rule I would hold to: the client may supply the request key, because it is an idempotency identifier and not a secret, and it may supply the cart. It may never supply the price, which is already true, since `quoteCart` at `src/model.ts:340` reads `p.priceCents` from the catalog and ignores anything the client sends. That property is the one worth pointing at in an interview, because the browser version already refuses to trust the client for the thing that matters.

## 7. Observability before the first incident.

Nothing is observable today: errors surface as text in the UI via `errorText` and `setError` (`src/App.tsx:156`), and that is all. The messages are good, "Workspace changed in another tab. Export your draft, then reload." (`src/repository.ts:33`), but they are strings on a screen, not signals.

Three things first. Give every thrown domain error a stable code so the twenty or so distinct messages in `src/model.ts` become countable dimensions instead of free text; without that you cannot tell a rise in stale-baseline rejections, which means users have too many tabs open, from a rise in "Quote changed", which means prices are moving under people mid-checkout. Second, count replays: a `replay` hit at `src/model.ts:389` is the system doing its job, and a rising replay rate is the earliest signal that writes are failing after they succeed. Third, measure the write path, because it is O(total data) and its degradation is gradual rather than sudden; the useful alert is on the duration of `encode` rather than on any error rate.

The one thing that would not appear in any of this: a bypassed repository. `astraupskill/VERIFICATION.md` names scripts writing `localStorage` directly, extensions and browser-profile access as outside the guarantee, and no amount of instrumentation inside the app sees them. On a server that class of problem disappears, which is a fair answer to give when asked why this would be worth moving.
