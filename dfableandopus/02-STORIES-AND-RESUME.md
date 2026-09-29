# Stories and resume material from Buildgum

## Story 1: the checkout that could charge twice

**Situation.** Buildgum's checkout set a boolean and displayed a fixed order identifier alongside payment, tax and delivery claims the app never performed. Nothing recorded what had been bought, nothing survived a reload, and a retry after a failure was indistinguishable from a second purchase.

**Task.** Replace the mockup with a flow where an accepted purchase is durable and a retry is safe, without pretending any money moved.

**Action.** I split it into three pieces. The cart stores only product ids and quantities; `quoteCart` in `src/model.ts:340` resolves prices from the accepted catalog, rejects unavailable products and duplicate lines, bounds quantities to 1 through 99 and sorts lines by product id so equivalent carts produce the same fingerprint. The UI freezes an attempt before awaiting the write, at `src/App.tsx:280`, creating the order id, the `requestKey`, the normalized buyer and the timestamp once, so a retry resends the identical command instead of rebuilding it from fields that may have changed. Inside the repository's lock, `commit` calls `replay` first (`src/repository.ts:30`) and only then compares the raw stored bytes to the caller's baseline (line 31), because a successful first write necessarily leaves the retry holding a stale baseline.

**Result.** The property is executable, not asserted in prose: the test "checkout retry after write then response failure finds receipt" at `test/model.cjs:351` makes `setItem` write and then throw, rejects once, commits the same command again, and asserts one order and revision 1. "Matching retry survives unrelated later edits" at `test/model.cjs:369` proves the same holds after another tab has written. The full run is 44 domain and storage tests plus 15 Chromium scenarios, all passing, per `astraupskill/VERIFICATION.md`.

## Story 2: stopping a stale tab from erasing a workspace

**Situation.** The whole workspace is one JSON document under one storage key (`src/repository.ts:9`). Any write replaces the entire document, so a tab holding an old snapshot could overwrite everything another tab had done since.

**Task.** Make a stale write impossible without making rejection cost the user their work.

**Action.** Two layers. `browserLock` at `src/repository.ts:69` serialises same-origin writers through `navigator.locks.request`, and refuses outright when `navigator.locks` is unavailable rather than falling back to an unlocked write. Inside the lock, `commit` compares `current.raw !== base.raw`, a compare-and-set on the exact stored bytes, and throws "Workspace changed in another tab. Export your draft, then reload." (`repository.ts:33`). Because rejection now happens routinely, I made it cheap: the error is caught in `save` at `src/App.tsx:155`, the editor draft, the cart and any frozen attempt stay in memory, and the UI offers a draft export at `App.tsx:949`.

**Result.** The test "two simultaneous tabs accept one stale-baseline save" at `test/model.cjs:340` runs two commits from the same baseline through `Promise.allSettled` and asserts exactly one fulfilled and a final revision of 1. A companion test at `test/model.cjs:330` proves that a storage quota failure leaves the caller's accepted snapshot and the underlying data untouched.

## Story 3: writing down what the app does not do

**Situation.** The finished interface looks like a store. Anyone reading only the screenshots would conclude that payments, tax and fulfillment exist.

**Task.** Make the limits as discoverable as the features.

**Action.** I changed the product's own language first: the success message at `src/App.tsx:152` reads "Simulated receipt recorded. No payment or delivery occurred." Then I wrote `astraupskill/VERIFICATION.md` with an explicit section for what the checks do not establish, naming the absence of an authenticated actor, an authorization boundary, a server database, payment acceptance, tax calculation, stock reservation, fulfillment and notification delivery, plus the storage ceilings of 4 MiB, 1000 products, 200 codes and 2000 receipts.

**Result.** The verification record reports 44 of 44 domain tests, 15 of 15 Chromium scenarios and a passing production build, with six screenshots reviewed at three widths, and states in the same document that Web Locks protect only cooperating same-origin writers and that power-loss durability is not certified.

## Resume bullets

- Rebuilt a mock checkout into an idempotent accepted-receipt flow, generating a stable request key when the attempt is frozen so a retry after a lost acknowledgement returns the existing receipt instead of creating a second order, proven by a test that writes and then throws.
- Eliminated cross-tab data loss in a single-document store by adding a Web Lock plus a raw-bytes compare-and-set, verified by a concurrent-commit test asserting exactly one of two writers succeeds.
- Moved all money handling to integer cents parsed once at the input boundary, with half-up discount rounding recomputed during validation so tampered or hand-edited totals are rejected.
- Wrote a strict whole-document validator enforcing exact field sets, collection ceilings, unique request keys, and receipt fingerprints that must agree with their own contents.
- Delivered 44 domain and storage tests and 15 Chromium scenarios, with a verification record that separately documents nine capabilities the system does not provide.

## 60-second spoken summary

Buildgum is a creator-commerce workshop: React 19 and TypeScript, with a pure domain module and a tiny storage repository underneath. What I actually did was replace a fake checkout with a real one. The cart holds ids and quantities only; prices are resolved from the catalog and frozen into a quote, with lines sorted so the same cart always hashes the same. When you check out, the UI freezes the attempt, including a client-generated request key, before the write is awaited, so a retry sends the identical command. In the repository, inside a Web Lock, I look for an existing receipt by that key before comparing the stored bytes against your baseline. That order is the point: a first write that succeeded but whose response was lost necessarily leaves you stale, so checking staleness first would reject exactly the retry idempotency exists for. Forty-four domain tests and fifteen browser scenarios cover it. The caveat I always give first: there is no server, no auth and no payment, so this is an integrity boundary, not a security one, and the whole workspace is rewritten on every change, which is why the ceilings are written down.

## What I would do next

1. Persist the frozen attempt under its own storage key. Today it lives in React state only, so closing the tab destroys the only copy of an in-flight request key, and `astraupskill/VERIFICATION.md` records that drafts are not durably resumed after reload.
2. The junior milestone from `astraupskill/README.md`: add a validated `supportUrl` to the catalog item, prove it survives export and import, and add the test that rejects a `javascript:` URL, which means extending the exact-key-set check in `validateProduct` at `src/model.ts:127`.
3. Narrow the concurrency boundary from the whole document to the record, now that `version` is already enforced by `reduce` at `src/model.ts:411`. That means leaving the single-key store behind, so it is an IndexedDB change rather than a validation change.
4. Replace the stored fingerprint with a hash of the same canonical form. At 2000 receipts the full `JSON.stringify` at `src/model.ts:222` is a measurable share of the document, which matters because `encode` re-parses the whole thing on every write.
