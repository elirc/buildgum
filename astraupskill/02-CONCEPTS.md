# Five ideas behind reliable CRUD

## Money is a domain value

The input `39.95` is text. Convert it once to `3995` integer cents and keep calculations in cents. `parsePrice` rejects exponent notation, negatives, extra decimal places, leading zero variants, and values above the permitted cap. Display formatting belongs at the edge: `money(3995)` produces `$39.95` without changing the stored value.

The discount policy is explicit: calculate one whole-percent discount across the subtotal and round half up to the nearest cent. For a subtotal of 4,001 cents with a 50% discount, the discount is 2,001 cents and the total is 2,000 cents. This is a chosen business rule, not a universal tax or accounting rule. Changing it requires examples that distinguish the old and new behavior.

## Identity, version, and revision differ

A product ID answers which record you mean. Its version answers which accepted edition you edited. The workspace revision advances whenever the aggregate changes. The repository also compares complete serialized bytes because an editor must not silently overwrite a replacement workspace or an unrelated accepted change.

Suppose two tabs load the same state. Tab A creates a discount. Tab B edits a product from its older snapshot. Even though that product's version is unchanged, B's save is rejected because its workspace baseline is stale. This is deliberately conservative. A future server can permit independent row updates using narrower concurrency controls; this design favors an easily explained consistency boundary.

## A lock is not authentication

Web Locks serialize cooperating writers for this key on the same origin. Inside the lock, the repository reads current bytes, validates intent, and writes one replacement document. Without the lock, two tabs could both check the same old bytes before either writes, and the later write could erase the earlier one.

A script ignoring the lock can still modify localStorage. A person with developer tools can alter data. There are no users or authorization policies. Do not describe a browser lock, TypeScript type, or hidden button as security against an untrusted client. In a deployed application, the server must authenticate the actor and enforce permissions within the relevant transaction.

## What this becomes on a server

`requestKey` becomes an `Idempotency-Key` header, and the receipt becomes a row in an idempotency table with a unique index on `(customerId, key)`, written in the same database transaction as the order; a replay reads that row and returns the stored response. The raw-baseline compare becomes `If-Match` with an ETag, or a `version` column with a conditional `UPDATE ... WHERE id = ? AND version = ?` whose row count is the answer. `navigator.locks` becomes the database transaction (and, for cross-process serialization, an advisory lock keyed by the customer and key). The `encode()` bounds become a request-size limit at the server plus schema validation at the route (Zod `.strict()`, or a DTO in ASP.NET). Everything this course does in one tab against storage, a Node or .NET service does across a network against PostgreSQL; the invariants are the same, only the boundary moves.

## Receipts preserve accepted facts

An order stores accepted titles, quantities, unit prices, discount details, and totals. Reading an old receipt does not join to today's title or price for display. Renaming Automation Field Manual changes the catalog while earlier receipts remain understandable.

Product deletion is blocked once a receipt references it. Archiving removes the product from new checkout without destroying history. Discount deletion is allowed because its historical code and percentage are embedded in the receipt. These are distinct policies based on the chosen reference model. Explain each policy instead of assuming every delete should cascade.

## Retrying is not creating again

The checkout attempt has a stable request key and a fingerprint of buyer and accepted quote details. A matching retry returns the existing receipt, including its current cancellation status. Reusing the key with different details fails. A fresh key represents a fresh attempt and can create another receipt.

The UI retains failed attempts in memory and freezes inputs. A lost acknowledgement after a successful write is recoverable by retrying the same attempt. Reloading or discarding it loses this protection for a later new request. Inspect Orders and export the draft first. The key is an idempotency identifier, not a secret or proof of identity. See executable examples in [the model tests](../test/model.cjs).
